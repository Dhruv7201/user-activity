import os
import json
from datetime import datetime, timedelta
import pika
import time
from .u_id import get_uid
import requests

directory = os.path.expanduser('~')
directory = os.path.join(directory, 'activity')
if not os.path.exists(directory):
    os.makedirs(directory)
api_url = "https://api.useractivity.ethicstechnology.net/api"
# api_url = "http://192.168.0.156:5001/api"

response = requests.get(f'{api_url}/rabbitmq_config/').json()
if 'status' not in response:
    host = str("localhost")
    port = int(5672)
    virtual_host = '/'
    username = None
    password = None
else:
    if response['status'] == "success":
        host = str(response['rabbitmq_host'])
        port = int(response['rabbitmq_port'])
        virtual_host = str(response['rabbitmq_virtual_host'])
        username = str(response['rabbitmq_username'])
        password = str(response['rabbitmq_password'])
    else:
        host = str("localhost")
        port = int(5672)
        virtual_host = '/'
        username = None
        password = None


class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)

def write_in_error_log(error_msg, error_log_file):
    if not os.path.exists(os.path.dirname(error_log_file)):
        os.makedirs(os.path.dirname(error_log_file), exist_ok=True)
    with open(error_log_file, 'a') as f:
        error_data = {
            'timestamp': datetime.now().isoformat(),
            'error_message': str(error_msg)
        }
        json.dump(error_data, f, indent=4, cls=DateTimeEncoder)
        f.write('\n')

def check_internet():
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=host, port=5672, virtual_host='/', credentials=pika.PlainCredentials(username, password))
        )
        connection.close()
        return True
    except Exception as e:
        print(f"Error while checking internet: {e}")
        return False


def write_in_log(log_msg, log_file):
    if not os.path.exists(os.path.dirname(log_file)):
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
    with open(log_file, 'w') as f:
        json.dump(log_msg, f, indent=4, cls=DateTimeEncoder)

def read_log_file():
    today = datetime.now().strftime("%Y-%m-%d")
    log_file = os.path.join(directory, 'logs', f'log_{today}.json')
    if os.path.exists(log_file):
        with open(log_file, 'r') as f:
            file_content = f.read()
            if len(file_content) > 0:
                log_dict = json.loads(file_content)
                f.close()
                return log_dict
            else:
                print('found empty')
                return {
                        "user_id": get_uid(),
                        "date": today,
                        "list_of_app": [],
                        "idle_time": "00:00:00"
                    }
    else:
        print('not found')
        return {
                "user_id": get_uid(),
                "date": today,
                "list_of_app": [],
                "idle_time": "00:00:00"
            }
            

def rabbitMQ_connection():
    connection = pika.BlockingConnection(pika.ConnectionParameters(
        host=host, port=port, virtual_host=virtual_host, credentials=pika.PlainCredentials(username, password)))
    channel = connection.channel()
    channel.queue_declare(queue='json_queue')
    return channel

def write_in_rabbitMQ(log_msg):
    today = datetime.now().strftime("%Y-%m-%d")
    log_file = os.path.join(directory, 'logs', f'log_{today}.json')
    error_log_file = os.path.join(directory, 'logs', f'error_log_{today}.json')
    flag = check_internet()
    if flag:
        try:
            channel = rabbitMQ_connection()
            if os.path.exists(log_file):
                with open(log_file, 'r+') as f:
                    file_content = f.read()
                    if len(file_content) > 0:
                        log_dict = json.loads(file_content)
                        channel.basic_publish(exchange='', routing_key='json_queue', body=json.dumps(log_dict))
                        write_in_log(log_msg, log_file)
                        f.close()
                        return log_msg
                    else:
                        write_in_log(log_msg, log_file)
                        channel.basic_publish(exchange='', routing_key='json_queue', body=json.dumps(log_msg))
                        return log_msg
            else:
                empty_log_msg = {}
                write_in_log(empty_log_msg, log_file)
                channel.basic_publish(exchange='', routing_key='json_queue', body=json.dumps(empty_log_msg))
                return log_msg
        except Exception as e:
            error_message = f"Error while sending log file to RabbitMQ: {e}"
            print(error_message)
            write_in_error_log(error_message, error_log_file)
            write_in_log(log_msg, log_file)
            return log_msg
    else:
        write_in_log(log_msg, log_file)
        return log_msg


def delete_old_logs():
    today = datetime.now().strftime("%Y-%m-%d")
    files_to_delete = os.listdir(os.path.join(directory, 'logs'))
    for file in files_to_delete:
        # dont delete file with today and yesterday date
        if file == f'log_{today}.json' or file == f'error_log_{today}.json' or file == f'log_{(datetime.now() - timedelta(1)).strftime("%Y-%m-%d")}.json' or file == f'error_log_{(datetime.now() - timedelta(1)).strftime("%Y-%m-%d")}.json':
            continue
        os.remove(os.path.join(directory, 'logs', file))

def upload_ss_to_server(file_name, api_url):
    error_log_file = os.path.join(directory, 'logs', f'error_log_{datetime.now().strftime("%Y-%m-%d")}.json')
    try:
        with open(file_name, 'rb') as f:
            file = {'file': f}
            file_path = file_name.split('/')
            api_url = api_url + '/uploadfile' + '/' + file_path[-1]
            response = requests.post(f'{api_url}', files=file)
            if response.status_code == 200:
                print("Screenshot uploaded successfully")
            else:
                print("Failed to upload screenshot")
                write_in_error_log("Failed to upload screenshot", error_log_file)


        os.remove(file_name)
        return True
    except Exception as e:
        print(f"Error while uploading screenshot: {e}")
        write_in_error_log(f"Error while uploading screenshot: {e}", error_log_file)
        return False

