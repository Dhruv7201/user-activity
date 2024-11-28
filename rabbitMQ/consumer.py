import pika
import json
from mongo_connection import mongo_connection
from datetime import timedelta, datetime

"""
this is the consumer which will consume the data from the rabbitMQ and process the data and store it in the mongoDB
only store data with used_time more than 2 seconds as windows generates many background processes which are not useful
"""


def connect_to_rabbitmq():
    connection = pika.BlockingConnection(
        pika.ConnectionParameters(
            "mq.ethicstechnology.net",
            5672,
            "/",
            pika.PlainCredentials("valuusragent", "Lh85*3q"),
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
    list_of_db_hostname = [user["host_name"] for user in user_list]
    host_name = data.get("host_name", "unknown")

    if data["user_id"] not in list_of_db_user:
        user_list_collection.insert_one(
            {"user_id": data["user_id"], "teamname": "admin", "host_name": host_name}
        )

    if not list_of_db_hostname:
        user_list_collection.update_one(
            {"user_id": data["user_id"]}, {"$set": {"host_name": host_name}}
        )

    if host_name not in list_of_db_hostname:
        user_list_collection.update_one(
            {"user_id": data["user_id"]}, {"$set": {"host_name": host_name}}
        )

    if same_user_date:
        user_db_data.update_one(
            {"user_id": data["user_id"], "date": data["date"]},
            {
                "$set": {
                    "list_of_app": data["list_of_app"],
                    "idle_time": data["idle_time"],
                }
            },
        )
    else:
        user_db_data.insert_one(data)


def callback(ch, method, properties, body):
    data = json.loads(body)
    db = mongo_connection()
    user_db_data = db["user_data"]
    user_list_collection = db["users"]
    process_json_data(data, user_db_data, user_list_collection)


def error_callback(ch, method, properties, body):
    # Establish MongoDB connection
    db = mongo_connection()
    error_data = db["error_data"]

    try:
        # Parse the incoming message
        data = json.loads(body)

        # Ensure all necessary fields are available in the incoming data
        if not all(k in data for k in ["error_message", "user_id", "host_name"]):
            print("Invalid error data format.")
            return

        # Define the time window for checking recent errors
        time_threshold = datetime.utcnow() - timedelta(hours=6)

        # Look for the same error occurring within the last 5 minutes
        same_error = error_data.find_one(
            {
                "error_message": data["error_message"],
                "timestamp": {"$gte": time_threshold},
            }
        )

        if same_error:
            # Update the count for the existing error
            error_data.update_one({"_id": same_error["_id"]}, {"$inc": {"count": 1}})
        else:
            # Insert a new error document
            error_data.insert_one(
                {
                    "error_message": data["error_message"],
                    "timestamp": datetime.utcnow(),
                    "user_id": data["user_id"],
                    "host_name": data["host_name"],
                    "count": 1,
                }
            )
    except Exception as e:
        print(f"Error processing message: {e}")


"""
this will process the data and store it in the mongoDB on loop
if any error occurs it will reconnect to the rabbitMQ and start consuming the data again
"""
while True:
    try:
        channel, connection = connect_to_rabbitmq()
        # clear the queue
        channel.queue_purge("json_queue")
        channel.basic_consume(
            queue="json_queue", on_message_callback=callback, auto_ack=True
        )
        channel.basic_consume(
            queue="error_queue", on_message_callback=error_callback, auto_ack=True
        )
        channel.start_consuming()
    except Exception as e:
        if connection and not connection.is_closed:
            connection.close()
        print(f"Error: {e}. Reconnecting...")
        continue
