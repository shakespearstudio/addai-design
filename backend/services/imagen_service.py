import asyncio
import base64
import io
import os
from google import genai
from google.genai import types
from PIL import Image
from prompts.render_builder import build_render_prompt, ANGLE_LABELS

client = genai.Client(api_key=os.environ["GOOGLE_API_KEY"])

ANGLES = ["reception", "open_office", "key_feature_zone"]


async def _generate_one(prompt: str, output_path: str) -> str:
    config = types.GenerateContentConfig(
        response_modalities=["IMAGE"],
        image_config=types.ImageConfig(
            aspect_ratio="16:9",
            image_size="1k",
        ),
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
            image = Image.open(io.BytesIO(part.inline_data.data))
            image = image.convert("RGB")
            image.save(output_path, "JPEG", quality=92)
            return output_path

    raise ValueError("Gemini 未返回图像数据")


def _to_base64(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode()


async def generate_renders(render_description: str, style: str, project_id: str) -> list[dict]:
    render_dir = os.environ.get("RENDER_DIR", "/tmp/renders")
    os.makedirs(render_dir, exist_ok=True)

    tasks = []
    paths = []
    for i, angle in enumerate(ANGLES):
        prompt = build_render_prompt(style, angle, render_description)
        path = f"{render_dir}/{project_id}_{i}.jpg"
        paths.append((angle, path))
        tasks.append(_generate_one(prompt, path))

    await asyncio.gather(*tasks)

    return [
        {
            "angle": angle,
            "label": ANGLE_LABELS[angle],
            "image_base64": _to_base64(path),
        }
        for angle, path in paths
    ]
