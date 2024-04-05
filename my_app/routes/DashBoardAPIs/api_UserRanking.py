from fastapi import APIRouter, Request, Query, Header
from fastapi.responses import JSONResponse
from datetime import datetime
from methods.db_method import db_connection



api_userRankings = APIRouter()

def format_time(seconds):
    hours, remainder = divmod(seconds, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f"{hours:02d}:{minutes:02d}:{seconds:02d}"

@api_userRankings.get("/mostActiveUser", tags=['UserRankings'])
async def mostActiveUsers(request: Request, fromDate: str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"), 
                            toDate: str = Query(None, description="Ending date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-31"),
                            teamname: str = Header(...)):
    
    db = db_connection()
    data_collection = db['user_data']
    user_list_collection = db['users']
    if teamname == 'admin':
        user_list = list(set(user['user_id'] for user in user_list_collection.find()))
    else:
        user_list = list(set(user['user_id'] for user in user_list_collection.find({'teamname': teamname})))
    
    user_rankings = {}

    date_range_filter = {'date': {'$gte': fromDate, '$lte': toDate}}
    user_data = data_collection.find(date_range_filter)

    for user in user_data:
        user_id = user['user_id']
        if user_id in user_list:
            total_seconds = sum([int(app['used_time'].split(':')[0]) * 3600 +
                                int(app['used_time'].split(':')[1]) * 60 +
                                int(app['used_time'].split(':')[2]) for app in user['list_of_app']])

            if user_id in user_rankings:
                user_rankings[user_id] += total_seconds
            else:
                user_rankings[user_id] = total_seconds

    sorted_user_rankings = dict(sorted(user_rankings.items(), key=lambda item: item[1], reverse=True))
    user_rankings_formatted = {user: format_time(total_seconds) for user, total_seconds in sorted_user_rankings.items()}
    return JSONResponse({"status": "success", "user_rankings": user_rankings_formatted})



@api_userRankings.get("/mostProductiveUsers", tags=["UserRankings"])
async def mostProductiveUser(request: Request, fromDate: str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"), 
                            toDate: str = Query(None, description="Ending date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-31"),
                            teamname: str = Header(...)):
    
    db = db_connection()
    data_collection = db['user_data']
    apps_collection = db['app_groups']
    user_list_collection = db['users']
    if teamname == 'admin':
        user_list = list(set(user['user_id'] for user in user_list_collection.find()))
    else:
        user_list = list(set(user['user_id'] for user in user_list_collection.find({'teamname': teamname})))
    appData = apps_collection.find()
    productiveApps = [app["group_name"] for app in appData]
    
    user_rankings = {}

    date_range_filter = {'date': {'$gte': fromDate, '$lte': toDate}}
    user_data = data_collection.find(date_range_filter)
    
    for user in user_data:
        user_id = user['user_id']
        if user_id in user_list:
            total_seconds = 0
            
            for app in user['list_of_app']:
                for papp in productiveApps:
                    if papp in app['window_title']:
                        total_seconds += int(app['used_time'].split(':')[0]) * 3600 + int(app['used_time'].split(':')[1]) * 60 + int(app['used_time'].split(':')[2])
                        break
            if user_id in user_rankings:
                user_rankings[user_id] += total_seconds
            else:
                user_rankings[user_id] = total_seconds
    
    sorted_user_rankings = dict(sorted(user_rankings.items(), key=lambda item: item[1], reverse=True))
    user_rankings_formatted = {user: format_time(total_seconds) for user, total_seconds in sorted_user_rankings.items()}

    return JSONResponse({"status": "success", "user_rankings": user_rankings_formatted})
