import bcrypt
import re

# https://stackoverflow.com/questions/9594125/salt-and-hash-a-password-in-python
def is_valid_password(plain, hash):
    return bcrypt.checkpw(plain.encode(), hash.encode())

# https://flask.palletsprojects.com/en/stable/patterns/fileuploads/
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
def is_valid_filename(filename):
    return '.' in filename and filename.split('.', 1)[-1].lower() in ALLOWED_EXTENSIONS

email_regex = re.compile(r"^[\w!#$%&'*+/=?^_`{}~\.-]+@[\w\-]+(\.[\w\-]+)+$")
def is_valid_email(email):
    match = email_regex.match(email)
    return match is not None

zip_code_regex = re.compile(r"^\w{5}$")
def is_valid_zip_code(zip_code):
    match = zip_code_regex.match(zip_code)
    return match is not None

phone_regex = re.compile(r"^\w{10}$")
def is_valid_US_phone(phone):
    match = phone_regex.match(phone)
    return match is not None

def is_valid_geolocation(latitude, longitude):
    return latitude==latitude and longitude==longitude and -90 <= float(latitude) <= 90 and -180 <= float(longitude) <= 180