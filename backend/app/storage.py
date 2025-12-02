import os
import shutil
import uuid
from pathlib import Path
from fastapi import UploadFile
from .config import get_settings

settings = get_settings()

BASE_PATH = Path(settings.local_storage_path)
BASE_PATH.mkdir(parents=True, exist_ok=True)


def save_file(file: UploadFile, folder: str | None, desired_name: str | None) -> tuple[str, str]:
    folder_name = (folder or "media").strip("/")
    target_folder = BASE_PATH / folder_name
    target_folder.mkdir(parents=True, exist_ok=True)

    filename = desired_name.strip("/") if desired_name else f"{uuid.uuid4().hex}_{file.filename}"
    filename = filename.replace("media/", "")
    path = target_folder / filename
    with path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    rel_path = f"{folder_name}/{filename}".lstrip("/")
    url = f"{settings.local_public_url.rstrip('/')}/{rel_path}"
    return url, rel_path


def delete_file(object_name: str):
    if not object_name:
        return
    cleaned = object_name.lstrip("/").replace("media/", "")
    path = BASE_PATH / cleaned
    if path.exists():
        try:
            path.unlink()
        except OSError:
            pass
