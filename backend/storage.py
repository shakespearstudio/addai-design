import uuid
import os

_projects: dict[str, dict] = {}

UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "/tmp/uploads")
RENDER_DIR = os.environ.get("RENDER_DIR", "/tmp/renders")


def create_project() -> str:
    pid = str(uuid.uuid4())
    _projects[pid] = {"project_id": pid, "status": "created", "renders": []}
    return pid


def get_project(pid: str) -> dict | None:
    return _projects.get(pid)


def update_project(pid: str, data: dict):
    if pid in _projects:
        _projects[pid].update(data)


def save_upload(pid: str, file_bytes: bytes, ext: str) -> str:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    path = f"{UPLOAD_DIR}/{pid}{ext}"
    with open(path, "wb") as f:
        f.write(file_bytes)
    return path


def get_render_path(pid: str, index: int) -> str:
    os.makedirs(RENDER_DIR, exist_ok=True)
    return f"{RENDER_DIR}/{pid}_{index}.jpg"
