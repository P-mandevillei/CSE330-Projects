from flask import Flask, jsonify, request, send_file
# from flask_cors import CORS
import paths
from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi
import requests
import validations
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required,
    set_access_cookies, get_jwt_identity, unset_jwt_cookies
)
from datetime import timedelta, datetime
import pandas as pd
import os
from werkzeug.utils import secure_filename
from bson.json_util import dumps
from bson.objectid import ObjectId
import matplotlib
matplotlib.use('Agg') # referenced from ChatGPT: non-interactive plotting
from matplotlib import pyplot as plt
import shutil

app = Flask(__name__)

#cors = CORS(app, supports_credentials=True, origins=[paths.public_page_path])

# configure JWT and CSRF tokens
# https://flask-jwt-extended.readthedocs.io/en/3.0.0_release/tokens_in_cookies/
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_SECURE'] = True
app.config['JWT_SECRET_KEY'] = 'xxxxxxxxxxxx'
app.config['JWT_COOKIE_SAMESITE'] = 'Lax'
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=2)
app.config['JWT_COOKIE_CSRF_PROTECT'] = True
app.config['JWT_ACCESS_COOKIE_NAME'] = 'xxxxxxxxxx'
jwt = JWTManager(app)

# configure file uploads
app.config['UPLOAD_FOLDER'] = paths.upload_folder
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

# connect with mongodb
# https://cloud.mongodb.com
client = MongoClient(paths.mongodb_uri, server_api=ServerApi('1'))
try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)

db = client.cse330_m8
signatures = db.signatures
admins = db.admins
reports = db.reports

def recaptcha_validate(token):
    # reCAPTCHA: https://developers.google.com/recaptcha/docs/verify
    body = {
        'secret': paths.google_recaptcha_serverKey,
        'response': token
    }
    res = requests.post(paths.google_recaptcha_api, data=body)
    response = res.json()
    return response['success']

@app.route(paths.sign_path, methods=['POST'])
def sign():
    data = request.get_json()
    
    if not 'recaptchaToken' in data.keys() or not recaptcha_validate(data['recaptchaToken']):
        return {"error": True, "msg": "You smell like a robot! Please try again with reCAPTCHA."}, 401
    
    for field in ['firstName', 'lastName', 'email', 'zipCode', 'phone', 'address1', 'address2']:
        if field not in data.keys():
            return {"error": True, "msg": "Incomplete input fields!"}, 400 
    
    if len(data['firstName'])==0 or len(data['lastName'])==0 or not validations.is_valid_email(
        data['email']) or not validations.is_valid_zip_code(
        data['zipCode']) or (len(data['phone'])>0 and not validations.is_valid_US_phone(
        data['phone'])):
        return {'error': True, 'msg': 'Invalid inputs!'}, 400

    signature = {
        "time": datetime.now().timestamp(),
        "firstName": data['firstName'],
        "lastName": data['lastName'],
        "email": data['email'],
        "zipCode": data['zipCode'],
        "phone": data['phone'],
        "address1": data['address1'],
        "address2": data['address2']
    }
    try:
        signatures.insert_one(signature)
        return {"error": False}
    except Exception as e:
        print(e)
        return {"error": True, "msg": "Sorry, your request cannot be processed by the database."}, 500
    
@app.route(paths.login_path, methods=['POST'])
def login():
    data = request.get_json()

    for field in ['username', 'password']:
        if field not in data.keys():
            return {"error": True, "msg": "Incomplete input fields!"}, 400
    
    match = admins.find_one({"username": data['username']})
    if not match:
        return {"error": True, "msg": "User does not exist."}, 401
    
    if not validations.is_valid_password(data['password'], match['password']):
        return {"error": True, "msg": "User does not exist."}, 401
    
    access_token = create_access_token(identity=data['username']) # this is the JWT
    
    response = jsonify({"error": False})
    set_access_cookies(response, access_token)
    return response
    
@app.route('/api/get_user', methods=['POST'])
@jwt_required()
def protected():
    username = get_jwt_identity()
    return jsonify({'error': False, 'username': username})

@app.route("/api/logout", methods=["POST"])
def logout():
    response = jsonify({'error': False})
    unset_jwt_cookies(response)
    return response

@app.route("/api/export_csv", methods=["POST"])
@jwt_required()
def export_csv():
    all_signs = list(signatures.find())
    signs_df = pd.DataFrame(all_signs)
    signs_df = signs_df.drop(columns={'_id'})
    signs_df.to_csv(paths.signs_csv_path, index=False)

    return send_file(paths.signs_csv_path)

@app.route(paths.report_path, methods=['POST'])
def report():
    if 'files' not in request.files:
        return {"error": True, "msg": "No pictures are sent!"}, 400
    if 'time' not in request.form.keys() or 'latitude' not in request.form.keys() or 'longitude' not in request.form.keys():
        return {"error": True, "msg": "Missing input fields!"}, 400
    files = request.files.getlist('files')
    time = request.form['time']
    latitude = request.form['latitude']
    longitude = request.form['longitude']
    if not validations.is_valid_geolocation(latitude, longitude):
        return {"error": True, "msg": "Invalid Location!"}, 400

    # https://flask.palletsprojects.com/en/stable/patterns/fileuploads/
    if len(files) == 0 or files[0].filename == '':
        return {"error": True, "msg": "No pictures were sent!"}, 400
    for file in files:
        if not validations.is_valid_filename(file.filename):
            return {"error": True, "msg": f"'{file.filename}' is not a valid filename"}, 400

    # save
    target_folder = f"{app.config['UPLOAD_FOLDER']}/{time}"
    if not os.path.exists(target_folder):
        os.makedirs(target_folder)
    else:
        return {"error": True, "msg": "Server busy. Please request again later."}, 503
    # https://flask.palletsprojects.com/en/stable/patterns/fileuploads/
    try:
        target_paths = []
        for file in files:
            filename = secure_filename(file.filename)
            target_path = os.path.join(target_folder, filename)
            file.save(target_path)

            target_paths.append(os.path.join(time, filename))
        data = {
            "paths": target_paths,
            "time": time,
            "latitude": latitude,
            "longitude": longitude
        }
        reports.insert_one(data)
    except:
        return {"error": True, "msg": "Database connection interrupted. Please try again later."}, 503
    
    return {"error": False}

@app.route(paths.get_reports_path, methods=['POST'])
@jwt_required()
def get_reports():
    try:
        all_reports = reports.find().sort({'time': -1})
        return dumps(all_reports)
    except Exception as e:
        print(e)
        return {"error": True, "msg": "Lost connection to database."}, 500

@app.route(paths.get_report_pic_path, methods=['POST'])
@jwt_required()
def get_report_pic():
    form = request.get_json()
    if 'path' in form.keys():
        target = os.path.join(app.config['UPLOAD_FOLDER'], form['path'])
        if os.path.exists(target):
            return send_file(target)
        else:
            return {"error": True, "msg": "File not found."}, 404
    return {"error": True, "msg": "Invalid request type."}, 400

@app.route(paths.update_report_path, methods=['PUT'])
@jwt_required()
def update_report():
    data = request.get_json()
    if 'id' not in data.keys() or 'target' not in data.keys() or 'field' not in data['target'].keys() or 'entry' not in data['target'].keys():
        return {"error": True, "msg": "Incomplete Input Field."}, 400
    field = data['target']['field']
    entry = data['target']['entry']
    id = ObjectId(data['id'])
    try:
        reports.update_one({"_id": id}, {"$set": {field: entry}})
        return {"error": False}
    except Exception as e:
        print(e)
        return {"error": True, "msg": "Lost connection to database."}, 500

@app.route(paths.delete_report_path, methods=['DELETE'])
@jwt_required()
def delete_report():
    data = request.get_json()
    if 'id' not in data.keys() or 'paths' not in data.keys():
        return {'error': True, 'msg': 'Invalid input fields!'}, 400
    
    # delete folder
    if len(data['paths'])>0:
        folder = data['paths'][0].split("\\")[0]
        path = os.path.join(app.config['UPLOAD_FOLDER'], folder)
        if os.path.exists(path):
            shutil.rmtree(path)

    # delete entry
    id = ObjectId(data['id'])
    try:
        reports.delete_one({"_id": id})
        return {"error": False}
    except Exception as e:
        print(e)
        return {"error": True, "msg": "Lost connection to database."}, 500
    
@app.route(paths.signature_pic_path, methods=['POST'])
@jwt_required()
def get_sign_pic():
  
    cur_time = datetime.now()
    if not os.path.exists(paths.signs_bar_log_path):
        with open(paths.signs_bar_log_path, "w") as file:
            file.write("not latest")
    
    is_latest = True
    with open(paths.signs_bar_log_path, "r") as file:
        for line in file:
            if line.strip() != cur_time.strftime("%m/%d"):
                is_latest = not is_latest
                break
    if not is_latest:
        # make new graph
        cur_time = datetime.now()
        cur_timestamp = int(cur_time.timestamp())
        week_min = cur_timestamp - 7*24*60*60
        dates = [datetime.fromtimestamp(timestamp).strftime("%m/%d") for timestamp in range(week_min, cur_timestamp, 24*60*60)]
        temp_df = pd.DataFrame({'adjustedTime': dates})

        df = pd.DataFrame(signatures.find({"time": {"$gt": week_min}}, {'_id': 1, 'time': 1}))
        df['adjustedTime'] = df['time'].apply(lambda x: datetime.fromtimestamp(int(x)).strftime("%m/%d"))
        df = df.groupby('adjustedTime')['time'].agg('count').to_frame().reset_index()
        df = temp_df.merge(df, on=['adjustedTime'], how='left').fillna(0)
        df['time'] = df['time'].astype(int)
        count = df['time'].sum()
        
        plt.figure(figsize=(5, 3))
        plt.bar(x=df['adjustedTime'], height=df['time'])
        plt.title(f"We had {count} signatures in the last week!")
        plt.xlabel("date")
        plt.ylabel("count")
        plt.savefig(paths.signs_barplot_path, dpi=180, bbox_inches='tight')
        plt.close()

        with open(paths.signs_bar_log_path, "w") as file:
            file.write(cur_time.strftime("%m/%d"))
    
    return send_file(paths.signs_barplot_path)

if __name__ == "__main__":
    app.run(host='localhost', debug=True)