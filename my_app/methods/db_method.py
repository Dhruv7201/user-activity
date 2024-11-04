from pymongo import MongoClient
import bcrypt


def db_connection():
    client = MongoClient('mongodb://user-agent-python-mongodb-1:27017/')
    # client = MongoClient('mongodb://192.168.0.156:27017/')
    db = client['mydatabase']
    return db

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def check_admin():
    db = db_connection()
    login_data = db['login']
    db_user = login_data.find_one({})
    if not db_user:
        password = hash_password('admin')
        login_data.insert_one({'username': 'admin', 'password': password, 'teamname': 'admin'})
    else:
        pass
    
