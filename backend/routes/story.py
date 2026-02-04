"""Routes for story generation and storybook pipeline (Mode 2)."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from models.schemas import StoryGenerateRequest, StoryGenerateResponse, StorybookResponse
from services.groq_llm import generate_story
from services.scene_extractor import extract_key_scenes
from services.image_generator import generate_images

router = APIRouter()


@router.post("/story/generate", response_model=StoryGenerateResponse)
def generate_story_endpoint(payload: StoryGenerateRequest) -> StoryGenerateResponse:
    """Generate a story from an idea, genre, type, and tone."""
    try:
        story = generate_story(
            idea=payload.idea,
            genre=payload.genre,
            story_type=payload.type,
            tone=payload.tone,
        )
        return StoryGenerateResponse(story=story)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/create/storybook", response_model=StorybookResponse)
def create_storybook(payload: StoryGenerateRequest) -> StorybookResponse:
    """Full pipeline: generate story, extract scenes, generate images."""
    try:
        story = generate_story(
            idea=payload.idea,
            genre=payload.genre,
            story_type=payload.type,
            tone=payload.tone,
        )
        scenes = extract_key_scenes(story)
        images = generate_images(scenes)
        return StorybookResponse(story=story, scenes=scenes, images=images)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
