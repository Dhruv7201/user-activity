from fastapi import APIRouter, Query, Header
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from methods.db_method import db_connection
import json

api_totalTime = APIRouter()

@api_totalTime.get('/idleTime', tags=["AttendancePage"])
async def idleTime(from_date: str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"),
                    to_date: str = Query(None, description="Ending date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-31"),
                    teamname: str = Header(...)):
    db = db_connection()
    user_data_collection = db['user_data']
    user_list_collection = db['users']
    if teamname == 'admin':
        user_list = set(user['user_id'] for user in user_list_collection.find())
    else:
        user_list = set(user['user_id'] for user in user_list_collection.find({'teamname': teamname}))
    all_dates = []
    while from_date <= to_date:
        all_dates.append(from_date)
        from_date = (datetime.strptime(from_date, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
    total_idle_time = timedelta()
    for date in all_dates:
        if date not in user_data_collection.distinct('date'):
            pass
        else:
            for user in user_list:
                user_data = user_data_collection.find_one({'user_id': user, 'date': date})
                if user_data:
                    total_idle_time += timedelta(hours=int(user_data['idle_time'].split(':')[0]), minutes=int(user_data['idle_time'].split(':')[1]), seconds=int(user_data['idle_time'].split(':')[2]))
    return JSONResponse(content={"idle_time": str(total_idle_time)})



@api_totalTime.get('/workTime', tags=["AttendancePage"])
async def workTime(from_date: str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"),
                    to_date: str = Query(None, description="Ending date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-31"),
                    teamname: str = Header(...)):
    db = db_connection()
    user_data_collection = db['user_data']
    user_list_collection = db['users']
    if teamname == 'admin':
        user_list = set(user['user_id'] for user in user_list_collection.find())
    else:
        user_list = set(user['user_id'] for user in user_list_collection.find({'teamname': teamname}))
    all_dates = []
    while from_date <= to_date:
        all_dates.append(from_date)
        from_date = (datetime.strptime(from_date, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
    total_work_time = {}
    
    for user in user_list:
        total_work_time[user] = timedelta()
    
    for date in all_dates:
        if date not in user_data_collection.distinct('date'):
            continue
        for user in user_list:
            user_data = user_data_collection.find_one({'user_id': user, 'date': date})
            if user_data and 'list_of_app' in user_data:
                for app in user_data['list_of_app']:
                    used_time_parts = app.get('used_time', '00:00:00').split(':')
                    total_work_time[user] += timedelta(
                        hours=int(used_time_parts[0]),
                        minutes=int(used_time_parts[1]),
                        seconds=int(used_time_parts[2])
                    )

    total_work_time = sum(total_work_time.values(), timedelta())

    total_work_time_str = str(total_work_time)
    return JSONResponse(content={"work_time": total_work_time_str})


@api_totalTime.get('/idleList', tags=["AttendancePage"])
async def idleList(from_date: str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"),
                    to_date: str = Query(None, description="Ending date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-31"),
                    teamname: str = Header(...)):
    db = db_connection()
    user_data_collection = db['user_data']
    user_list_collection = db['users']
    if teamname == 'admin':
        user_list = set(user['user_id'] for user in user_list_collection.find())
    else:
        user_list = set(user['user_id'] for user in user_list_collection.find({'teamname': teamname}))
    all_dates = []
    while from_date <= to_date:
        all_dates.append(from_date)
        from_date = (datetime.strptime(from_date, "%Y-%m-%d") + timedelta(days=1)).strftime("%Y-%m-%d")
    idle_list = {}
    
    for date in all_dates:
        for user in user_data_collection.find({'date': date, 'user_id': {'$in': list(user_list)}}):
            if user['user_id'] not in idle_list:
                idle_list[user['user_id']] = timedelta()
            idle_list[user['user_id']] += timedelta(hours=int(user['idle_time'].split(':')[0]),
                                                    minutes=int(user['idle_time'].split(':')[1]),
                                                    seconds=int(user['idle_time'].split(':')[2]))

    sorted_idle_list = sorted(idle_list.items(), key=lambda x: x[1], reverse=True)
    idle_list = dict(sorted_idle_list)
    idle_list_str = {user: str(idle) for user, idle in idle_list.items()}

    return JSONResponse(content={"idle_list": idle_list_str})
