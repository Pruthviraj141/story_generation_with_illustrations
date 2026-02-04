"""Application configuration loaded from environment variables."""
from __future__ import annotations

import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()


def _get_env(name: str, default: str = "") -> str:
    """Fetch environment variable with a default."""
    return os.getenv(name, default).strip()


@dataclass(frozen=True)
class Settings:
    """Centralized configuration settings."""

    groq_api_key: str = _get_env("GROQ_API_KEY")
    image_api_url: str = _get_env("IMAGE_API_URL").rstrip("/")
    request_timeout: int = int(_get_env("REQUEST_TIMEOUT", "30"))
    scene_min: int = 3
    scene_max: int = 5


settings = Settings()
