from fastapi import APIRouter, Request, Query, Header
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from methods.db_method import db_connection

import re

api_employeedetails = APIRouter()
today = datetime.now().strftime("%Y-%m-%d")

@api_employeedetails.get('/employeeDetails', tags=["EmployeePage"])
async def employeedetails(request: Request, date:  str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"), teamname: str = Header(...)):
    global today
    if date:
        today = date
    db = db_connection()
    collection = db['user_data']
    today_user_data = collection.find({'date': today})
    for doc in today_user_data:
           return JSONResponse(content=doc)
    
@api_employeedetails.get('/userAttendance', tags=["EmployeePage"])
async def userdata(request: Request, 
                  name: str = Query(..., description="Name of the employee", example="John Doe"),
                  from_date: str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"),
                  to_date: str = Query(None, description="Ending date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01")):

    db = db_connection()
    collection = db['user_data']
    all_dates = []
    
    while from_date <= to_date:
        all_dates.append(from_date)
        from_date = (datetime.strptime(from_date, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
    user_attendance = {}
    for date in all_dates:
        for doc in collection.find({'date': date}):
            if doc['user_id'] == name:
                user_attendance[date] = 'Present'
                break
    for date in all_dates:
        if date not in user_attendance.keys():
            user_attendance[date] = 'Absent'
    user_attendance = dict(sorted(user_attendance.items(), key=lambda item: item[0]))
    return JSONResponse(content=user_attendance)    
