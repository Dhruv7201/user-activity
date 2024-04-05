from fastapi import APIRouter, Request, Query, Header
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from methods.db_method import db_connection


today = datetime.now().strftime("%Y-%m-%d")

api_employeelist = APIRouter()


@api_employeelist.get('/employeelist', tags=["EmployeePage"])
async def get_employee(request: Request , date:  str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"),
                        teamname: str = Header(...)):
    global today
    if date:
        today = request.query_params.get('date')
    db = db_connection()
    collection = db['user_data']
    user_list_collection = db['users']
    if teamname == 'admin':
        user_list = list(set(user['user_id'] for user in user_list_collection.find()))
    else:
        user_list = list(set(user['user_id'] for user in user_list_collection.find({'teamname': teamname})))

    all_user_data = collection.find({'date': today, 'user_id': {'$in': user_list}})

    employee_list_data = {}
    for doc in all_user_data:
        user_id = doc['user_id']
        list_of_app = doc['list_of_app']

        total_time = timedelta()
        total_idle_time = timedelta()
        for app in list_of_app:
            used_time_str = app['used_time']
            used_time_parts = used_time_str.split(':')
            used_time = timedelta(hours=int(used_time_parts[0]), minutes=int(used_time_parts[1]), seconds=int(used_time_parts[2]))
            total_time += used_time

        idle_time_str = doc['idle_time']
        idle_time_parts = idle_time_str.split(':')
        idle_time = timedelta(hours=int(idle_time_parts[0]), minutes=int(idle_time_parts[1]), seconds=int(idle_time_parts[2]))
        total_idle_time += idle_time

        employee_list_data[user_id] = {
            "used_time": str(total_time),
            "total_idle_time": str(total_idle_time),
            "total_time": str(total_time + total_idle_time)
        }
    return JSONResponse(content=employee_list_data)
