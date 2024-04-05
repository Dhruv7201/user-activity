# start by pulling the python image
FROM python:3.8
RUN apt update

# copy requirements.txt to the docker image
COPY requirements.txt /app/requirements.txt

# switch working directory
WORKDIR /app

# install requirements
RUN pip install -r requirements.txt

# copy every content from the local file to the image
COPY . /app

# command to run on container start
CMD [ "python", "main.py" ]