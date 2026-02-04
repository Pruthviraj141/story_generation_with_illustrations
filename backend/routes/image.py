"""Routes for illustrating user-written stories (Mode 1)."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from models.schemas import IllustrateStoryRequest, StorybookResponse
from services.scene_extractor import extract_key_scenes
from services.image_generator import generate_images

router = APIRouter()


@router.post("/illustrate/story", response_model=StorybookResponse)
def illustrate_story(payload: IllustrateStoryRequest) -> StorybookResponse:
    """Extract scenes and generate images for a user-provided story."""
    try:
        story = payload.story.strip()
        scenes = extract_key_scenes(story)
        images = generate_images(scenes)
        return StorybookResponse(story=story, scenes=scenes, images=images)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
