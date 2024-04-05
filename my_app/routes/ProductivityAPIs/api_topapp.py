from fastapi import APIRouter, Query, Header
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta
from methods.db_method import db_connection

api_topapp = APIRouter()

@api_topapp.get('/topApp', tags=["ProductivityPage"])
async def topapp(from_date: str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"),
                    to_date: str = Query(None, description="Ending date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-31"),
                    teamname: str = Header(...)):
    db = db_connection()
    user_data_collection = db['user_data']
    user_list_collection = db['users']
    if teamname == 'admin':
        user_list = list(set(user['user_id'] for user in user_list_collection.find()))
    else:
        user_list = list(set(user['user_id'] for user in user_list_collection.find({'teamname': teamname})))

    if from_date and to_date:
        user_data = user_data_collection.find({'date': {'$gte': from_date, '$lte': to_date}, 'user_id': {'$in': user_list}})
    else:
        user_data = user_data_collection.find({'date': datetime.now().strftime("%Y-%m-%d"), 'user_id': {'$in': user_list}})

    top_app = {}
    for user in user_data:
        for app in user['list_of_app']:
            window_title = app.get('window_title')
            used_time_str = app.get('used_time')
            used_time = datetime.strptime(used_time_str, "%H:%M:%S").time()

            top_app[window_title] = top_app.get(window_title, timedelta()) + timedelta(hours=used_time.hour, minutes=used_time.minute, seconds=used_time.second)

    # Combine usage across all documents
    combined_top_app = {}
    for title, time in top_app.items():
        combined_top_app[title] = combined_top_app.get(title, timedelta()) + time

    # Find the app with the highest usage time
    top_app_serializable = max(combined_top_app.items(), key=lambda x: x[1])

    result = {
        "productivity": str(top_app_serializable[0])
    }

    return JSONResponse(status_code=200, content=result)


@api_topapp.get('/topTab', tags=["ProductivityPage"])
async def topTab(from_date: str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"),
                    to_date: str = Query(None, description="Ending date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-31"),
                    teamname: str = Header(...)):
    db = db_connection()
    user_data_collection = db['user_data']
    group_collection = db['app_groups']
    chrome_tab = group_collection.find_one({'group_name': 'Google Chrome'})
    chrome_tab = chrome_tab['group_name']
    user_list_collection = db['users']
    if teamname == 'admin':
        user_list = list(set(user['user_id'] for user in user_list_collection.find()))
    else:
        user_list = list(set(user['user_id'] for user in user_list_collection.find({'teamname': teamname})))

    if from_date and to_date:
        user_data = user_data_collection.find({'date': {'$gte': from_date, '$lte': to_date}, 'user_id': {'$in': user_list}})
    else:
        user_data = user_data_collection.find({'date': datetime.now().strftime("%Y-%m-%d"), 'user_id': {'$in': user_list}})

    top_tab = {}
    for user in user_data:
        for app in user['list_of_app']:
            window_title = app.get('window_title')
            used_time_str = app.get('used_time')
            used_time = datetime.strptime(used_time_str, "%H:%M:%S").time()

            if chrome_tab in window_title:
                top_tab[window_title] = top_tab.get(window_title, timedelta()) + timedelta(hours=used_time.hour, minutes=used_time.minute, seconds=used_time.second)

    # Combine usage across all documents
    combined_top_tab = {}
    for title, time in top_tab.items():
        combined_top_tab[title] = combined_top_tab.get(title, timedelta()) + time

    # Find the app with the highest usage time
    top_tab_serializable = max(combined_top_tab.items(), key=lambda x: x[1])

    result = {
        "productivity": str(top_tab_serializable[0])
    }

    return JSONResponse(status_code=200, content=result)


@api_topapp.get('/topCategory', tags=["ProductivityPage"])
async def topCategory(from_date: str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"),
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
    productivity_apps = group_collection.find({})
    productivity_list = [app['group_name'] for app in productivity_apps]

    if from_date and to_date:
        user_data = user_data_collection.find({'date': {'$gte': from_date, '$lte': to_date}, 'user_id': {'$in': user_list}})
    else:
        user_data = user_data_collection.find({'date': datetime.now().strftime("%Y-%m-%d"), 'user_id': {'$in': user_list}})

    top_category = {}
    for user in user_data:
        for app in user['list_of_app']:
            window_title = app.get('window_title')
            used_time_str = app.get('used_time')
            used_time = datetime.strptime(used_time_str, "%H:%M:%S").time()

            for i, app in enumerate(productivity_list):
                if app in window_title:
                    productive_app = productivity_list[i]
                    top_category[productive_app] = top_category.get(productive_app, timedelta()) + timedelta(hours=used_time.hour, minutes=used_time.minute, seconds=used_time.second)

    # Combine usage across all documents
    combined_top_category = {}
    for title, time in top_category.items():
        combined_top_category[title] = combined_top_category.get(title, timedelta()) + time

    # Find the app with the highest usage time
    top_category_serializable = max(combined_top_category.items(), key=lambda x: x[1])

    result = {
        "productivity": str(top_category_serializable[0])
    }

    return JSONResponse(status_code=200, content=result)


@api_topapp.get('/topUnproductive', tags=["ProductivityPage"])
async def topUnproductive(from_date: str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"),
                  to_date: str = Query(None, description="Ending date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-31")):
    db = db_connection()
    user_data_collection = db['user_data']
    unproductive_collection = db['unproductiveApps']
    unproductive_apps = unproductive_collection.find({})
    unproductive_list = [app['name'] for app in unproductive_apps]

    if from_date and to_date:
        user_data = user_data_collection.find({'date': {'$gte': from_date, '$lte': to_date}})
    else:
        user_data = user_data_collection.find()

    top_unproductive = {}
    for user in user_data:
        for app in user['list_of_app']:
            window_title = app.get('window_title')
            used_time_str = app.get('used_time')
            used_time = datetime.strptime(used_time_str, "%H:%M:%S").time()

            for i, app in enumerate(unproductive_list):
                if app in window_title:
                    unproductive_app = unproductive_list[i]
                    top_unproductive[unproductive_app] = top_unproductive.get(unproductive_app, timedelta()) + timedelta(hours=used_time.hour, minutes=used_time.minute, seconds=used_time.second)

    # Combine usage across all documents
    combined_top_unproductive = {}
    for title, time in top_unproductive.items():
        combined_top_unproductive[title] = combined_top_unproductive.get(title, timedelta()) + time
    if not combined_top_unproductive:
        result = {
            "productivity": "No unproductive app found"
        }
        return JSONResponse(status_code=200, content=result)
    # Find the app with the highest usage time
    top_unproductive_serializable = max(combined_top_unproductive.items(), key=lambda x: x[1])

    result = {
        "productivity": str(top_unproductive_serializable[0])
    }

    return JSONResponse(status_code=200, content=result)