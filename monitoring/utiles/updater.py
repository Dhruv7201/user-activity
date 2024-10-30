import requests
import os

api_url = "https://api.useractivity.ethicstechnology.net/api"
# api_url = "http://192.168.0.156:5001/api"
path = os.path.expanduser('~')
path = os.path.join(path, 'activity')
if not os.path.exists(path):
    os.makedirs(path)

'''
it will check the api for version and download the updater_exe if the version is different
'''
def check_for_updates():
    if not os.path.exists(path):
        os.makedirs(path)
    if not os.path.exists(f"{path}/version.txt"):
        with open(f"{path}/version.txt", "w") as f:
            response = requests.get(f'{api_url}/update/0.0.0').json()
            f.write(response['latest_version'])
            return True
    with open(f"{path}/version.txt", "r") as f:
        current_version = f.read().strip()
    response = requests.get(f'{api_url}/update/{current_version}').json()
    if response['update_required']:
        with open(f"{path}/version.txt", "w") as f:
            f.write(response['latest_version'])
        return True 
    return False



def update_exe():
    update_flag = check_for_updates()
    print(update_flag)
    if update_flag:
        # check if updater.exe exists
        if not os.path.exists(f"{path}/updater_exe.exe"):
            response = requests.get(f'{api_url}/download_updater_exe')
            response.raise_for_status()
            '''
            download the updater_exe
            '''
            with open(f'{path}/updater_exe.exe', 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        f.write(chunk)
        '''
        run the updater_exe
        '''
        os.system(f'{path}/updater_exe.exe')
