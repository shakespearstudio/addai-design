# AddAI Design — Cursor Agent 完整开发指令

> 这是交给 Cursor Agent（Claude / GPT / Gemini）的完整作业文档。
> 按照本文档独立实现，不要问多余的问题，直接做。

---

## 一、产品是什么

**办公空间 AI 设计规划助手。**

用户上传办公空间原始平面图 + 填写需求表单，AI 完成两件事：

1. **Stage 1 — 平面规划**：Claude Vision 读图，扮演顶尖办公空间设计师，输出专业空间规划方案（JSON 结构化）
2. **Stage 2 — 效果图**：基于规划方案，调用 Nano Banana 2（Gemini 图片生成）并发生成 3 张不同角度的效果图

每个阶段有**人工确认节点**，确认后进入下一阶段。

---

## 二、技术栈（固定，不换）

| 层 | 选型 |
|----|------|
| 前端框架 | Next.js 15（App Router + TypeScript） |
| 样式 | Tailwind CSS |
| 动效 | Framer Motion |
| 后端 | FastAPI（Python 3.11+） |
| AI Stage 1 | Anthropic SDK — `claude-sonnet-4-6`，Vision 功能 |
| AI Stage 2 | `google-genai` — `gemini-3.1-flash-image-preview` |
| 存储 | 服务端临时文件 `/tmp/uploads` / `/tmp/renders`（无数据库） |
| 部署 | Docker + docker-compose |
| UI 风格 | Calm（深色，Linear/Vercel 风格） |

**不用**：LangChain、Supabase、Redux、任何额外状态管理库。

---

## 三、环境变量

后端需要：

```env
ANTHROPIC_API_KEY=（向项目负责人索取）
GOOGLE_API_KEY=（向项目负责人索取）
UPLOAD_DIR=/tmp/uploads
RENDER_DIR=/tmp/renders
```

前端需要（`.env.local`）：

```env
BACKEND_URL=http://localhost:8000
```

---

## 四、完整文件结构

```
addai-design/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # 全局布局，深色主题
│   ├── globals.css                   # Calm 主题 CSS 变量 + 工具类
│   ├── page.tsx                      # 首页（Landing）
│   ├── new/
│   │   └── page.tsx                  # Step 1：上传平面图 + 需求表单
│   ├── project/[id]/
│   │   ├── plan/page.tsx             # Step 2：平面规划结果 + 确认
│   │   └── renders/page.tsx          # Step 3：效果图展示 + 下载
│   └── api/backend/[...path]/
│       └── route.ts                  # 代理转发到 FastAPI
├── backend/
│   ├── main.py                       # FastAPI 入口
│   ├── models.py                     # Pydantic 数据模型
│   ├── storage.py                    # 内存项目状态 + 文件管理
│   ├── routers/
│   │   ├── planning.py               # POST /api/planning/analyze
│   │   └── renders.py                # POST /api/renders/generate
│   ├── services/
│   │   ├── claude_service.py         # Claude Vision 调用
│   │   └── imagen_service.py         # Nano Banana 并发调用
│   ├── prompts/
│   │   ├── space_planner.py          # Stage 1 完整 system prompt
│   │   └── render_builder.py         # Stage 2 prompt 构建逻辑
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml                # 前端 3000 / 后端 8000
└── .env.example
```

---

## 五、API 接口定义

### `POST /api/planning/analyze`

**Request**：`multipart/form-data`

| 字段 | 类型 | 说明 |
|------|------|------|
| `floor_plan` | File | 平面图，JPG/PNG/WebP，最大 10MB |
| `requirements` | string (JSON) | 见下方结构 |

```json
{
  "project_name": "string",
  "total_area": 2000,
  "headcount": 80,
  "space_types": ["open_office", "reception", "meeting_rooms"],
  "has_livestream": false,
  "brand_style": "modern_minimalist",
  "special_requirements": "string 或 null"
}
```

**Response**：

```json
{
  "project_id": "uuid",
  "plan": {
    "site_analysis": "string",
    "zones": [
      { "name": "前厅接待区", "area_sqm": 120, "location": "string", "rationale": "string" }
    ],
    "circulation_strategy": "string",
    "acoustic_strategy": "string",
    "key_design_moves": ["string"],
    "render_description": "string（200字，用于生成效果图）",
    "flags": ["string"]
  }
}
```

---

### `POST /api/renders/generate`

**Request**：`application/json`

```json
{
  "project_id": "uuid",
  "style": "modern_minimalist"
}
```

`style` 可选值：`modern_minimalist` / `high_tech` / `boutique`

**Response**：

```json
{
  "project_id": "uuid",
  "renders": [
    { "angle": "reception",        "label": "前厅接待区",   "image_base64": "string" },
    { "angle": "open_office",      "label": "开放办公区",   "image_base64": "string" },
    { "angle": "key_feature_zone", "label": "核心特色空间", "image_base64": "string" }
  ]
}
```

---

## 六、后端核心实现

### `storage.py`

```python
import uuid, os

_projects: dict[str, dict] = {}
UPLOAD_DIR = os.environ.get("UPLOAD_DIR", "/tmp/uploads")
RENDER_DIR  = os.environ.get("RENDER_DIR",  "/tmp/renders")

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
```

---

### `services/claude_service.py`

```python
import base64, json, re, os
from anthropic import Anthropic
from prompts.space_planner import SYSTEM_PROMPT

client = Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

def analyze_floor_plan(floor_plan_path: str, requirements: dict) -> dict:
    with open(floor_plan_path, "rb") as f:
        image_data = base64.standard_b64encode(f.read()).decode("utf-8")

    ext = floor_plan_path.rsplit(".", 1)[-1].lower()
    media_types = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp"}
    media_type = media_types.get(ext, "image/jpeg")

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system=SYSTEM_PROMPT,
        messages=[{
            "role": "user",
            "content": [
                {"type": "image", "source": {"type": "base64", "media_type": media_type, "data": image_data}},
                {"type": "text", "text": f"客户需求：{json.dumps(requirements, ensure_ascii=False)}\n\n请严格按照要求的 JSON 格式返回，只返回 JSON，不要有其他文字。"}
            ]
        }]
    )

    text = response.content[0].text.strip()
    json_match = re.search(r"\{.*\}", text, re.DOTALL)
    if not json_match:
        raise ValueError("Claude 未返回有效 JSON")
    return json.loads(json_match.group())
```

---

### `services/imagen_service.py`

**重要**：使用 `gemini-3.1-flash-image-preview` 模型，通过 `GenerateContentConfig` + `ImageConfig` 生成图片。这是正确的 API 调用方式，不要用已废弃的 `ImageGenerationConfig`。

```python
import asyncio, base64, io, os
from google import genai
from google.genai import types
from PIL import Image
from prompts.render_builder import build_render_prompt, ANGLE_LABELS

client = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])
ANGLES = ["reception", "open_office", "key_feature_zone"]

async def _generate_one(prompt: str, output_path: str) -> str:
    config = types.GenerateContentConfig(
        response_modalities=["IMAGE"],
        image_config=types.ImageConfig(aspect_ratio="16:9", image_size="1k"),
    )
    loop = asyncio.get_running_loop()
    response = await loop.run_in_executor(
        None,
        lambda: client.models.generate_content(
            model="gemini-3.1-flash-image-preview",
            contents=prompt,
            config=config,
        ),
    )
    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            img = Image.open(io.BytesIO(part.inline_data.data)).convert("RGB")
            img.save(output_path, "JPEG", quality=92)
            return output_path
    raise ValueError("Gemini 未返回图像数据")

async def generate_renders(render_description: str, style: str, project_id: str) -> list[dict]:
    os.makedirs(os.environ.get("RENDER_DIR", "/tmp/renders"), exist_ok=True)
    render_dir = os.environ.get("RENDER_DIR", "/tmp/renders")
    tasks, paths = [], []
    for i, angle in enumerate(ANGLES):
        prompt = build_render_prompt(style, angle, render_description)
        path = f"{render_dir}/{project_id}_{i}.jpg"
        paths.append((angle, path))
        tasks.append(_generate_one(prompt, path))
    await asyncio.gather(*tasks)
    return [
        {"angle": a, "label": ANGLE_LABELS[a], "image_base64": base64.b64encode(open(p, "rb").read()).decode()}
        for a, p in paths
    ]
```

---

## 七、System Prompts（完整版，逐字使用）

### Stage 1 — `prompts/space_planner.py`

```python
SYSTEM_PROMPT = """You are a senior workplace design principal with 20+ years of experience at world-class firms (Gensler, AECOM, M Moser Associates). You combine rigorous spatial analysis with award-winning design aesthetics. You think in both metric precision and human experience.

## YOUR APPROACH

When given a floor plan image and client brief, you:

**OBSERVE the floor plan:**
- Identify overall dimensions and gross area
- Locate structural elements: columns, shear walls, service cores
- Map natural light sources: window walls, skylights, light wells
- Note all access points: main entry, fire exits, service entry
- Identify fixed constraints: wet areas, risers, existing partitions

**READ the brief:**
- Headcount and space ratio (target: 8–12 sqm NIA per person for standard office)
- Space type mix required
- Brand and cultural intent
- Any special requirements

## DESIGN PRINCIPLES YOU APPLY

**Circulation:**
- Primary corridor minimum 1.8m clear
- Secondary corridor minimum 1.2m clear
- Separate guest circulation from staff/service circulation
- Fire egress compliance (max travel distance to exit: 30m in open plan)

**Daylight strategy:**
- Perimeter zones: collaborative spaces, focus workstations, meeting rooms
- Core zones: storage, server rooms, WC, service areas
- Never place permanent enclosed offices in corners

**Acoustic zoning (3 bands):**
- Quiet zone: focus work, max 45dB — away from circulation
- Collaborative zone: team work, 55–65dB — near core, natural separation
- Active zone: reception, café, phone booths — nearest to entry

**Activity-Based Working ratios:**
- Standard corporate: 70% focus / 20% collaborative / 10% social
- Creative/tech: 40% focus / 40% collaborative / 20% social
- Adjust based on client brief

**Chinese Standards compliance:**
- Reference GB 50189 for energy and space standards
- Min office floor-to-ceiling height: 2.6m (prefer 2.8m+)
- Emergency exit signage zones per GB 51309

## OUTPUT FORMAT

Respond in Chinese. Return ONLY valid JSON, no other text, matching this schema exactly:

{
  "site_analysis": "对平面图的客观观察：尺寸、结构、采光、入口（2–3段）",
  "zones": [
    {
      "name": "区域名称",
      "area_sqm": 数字,
      "location": "在平面图中的位置描述",
      "rationale": "为什么这样设计（设计逻辑）"
    }
  ],
  "circulation_strategy": "动线策略",
  "acoustic_strategy": "声学分区策略",
  "key_design_moves": ["3–5个最重要的设计决策，每条一句话"],
  "render_description": "200字左右的空间氛围描述，用于生成效果图",
  "flags": ["发现的约束或需要业主决策的事项"]
}

Be specific. Use professional terminology. Think like the best designer in the room."""
```

---

### Stage 2 — `prompts/render_builder.py`

```python
STYLE_PREFIX = {
    "modern_minimalist": "contemporary workplace interior design, warm white oak wood and matte black steel palette, biophilic elements with indoor plants, soft diffused natural lighting through floor-to-ceiling windows",
    "high_tech": "tech campus office interior, glass partitions with frosted film, architectural accent lighting, exposed concrete ceiling with cable management, dynamic spatial layers",
    "boutique": "boutique hospitality-influenced office interior, curated luxury materials, art-forward wall treatments, bespoke custom furniture, intimate human-scale spaces with warm ambient lighting",
}

ANGLE_CONTEXT = {
    "reception": "main reception lobby viewed from main entrance, showing welcome desk, brand wall signage, and waiting lounge area with signature lighting fixture",
    "open_office": "open plan workstation area viewed from above-eye level, showing ergonomic workstations in clusters, glass-walled collaboration pods, and natural light flooding the space",
    "key_feature_zone": "the most architecturally distinctive zone in the office, showing the signature design move with maximum spatial drama and material richness",
}

ANGLE_LABELS = {
    "reception": "前厅接待区",
    "open_office": "开放办公区",
    "key_feature_zone": "核心特色空间",
}

def build_render_prompt(style: str, angle: str, render_description: str) -> str:
    return (
        f"{STYLE_PREFIX.get(style, STYLE_PREFIX['modern_minimalist'])}, "
        f"{ANGLE_CONTEXT[angle]}, "
        f"{render_description}, "
        f"architectural interior visualization, photorealistic rendering, high resolution, "
        f"natural daylight with supplementary warm ambient lighting, "
        f"high-end commercial interior design, premium materials and finishes, "
        f"eye level perspective with slight elevation, wide angle lens, subtle depth of field, "
        f"no people, pristine showroom condition, professional architectural photography"
    )
```

---

## 八、前端关键逻辑

### 数据流

```
/new 填表 → POST /api/backend/planning/analyze
         → 成功后把 plan 存入 sessionStorage（key: plan_{project_id}）
         → router.push(`/project/${project_id}/plan`)

/project/[id]/plan → 从 sessionStorage 读 plan 展示
                   → 用户点"确认" → router.push(`/project/${id}/renders`)

/project/[id]/renders → useEffect 触发 POST /api/backend/renders/generate
                      → 显示3个骨架屏加载动画
                      → 渲染完成展示图片（base64）
                      → 支持 Lightbox 全屏 + 下载
```

### Next.js 代理路由

`app/api/backend/[...path]/route.ts` — 将所有 `/api/backend/*` 请求透传到 FastAPI：

```typescript
import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_URL || 'http://localhost:8000'

async function proxy(request: NextRequest, path: string[]) {
  const url = `${BACKEND}/api/${path.join('/')}`
  const contentType = request.headers.get('content-type') || ''
  const headers: Record<string, string> = {}
  if (contentType) headers['content-type'] = contentType
  const body = request.method !== 'GET' ? await request.arrayBuffer() : undefined
  const res = await fetch(url, { method: request.method, headers, body })
  const resContentType = res.headers.get('content-type') || ''
  if (resContentType.includes('application/json')) {
    return NextResponse.json(await res.json(), { status: res.status })
  }
  return new Response(await res.arrayBuffer(), { status: res.status, headers: { 'content-type': resContentType } })
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path)
}
export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  return proxy(req, (await params).path)
}
```

---

## 九、UI 设计规范

**Calm 主题配色（严格执行，不自己发挥）：**

```
背景：  #0A0A0B
卡片：  #111113
边框：  #1F1F23
主文字：#FFFFFF
辅文字：#888890
强调色：#5B5BD6（Indigo）
```

**CSS 工具类（写入 globals.css）：**

```css
.surface   { background-color: #111113; border: 1px solid #1F1F23; }
.btn-primary { /* bg-indigo-600 hover:bg-indigo-500，disabled:opacity-40 */ }
.btn-ghost  { /* border border-[#1F1F23]，text-[#888890] hover:text-white */ }
.input-base { /* bg-[#111113] border border-[#1F1F23]，focus:border-indigo-500 */ }
.tag        { /* bg-[#1F1F23] text-[#888890]，可点击切换选中状态 */ }
.tag-active { /* bg-indigo-600/20 text-indigo-400 border border-indigo-600/40 */ }
```

**页面原则：**
- 每个 Step 单任务，不堆信息
- 加载用骨架屏 + 文案（"设计师正在分析平面图…"）
- 底部固定操作栏（sticky bottom bar）：左侧说明 + 右侧按钮组
- Framer Motion：`fadeIn + slideUp`，delay 错开 0.1s
- 所有图片放大用 Lightbox（暗色遮罩 + 居中大图）

---

## 十、本地启动方式

```bash
# 1. 克隆仓库
git clone https://github.com/shakespearstudio/addai-design.git
cd addai-design

# 2. 填入环境变量
cp .env.example .env.local
# 编辑 .env.local，填入 ANTHROPIC_API_KEY 和 GOOGLE_API_KEY

# 3. 启动
docker compose up --build

# 前端：http://localhost:3000
# 后端：http://localhost:8000
# 后端健康检查：http://localhost:8000/health
```

---

## 十一、注意事项（容易踩的坑）

1. **`google-genai` API**：用 `client.models.generate_content()` + `GenerateContentConfig` + `ImageConfig`，不要用已废弃的 `ImageGenerationConfig` 或 `generate_images()`
2. **效果图并发**：用 `asyncio.gather()` 并发生成 3 张，不要串行
3. **JSON 解析容错**：Claude 偶尔在 JSON 前后加文字，用 `re.search(r'\{.*\}', text, re.DOTALL)` 提取
4. **图片传输**：效果图以 base64 字符串在 JSON 里传，不要单独建图片 API
5. **Next.js 15 的 params**：`params` 是 Promise，需要 `await params` 再解构
6. **CORS**：FastAPI 需要允许 `http://localhost:3000`

---

*GitHub：https://github.com/shakespearstudio/addai-design*
*技术负责：晓蓓 · 2026-04-26*
