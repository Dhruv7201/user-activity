import os

exe_folder_name = 'activity'

def cleanup_exe():
    try:
        # Get the directory where the executable is stored
        directory = os.path.expanduser('~')
        directory = os.path.join(directory, exe_folder_name)

        # Check if the directory exists
        if os.path.exists(directory):
            # Iterate over files in the directory
            for file in os.listdir(directory):
                if file.endswith('.exe'):
                    exe_name = file
                    # Stop the executable
                    os.system(f"taskkill /f /im {exe_name}")

            # Get the path for the startup folder
            start_up_folder = os.path.join(os.getenv('APPDATA'), 'Microsoft', 'Windows', 'Start Menu', 'Programs', 'Startup')

            # Check if the startup folder exists
            if os.path.exists(start_up_folder):
                # Delete shortcut from startup folder
                os.system(f"del \"{os.path.join(start_up_folder, exe_name.split('.')[0] + '-shortcut.lnk')}\"")
            # Remove directory forcefully
            os.system(f"rmdir /s /q {directory}")
        else:
            print("Directory not found:", directory)

    except Exception as e:
        print("An error occurred:", e)



if __name__ == "__main__":
    cleanup_exe()