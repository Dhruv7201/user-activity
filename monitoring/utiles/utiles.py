import os
import minio
import json
from datetime import datetime, timedelta
import pika
import time
from .u_id import get_uid

directory = os.path.expanduser('~')
today = datetime.now().strftime("%Y-%m-%d")
log_file = os.path.join(directory, 'logs', f'log_{today}.json')
error_log_file = os.path.join(directory, 'logs', f'error_log_{today}.json')
host = 'host'
port = 5672
virtual_host = '/'
username = 'username'
password = 'password'
bucket_link = "bucket-link"
bucket_name = 'bucket-name'
access_key = 'access-key'
secret_key = 'secret-key'



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
            pika.ConnectionParameters(host=host, port=port, virtual_host=virtual_host, credentials=pika.PlainCredentials(username, password))
        )
        connection.close()
        return True
    except Exception as e:
        return False


def write_in_log(log_msg, log_file):
    if not os.path.exists(os.path.dirname(log_file)):
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
    with open(log_file, 'w') as f:
        json.dump(log_msg, f, indent=4, cls=DateTimeEncoder)

def read_log_file():
    global log_file
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
    global log_file
    flag = check_internet()
    if flag:
        try:
            channel = rabbitMQ_connection()
            delete_old_logs()
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
                # If the log file doesn't exist, create an empty log message and send it
                empty_log_msg = {}  # You can customize this as needed
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
    current_date = datetime.now()
    for i in range(1, 7):
        target_date = current_date - timedelta(days=i)
        log_file_to_delete = os.path.join(directory, 'logs', f'log_{target_date.strftime("%Y-%m-%d")}.json')
        if os.path.exists(log_file_to_delete):
            channel = rabbitMQ_connection()
            with open(log_file_to_delete, 'r') as f:
                file_content = f.read()
                if len(file_content) > 0:
                    log_dict = json.loads(file_content)
                    channel.basic_publish(exchange='', routing_key='json_queue', body=json.dumps(log_dict))
                    f.close()
                    time.sleep(1)
            os.remove(log_file_to_delete)
            print(f"Deleted log file from {target_date.strftime('%Y-%m-%d')}")



def upload_ss_to_server(file_name, date_time):
        client = minio.Minio(
            bucket_link,
            access_key=access_key,
            secret_key=secret_key,
            secure=True,
        )
        
        file_parts = file_name.split("_")
        user_folder = file_parts[0].split("/")[-1]
        print(user_folder)
        date_time_str = file_parts[1].split(".")[0]
        date_time = datetime.strptime(date_time_str, "%Y-%m-%d-%H-%M-%S")
        date_file = date_time.strftime("%Y-%m-%d")
        time_file = date_time.strftime("%H-%M-%S") + file_name[file_name.rfind("."):]
        full_path = os.path.join(date_file, user_folder, time_file)
        location = full_path.replace("\\", "/")
        if date_time.hour >= 22 or date_time.hour < 8:
            os.remove(file_name)
        client.fput_object(bucket_name, "ss/" + location, file_name)
        print(file_name)
        # check if successfully uploaded
        if client.bucket_exists(bucket_name):
            print(f'Screenshot uploaded at {date_time}')
            # close the file
            # close file
        else:
            print(f'Failed to send screenshot at {date_time}')
        time.sleep(1)
        # Delete the saved screenshot file
        os.remove(file_name)
        return True
