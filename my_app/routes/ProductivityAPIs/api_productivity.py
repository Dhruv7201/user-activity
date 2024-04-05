import re
from fastapi import APIRouter, Query, Header
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from methods.db_method import db_connection

api_productivity = APIRouter()

@api_productivity.get('/productivity', tags=["ProductivityPage"])
async def productivity(from_date: str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"),
                        to_date: str = Query(None, description="Ending date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-31"),
                        teamname: str = Header(...)):
    db = db_connection()
    user_data_collection = db['user_data']
    user_list_collection = db['users']
    if teamname == 'admin':
        user_list = list(set(user['user_id'] for user in user_list_collection.find()))
    else:
        user_list = list(set(user['user_id'] for user in user_list_collection.find({'teamname': teamname})))
    productivity_collection = db['app_groups']

    if from_date and to_date:
        user_data = user_data_collection.find({'date': {'$gte': from_date, '$lte': to_date}, 'user_id': {'$in': user_list}})
    else:
        user_data = user_data_collection.find({'date': datetime.now().strftime("%Y-%m-%d"), 'user_id': {'$in': user_list}})

    productivity_apps = productivity_collection.find({})
    productivity_list = [app['group_name'] for app in productivity_apps]

    total_used_time = timedelta()
    total_productive_time = timedelta()
    total_idle_time = timedelta()

    for user in user_data:
        for app in user['list_of_app']:
            window_title = app.get('window_title')
            used_time_str = app.get('used_time')
            used_time = datetime.strptime(used_time_str, "%H:%M:%S").time()
            for productive_app in productivity_list:
                if productive_app in window_title:
                    total_productive_time += timedelta(hours=used_time.hour, minutes=used_time.minute, seconds=used_time.second)
                    break
            total_used_time += timedelta(hours=used_time.hour, minutes=used_time.minute, seconds=used_time.second)

        # Convert 'idle_time' string to timedelta
        idle_time_str = user['idle_time']
        idle_time = datetime.strptime(idle_time_str, "%H:%M:%S").time()
        total_idle_time += timedelta(hours=idle_time.hour, minutes=idle_time.minute, seconds=idle_time.second)

    total_used_time_seconds = total_used_time.total_seconds()
    total_productive_time_seconds = total_productive_time.total_seconds()
    total_idle_time_seconds = total_idle_time.total_seconds()
    total_time = total_used_time_seconds + total_idle_time_seconds

    total_percentage = round((total_productive_time_seconds / total_time) * 100, 2)
    
    result = {
        "productivity": total_percentage
    }

    return JSONResponse(status_code=200, content=result)
