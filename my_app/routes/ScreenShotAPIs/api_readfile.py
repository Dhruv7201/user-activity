from fastapi import APIRouter, Request, Query, Header
from fastapi.responses import JSONResponse, RedirectResponse, StreamingResponse
from methods.db_method import db_connection
import os
from minio import Minio
from io import BytesIO
from datetime import datetime
from jose import jwt


api_readfile = APIRouter()

access_key = "ACCESS_KEY"
secret_key = "SECRET_KEY"
minio_host = "objectstore.e2enetworks.net"
minio_bucket = "test-db"
SECRET_KEY = "FastAPI-reactJS"
ALGORITHM = "HS256"

client = Minio(
    minio_host,
    access_key=access_key,
    secret_key=secret_key,
    secure=True,
)


@api_readfile.get("/list_files", tags=["ScreenShotPage"])
async def list_files(
    request: Request, date: str = Query(None), teamname: str = Header(...)
):
    files_list = []
    user_list_collection = db_connection()["users"]
    if teamname == "admin":
        user_list = user_list_collection.find()
    else:
        user_list = user_list_collection.find({"teamname": teamname})
    user_list = list(user["user_id"] for user in user_list)
    if date:
        try:
            objects = client.list_objects(
                minio_bucket, prefix=f"ss/{date}/", recursive=True
            )
            for obj in objects:
                if obj.object_name.split("/")[2] in user_list:
                    if not obj.object_name.endswith("_thumbnail.png"):
                        files_list.append(obj.object_name)
        except Exception as e:
            return JSONResponse(status_code=400, content={"error": str(e)})

        user_list = []

        for file_path in files_list:
            user, file_name = os.path.split(file_path)
            user_name = user.split("/")[-1]
            user_data = {"user": user_name, "files": [file_name]}
            if user_name in [user["user"] for user in user_list]:
                for user in user_list:
                    if user["user"] == user_name:
                        user["files"].append(file_name)
            else:
                user_list.append(user_data)

        return user_list
    else:
        return JSONResponse(
            status_code=400, content={"error": "Date parameter is required"}
        )


@api_readfile.get("/file/{date}/{user}/{file_name}/{token}", tags=["ScreenShotPage"])
async def file_handler(
    request: Request, date: str, user: str, file_name: str, token: str
):
    try:
        # Validate the token
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            exp = payload.get("exp")
            if exp < datetime.utcnow().timestamp():
                return JSONResponse(status_code=401, content={"error": "Token expired"})
        except Exception:
            return JSONResponse(status_code=401, content={"error": "Invalid token"})

        is_thumbnail = "_thumbnail" in file_name
        object_path = f"ss/{date}/{user}/{file_name}"
        try:
            # Fetch the file from the bucket
            response = client.get_object(minio_bucket, object_path)
            buffer = BytesIO(response.read())
            buffer.seek(0)
        except Exception as e:
            # if error on thumbnail fetch the original image
            if is_thumbnail:
                object_path = object_path.replace("_thumbnail", "")
                response = client.get_object(minio_bucket, object_path)
                buffer = BytesIO(response.read())
                buffer.seek(0)
            else:
                return JSONResponse(status_code=400, content={"error": str(e)})

        return StreamingResponse(buffer, media_type="image/png")
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": str(e)})
