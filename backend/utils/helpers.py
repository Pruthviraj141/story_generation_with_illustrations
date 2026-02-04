"""Utility helpers for scene processing and JSON parsing."""
from __future__ import annotations

import json
import re
from typing import Any, List


def safe_json_loads(text: str) -> Any:
    """Attempt to load JSON, with a fallback to bracket extraction."""
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        left = text.find("[")
        right = text.rfind("]")
        if left != -1 and right != -1 and right > left:
            snippet = text[left : right + 1]
            return json.loads(snippet)
        raise


def normalize_scene_list(raw: Any) -> List[str]:
    """Normalize raw scene output into a clean list of strings."""
    if isinstance(raw, list):
        scenes = [str(item).strip() for item in raw if str(item).strip()]
        return scenes
    if isinstance(raw, str):
        return [raw.strip()] if raw.strip() else []
    return []


def clamp_scene_count(scenes: List[str], min_count: int, max_count: int) -> List[str]:
    """Clamp scenes to a required range."""
    if not scenes:
        return []
    if len(scenes) > max_count:
        return scenes[:max_count]
    return scenes


def fallback_scenes_from_story(story: str, min_count: int, max_count: int) -> List[str]:
    """Create fallback scenes by splitting the story into sentences."""
    sentences = re.split(r"(?<=[.!?])\s+", story.strip())
    cleaned = [s.strip() for s in sentences if s.strip()]
    if not cleaned:
        return []
    return cleaned[:max_count] if len(cleaned) >= min_count else cleaned
