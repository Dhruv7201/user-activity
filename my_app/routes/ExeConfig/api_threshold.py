from fastapi import APIRouter, Path
from fastapi.responses import JSONResponse

api_threshold = APIRouter()

@api_threshold.get("/ideal_time_threshold/{user_name}", tags=["ExeConfig"])
async def get_threshold(user_name: str = Path(..., title="The name of the user", description="The name of the user")):
    print(user_name)
    threshold = 10
    return JSONResponse({"status": "success", "ideal_time_threshold": threshold})