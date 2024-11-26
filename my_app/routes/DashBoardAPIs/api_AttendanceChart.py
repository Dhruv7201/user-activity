from fastapi import APIRouter, Request, Query, Header
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from methods.db_method import db_connection

api_attendance_chart = APIRouter()


@api_attendance_chart.get("/Attendance-pie", tags=["DashboardPage"])
async def total_used_time(
    request: Request,
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
    data_collection = db["user_data"]
    user_list_collection = db["users"]
    present_user_list = []
    absent_user_list = []
    all_dates = []
    while from_date <= to_date:
        all_dates.append(from_date)
        from_date = (
            datetime.strptime(from_date, "%Y-%m-%d") + timedelta(days=1)
        ).strftime("%Y-%m-%d")

    for date in all_dates:
        if date in data_collection.distinct("date"):
            # Filter user data based on users present in user_list
            if teamname == "admin":
                user_data_for_date = data_collection.find({"date": date})
            else:
                user_data_for_date = data_collection.find(
                    {
                        "date": date,
                        "user_id": {
                            "$in": list(
                                user["user_id"]
                                for user in user_list_collection.find(
                                    {"teamname": teamname}
                                )
                            )
                        },
                    }
                )
            present_user_list.append(
                len(set(user["user_id"] for user in user_data_for_date))
            )
        else:
            present_user_list.append(0)
        if teamname == "admin":
            absent_user_list.append(
                len(user_list_collection.distinct("user_id")) - present_user_list[-1]
            )
        else:
            absent_user_list.append(
                len(user_list_collection.distinct("user_id", {"teamname": teamname}))
                - present_user_list[-1]
            )
    return JSONResponse(
        content={"present": present_user_list, "absent": absent_user_list}
    )


@api_attendance_chart.get("/Attendance-Bar", tags=["DashboardPage"])
async def total_used_time(
    request: Request,
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
                {"date": date, "user_id": {"$in": list(user_list)}}
            )
            date_attendance["data"][date]["present"] = len(
                set(user["user_id"] for user in user_data_for_date)
            )
            date_attendance["data"][date]["absent"] = (
                len(user_list) - date_attendance["data"][date]["present"]
            )
    # total users
    total = len(user_list)
    date_attendance["max"] = total
    return JSONResponse(content=date_attendance)
