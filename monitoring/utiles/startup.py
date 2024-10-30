import os
import sys
import shutil
import win32com.client
from datetime import datetime

'''
get the user folder path and create a folder activity in it
'''
directory = os.path.expanduser('~')
directory = os.path.join(directory, 'activity')
if not os.path.exists(directory):
    os.makedirs(directory)
window_file_name = sys.argv[0].split("\\")[-1].split(".")[0]
window_exe_name = window_file_name + ".exe"
today = datetime.now().strftime("%Y-%m-%d")
error_log_file = os.path.join(directory, 'logs', f'error_log_{today}.json')
if not os.path.exists(os.path.join(directory, 'logs')):
    os.makedirs(os.path.join(directory, 'logs'))
if not os.path.exists(error_log_file):
    with open(error_log_file, 'w') as f:
        f.write("Error Log\n")


'''
copy exe to user folder if not exists to run it from there to keep the same exe location for all the users
'''
def copy_exe_to_user_folder():
    try:
        if os.path.exists(os.path.join(directory, window_exe_name)):
            print(f"{window_exe_name} already exists in user folder")
            return
        # copy exe to user folder
        shutil.copy(f"{window_exe_name}", directory)
    except Exception as e:
        with open(error_log_file, 'a') as f:
            f.write(f"Error while copying exe to user folder: {e}\n")


'''
create a shortcut of the exe in the startup folder to run the exe on startup of the system
'''
def create_shortcut(target_path, shortcut_name, description="Shortcut to My App"):
    try:
        
        print("Creating shortcut...")
        shell = win32com.client.Dispatch("WScript.Shell")
        
        # Get the user's Startup folder
        startup_folder = shell.SpecialFolders("Startup")
        shortcut_path = os.path.join(startup_folder, shortcut_name)
        
        if not os.path.exists(shortcut_path):
            shortcut = shell.CreateShortCut(shortcut_path)
            shortcut.TargetPath = target_path
            shortcut.Description = description
            shortcut.Save()
            print("Shortcut created successfully at", shortcut_path)
        else:
            print("Shortcut already exists at", shortcut_path)
    except Exception as e:
        with open(error_log_file, 'a') as f:
            f.write(f"Error while creating shortcut: {e}\n")


'''
copy the shortcut to the startup folder short cut will trigger the exe to run on startup
'''
def copy_shortcut_to_startup(shortcut_path):
    print("Copying shortcut to startup folder...")
    
    # Get the user's Startup folder
    shell = win32com.client.Dispatch("WScript.Shell")
    startup_folder = shell.SpecialFolders("Startup")
    shortcut_name = os.path.basename(shortcut_path)
    startup_shortcut_path = os.path.join(startup_folder, shortcut_name)

    try:
        # Check if the source shortcut file exists before copying
        if os.path.exists(shortcut_path):
            shutil.copy(shortcut_path, startup_shortcut_path)
            print("Copied shortcut to startup folder")
        else:
            print("Source shortcut not found:", shortcut_path)
    except Exception as e:
        with open(error_log_file, 'a') as f:
            f.write(f"Error while copying shortcut to startup folder: {e}\n")


'''
it will run the process of creating shortcut and copying it to the startup folder
'''
def startup_config():
    try:
        # copy exe to user folder
        copy_exe_to_user_folder()

        # Specify the path to your application's .exe
        app_path = os.path.join(directory, window_exe_name)
        
        # Create a shortcut to your application
        shortcut_name = f"{window_file_name}-shortcut.lnk"
        create_shortcut(app_path, shortcut_name)
        
        # Copy the shortcut to the user's Startup folder
        copy_shortcut_to_startup(shortcut_name)
    except Exception as e:
        with open(error_log_file, 'a') as f:
            f.write(f"Error in startup_config: {e}\n")


