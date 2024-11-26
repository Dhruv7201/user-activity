import pika
import json
from mongo_connection import mongo_connection
from datetime import timedelta


def connect_to_rabbitmq():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            "user-agent-python-rabbitmq-1",
            5672,
            "/",
            pika.PlainCredentials("username", "password"),
        )
    )
    channel = connection.channel()
    channel.queue_declare(queue="json_queue")
    return channel, connection


def process_json_data(data, user_db_data, user_list_collection):
    data["list_of_app"] = [
        app
        for app in data["list_of_app"]
        if app["used_time"] not in ("00:00:00", "00:00:01", "00:00:02")
    ]

    same_user_date = user_db_data.find_one(
        {"user_id": data["user_id"], "date": data["date"]}
    )
    user_list = user_list_collection.find({})
    list_of_db_user = [user["user_id"] for user in user_list]
    if data["user_id"] not in list_of_db_user:
        user_list_collection.insert_one(
            {"user_id": data["user_id"], "teamname": "admin"}
        )
    if same_user_date:
        for app in data["list_of_app"]:
            window_title = app["window_title"]
            existing_app = user_db_data.find_one(
                {
                    "user_id": data["user_id"],
                    "date": data["date"],
                    "list_of_app.window_title": window_title,
                }
            )
            if existing_app:
                user_db_data.update_one(
                    {
                        "user_id": data["user_id"],
                        "date": data["date"],
                        "list_of_app.window_title": window_title,
                    },
                    {"$set": {"list_of_app.$.used_time": app["used_time"]}},
                )
            else:
                user_db_data.update_one(
                    {"user_id": data["user_id"], "date": data["date"]},
                    {"$push": {"list_of_app": app}},
                )
        user_db_data.update_one(
            {"user_id": data["user_id"], "date": data["date"]},
            {"$set": {"idle_time": data["idle_time"]}},
        )
    else:
        user_db_data.insert_one(data)


def callback(ch, method, properties, body):
    data = json.loads(body)
    print("Received JSON data:", data)
    db = mongo_connection()
    user_db_data = db["user_data"]
    user_list_collection = db["users"]
    process_json_data(data, user_db_data, user_list_collection)


while True:
    try:
        channel, connection = connect_to_rabbitmq()
        channel.basic_consume(
            queue="json_queue", on_message_callback=callback, auto_ack=True
        )
        channel.start_consuming()
    except Exception as e:
        print("Error in consumer.py:", e)
        connection.close()
        continue
