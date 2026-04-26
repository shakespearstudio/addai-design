import base64
import json
import re
import os
from anthropic import Anthropic
from prompts.space_planner import SYSTEM_PROMPT

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

MEDIA_TYPES = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
}


def analyze_floor_plan(floor_plan_path: str, requirements: dict) -> dict:
    with open(floor_plan_path, "rb") as f:
        image_data = base64.standard_b64encode(f.read()).decode("utf-8")

    ext = floor_plan_path.rsplit(".", 1)[-1].lower()
    media_type = MEDIA_TYPES.get(ext, "image/jpeg")

    space_types_cn = {
        "open_office": "开放办公区",
        "reception": "前厅接待区",
        "meeting_rooms": "会议室",
        "focus_rooms": "专注工作间",
        "lounge": "休闲社交区",
        "livestream": "直播间",
        "executive": "高管区",
    }
    space_list = "、".join(
        space_types_cn.get(s, s) for s in requirements.get("space_types", [])
    )

    style_cn = {
        "modern_minimalist": "现代简约",
        "high_tech": "科技感",
        "boutique": "精品酒店风",
    }

    free_req = requirements.get("free_requirements") or requirements.get("special_requirements") or ""

    user_message = f"""请分析这张办公空间平面图，根据以下客户需求提供专业平面规划方案。

客户需求：
- 项目名称：{requirements['project_name']}
- 总面积：{requirements['total_area']} 平方米
- 使用人数：{requirements['headcount']} 人
- 需要的空间类型：{space_list}
- 是否有直播间需求：{'是' if requirements.get('has_livestream') else '否'}
- 品牌风格方向：{style_cn.get(requirements.get('brand_style', ''), requirements.get('brand_style', ''))}
- 详细需求描述：{free_req if free_req else '无'}

请严格按照要求的 JSON 格式返回，只返回 JSON，不要有其他文字。"""

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": media_type,
                            "data": image_data,
                        },
                    },
                    {"type": "text", "text": user_message},
                ],
            }
        ],
    )

    text = response.content[0].text.strip()

    # 提取 JSON，容错处理
    json_match = re.search(r"\{.*\}", text, re.DOTALL)
    if not json_match:
        raise ValueError(f"Claude 未返回有效 JSON，原始响应：{text[:200]}")

    return json.loads(json_match.group())
