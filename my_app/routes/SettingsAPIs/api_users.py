from fastapi import APIRouter, Query, Path, Header
from fastapi.responses import JSONResponse
from methods.db_method import db_connection
from minio import Minio
import bcrypt


api_users = APIRouter()


folder_path = "ss"
access_key = 'IEWC51DQAPVJ489HHOGC'
secret_key = '7WH5WYAW5OAC4NYX6G0LVBGG8NCOTQX9IBTGVLY2'
minio_host = "objectstore.e2enetworks.net"
minio_bucket = "test-db"

client = Minio(
    minio_host,
    access_key=access_key,
    secret_key=secret_key,
    secure=True,
)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


@api_users.get("/users", tags=["SettingsPage"])
async def get_users(teamname: str = Header(...)):
    db = db_connection()
    user_collection = db['users']
    users = user_collection.find()
    login_collection = db['teams']
    login_users = login_collection.find()
    user_list = {}
    logins = []
    for user in users:
        user_list[user['user_id']] = user['teamname']
    for login in login_users:
        logins.append(login['teamname'])
    data = {'user_list': user_list, 'teams': logins}
    return JSONResponse(content=data)


@api_users.delete("/users/{user_id}", tags=["SettingsPage"])
async def delete_user(user_id: str):
    try:
        db = db_connection()
        collection = db['users']
        collection.delete_one({'user_id': user_id})
        user_data = db['user_data']
        user_data.delete_one({'user_id': user_id})
        # delete from object storage
        objects = client.list_objects(minio_bucket, prefix=f"ss/", recursive=True)
        for obj in objects:
            if '\\' in obj.object_name:
                continue
            if obj.object_name.split("/")[2] == user_id:
                client.remove_object(minio_bucket, obj.object_name)
        user_list = []
        users = collection.find()
        for user in users:
            user_list.append(user['user_id'])
        return JSONResponse(content=user_list)
    except Exception as e:
        return JSONResponse(content={'error': str(e)})


@api_users.get("/user_list", tags=["SettingsPage"])
async def post_user_list():
    db = db_connection()
    collection = db['user_data']
    exist_user_collection = db['users']
    exist_user = exist_user_collection.find()
    exist_user_list = []
    for user in exist_user:
        exist_user_list.append(user['user_id'])
    user_data = collection.find()
    user_id_list = []
    for user in user_data:
        if user['user_id'] not in exist_user_list:
            user_id_list.append(user['user_id'])

    user_id_list = list(set(user_id_list))

    return JSONResponse(content=user_id_list)


@api_users.post("/users/{user_id}", tags=["SettingsPage"])
async def post_user(user_id: str):
    db = db_connection()
    user_collection = db['user_data']
    collection = db['users']
    collection.insert_one({'user_id': user_id})
    all_user_list = []
    unexist_user_list = []
    users = collection.find()
    for user in users:
        all_user_list.append(user['user_id'])
    user_data = user_collection.find()
    for user in user_data:
        if user['user_id'] not in all_user_list:
            unexist_user_list.append(user['user_id'])
    unexist_user_list = list(set(unexist_user_list))
    return JSONResponse(content=unexist_user_list)



@api_users.put("/users/{user_id}", tags=["SettingsPage"])
async def put_user(user_id: str = Path(..., min_length=1, max_length=20), teamname: str = Query(..., min_length=1, max_length=20)):
    db = db_connection()
    collection = db['users']
    collection.update_one({'user_id': user_id}, {'$set': {'teamname': teamname}})
    return JSONResponse(content={'user_id': user_id, 'teamname': teamname})



@api_users.post("/monitoring-user", tags=["SettingsPage"])
async def add_monitoring_user(data: dict):
    username = data.get('username')
    password = data.get('password')
    password = hash_password(password)
    selectedTeams = data.get('selectedTeams')

    db = db_connection()
    collection = db['login']
    collection.insert_one({'username': username, 'password': password, 'teamname': selectedTeams})
    return JSONResponse(content={'username': username, 'password': password, 'teamname': selectedTeams})


@api_users.get("/monitoring-user", tags=["SettingsPage"])
async def get_monitoring_user():
    db = db_connection()
    collection = db['login']
    login_users = collection.find()
    login_list = {}
    for login in login_users:
        login_list[login['username']] = {
            'password': login['password'],
            'teamname': login['teamname']
        }
    return JSONResponse(content=login_list)


@api_users.delete("/monitoring-user/{username}", tags=["SettingsPage"])
async def delete_monitoring_user(username = Path(..., min_length=1, max_length=20)):
    db = db_connection()
    collection = db['login']
    collection.delete_one({'username': username})
    login_users = collection.find()
    login_list = {}
    for login in login_users:
        login_list[login['username']] = {
            'password': login['password'],
            'teamname': login['teamname']
        }
    return JSONResponse(content=login_list)
