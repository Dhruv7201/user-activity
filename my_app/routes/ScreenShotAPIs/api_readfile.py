from fastapi import APIRouter, Request, Query, Header
from fastapi.responses import JSONResponse, FileResponse
from methods.db_method import db_connection
import os
import time
import shutil
from minio import Minio

api_readfile = APIRouter()

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


@api_readfile.get("/list_files", tags=["ScreenShotPage"])
async def list_files(request: Request, date: str = Query(None), teamname: str = Header(...)):

    files_list = []
    user_list_collection = db_connection()["users"]
    if teamname == "admin":
        user_list = user_list_collection.find()
    else:
        user_list = user_list_collection.find({"teamname": teamname})
    user_list = list(user['user_id'] for user in user_list)
    if date:
        try:
            objects = client.list_objects(minio_bucket, prefix=f"ss/{date}/", recursive=True)
            for obj in objects:
                if obj.object_name.split("/")[2] in user_list:
                    files_list.append(obj.object_name)
        except Exception as e:
            return JSONResponse(status_code=400, content={"error": str(e)})

        user_list = []

        for file_path in files_list:
            user, file_name = os.path.split(file_path)
            user_name = user.split("/")[-1]
            user_data = {
                "user": user_name,
                "files": [file_name]
            }
            if user_name in [user["user"] for user in user_list]:
                for user in user_list:
                    if user["user"] == user_name:
                        user["files"].append(file_name)
            else:
                user_list.append(user_data)

        return user_list
    else:
        return JSONResponse(status_code=400, content={"error": "Date parameter is required"})


@api_readfile.get("/download_file/{date}/{user}/{file_name}", tags=["ScreenShotPage"])
async def download_file(request: Request, date: str, user: str, file_name: str):
    try:
        file_path = f"{folder_path}/{date}/{user}/{file_name}"

        # delete all folder other than current date
        if os.path.exists(folder_path):
            for folder in os.listdir(f'{folder_path}/'):
                if folder != date:
                    shutil.rmtree(f"{folder_path}/{folder}")

        # create folder if not exists
        if not os.path.exists(f"{folder_path}/{date}/{user}"):
            os.makedirs(f"{folder_path}/{date}/{user}")

        client.fget_object(minio_bucket, f"{folder_path}/{date}/{user}/{file_name}", file_path)

        return FileResponse(file_path)
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})
