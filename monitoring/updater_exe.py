import os
import requests

api_url = "https://api.useractivity.ethicstechnology.net/api"
# api_url = "http://192.168.0.156:5001/api"


'''
it will check the api for version and download the updater_exe if the version is different
download the new exe and run it
and remove the old exe
'''
if __name__ == '__main__':
    exe_list = [name for name in os.listdir() if name.endswith('.exe')]
    
    for exe in exe_list:
        if exe != 'EthicsAntivirus.exe':
            continue
        exe_name = exe.split('.')[0]
        try:
            # terminate all processes with exe name
            os.system(f'taskkill /f /im {exe}')
        except OSError as e:

            print(f"Error terminating process {exe}: {e}")
            continue

        # download new exe
        try:
            response = requests.get(f'{api_url}/download_exe/', stream=True)
            response.raise_for_status()
            with open(f'{exe_name}_new.exe', 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
        except requests.RequestException as e:
            print(f"Error downloading new exe: {e}")
            continue

        # remove old exe
        try:
            os.remove(exe)
        except OSError as e:
            print(f"Error removing old exe {exe}: {e}")
            continue

        # rename new exe
        try:
            os.rename(f'{exe_name}_new.exe', exe)
        except OSError as e:
            print(f"Error renaming new exe {exe_name}_new.exe: {e}")

        # run new exe
        try:
            os.system(f'{exe}')
        except OSError as e:
            print(f"Error running new exe {exe}: {e}")
            continue