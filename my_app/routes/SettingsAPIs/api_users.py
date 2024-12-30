from fastapi import APIRouter, Query, Path, Header, BackgroundTasks
from fastapi.responses import JSONResponse
from methods.db_method import db_connection
from minio import Minio
import bcrypt
from datetime import datetime
from aiobotocore.session import get_session


api_users = APIRouter()


folder_path = "ss"
MINIO_ACCESS_KEY = 'IEWC51DQAPVJ489HHOGC'
MINIO_SECRET_KEY = '7WH5WYAW5OAC4NYX6G0LVBGG8NCOTQX9IBTGVLY2'
MINIO_ENDPOINT = "https://objectstore.e2enetworks.net"
MINIO_BUCKET = "test-db"


# client = Minio(
#     minio_host,
#     access_key=access_key,
#     secret_key=secret_key,
#     secure=True,
# )

async def delete_user_data_from_minio(user_id: str, date_list: list):
    session = get_session()
    async with session.create_client(
        "s3",
        endpoint_url=MINIO_ENDPOINT,
        aws_access_key_id=MINIO_ACCESS_KEY,
        aws_secret_access_key=MINIO_SECRET_KEY,
    ) as client:
        paginator = client.get_paginator("list_objects_v2")
        # run loop for all the dates and get the data from that date only with prefix
        for date in date_list:
            async for result in paginator.paginate(Bucket=MINIO_BUCKET, Prefix=f"ss/{date}/{user_id}"):
                if "Contents" in result:
                    for obj in result["Contents"]:
                        object_name = obj["Key"]
                        if '\\' in object_name:
                            continue
                        if object_name.split("/")[2] == user_id:
                            print(f"Deleting {object_name}")
                            await client.delete_object(Bucket=MINIO_BUCKET, Key=object_name)
                        else:
                            print(f"Skipping {object_name}")
    print("MinIO cleanup completed")

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
        user_list[user['user_id']] = {
            'teamname': user['teamname'],
            'host_name': user['host_name'],
            'user_name': user['user_name'] if 'user_name' in user else ''
        }
    for login in login_users:
        logins.append(login['teamname'])
    print(user_list)
    data = {'user_list': user_list, 'teams': logins}
    return JSONResponse(content=data)


@api_users.delete("/users/{user_id}", tags=["SettingsPage"])
async def delete_user(user_id: str, background_tasks: BackgroundTasks):
    start_time = datetime.now()
    try:
        db = db_connection()
        # Delete user from MongoDB
        users_collection = db['users']
        user_data_collection = db['user_data']
        # get the user date from the user_data collection
        user_data = user_data_collection.find({'user_id': user_id})
        if not user_data:
            return JSONResponse(content={'error': 'User data not found'})
        # make the list of all the dates from the user_data collection
        date_list = []
        for data in user_data:
            date_list.append(data['date'])
                
        print("date_list: ", date_list)
        
        users_collection.delete_one({'user_id': user_id})
        user_data_collection.delete_one({'user_id': user_id})
        print("db delete time: ", datetime.now() - start_time)

        # Schedule MinIO cleanup in the background
        background_tasks.add_task(delete_user_data_from_minio, user_id, date_list)

        # Fetch remaining users
        remaining_users = users_collection.find({}, {"user_id": 1})
        user_list = [user["user_id"] for user in remaining_users]

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
async def put_user(user_id: str = Path(..., min_length=1, max_length=20), teamname: str = Query(..., min_length=1, max_length=20), user_name: str = Query(..., min_length=1, max_length=20)):
    db = db_connection()
    collection = db['users']
    if user_name != "null":
        collection.update_one({'user_id': user_id}, {'$set': {'user_name': user_name}})
    elif teamname:
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
