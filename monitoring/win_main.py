import os
import time
import threading
import win32gui
import pyautogui
from datetime import datetime, timedelta
from pynput import mouse, keyboard
from utiles.u_id import get_uid
from utiles.utiles import write_in_rabbitMQ, upload_ss_to_server, read_log_file, delete_old_logs
from utiles.startup import startup_config
import requests


directory = os.path.expanduser('~')
user_name = directory.split("\\")[-1]
directory = os.path.join(directory, 'activity')
if not os.path.exists(directory):
    os.makedirs(directory)
ss_dir = directory + '\ss'
running = True
last_mouse_activity = time.time()
last_keyboard_activity = time.time()
today = datetime.now().strftime("%Y-%m-%d")
api_url = "https://api.useractivity.ethicstechnology.net/api"
# api_url = "http://192.168.0.156:5001/api"
response = requests.get(f'{api_url}/exe_config/').json()

if 'status' not in response:
    screen_shot_interval = int(300)
    ideal_time_threshold = int(10)
    start_working_hour = int(9)
    end_working_hour = int(21)
    working_days = int(5)
else:
    if response['status'] == "success":
        screen_shot_interval = int(response['screen_shot_interval'])
        ideal_time_threshold = int(response['ideal_time_threshold'])
        start_working_hour = int(response['start_working_hour'])
        end_working_hour = int(response['end_working_hour'])
        working_days = int(response['working_days'])
    else:
        screen_shot_interval = int(300)
        ideal_time_threshold = int(10)
        start_working_hour = int(9)
        end_working_hour = int(21)
        working_days = int(5)




def take_screen_shot():
    while True:
        try:
            # check for working days
            if datetime.now().weekday() + 1 > working_days:
                continue
            if datetime.now().hour < start_working_hour or datetime.now().hour > end_working_hour:
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
            print("Error: ", e)
            

def get_active_window_title():
    global running
    if not running:
        return None
    hwnd = win32gui.GetForegroundWindow()
    window_title = win32gui.GetWindowText(hwnd)
    return window_title

def get_opened_windows():
    global data
    try:
        while True:
            if datetime.now().weekday() + 1 > working_days:
                continue
            if datetime.now().hour < start_working_hour or datetime.now().hour > end_working_hour:
                continue
            time.sleep(1)
            if data:
                if data['date'] != datetime.now().strftime("%Y-%m-%d"):
                    data = {
                        "user_id": get_uid(),
                        "date": datetime.now().strftime("%Y-%m-%d"),
                        "list_of_app": [],
                        "idle_time": "00:00:00"
                    }
            active_window_title = get_active_window_title()
            existing_window_titles = [window["window_title"] for window in data["list_of_app"]]

            def enum_handler(hwnd, ctx):
                window_title = win32gui.GetWindowText(hwnd)
                if window_title != '':
                    found_window = None
                    if window_title in existing_window_titles:
                        found_window = next(window for window in data["list_of_app"] if window["window_title"] == window_title)
                    if found_window:
                        if window_title == active_window_title:
                            used_time = datetime.strptime(found_window["used_time"], "%H:%M:%S")
                            new_used_time = used_time + timedelta(seconds=1)
                            found_window["used_time"] = str(new_used_time.time())  # Changed the format
                    else:
                        print("New window found: ", window_title)
                        data["list_of_app"].append({
                            "window_title": str(window_title),
                            "start_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                            "used_time": "00:00:00"
                        })

            win32gui.EnumWindows(enum_handler, None)
            data = write_in_rabbitMQ(data)
    except Exception as e:
        print('Error: ', e)


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

    mouse_listener = mouse.Listener(on_move=on_mouse_move, on_scroll=on_scroll, on_click=on_mouse_click)
    keyboard_listener = keyboard.Listener(on_press=on_key_press)
    mouse_listener.start()
    keyboard_listener.start()
    try:
        while True:
            if datetime.now().weekday() + 1 > working_days:
                continue
            if datetime.now().hour < start_working_hour or datetime.now().hour > end_working_hour:
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
                hours, minutes, seconds = map(int, idle_time.split(':'))
                idle_time = timedelta(hours=hours, minutes=minutes, seconds=seconds)
                idle_time += timedelta(seconds=1)
                hours, remainder = divmod(idle_time.seconds, 3600)
                minutes, seconds = divmod(remainder, 60)
                idle_time_str = str(timedelta(hours=hours, minutes=minutes, seconds=seconds))
                data["idle_time"] = idle_time_str
            else:
                running = True
                time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        mouse_listener.stop()
        keyboard_listener.stop()

def main():
    global data
    data = read_log_file()
    # send data with get_opened_windows as argument
    threading.Thread(target=get_opened_windows).start()
    threading.Thread(target=detect_inactivity).start()
    threading.Thread(target=take_screen_shot).start()
    

if __name__ == "__main__":
    try:
        delete_old_logs()
    except Exception as e:
        print("Error while deleting old logs: ", e)
    startup_config()
    main()
