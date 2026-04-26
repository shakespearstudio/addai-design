from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.imagen_service import generate_renders
from storage import get_project, update_project

router = APIRouter(prefix="/api/renders", tags=["renders"])


class GenerateRequest(BaseModel):
    project_id: str
    style: str = "modern_minimalist"


@router.post("/generate")
async def generate(req: GenerateRequest):
    project = get_project(req.project_id)
    if not project:
        raise HTTPException(404, "项目不存在")
    if project.get("status") not in ("plan_ready", "renders_ready"):
        raise HTTPException(400, "请先完成平面规划确认")

    plan = project.get("plan")
    if not plan:
        raise HTTPException(400, "平面规划数据不存在")

    render_description = plan.get("render_description", "")
    if not render_description:
        raise HTTPException(400, "平面规划缺少效果图描述")

    update_project(req.project_id, {"status": "rendering"})

    try:
        renders = await generate_renders(render_description, req.style, req.project_id)
    except Exception as e:
        update_project(req.project_id, {"status": "plan_ready"})
        raise HTTPException(500, f"效果图生成失败：{str(e)}")

    update_project(req.project_id, {"renders": renders, "status": "renders_ready"})

    return {"project_id": req.project_id, "renders": renders}
