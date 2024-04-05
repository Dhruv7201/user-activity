import pymongo


def mongo_connection():
    my_client = pymongo.MongoClient("mongodb://user-agent-python-mongodb-1:27017/")
    my_db = my_client["mydatabase"]
    return my_db
