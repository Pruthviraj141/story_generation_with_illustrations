"""Scene extraction pipeline with safeguards and fallback logic."""
from __future__ import annotations

from typing import List

from config import settings
from services.groq_llm import extract_scenes
from utils.helpers import clamp_scene_count, fallback_scenes_from_story


def extract_key_scenes(story: str) -> List[str]:
    """Extract 3-5 scenes, falling back to sentence-based scenes if needed."""
    scenes = extract_scenes(story)
    scenes = clamp_scene_count(scenes, settings.scene_min, settings.scene_max)

    if len(scenes) < settings.scene_min:
        fallback = fallback_scenes_from_story(story, settings.scene_min, settings.scene_max)
        if fallback:
            scenes = fallback[: settings.scene_max]

    return scenes[: settings.scene_max]
