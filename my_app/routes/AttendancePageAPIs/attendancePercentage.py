from fastapi import APIRouter, Query, Header
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from methods.db_method import db_connection

api_attendancePercentage = APIRouter()


@api_attendancePercentage.get("/attendancePercentage", tags=["AttendancePage"])
async def attendancePercentage(
    from_date: str = Query(
        None,
        description="Starting date (YYYY-MM-DD)",
        regex=r"\d{4}-\d{2}-\d{2}",
        example="2023-01-01",
    ),
    to_date: str = Query(
        None,
        description="Ending date (YYYY-MM-DD)",
        regex=r"\d{4}-\d{2}-\d{2}",
        example="2023-01-31",
    ),
    teamname: str = Header(...),
):
    db = db_connection()
    user_data_collection = db["user_data"]
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
    all_dates = []
    while from_date <= to_date:
        all_dates.append(from_date)
        from_date = (
            datetime.strptime(from_date, "%Y-%m-%d") + timedelta(days=1)
        ).strftime("%Y-%m-%d")
    date_attendance = {
        "data": {},
    }
    for date in all_dates:
        date_attendance["data"][date] = {}
        if date not in user_data_collection.distinct("date"):
            date_attendance["data"][date]["present"] = 0
            date_attendance["data"][date]["absent"] = len(user_list)
        else:
            # Filter user data based on users present in user_list
            user_data_for_date = user_data_collection.find(
                {"date": date, "user_id": {"$in": user_list}}
            )
            date_attendance["data"][date]["present"] = len(
                set(user["user_id"] for user in user_data_for_date)
            )
            date_attendance["data"][date]["absent"] = (
                len(user_list) - date_attendance["data"][date]["present"]
            )
    # sum the total and make present percentage of all dates
    attendancePercentage = {
        "total": 0,
        "present": 0,
        "absent": 0,
    }
    for date in all_dates:
        attendancePercentage["total"] += (
            date_attendance["data"][date]["present"]
            + date_attendance["data"][date]["absent"]
        )
        attendancePercentage["present"] += date_attendance["data"][date]["present"]
        attendancePercentage["absent"] += date_attendance["data"][date]["absent"]
    if not attendancePercentage["total"]:
        return JSONResponse(content={"present": 0, "absent": 0})
    attendancePercentage["present"] = round(
        attendancePercentage["present"] / attendancePercentage["total"] * 100, 2
    )
    attendancePercentage["absent"] = round(
        attendancePercentage["absent"] / attendancePercentage["total"] * 100, 2
    )
    return JSONResponse(content=attendancePercentage)
