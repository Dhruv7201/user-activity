from fastapi import APIRouter, Request, Query, Header
from fastapi.responses import JSONResponse
from methods.db_method import db_connection
from datetime import datetime

api_datatable = APIRouter()

@api_datatable.get('/userDataTable', tags=["AppPage"])
async def datatable(request: Request, from_date: str = Query(None, description="Starting date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-01"), 
                            to_date: str = Query(None, description="Ending date (YYYY-MM-DD)", regex=r'\d{4}-\d{2}-\d{2}', example="2023-01-31"),
                            teamname: str = Header(...)):
    db = db_connection()
    app_specs = db['unproductiveApps']
    unproductive_apps = [doc['pattern'] for doc in app_specs.find()]
    collection = db['user_data']
    user_list_collection = db['users']
    if teamname == 'admin':
        user_list = list(set(user['user_id'] for user in user_list_collection.find()))
    else:
        user_list = list(set(user['user_id'] for user in user_list_collection.find({'teamname': teamname})))
    
    date_filter = {}
    date_filter['user_id'] = {'$in': user_list}
    
    if from_date and to_date:
        date_filter['date'] = {'$gte': from_date, '$lte': to_date}
    else:
        today = datetime.now().strftime("%Y-%m-%d")
        date_filter['date'] = today
    
    today_user_data = collection.find(date_filter)
    
    app_data = {}

    for doc in today_user_data:
        for app in doc['list_of_app']:
            window_title = app['window_title']

            if window_title not in app_data:
                app_data[window_title] = {
                    'count_of_all_apps': 1,
                    'unproductive': any(unprod_app.lower() in window_title.lower() for unprod_app in unproductive_apps)
                }
            else:
                app_data[window_title]['count_of_all_apps'] += 1

    formatted_data = [
        {
            'window_title': app,
            'count_of_all_apps': data['count_of_all_apps'],
            'unproductive': data['unproductive']
        }
        for app, data in app_data.items()
    ]
    sorted_data = sorted(formatted_data, key=lambda x: x['count_of_all_apps'], reverse=True)
    return JSONResponse(content=sorted_data)
