import pika
import json
host = '164.52.204.75'
port = 5672
virtual_host = '/'
username = 'valuusragent'
password = 'Lh85*3q'

def rabbitmq_connection():

    connection = pika.BlockingConnection(
        pika.ConnectionParameters(host=host, port=port, virtual_host=virtual_host, credentials=pika.PlainCredentials(username, password))
    )
    channel = connection.channel()
    channel.queue_declare(queue='json_queue')
    return channel


channel = rabbitmq_connection()
log_dict = {
        "user_id": 'test',
        "date": '2024-04-26',
        "list_of_app": [],
        "idle_time": "00:00:10"
    }
channel.basic_publish(exchange='', routing_key='json_queue', body=json.dumps(log_dict))
