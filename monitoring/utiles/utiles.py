import os
import json
from datetime import datetime, timedelta
import pika
from .u_id import get_uid, host_name
import requests

directory = os.path.expanduser('~')
directory = os.path.join(directory, 'activity')
if not os.path.exists(directory):
    os.makedirs(directory)
api_url = "https://api.useractivity.ethicstechnology.net/api"
# api_url = "http://192.168.0.156:5001/api"


'''
get the username and password for rabbitmq from the api because it can be changed and it will be safe
'''
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

'''
date time encoder for json to serialize datetime object
'''
class DateTimeEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, datetime):
            return o.isoformat()
        return super().default(o)


'''
write error log in file with timestamp so that we can track the error and debug it
'''
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


'''
# TODO write error log in rabbitmq it is working only part remaining is to receive it in the client side
'''
def write_error_in_rabbitMQ(error_msg):
    today = datetime.now().strftime("%Y-%m-%d")
    error_log_file = os.path.join(directory, 'logs', f'error_log_{today}.json')
    flag = check_internet()
    if flag:
        try:
            channel = rabbitMQ_connection()
            error_message = {
                'timestamp': datetime.now().isoformat(),
                'user_id': get_uid(),
                'host_name': host_name(),
                'error_message': str(error_msg)
            }
            channel.basic_publish(exchange='', routing_key='error_queue', body=json.dumps(error_message))
            write_in_error_log(error_msg, error_log_file)
            return error_message
        except Exception as e:
            print(f"Error while sending error log to RabbitMQ: {e}")
            write_in_error_log(f"Error while sending error log to RabbitMQ: {e}", error_log_file)
            return error_msg
    else:
        write_in_error_log(error_msg, error_log_file)
        return error_msg

'''
write log in file and can be used to send it to rabbitmq not directly sending to mq because it can slow down the process if mq is not available or slow connection
'''
def write_in_log(log_msg, log_file):
    if not os.path.exists(os.path.dirname(log_file)):
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
    with open(log_file, 'w') as f:
        json.dump(log_msg, f, indent=4, cls=DateTimeEncoder)

'''
Read log file if exists otherwise create a new log file
send the log file to rabbitmq
'''
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
                        "host_name": host_name(),
                        "date": today,
                        "list_of_app": [],
                        "idle_time": "00:00:00"
                    }
    else:
        print('not found')
        return {
                "user_id": get_uid(),
                "host_name": host_name(),
                "date": today,
                "list_of_app": [],
                "idle_time": "00:00:00"
            }
            
'''
mq connection and channel for message queueing
'''
def rabbitMQ_connection():
    connection = pika.BlockingConnection(pika.ConnectionParameters(
        host=host, port=port, virtual_host=virtual_host, credentials=pika.PlainCredentials(username, password)))
    channel = connection.channel()
    channel.queue_declare(queue='json_queue')
    return channel

'''
check the mq connection and send data to mq if connection is available else write in log file it will be sent to mq when connection is available
made this logic to prevent data loss
'''
def write_in_rabbitMQ(log_msg):
    today = datetime.now().strftime("%Y-%m-%d")
    log_file = os.path.join(directory, 'logs', f'log_{today}.json')
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
            write_error_in_rabbitMQ(error_message)
            write_in_log(log_msg, log_file)
            return log_msg
    else:
        write_in_log(log_msg, log_file)
        return log_msg

'''
delete old logs which are not required
'''
def delete_old_logs():
    today = datetime.now().strftime("%Y-%m-%d")
    files_to_delete = os.listdir(os.path.join(directory, 'logs'))
    for file in files_to_delete:
        # dont delete file with today and yesterday date
        if file == f'log_{today}.json' or file == f'error_log_{today}.json' or file == f'log_{(datetime.now() - timedelta(1)).strftime("%Y-%m-%d")}.json' or file == f'error_log_{(datetime.now() - timedelta(1)).strftime("%Y-%m-%d")}.json':
            continue
        os.remove(os.path.join(directory, 'logs', file))


'''
upload screenshot to server and delete the screenshot after uploading api will store it in e3e object storage
'''
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
        write_error_in_rabbitMQ(f"Error while uploading screenshot: {e}")
        return False

