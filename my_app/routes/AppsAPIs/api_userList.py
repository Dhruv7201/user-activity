from fastapi import APIRouter, Query, Request, Header
from fastapi.responses import JSONResponse
from methods.db_method import db_connection
from methods.utiles import parse_datetime_with_fractional_seconds
from datetime import datetime

api_userList = APIRouter()
today = datetime.now().strftime("%Y-%m-%d")



@api_userList.get('/userList', tags=["AppPage"])
async def userList(request: Request, from_date: str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"),
                            to_date: str = Query(None, description="Ending date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-31"),
                            app_name: str = Query(None, description="App name", example="Google Chrome"),
                            teamname: str = Header(...)):
    db = db_connection()
    collection = db['user_data']
    user_list_collection = db['users']
    if teamname == 'admin':
        user_list = list(set(user['user_id'] for user in user_list_collection.find()))
    else:
        user_list = list(set(user['user_id'] for user in user_list_collection.find({'teamname': teamname})))
    result = {}

    if from_date and to_date:
        date_filter = {'date': {'$gte': from_date, '$lte': to_date}, 'user_id': {'$in': user_list}}
    else:
        date_filter = {'date': today, 'user_id': {'$in': user_list}}

    user_data = collection.find(date_filter)

    for user in user_data:
        user_id = user['user_id']

        for apps in user['list_of_app']:
            if user_id not in result and app_name == apps['window_title']:
                result[user_id] = {'start_time': [], 'used_time': []}
            if app_name == apps['window_title']:
                formatted_start_time = parse_datetime_with_fractional_seconds(apps['start_time']).strftime("%Y-%m-%d %H:%M:%S")
                result[user_id]['start_time'].append(formatted_start_time)
                result[user_id]['used_time'].append(apps['used_time'])
            elif app_name in apps['window_title']:
                result[user_id] = {'start_time': [], 'used_time': []}
                formatted_start_time = parse_datetime_with_fractional_seconds(apps['start_time']).strftime("%Y-%m-%d %H:%M:%S")
                result[user_id]['start_time'].append(formatted_start_time)
                result[user_id]['used_time'].append(apps['used_time'])

    return JSONResponse(content=result, status_code=200)
