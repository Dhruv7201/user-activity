from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from methods.db_method import db_connection

api_unproductive = APIRouter()


@api_unproductive.post("/addUnproductive", tags=["SettingsPage"])
async def addUnproductive(request: Request):
    data = await request.json()
    db = db_connection()
    collection = db["unproductiveApps"]
    # make regex pattern for given group name
    name = data["appName"]
    pattern = data["pattern"]
    collection.insert_one({"name": name, "pattern": pattern})
    return JSONResponse(content=data, status_code=200)


@api_unproductive.get("/unproductiveList", tags=["SettingsPage"])
async def getUnproductive(request: Request):
    db = db_connection()
    collection = db["unproductiveApps"]
    groups_collection = collection.find()
    list_of_groups = []
    for docs in groups_collection:
        groups = {
            "_id": str(docs["_id"]),
            "name": docs["name"],
            "pattern": docs["pattern"],
        }
        list_of_groups.append(groups)

    return JSONResponse(content=list_of_groups, status_code=200)


@api_unproductive.delete("/deleteapp", tags=["SettingsPage"])
async def deleteUnproductive(request: Request):
    db = db_connection()
    collection = db["unproductiveApps"]
    collection.delete_one({"name": request.query_params.get("name")})
    return JSONResponse(
        content={"message": "Unproductive App deleted"}, status_code=200
    )
