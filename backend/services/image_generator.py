"""Image generation service using external Gradio API."""
from __future__ import annotations

from typing import List
from pathlib import Path
import base64
import mimetypes
from gradio_client import Client

from config import settings
from services.prompt_builder import build_image_prompt


def _validate_image_api_url() -> str:
    if not settings.image_api_url:
        raise RuntimeError("IMAGE_API_URL is not set in the environment")
    return settings.image_api_url


def _to_data_url(value) -> str:
    """Normalize Gradio outputs into a browser-ready data URL or URL."""
    if isinstance(value, list) and value:
        value = value[0]
    if isinstance(value, dict) and "data" in value:
        value = value["data"]

    if isinstance(value, str):
        if value.startswith("data:") or value.startswith("http"):
            return value
        path = Path(value)
        if path.exists():
            mime, _ = mimetypes.guess_type(path.name)
            mime = mime or "image/png"
            encoded = base64.b64encode(path.read_bytes()).decode("utf-8")
            return f"data:{mime};base64,{encoded}"
        # Fallback: treat as base64 without prefix
        return f"data:image/png;base64,{value}"

    raise RuntimeError("Image API returned an unsupported response type")


def generate_images(scenes: List[str]) -> List[str]:
    """Generate images for each scene using the Gradio client.

    Calls are made sequentially to avoid overload and keep responses stable.
    """
    url = _validate_image_api_url()
    client = Client(url)
    images: List[str] = []

    for scene in scenes:
        prompt = build_image_prompt(scene)
        result = client.predict(prompt=prompt, api_name="/predict")
        if not result:
            raise RuntimeError("Image API returned an empty response")
        images.append(_to_data_url(result))

    return images
