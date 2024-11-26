import time
import pyautogui
from datetime import datetime
import os
import minio


directory = os.path.expanduser("~")
ss_dir = directory + "/ss"


def take_screen_shot():
    while True:
        print("Taking screenshot...")
        screenshot = pyautogui.screenshot()
        user = "kapil"
        date_time = user + "_" + datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
        if os.path.exists(ss_dir):
            print("Directory exists")
            print(date_time)
            file_name = f"{ss_dir}/{date_time}.png"
        else:
            os.makedirs(ss_dir, exist_ok=True)
            file_name = f"{ss_dir}/{date_time}.png"

        screenshot.save(file_name)

        upload_ss_to_server(file_name, date_time)
        # every 1 hour
        time.sleep(3600)


def upload_ss_to_server(file_name, date_time):
    bucket_name = "test-db"
    with open(file_name, "rb") as f:
        file_content = f.read()
    access_key = ""
    secret_key = ""

    client = minio.Minio(
        "objectstore.e2enetworks.net",
        access_key=access_key,
        secret_key=secret_key,
        secure=True,
    )

    file_parts = file_name.split("_")
    user_folder = file_parts[0].split("/")[-1]
    print(user_folder)
    date_time_str = file_parts[1].split(".")[0]
    date_time = datetime.strptime(date_time_str, "%Y-%m-%d-%H-%M-%S")
    date_file = date_time.strftime("%Y-%m-%d")
    time_file = date_time.strftime("%H-%M-%S") + file_name[file_name.rfind(".") :]
    full_path = os.path.join(date_file, user_folder, time_file)
    print(full_path)
    if date_time.hour >= 22 or date_time.hour < 8:
        os.remove(file_name)
    client.fput_object(bucket_name, "ss/" + full_path, file_name)
    print(file_name)
    # check if successfully uploaded
    if client.bucket_exists(bucket_name):
        print(f"Screenshot uploaded at {date_time}")
        # close the file
        # close file
        f.close()
    else:
        print(f"Failed to send screenshot at {date_time}")
    time.sleep(1)
    # Delete the saved screenshot file
    os.remove(file_name)
    return True


if __name__ == "__main__":
    take_screen_shot()
