from pymongo import MongoClient


def db_connection():
    client = MongoClient('mongodb://user-agent-python-mongodb-1:27017/')
    # client = MongoClient('mongodb://192.168.0.156:27017/')
    db = client['mydatabase']
    return db



def check_admin():
    db = db_connection()
    login_data = db['login']
    db_user = login_data.find_one({})
    if not db_user:
        login_data.insert_one({'username': 'admin', 'password': 'admin', 'teamname': 'admin'})
        print('Admin created successfully')
    else:
        print('Admin already exists')