"""FastAPI application entrypoint."""
from __future__ import annotations

from fastapi import FastAPI

from routes.story import router as story_router
from routes.image import router as image_router

app = FastAPI(title="AI Illustrated Storybook API", version="1.0.0")

app.include_router(story_router)
app.include_router(image_router)


@app.get("/")
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}
