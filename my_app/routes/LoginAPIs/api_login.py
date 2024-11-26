from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from methods.db_method import db_connection, check_admin
from datetime import datetime, timedelta, timezone
from jose import jwt
import bcrypt


api_login = APIRouter()
SECRET_KEY = "FastAPI-reactJS"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120


def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def authenticate_user(username: str, password: str):
    db = db_connection()
    check_admin()
    login_data = db["login"]
    db_user = login_data.find({"username": username})

    for user in db_user:
        if verify_password(password, user["password"]):
            return {"authenticated": True, "teamname": user["teamname"]}

    return {"authenticated": False}


@api_login.post("/token", tags=["Login"])
async def login(request_data: dict):
    username = request_data.get("username")
    password = request_data.get("password")
    if not (username and password):
        raise HTTPException(status_code=400, detail="Invalid input data")
    print(username, password)
    auth_result = authenticate_user(username, password)
    if auth_result["authenticated"]:
        token_data = {"sub": username, "teamname": auth_result["teamname"]}
        access_token = create_token(token_data)
        return JSONResponse(
            {
                "access_token": access_token,
                "token_type": "bearer",
                "teamname": auth_result["teamname"],
            }
        )
    else:
        raise HTTPException(status_code=401, detail="Invalid credentials")
