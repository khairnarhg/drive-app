import os
from flask import current_app


def get_available_disk_space():
    folder_path = current_app.config["UPLOAD_FOLDER"]
    total_space = current_app.config["ALLOCATED_SPACE"] * 1024 * 1024 * 1024

    used_space = 0

    for dirpath, dirnames, filenames in os.walk(folder_path):
        for f in filenames:
            fp = os.path.join(dirpath,f)

            try:
                used_space += os.path.getsize(fp)
            except OSError as e:
                print(f"Error in getting size for :{fp}")
                print(f"Error: {e}")
                continue
    
    remaining_space = total_space - used_space


    return remaining_space/(1024 * 1024 * 1024)

