import os
import time
import threading
import win32gui
import pyautogui
from datetime import datetime, timedelta
from pynput import mouse, keyboard
from utiles.u_id import get_uid, host_name
from utiles.utiles import (
    write_in_rabbitMQ,
    upload_ss_to_server,
    read_log_file,
    delete_old_logs,
    write_error_in_rabbitMQ,
)
from utiles.startup import startup_config
from utiles.updater import update_exe
import requests

"""
expanduser('~') returns the path to the user's home directory for storing the activity logs.
directory structure:
- activity
    - ss
    - logs
    - uuid.txt
    - win_main.py
    - utiles/
        - u_id.py
        - utiles.py
        - updater.py
        - startup.py
        - cleanup_exe.py

exe for all task will be generated with pyinstaller with flags --onefile --noconsole --icon=icon.ico
"""
directory = os.path.expanduser("~")
user_name = directory.split("\\")[-1]
directory = os.path.join(directory, "activity")
if not os.path.exists(directory):
    os.makedirs(directory)
ss_dir = directory + "\ss"
running = True
last_mouse_activity = time.time()
last_keyboard_activity = time.time()
today = datetime.now().strftime("%Y-%m-%d")
api_url = "https://api.useractivity.ethicstechnology.net/api"
# api_url = "http://192.168.0.156:5001/api"
response = requests.get(f"{api_url}/exe_config/").json()
"""
This is to get the configuration from the server. If the server is down or the configuration is not available, the default values will be used.
configurations:
- screen_shot_interval: time interval to take a screenshot
- ideal_time_threshold: time threshold to detect inactivity
- start_working_hour: start time of the working hour
- end_working_hour: end time of the working hour
- working_days: number of working days in a week
/exe_config/ API will return the configuration in JSON format.
"""
if "status" not in response:
    screen_shot_interval = int(300)
    ideal_time_threshold = int(10)
    start_working_hour = int(9)
    end_working_hour = int(21)
    working_days = int(5)
else:
    if response["status"] == "success":
        screen_shot_interval = int(response["screen_shot_interval"])
        ideal_time_threshold = int(response["ideal_time_threshold"])
        start_working_hour = int(response["start_working_hour"])
        end_working_hour = int(response["end_working_hour"])
        working_days = int(response["working_days"])
    else:
        screen_shot_interval = int(300)
        ideal_time_threshold = int(10)
        start_working_hour = int(9)
        end_working_hour = int(21)
        working_days = int(5)


"""
Take screenshot and upload to the server.
If the current time is not within the working hours or working days, the script will sleep for 10000 seconds.
Screen shot will be deleted after uploading to the server.
weekdays will be in 0-6 format. 0 is Monday and 6 is Sunday.
"""


def take_screen_shot():
    while True:
        try:
            # check for working days
            if datetime.now().weekday() + 1 > working_days:
                time.sleep(10000)
                continue
            if (
                datetime.now().hour < start_working_hour
                or datetime.now().hour > end_working_hour
            ):
                time.sleep(10000)
                continue
            print("Taking screenshot...")
            screenshot = pyautogui.screenshot()
            user = get_uid()
            date_time = user + "_" + datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
            if os.path.exists(ss_dir):
                print("Directory exists")
                print(date_time)
                file_name = f"{ss_dir}/{date_time}.png"
            else:
                os.makedirs(ss_dir, exist_ok=True)
                file_name = f"{ss_dir}/{date_time}.png"

            screenshot.save(file_name)

            upload_ss_to_server(file_name, api_url)
            time.sleep(screen_shot_interval)
        except Exception as e:
            print("Error while taking screenshot: ", e)
            write_error_in_rabbitMQ(f"Error while taking screenshot: {e}")


"""
It will return the title of the active window.
"""


def get_active_window_title():
    global running
    if not running:
        return None
    hwnd = win32gui.GetForegroundWindow()
    window_title = win32gui.GetWindowText(hwnd)
    return window_title


"""
Logic to get the opened windows and the time spent on each window.
Logic could be improved.
"""


def get_opened_windows():
    global data
    try:
        while True:
            """
            sleep the script for good amount of time as the script will run for the whole day not good for the system.
            """
            if datetime.now().weekday() + 1 > working_days:
                time.sleep(10000)
                continue
            if (
                datetime.now().hour < start_working_hour
                or datetime.now().hour > end_working_hour
            ):
                time.sleep(10000)
                continue
            time.sleep(1)
            if data:
                if data["date"] != datetime.now().strftime("%Y-%m-%d"):
                    data = {
                        "user_id": get_uid(),
                        "host_name": host_name(),
                        "date": datetime.now().strftime("%Y-%m-%d"),
                        "list_of_app": [],
                        "idle_time": "00:00:00",
                    }
            active_window_title = get_active_window_title()
            existing_window_titles = [
                window["window_title"] for window in data["list_of_app"]
            ]
            """
            enum_handler function will be called for each window.
            it will check if the window is already in the list_of_app.
            """

            def enum_handler(hwnd, ctx):
                window_title = win32gui.GetWindowText(hwnd)
                if window_title != "":
                    found_window = None
                    if window_title in existing_window_titles:
                        found_window = next(
                            window
                            for window in data["list_of_app"]
                            if window["window_title"] == window_title
                        )
                    if found_window:
                        if window_title == active_window_title:
                            used_time = datetime.strptime(
                                found_window["used_time"], "%H:%M:%S"
                            )
                            new_used_time = used_time + timedelta(seconds=1)
                            found_window["used_time"] = str(
                                new_used_time.time()
                            )  # Changed the format
                    else:
                        print("New window found: ", window_title)
                        data["list_of_app"].append(
                            {
                                "window_title": str(window_title),
                                "start_time": datetime.now().strftime(
                                    "%Y-%m-%d %H:%M:%S"
                                ),
                                "used_time": "00:00:00",
                            }
                        )

            win32gui.EnumWindows(enum_handler, None)
            data = write_in_rabbitMQ(data)
    except Exception as e:
        print("Error while getting opened windows: ", e)
        write_error_in_rabbitMQ(f"Error while getting opened windows: {e}")


"""
inactivity will be detected by the mouse and keyboard.
it will be checked every second.
if the inactivity is detected, the script will sleep for 1 second.
if the inactivity is detected for the ideal_time_threshold, the script will set running to False.
if not running and inactivity is detected, the idle_time will be updated. and used_time will not be updated.
"""


def detect_inactivity():
    global running
    time.sleep(1)
    global last_mouse_activity, last_keyboard_activity, data

    def on_mouse_move(x, y):
        global last_mouse_activity
        last_mouse_activity = time.time()

    def on_key_press(key):
        global last_keyboard_activity
        last_keyboard_activity = time.time()

    def on_scroll(x, y, dx, dy):
        global last_mouse_activity
        last_mouse_activity = time.time()

    def on_mouse_click(x, y, button, pressed):
        global last_mouse_activity
        last_mouse_activity = time.time()

    mouse_listener = mouse.Listener(
        on_move=on_mouse_move, on_scroll=on_scroll, on_click=on_mouse_click
    )
    keyboard_listener = keyboard.Listener(on_press=on_key_press)
    mouse_listener.start()
    keyboard_listener.start()
    try:
        while True:
            if datetime.now().weekday() + 1 > working_days:
                time.sleep(10000)
                continue
            if (
                datetime.now().hour < start_working_hour
                or datetime.now().hour > end_working_hour
            ):
                time.sleep(10000)
                continue
            current_time = time.time()
            mouse_inactive_time = current_time - last_mouse_activity
            keyboard_inactive_time = current_time - last_keyboard_activity
            threshold = ideal_time_threshold
            if mouse_inactive_time > threshold and keyboard_inactive_time > threshold:
                time.sleep(1)
                running = False
                idle_time = data["idle_time"]
                # convert string to timedelta seconds
                hours, minutes, seconds = map(int, idle_time.split(":"))
                idle_time = timedelta(hours=hours, minutes=minutes, seconds=seconds)
                idle_time += timedelta(seconds=1)
                hours, remainder = divmod(idle_time.seconds, 3600)
                minutes, seconds = divmod(remainder, 60)
                idle_time_str = str(
                    timedelta(hours=hours, minutes=minutes, seconds=seconds)
                )
                data["idle_time"] = idle_time_str
            else:
                running = True
                time.sleep(1)
    except Exception as e:
        write_error_in_rabbitMQ("Error while detecting inactivity: " + str(e))
    finally:
        mouse_listener.stop()
        keyboard_listener.stop()


def main():
    global data
    data = read_log_file()
    """
    used threading to run the functions in parallel.
    without threading, the script will run the functions one by one.
    not using asyncio because of the compatibility issue with the libraries.
    not using multiprocessing because of blocking the main thread.
    """
    threading.Thread(target=get_opened_windows).start()
    threading.Thread(target=detect_inactivity).start()
    threading.Thread(target=take_screen_shot).start()


if __name__ == "__main__":
    try:
        """
        update the exe file if there is a new version available.
        """
        update_exe()
    except Exception as e:
        write_error_in_rabbitMQ(f"Error while checking for updates: {e}")
    try:
        """
        utility function to delete old logs.
        """
        delete_old_logs()
    except Exception as e:
        write_error_in_rabbitMQ(f"Error while deleting old logs: {e}")
    try:
        """
        utility function to set up the exe file on startup of windows.
        """
        startup_config()
    except Exception as e:
        write_error_in_rabbitMQ(f"Error while setting up startup: {e}")
    """
    main function to start the script to monitor the user activity.
    """
    main()
