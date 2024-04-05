from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from methods.db_method import db_connection

api_groupapp = APIRouter()




@api_groupapp.post('/addGroup', tags=["SettingsPage"])
async def addGroup(request: Request):
    data = await request.json()
    db = db_connection()
    collection = db['app_groups']
    # make regex pattern for given group name
    pattern = data['application']
    group_name = data['nameGroup']
    collection.insert_one({'pattern': pattern, 'group_name': group_name})
    return JSONResponse(content=data, status_code=200)


@api_groupapp.get('/groupList', tags=["SettingsPage"])
async def getGroups(request: Request):
    db = db_connection()
    collection = db['app_groups']
    groups_collection = collection.find()
    list_of_groups = []
    for docs in groups_collection:
        groups= {
            '_id': str(docs['_id']),
            'pattern': docs['pattern'],
            'nameGroup': docs['group_name']
        }
        list_of_groups.append(groups)

    return JSONResponse(content=list_of_groups, status_code=200)


@api_groupapp.delete('/deleteGroup', tags=["SettingsPage"])
async def deleteGroup(request: Request):
    db = db_connection()
    collection = db['app_groups']
    collection.delete_one({'group_name': request.query_params.get('nameGroup')})
    return JSONResponse(content={'message': 'Group deleted'}, status_code=200)
