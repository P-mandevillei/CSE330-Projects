#public_page_path = r"http://localhost:5173"

server_root = "/api"
sign_path = f"{server_root}/sign"
login_path = f"{server_root}/login"
report_path = f"{server_root}/specimen_report"
get_reports_path = f"{server_root}/get_reports"
get_report_pic_path = f"{server_root}/get_report_pic"
update_report_path = f"{server_root}/update_report"
delete_report_path = f"{server_root}/delete_report"
signature_pic_path = f"{server_root}/get_sign_pic"

mongodb_uri = "xxxxxxxxxx"

google_recaptcha_api = "xxxxxxxxxxxxxxxxx"
google_recaptcha_serverKey = "xxxxxxxxxxxxxxxxxxxxx"

signs_csv_path = "../data/signs.csv"
signs_csv_filename = "signatures.csv"
signs_barplot_path = "../data/signs_bar.png"
signs_bar_log_path = "../data/signs_bar_log.txt"

upload_folder = "../data/uploads"