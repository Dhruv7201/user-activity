import os
import time
import threading
import subprocess
from datetime import datetime, timedelta
from Xlib import X, display
from pynput import mouse, keyboard
from utiles.u_id import get_uid
from utiles.utiles import write_in_rabbitMQ, upload_ss_to_server
# from utiles.startup import startup_config

directory = os.path.expanduser('~')
ss_dir = os.path.join(directory, 'ss')
running = True
idle_time = timedelta(seconds=0)
last_mouse_activity = time.time()
last_keyboard_activity = time.time()
today = datetime.now().strftime("%Y-%m-%d")

ignore_window_titles = [
    "Battery Meter", "Network Flyout", "Window", "Task Host Window", "Folder In Use",
    "GDI+ Window (Explorer.EXE)", "Mail", "Add an account", "DDE Server Window",
    "OneDrive - Personal", "NotifyIconWindowTitle", "SecurityHealthSystray",
    "MS_WebcheckMonitor", "Settings", "Rtc Video PnP Listener", "AcrobatTrayIcon",
    "ESET Proxy", "GDI+ Window (eguiproxy.exe)", "Microsoft Text Input Application",
    "NvSvc", "BluetoothNotificationAreaIconWindowClass", "UxdService",
    "Windows Push Notifications Platform", "NvContainerWindowClass00000A20",
    "DWM Notification Window", "MSCTFIME UI", "Default IME", "Program Manager",
    ".NET-BroadcastEventWindow.b7ab7b.0", "NvContainerWindowClass00002B90",
    "InnoSetupLdrWindow", "Setup - Microsoft Visual Studio Code (User)",
    "Progress", "Setup", "Microsoft Office Sync Process", "OfficePowerManagerWindow",
    "GDI+ Window (MsoSync.exe)", "NvContainerWindowClass0000114C",
]

def take_screen_shot():
    global running
    while True:
        print("Taking screenshot...")
        user = get_uid()
        date_time = user + "_" + datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
        if os.path.exists(ss_dir):
            print("Directory exists")
            print(date_time)
            file_name = os.path.join(ss_dir, f"{date_time}.png")
        else:
            os.makedirs(ss_dir, exist_ok=True)
            file_name = os.path.join(ss_dir, f"{date_time}.png")

        # Use the 'import' command to take a screenshot on Linux
        subprocess.run(["import", file_name])

        upload_ss_to_server(file_name, date_time)
        # Every 1 hour
        time.sleep(3600)

def get_active_window_title():
    global running
    if not running:
        return
    d = display.Display()
    root = d.screen().root
    window_id = root.get_full_property(d.intern_atom('_NET_ACTIVE_WINDOW'), X.AnyPropertyType).value[0]
    window = d.create_resource_object('window', window_id)
    window_title = window.get_wm_name()
    d.close()
    return window_title

def get_opened_windows():
    global data, running
    try:
        while True:
            time.sleep(1)
            active_window_title = get_active_window_title()
            existing_window_titles = [window["window_title"] for window in data["list_of_app"]]

            # Replace this code with Linux-specific window enumeration
            # You can use 'xdotool' or similar tools to list open windows on Linux
            process = subprocess.Popen(["xdotool", "search", "--name", ""], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout, _ = process.communicate()
            window_ids = [w.decode('utf-8').strip() for w in stdout.splitlines()]

            for window_id in window_ids:
                window_title = subprocess.check_output(["xdotool", "getwindowname", window_id], stderr=subprocess.DEVNULL).decode("utf-8").strip()
                if window_title not in ignore_window_titles and window_title != '':
                    found_window = None
                    if window_title in existing_window_titles:
                        found_window = next(window for window in data["list_of_app"] if window["window_title"] == window_title)
                    if found_window:
                        if window_title == active_window_title:
                            used_time = datetime.strptime(found_window["used_time"], "%H:%M:%S")
                            new_used_time = used_time + timedelta(seconds=1)
                            found_window["used_time"] = str(new_used_time.time())  # Changed the format
                    else:
                        data["list_of_app"].append({
                            "window_title": window_title,
                            "start_time": datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f"),
                            "used_time": "00:00:00"
                        })

            data = write_in_rabbitMQ(data)
    except Exception as e:
        print(e)


def detect_inactivity():
    global idle_time, last_mouse_activity, last_keyboard_activity, data, running
    def on_mouse_move(x, y):
        global last_mouse_activity, idle_time, running
        running = True
        last_mouse_activity = time.time()

    def on_key_press(key):
        global last_keyboard_activity, idle_time, running
        running = True
        last_keyboard_activity = time.time()

    def on_scroll(x, y, dx, dy):
        global last_mouse_activity, idle_time, running
        running = True
        last_mouse_activity = time.time()

    def on_mouse_click(x, y, button, pressed):
        global last_mouse_activity, idle_time, running
        running = True
        last_mouse_activity = time.time()

    mouse_listener = mouse.Listener(on_move=on_mouse_move, on_scroll=on_scroll, on_click=on_mouse_click)
    keyboard_listener = keyboard.Listener(on_press=on_key_press)
    mouse_listener.start()
    keyboard_listener.start()
    try:
        while True:
            current_time = time.time()
            mouse_inactive_time = current_time - last_mouse_activity
            keyboard_inactive_time = current_time - last_keyboard_activity
            threshold = 10
            if mouse_inactive_time > threshold and keyboard_inactive_time > threshold:
                running = False
                idle_time += timedelta(seconds=1)
                hours, remainder = divmod(idle_time.seconds, 3600)
                minutes, seconds = divmod(remainder, 60)
                formatted_idle_time = f"{hours:02}:{minutes:02}:{seconds:02}"
                data["idle_time"] = formatted_idle_time
            time.sleep(1)
    except KeyboardInterrupt:
        pass
    finally:
        mouse_listener.stop()
        keyboard_listener.stop()

def main():
    global data, running
    data = {
        "user_id": get_uid(),
        "date": today,
        "list_of_app": [],
        "idle_time": "00:00:00"
    }
    global running
    # send data with get_opened_windows as argument
    threading.Thread(target=get_opened_windows).start()
    threading.Thread(target=take_screen_shot).start()
    threading.Thread(target=detect_inactivity).start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        running = False

if __name__ == "__main__":
    # startup_config()
    main()
