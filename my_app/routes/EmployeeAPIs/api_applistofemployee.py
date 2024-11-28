import re
from fastapi import APIRouter, Request, Query, Header
from fastapi.responses import JSONResponse
from datetime import datetime
from methods.db_method import db_connection

api_applistofemployee = APIRouter()
today = datetime.now().strftime("%Y-%m-%d")


@api_applistofemployee.get("/applistofemployee", tags=["EmployeePage"])
async def applistofemployee(
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
        example="2023-01-01",
    ),
    name: str = Query(None, description="Name of the employee", example="John Doe"),
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
    if from_date and to_date:
        # Filter user data based on users present in user_list
        user_data = collection.find(
            {
                "date": {"$gte": from_date, "$lte": to_date},
                "user_id": {"$in": user_list},
            }
        )
    else:
        # Filter user data based on users present in user_list
        user_data = collection.find({"date": today, "user_id": {"$in": user_list}})
    list_of_app = []

    app_groups = db["app_groups"].find()
    patterns = [(doc["pattern"], doc["group_name"]) for doc in app_groups]
    for doc in user_data:
        if doc["user_id"] != name:
            continue
        for item in doc["list_of_app"]:
            window_title = item["window_title"]
            matched = False
            group = {
                "group_name": "Other",
                "window_title": window_title,
                "app_time": item["used_time"],
            }
            if "Google Chrome" in window_title:
                group["group_name"] = "Google Chrome"
                matched = True
            for pattern, group_name in patterns:
                match = re.search(pattern, window_title, re.IGNORECASE)
                if match:
                    group["group_name"] = group_name
                    matched = True
                    break
            list_of_app.append(group)
    return JSONResponse(content=list_of_app, status_code=200)
