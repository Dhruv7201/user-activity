from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import register_api
from Config import Config

app = FastAPI()


origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_api(app)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        Config.app_name, port=Config.port, host=Config.host, reload=Config.reload
    )
