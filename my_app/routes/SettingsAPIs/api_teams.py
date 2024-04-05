from fastapi import APIRouter, HTTPException, Query, Path
from fastapi.responses import JSONResponse
from methods.db_method import db_connection


api_teams = APIRouter()


@api_teams.get("/teams", tags=["ManageTeamsPage"])
async def get_teams():
    db = db_connection()
    teams_collection = db['teams']
    teams = teams_collection.find()
    teams_list = []
    for team in teams:
        teams_list.append(team['teamname'])
    data = {'teams': teams_list}
    return JSONResponse(content=data)


@api_teams.post("/add_team/{team}", tags=["ManageTeamsPage"])
async def add_team(team: str = Path(..., min_length=1, max_length=20)):
    db = db_connection()
    teams_collection = db['teams']
    if team in teams_collection.distinct('teamname'):
        raise HTTPException(status_code=400, detail=f"Team '{team}' already exists.")
    try:
        teams_collection.insert_one({'teamname': team})
        return {"message": f"Team '{team}' added successfully."}
    except Exception as e:
        print(f"Error adding team: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error adding team: {str(e)}")


@api_teams.delete("/teams/{team_name}", tags=["ManageTeamsPage"])
async def delete_team(team_name: str):
    db = db_connection()
    teams_collection = db['teams']
    try:
        teams_collection.delete_one({'teamname': team_name})
        return {"message": f"Team '{team_name}' deleted successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting team: {str(e)}")
