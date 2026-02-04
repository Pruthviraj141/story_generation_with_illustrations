"""Groq LLM service for story generation and scene extraction."""
from __future__ import annotations

from typing import List
from groq import Groq

from config import settings
from services.prompt_builder import build_scene_extraction_prompt, build_story_prompt
from utils.helpers import normalize_scene_list, safe_json_loads


MODEL_NAME = "llama-3.3-70b-versatile"


def _get_client() -> Groq:
    if not settings.groq_api_key:
        raise RuntimeError("GROQ_API_KEY is not set in the environment")
    return Groq(api_key=settings.groq_api_key)


def generate_story(idea: str, genre: str, story_type: str, tone: str) -> str:
    """Generate a book-style story using Groq LLM."""
    client = _get_client()
    prompt = build_story_prompt(idea=idea, genre=genre, story_type=story_type, tone=tone)

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": "You are a creative children's book author who writes immersive stories.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.8,
        max_tokens=1200,
    )

    return response.choices[0].message.content.strip()


def extract_scenes(story: str) -> List[str]:
    """Extract 3-5 key scenes from a story as a list of strings."""
    client = _get_client()
    prompt = build_scene_extraction_prompt(story)

    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {"role": "system", "content": "You extract visual scenes for illustration."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=600,
    )

    content = response.choices[0].message.content.strip()
    raw = safe_json_loads(content)
    return normalize_scene_list(raw)
