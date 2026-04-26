from pydantic import BaseModel
from typing import Optional


class Requirements(BaseModel):
    project_name: str
    total_area: int
    headcount: int
    space_types: list[str]
    has_livestream: bool = False
    brand_style: str = "modern_minimalist"
    special_requirements: Optional[str] = None


class Zone(BaseModel):
    name: str
    area_sqm: int
    location: str
    rationale: str


class SpacePlan(BaseModel):
    site_analysis: str
    zones: list[Zone]
    circulation_strategy: str
    acoustic_strategy: str
    key_design_moves: list[str]
    render_description: str
    flags: list[str]


class RenderResult(BaseModel):
    angle: str
    label: str
    image_base64: str


class ProjectState(BaseModel):
    project_id: str
    status: str = "created"
    floor_plan_path: Optional[str] = None
    requirements: Optional[dict] = None
    plan: Optional[dict] = None
    renders: list[dict] = []
