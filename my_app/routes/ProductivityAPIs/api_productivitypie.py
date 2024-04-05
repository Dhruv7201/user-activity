from fastapi import APIRouter, Query, Header
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from methods.db_method import db_connection

api_productivitypie = APIRouter()

@api_productivitypie.get('/productivitypie', tags=["ProductivityPage"])
async def productivitypie(from_date: str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"),
                            to_date: str = Query(None, description="Ending date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-31"),
                            teamname: str = Header(...)):
    db = db_connection()
    user_data_collection = db['user_data']
    productivity_collection = db['app_groups']
    user_list_collection = db['users']
    if teamname == 'admin':
        user_list = list(set(user['user_id'] for user in user_list_collection.find()))
    else:
        user_list = list(set(user['user_id'] for user in user_list_collection.find({'teamname': teamname})))

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
        idle_time_str = user['idle_time']
        idle_time = datetime.strptime(idle_time_str, "%H:%M:%S").time()
        for app in user['list_of_app']:
            used_time_str = app.get('used_time')
            used_time = datetime.strptime(used_time_str, "%H:%M:%S").time()
            total_used_time += timedelta(hours=used_time.hour, minutes=used_time.minute, seconds=used_time.second)

            window_title = app.get('window_title')
            for productivity_app in productivity_list:
                if productivity_app in window_title:
                    total_productive_time += timedelta(hours=used_time.hour, minutes=used_time.minute, seconds=used_time.second)
                    break
        total_idle_time += timedelta(hours=idle_time.hour, minutes=idle_time.minute, seconds=idle_time.second)
    neutral_time = total_used_time - total_productive_time
    total_time = neutral_time + total_productive_time + total_idle_time
    # calculate percentage of each time
    neutral_time = neutral_time / total_time * 100
    total_productive_time = total_productive_time / total_time * 100
    total_idle_time = total_idle_time / total_time * 100
    result = {
        "neutral_time": str(neutral_time),
        "productive_time": str(total_productive_time),
        "idle_time": str(total_idle_time),
    }

    return JSONResponse(status_code=200, content=result)
