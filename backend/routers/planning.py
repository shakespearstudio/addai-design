import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from services.claude_service import analyze_floor_plan
from storage import create_project, update_project, get_project, save_upload

router = APIRouter(prefix="/api/planning", tags=["planning"])

ALLOWED_EXTS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_SIZE = 10 * 1024 * 1024  # 10MB


def _extract_pdf_text(data: bytes) -> str:
    try:
        import fitz  # PyMuPDF
        doc = fitz.open(stream=data, filetype="pdf")
        return "\n".join(page.get_text() for page in doc)
    except Exception as e:
        raise HTTPException(400, f"PDF 解析失败：{str(e)}")


@router.post("/analyze")
async def analyze(
    floor_plan: UploadFile = File(...),
    requirements: str = Form(...),
    requirements_doc: UploadFile = File(None),
):
    ext = "." + floor_plan.filename.rsplit(".", 1)[-1].lower() if "." in floor_plan.filename else ""
    if ext not in ALLOWED_EXTS:
        raise HTTPException(400, "不支持的文件格式，请上传 JPG / PNG / WebP")

    file_bytes = await floor_plan.read()
    if len(file_bytes) > MAX_SIZE:
        raise HTTPException(400, "文件大小超过 10MB 限制")

    req_data = json.loads(requirements)

    # 如果上传了需求文档，提取文本并合并
    if requirements_doc and requirements_doc.filename:
        doc_bytes = await requirements_doc.read()
        doc_ext = requirements_doc.filename.rsplit(".", 1)[-1].lower() if "." in requirements_doc.filename else ""
        if doc_ext == "pdf":
            doc_text = _extract_pdf_text(doc_bytes)
        else:
            doc_text = doc_bytes.decode("utf-8", errors="replace")
        existing = req_data.get("free_requirements", "").strip()
        req_data["free_requirements"] = (existing + "\n\n" + doc_text).strip() if existing else doc_text

    pid = create_project()
    floor_plan_path = save_upload(pid, file_bytes, ext)
    update_project(pid, {
        "floor_plan_path": floor_plan_path,
        "requirements": req_data,
        "status": "analyzing",
    })

    try:
        plan = analyze_floor_plan(floor_plan_path, req_data)
    except Exception as e:
        update_project(pid, {"status": "error"})
        raise HTTPException(500, f"平面规划分析失败：{str(e)}")

    update_project(pid, {"plan": plan, "status": "plan_ready"})

    return {"project_id": pid, "plan": plan}


@router.get("/{project_id}")
async def get_plan(project_id: str):
    project = get_project(project_id)
    if not project:
        raise HTTPException(404, "项目不存在")
    return project
