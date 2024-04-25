import os
import sys
import subprocess

directory = os.path.expanduser('~')
startup_folder = os.path.join(directory, "AppData", "Roaming", "Microsoft", "Windows", "Start Menu", "Programs", "Startup")
download_folder = os.path.join(directory, "Downloads")
user_folder = os.path.join(directory, "AppData", "Roaming")
directory = os.path.join(directory, 'activity')
if not os.path.exists(directory):
    os.makedirs(directory)
win_main = "win_main"
file_name = os.path.splitext(sys.argv[0].split("\\")[-1])[0]
ss_folder = 'ss'
log_folder = 'logs'


def delete_file(file_path, description):
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            print(f"Deleted {description} from {os.path.dirname(file_path)}")
    except Exception as e:
        print(f"Error deleting {description}: {str(e)}")


def delete_folder(folder_path, description):
    try:
        if os.path.exists(folder_path):
            os.rmdir(folder_path)
            print(f"Deleted {description} folder from {directory}")
    except Exception as e:
        print(f"Error deleting {description} folder: {str(e)}")


def clean_up():
    try:
        processes_to_kill = [win_main]
        for process in processes_to_kill:
            subprocess.run(['taskkill', '/f', '/im', f'{process}.exe'])

        for item in [win_main, file_name]:
            delete_file(os.path.join(download_folder, f'{item}.exe'), f'{item}.exe')
            delete_file(os.path.join(download_folder, f'{item}.lnk'), f'{item}.lnk')
            delete_file(os.path.join(startup_folder, f'{item}.exe'), f'{item}.exe')
            delete_file(os.path.join(startup_folder, f'{item}.lnk'), f'{item}.lnk')
            delete_file(os.path.join(user_folder, item), item)

        delete_folder(os.path.join(directory, ss_folder), ss_folder)
        delete_folder(os.path.join(directory, log_folder), log_folder)

    except Exception as e:
        print("Error during cleanup:", str(e))

