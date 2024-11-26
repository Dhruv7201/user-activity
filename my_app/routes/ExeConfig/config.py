from fastapi import APIRouter, Path
from fastapi.responses import JSONResponse

api_config = APIRouter()


@api_config.get("/exe_config/", tags=["ExeConfig"])
def get_exe_config():
    # in seconds
    screen_shot_interval = 300
    # in seconds
    ideal_time_threshold = 10
    # in hours
    start_working_hour = 9
    # in hours
    end_working_hour = 21
    # in week days number 1 to 7
    working_days = 5
    return JSONResponse(
        {
            "status": "success",
            "screen_shot_interval": screen_shot_interval,
            "ideal_time_threshold": ideal_time_threshold,
            "start_working_hour": start_working_hour,
            "end_working_hour": end_working_hour,
            "working_days": working_days,
        }
    )


@api_config.get("/rabbitmq_config/", tags=["RabbitMQ"])
def get_rabbitmq_config():
    rabbitmq_host = "mq.ethicstechnology.net"
    rabbitmq_port = 5672
    rabbitmq_virtual_host = "/"
    rabbitmq_username = "valuusragent"
    rabbitmq_password = "Lh85*3q"
    return JSONResponse(
        {
            "status": "success",
            "rabbitmq_host": rabbitmq_host,
            "rabbitmq_port": rabbitmq_port,
            "rabbitmq_virtual_host": rabbitmq_virtual_host,
            "rabbitmq_username": rabbitmq_username,
            "rabbitmq_password": rabbitmq_password,
        }
    )
