from fastapi import APIRouter, Request, File, UploadFile, Path
from fastapi.responses import JSONResponse
import os
import pathlib
from datetime import datetime
import minio
import time
from PIL import Image
import io

api_file_upload = APIRouter()
bucket_link = "objectstore.e2enetworks.net"
bucket_name = "test-db"
access_key = "ACCESS_KEY"
secret_key = "SECRATE_KEY"
client = minio.Minio(
    bucket_link,
    access_key=access_key,
    secret_key=secret_key,
    secure=True,
)


@api_file_upload.post("/uploadfile/{file_name}", tags=["ScreenShotPage"])
async def create_upload_file(
    request: Request,
    file: UploadFile = File(...),
    file_name: str = Path(
        ..., title="The name of the file", description="The name of the file"
    ),
):
    file_parts = file_name.split("_")
    user_folder = file_parts[0].split("/")[-1]
    date_time_str = file_parts[1].split(".")[0]
    date_time = datetime.strptime(date_time_str, "%Y-%m-%d-%H-%M-%S")
    date_file = date_time.strftime("%Y-%m-%d")
    time_file = date_time.strftime("%H-%M-%S") + file_name[file_name.rfind(".") :]
    full_path = os.path.join(date_file, user_folder, time_file)
    location = full_path.replace("\\", "/")
    location = "ss/" + location
    # store the file in dir with date and user folder
    file_path = os.path.join("screenshots", date_file, user_folder)
    pathlib.Path(file_path).mkdir(parents=True, exist_ok=True)
    with open(os.path.join(file_path, time_file), "wb") as buffer:
        buffer.write(await file.read())

    # decrease the size of file for thumbnail and upload it with the thumbnail name in it to minio
    with Image.open(os.path.join(file_path, time_file)) as image:
        thumbnail = image.copy()
        thumbnail.thumbnail((100, 100))

        thumbnail_buffer = io.BytesIO()
        thumbnail.save(thumbnail_buffer, format=image.format)
        thumbnail_buffer.seek(0)
        thumbnail_name = time_file.replace(".", "_thumbnail.")
        client.put_object(
            bucket_name,
            location.replace(time_file, thumbnail_name),
            thumbnail_buffer,
            len(thumbnail_buffer.getvalue()),
            content_type="image/png",
        )
        thumbnail_buffer.close()
        if os.path.exists(os.path.join(file_path, thumbnail_name)):
            os.remove(os.path.join(file_path, thumbnail_name))

    # upload the file to minio
    client.fput_object(bucket_name, location, os.path.join(file_path, time_file))
    # check if successfully uploaded
    obj = client.list_objects(bucket_name, location)

    if location in [obj.object_name for obj in obj]:
        print(f"Successfully sent screenshot at {date_time}")
    else:
        print(f"Failed to send screenshot at {date_time}")
    if os.path.exists(os.path.join(file_path, time_file)):
        os.remove(os.path.join(file_path, time_file))
    time.sleep(1)

    return JSONResponse({"status": "success", "message": "File Uploaded Successfully"})
