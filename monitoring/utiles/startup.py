import os
import sys
import shutil
import win32com.client


directory = os.path.expanduser('~')
window_file_name = sys.argv[0].split("\\")[-1].split(".")[0]
window_exe_name = window_file_name + ".exe"


def copy_exe_to_user_folder():
    try:
        if os.path.exists(os.path.join(directory, window_exe_name)):
            print(f"{window_exe_name} already exists in user folder")
            return
        # copy exe to user folder
        shutil.copy(f"{window_exe_name}", directory)
    except Exception as e:
        print("Error copying exe to user folder:", str(e))

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
        print("Error creating shortcut:", str(e))

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
        print("Error copying shortcut to startup folder:", str(e))

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
        print("Startup configuration error:", str(e))


