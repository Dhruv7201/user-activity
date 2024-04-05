import os

# Specify the directory where 'uuid.txt' should be located
directory = os.path.expanduser('~')  # This points to the user's home directory
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
    # write to file
    with open(uuid_file, 'w') as f:
        f.write(uid)
    return uid
