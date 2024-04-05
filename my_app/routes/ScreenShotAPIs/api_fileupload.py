from fastapi import APIRouter, Request, File, UploadFile, Path
from fastapi.responses import JSONResponse
import os
import pathlib
from datetime import datetime

api_file_upload = APIRouter()

@api_file_upload.post("/uploadfile/", tags=["ScreenShotPage"])
async def create_upload_file(request: Request, file: UploadFile = File(...)):
    file_parts = file.filename.split("_")
    
    if len(file_parts) < 2:
        return JSONResponse(status_code=400, content={"error": "Invalid filename format"})

    username = file_parts[0]
    username = username.split("/")[1]
    date_time_str = file_parts[1].split(".")[0]  # Remove the file extension
    date_time = datetime.strptime(date_time_str, "%Y-%m-%d-%H-%M-%S")
    
    ss_folder = "ss"  # Ensure no trailing slash
    if ss_folder.endswith('/'):
        ss_folder = ss_folder[:-1]
    date_folder = os.path.join(ss_folder, date_time.strftime("%Y-%m-%d"))
    user_folder = os.path.join(date_folder, username)
    time_file = date_time.strftime("%H-%M-%S") + file.filename[file.filename.rfind("."):]
    full_path = os.path.join(user_folder, time_file)
    # dont receive files after 10pm and before 8am
    if date_time.hour >= 22 or date_time.hour < 8:
        return JSONResponse(status_code=400, content={"error": "Invalid time"})
    pathlib.Path(os.path.dirname(full_path)).mkdir(parents=True, exist_ok=True)

    with open(full_path, "wb") as buffer:
        buffer.write(await file.read())

    return JSONResponse({"status": "success", "message": "File Uploaded Successfully"})


from fastapi import APIRouter, Request, Path
from fastapi.responses import JSONResponse

# Create an instance of APIRouter
api_file_upload = APIRouter()

from fastapi import APIRouter, Request, Path
from fastapi.responses import JSONResponse

# Create an instance of APIRouter
api_file_upload = APIRouter()

# Define the endpoint for handling GET requests
@api_file_upload.get("/screen_shot_interval/{user_name}", tags=["ScreenShotPage"])
async def get_screen_shot_interval(user_name: str = Path(..., title="The name of the user", description="The name of the user")):
    print(user_name)
    
    # Assuming you have a function to get the screen shot interval based on the user
    screen_shot_interval = 3600

    return JSONResponse({"status": "success", "screen_shot_interval": screen_shot_interval})