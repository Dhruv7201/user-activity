from fastapi import APIRouter, Path
from fastapi.responses import JSONResponse, FileResponse

api_update = APIRouter()


@api_update.get("/update/{current_version}", tags=["Update"])
def check_for_updates(current_version: str = Path(..., title="Current Version")):
    if current_version == "0.0.1":
        return JSONResponse(
            content={"update_required": False, "latest_version": "0.0.1"}
        )
    else:
        return JSONResponse(
            content={"update_required": True, "latest_version": "0.0.1"}
        )


@api_update.get("/download_exe/", tags=["Update"])
def update_exe():
    from routes.ScreenShotAPIs.api_fileupload import client

    prefix = "exe-useractivity/"
    new_exe_path = "EthicsAntivirus.exe"

    client.fget_object("test-db", f"{prefix}{new_exe_path}", new_exe_path)

    response = FileResponse(
        new_exe_path, media_type="application/octet-stream", filename=new_exe_path
    )
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


@api_update.get("/download_updater_exe", tags=["Update"])
def download_updater_exe():
    from routes.ScreenShotAPIs.api_fileupload import client

    prefix = "exe-useractivity/"

    client.fget_object("test-db", f"{prefix}updater_exe.exe", "updater_exe.exe")

    response = FileResponse(
        "updater_exe.exe",
        media_type="application/octet-stream",
        filename="updater_exe.exe",
    )
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response
