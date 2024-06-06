import os

# Specify the directory where 'uuid.txt' should be located
directory = os.path.expanduser('~')
directory = os.path.join(directory, 'activity')
if not os.path.exists(directory):
    os.makedirs(directory)
uuid_file = os.path.join(directory, 'uuid.txt')


def get_uid():
    if os.path.exists(uuid_file):
        with open(uuid_file, 'r') as f:
            get_uid = f.read()
            if get_uid != '':
                return get_uid
            else:
                get_uid = generate_uid()
    else:
        get_uid = generate_uid()
    return get_uid

def generate_uid():
    # get username from os
    uid = os.getlogin()
    uid = uid.replace('_', '.')
    # write to file
    with open(uuid_file, 'w') as f:
        f.write(uid)
    return uid
