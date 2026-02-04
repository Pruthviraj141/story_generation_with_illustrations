"""Pydantic models for request/response payloads."""
from __future__ import annotations

from typing import List
from pydantic import BaseModel, Field


class StoryGenerateRequest(BaseModel):
    idea: str = Field(..., min_length=3, description="Short story idea")
    genre: str = Field(..., min_length=3, description="Story genre")
    type: str = Field(..., min_length=3, description="Story type (e.g., Funny, Learning)")
    tone: str = Field(..., min_length=3, description="Story tone")


class StoryGenerateResponse(BaseModel):
    story: str


class IllustrateStoryRequest(BaseModel):
    story: str = Field(..., min_length=20, description="Full user-written story")


class StorybookResponse(BaseModel):
    story: str
    scenes: List[str]
    images: List[str]
