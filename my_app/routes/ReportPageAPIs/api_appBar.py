from fastapi import APIRouter, Query, Header
from datetime import datetime, timedelta
from fastapi.responses import JSONResponse
from methods.db_method import db_connection

api_appBar = APIRouter()

@api_appBar.get('/appBar', tags=["Reports Page"])
async def appBar(from_date: str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"),
                    to_date: str = Query(None, description="Ending date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-31"),
                    teamname: str = Header(...)):
    db = db_connection()
    user_data_collection = db['user_data']
    user_list_collection = db['users']
    if teamname == 'admin':
        user_list = list(set(user['user_id'] for user in user_list_collection.find()))
    else:
        user_list = list(set(user['user_id'] for user in user_list_collection.find({'teamname': teamname})))
    group_collection = db['app_groups']
    group_data = group_collection.find({})
    group_list = [group['group_name'] for group in group_data]
    unproductive_collection = db['unproductiveApps']
    unproductive_data = unproductive_collection.find({})
    unproductive_list = [app['name'] for app in unproductive_data]
    if from_date and to_date:
        user_data = user_data_collection.find({'date': {'$gte': from_date, '$lte': to_date}, 'user_id': {'$in': user_list}})
    else:
        user_data = user_data_collection.find({'date': datetime.now().strftime("%Y-%m-%d"), 'user_id': {'$in': user_list}})

    top_seven_group = {}
    for group in group_list:
        top_seven_group[group] = 0

    for user in user_data:
        for app in user['list_of_app']:
            window_title = app.get('window_title')
            used_time_str = app.get('used_time')
            used_time = datetime.strptime(used_time_str, "%H:%M:%S").time()
            for group in group_list:
                if group in window_title:
                    top_seven_group[group] += timedelta(hours=used_time.hour, minutes=used_time.minute, seconds=used_time.second).total_seconds()
                    break

    top_seven_group = dict(sorted(top_seven_group.items(), key=lambda item: item[1], reverse=True)[:7])

    #convert seconds to HH:MM:SS
    for key, value in top_seven_group.items():
        top_seven_group[key] = str(timedelta(seconds=value))

    result = {
        "top_seven_group": top_seven_group
    }

    return JSONResponse(status_code=200, content=result)