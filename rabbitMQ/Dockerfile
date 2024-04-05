# Dockerfile for consumer service
FROM python:3.8

WORKDIR /app

COPY . /app

RUN pip install -r requirements.txt

CMD ["python", "consumer.py"]
