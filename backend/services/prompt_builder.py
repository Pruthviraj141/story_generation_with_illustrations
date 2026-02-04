"""Centralized prompt templates and sanitization utilities."""
from __future__ import annotations

from typing import Dict, Tuple
import logging
import re

logger = logging.getLogger(__name__)


_COPYRIGHTED = {
    "harry potter",
    "spider-man",
    "spiderman",
    "batman",
    "superman",
    "iron man",
    "avengers",
    "disney",
    "pikachu",
    "pokemon",
    "star wars",
    "darth vader",
    "elsa",
}

_PUBLIC_FIGURES = {
    "elon musk",
    "taylor swift",
    "cristiano ronaldo",
    "donald trump",
    "barack obama",
}


_LENGTH_RANGES: Dict[str, Tuple[int, int]] = {
    "short": (220, 320),
    "medium": (360, 520),
    "long": (600, 820),
}


def sanitize_user_input(text: str) -> str:
    """Sanitize user input to remove PII and unsafe content.

    If disallowed content is detected, returns a JSON error string and logs the reason.
    """
    if not text:
        return ""

    lowered = text.lower()
    if any(name in lowered for name in _PUBLIC_FIGURES | _COPYRIGHTED):
        logger.warning("content_not_allowed: detected public figure or copyrighted character")
        return '{"error": "content_not_allowed"}'

    cleaned = re.sub(r"[\w.+-]+@[\w-]+\.[\w.-]+", "", text)
    cleaned = re.sub(r"\b\+?\d[\d\s().-]{7,}\b", "", cleaned)
    cleaned = re.sub(r"\b\d{3}-\d{2}-\d{4}\b", "", cleaned)
    cleaned = re.sub(r"https?://\S+", "", cleaned)
    cleaned = re.sub(r"@\w+", "", cleaned)
    cleaned = re.sub(r"[^\w\s.,!?'-]", " ", cleaned)
    cleaned = re.sub(r"\s{2,}", " ", cleaned).strip()

    return cleaned


def build_story_prompt(
    idea: str,
    genre: str,
    story_type: str,
    tone: str,
    audience: str = "kids",
    length: str = "short",
) -> str:
    """Return a deterministic story prompt for Groq LLM.

    Template (exact structure required):
    You are a professional children's story author. Output a complete, self-contained short story that reads like a book for the given idea and parameters. DO NOT use markdown, bullet lists, or explain your reasoning. Output must be plain text only.

    Format rules:
    1) The first line MUST be the story title (short, <= 6 words).
    2) Then output the story paragraphs. Keep total length approximately 220-320 words for length="short". Be logical, emotionally coherent, and descriptive. Use sensory details and natural language. Do not invent modern brand names or copyrighted characters.
    3) The final line MUST be a single-sentence quote or moral prefixed exactly as:
    — Quote: "The quote text here"

    Story parameters:
    - Idea: {idea}
    - Genre: {genre}
    - Story Type: {story_type}
    - Tone: {tone}
    - Audience: {audience}

    Constraints:
    - No graphic violence, no sexual content.
    - No real-person likenesses or public figures.
    - No code blocks, no JSON, no extra text outside the story.
    - End with the required quote line.

    Now, write the story that follows the rules above.
    """
    min_words, max_words = _LENGTH_RANGES.get(length, _LENGTH_RANGES["short"])
    return (
        "You are a professional children's story author. Output a complete, self-contained short story that reads like a book for the given idea and parameters. DO NOT use markdown, bullet lists, or explain your reasoning. Output must be plain text only.\n\n"
        "Format rules:\n"
        "1) The first line MUST be the story title (short, <= 6 words).\n"
        f"2) Then output the story paragraphs. Keep total length approximately {min_words}-{max_words} words for length=\"{length}\". Be logical, emotionally coherent, and descriptive. Use sensory details and natural language. Do not invent modern brand names or copyrighted characters.\n"
        "3) The final line MUST be a single-sentence quote or moral prefixed exactly as:\n"
        "— Quote: \"The quote text here\"\n\n"
        "Story parameters:\n"
        f"- Idea: {idea}\n"
        f"- Genre: {genre}\n"
        f"- Story Type: {story_type}\n"
        f"- Tone: {tone}\n"
        f"- Audience: {audience}\n\n"
        "Constraints:\n"
        "- No graphic violence, no sexual content.\n"
        "- No real-person likenesses or public figures.\n"
        "- No code blocks, no JSON, no extra text outside the story.\n"
        "- End with the required quote line.\n\n"
        "Now, write the story that follows the rules above."
    )


def build_scene_extraction_prompt(
    story_text: str,
    min_scenes: int = 3,
    max_scenes: int = 5,
) -> str:
    """Return the scene extraction prompt (JSON array only)."""
    return (
        "You are an assistant that extracts visual scenes from a story. Input: the full story text.\n\n"
        f"Task: Return a JSON array (only the JSON array, nothing else) containing between {min_scenes} and {max_scenes} succinct, vivid, one-sentence scene descriptions suitable for image generation. Each item should be a single sentence and describe a discrete visual moment (who, where, action, lighting). Keep each description short and concrete.\n\n"
        "Example output:\n"
        "[\"A boy standing at the edge of a jungle at sunrise\", \"A glowing cave interior with crystals and a small lantern\", \"A hidden golden chamber sparkling under torchlight\"]\n\n"
        "Now, extract scenes from this story:\n"
        f"'''{story_text}'''"
    )


def _infer_character_hint(scene_description: str) -> str:
    lowered = scene_description.lower()
    if "boy" in lowered:
        return "young boy with worn backpack, curious expression"
    if "girl" in lowered:
        return "young girl with bright eyes, brave posture"
    if "child" in lowered:
        return "child with gentle smile, simple clothes"
    return "main character, expressive face"


def build_image_prompt(
    scene_description: str,
    style_tag: str = "storybook illustration, soft cartoon",
    palette: str = "pastel",
    art_details: str = "cel-shaded, high detail",
    camera: str = "wide shot",
    aspect: str = "4:3",
) -> str:
    """Return the image prompt for diffusion-based models."""
    character_hint = _infer_character_hint(scene_description)
    return (
        f"{style_tag}, {palette} palette, {art_details}, cinematic lighting, high detail, "
        f"no text, no watermark, no photorealism, camera: {camera}. "
        f"Scene: {scene_description}. Character details: {character_hint}. "
        f"Aspect ratio: {aspect}. --ar {aspect}"
    )


def build_negative_image_prompt() -> str:
    """Return the negative prompt to reduce artifacts and realism."""
    return (
        "photorealistic, realism, text, watermark, logo, lowres, bad anatomy, "
        "extra limbs, deformed, blurred, mutated, signature, ugly, out of frame"
    )


def build_image_api_payload(
    scene_prompt: str,
    negative_prompt: str,
    width: int = 512,
    height: int = 512,
    steps: int = 25,
    guidance_scale: float = 7.5,
) -> dict:
    """Return the JSON payload for the Gradio /predict endpoint."""
    return {
        "prompt": scene_prompt,
        "negative_prompt": negative_prompt,
        "steps": steps,
        "width": width,
        "height": height,
        "guidance_scale": guidance_scale,
    }


def build_groq_payload_for_story(
    prompt: str,
    max_tokens: int = 1024,
    temperature: float = 0.7,
) -> dict:
    """Wrap the story prompt for Groq chat completions."""
    return {
        "model": "llama-3.3-70b-versatile",
        "messages": [
            {"role": "system", "content": "You are a creative children's book author."},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": max_tokens,
        "temperature": temperature,
    }


def choose_style_tag(genre: str, story_type: str, tone: str) -> Tuple[str, str]:
    """Pick a consistent style tag and palette for the story images."""
    key = f"{genre.lower()}|{story_type.lower()}|{tone.lower()}"
    if "adventure" in key or "inspirational" in key:
        return "storybook illustration, soft cartoon", "warm pastel"
    if "mystery" in key or "dark" in key:
        return "storybook illustration, soft cartoon", "cool dusk"
    if "fantasy" in key or "mythology" in key:
        return "storybook illustration, dreamy watercolor", "misty pastel"
    if "sci-fi" in key:
        return "storybook illustration, soft cartoon", "neon pastel"
    if "funny" in key or "happy" in key:
        return "storybook illustration, playful cartoon", "bright pastel"
    return "storybook illustration, soft cartoon", "pastel"
