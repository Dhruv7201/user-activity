from fastapi import APIRouter, Request, Query, Header
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from methods.db_method import db_connection
from methods.utiles import parse_datetime_with_fractional_seconds

api_dailyreport = APIRouter()
today = datetime.now().strftime("%Y-%m-%d")


@api_dailyreport.get("/dailyreport", tags=["Reports Page"])
async def dailyreport(
    request: Request,
    date: str = Query(
        None,
        description="Date (YYYY-MM-DD)",
        regex=r"\d{4}-\d{2}-\d{2}",
        example="2023-01-01",
    ),
    teamname: str = Header(...),
):
    global today
    db = db_connection()
    collection = db["user_data"]
    user_list_collection = db["users"]
    if teamname == "admin":
        user_list = list(set(user["user_id"] for user in user_list_collection.find()))
    else:
        user_list = list(
            set(
                user["user_id"]
                for user in user_list_collection.find({"teamname": teamname})
            )
        )
    apps_collection = db["app_groups"]
    productive_apps = [app["group_name"] for app in apps_collection.find({})]
    if date:
        today = date
    today_user_data = collection.find({"date": today, "user_id": {"$in": user_list}})
    user_daily_report = []

    for doc in today_user_data:
        user_id = doc["user_id"]
        idle_time = doc["idle_time"]
        if not doc["list_of_app"]:
            continue
        # Convert start_time strings to datetime objects
        start_times = [
            parse_datetime_with_fractional_seconds(app["start_time"])
            for app in doc["list_of_app"]
        ]

        # Get the earliest start_time and format it as HH:mm:ss
        arrival_time = min(start_times).strftime("%H:%M:%S")

        working_time_seconds = sum(
            int(app["used_time"].split(":")[0]) * 3600
            + int(app["used_time"].split(":")[1]) * 60
            + int(app["used_time"].split(":")[2])
            for app in doc["list_of_app"]
        )
        working_time = str(timedelta(seconds=working_time_seconds))

        productive_time_seconds = sum(
            int(app["used_time"].split(":")[0]) * 3600
            + int(app["used_time"].split(":")[1]) * 60
            + int(app["used_time"].split(":")[2])
            for app in doc["list_of_app"]
            if app["window_title"] in productive_apps
        )
        productive_time = str(timedelta(seconds=productive_time_seconds))

        idle_time_seconds = (
            int(idle_time.split(":")[0]) * 3600
            + int(idle_time.split(":")[1]) * 60
            + int(idle_time.split(":")[2])
        )
        total_time_seconds = working_time_seconds + idle_time_seconds
        total_time = str(timedelta(seconds=total_time_seconds))

        user_data = {
            "Employee Name": user_id,
            "Arrival": arrival_time,
            "Working Time": working_time,
            "Productive Time": productive_time,
            "Idle Time": idle_time,
            "Total Time": total_time,
        }

        user_daily_report.append(user_data)

    return JSONResponse(status_code=200, content=user_daily_report)
