from fastapi import APIRouter, Request, Query, Header
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from methods.db_method import db_connection

api_monthlyreport = APIRouter()


@api_monthlyreport.get("/monthlyreport", tags=["Reports Page"])
async def monthlyreport(
    request: Request,
    month: str = Query(
        None, description="Month (YYYY-MM)", regex=r"\d{4}-\d{2}", example="2023-01"
    ),
    teamname: str = Header(...),
):
    if not month:
        month = datetime.now().strftime("%Y-%m")
    today = datetime.now().date()
    db = db_connection()
    collection = db["user_data"]
    users_collection = db["users"]
    user_list = []
    if teamname == "admin":
        for user in users_collection.find():
            user_list.append(user["user_id"])
    else:
        for user in users_collection.find({"teamname": teamname}):
            user_list.append(user["user_id"])
    result = {}
    for user in user_list:
        result[user] = {}
        result[user]["user_id"] = user
        for i in range(1, 32):
            try:
                if i < 10:
                    date = month + "-0" + str(i)
                else:
                    date = month + "-" + str(i)
                if datetime.strptime(date, "%Y-%m-%d").date() > today:
                    break
                if collection.find_one({"user_id": user, "date": date}):
                    result[user][date] = "P"
                else:
                    result[user][date] = "A"
            except ValueError:
                # Handle the case where the day is out of range for the month
                break
    return JSONResponse(status_code=200, content={"message": "success", "data": result})
