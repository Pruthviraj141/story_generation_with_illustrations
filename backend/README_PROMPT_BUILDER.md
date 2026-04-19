# Prompt Builder

This module provides deterministic, reusable prompt templates and helpers for Groq LLM story generation and image generation via a Gradio/Colab endpoint.

## What it does

- Builds story prompts with strict formatting rules (title first line, quote last line).
- Builds scene extraction prompts that return JSON arrays.
- Enhances scene descriptions into consistent, storybook-style image prompts.
- Provides negative prompt defaults and image API payload helpers.
- Sanitizes user input to remove PII and block public figure/copyrighted requests.

## Tuning parameters

- **Length**: `length="short" | "medium" | "long"` adjusts target word range.
- **Tone**: `tone="Soft" | "Emotional" | "Dark" | "Happy"` affects style tag selection.
- **Style**: use `choose_style_tag(...)` once per story and reuse the palette for all images.
- **Aspect ratio**: keep `aspect` consistent (e.g., `4:3` for book-like landscape).

## Example usage

```python
from services.prompt_builder import (
    build_story_prompt,
    build_groq_payload_for_story,
    build_scene_extraction_prompt,
    build_image_prompt,
    build_negative_image_prompt,
    build_image_api_payload,
    sanitize_user_input,
    choose_style_tag
)

# Mode 2 example
idea = "A boy searching for gold in a jungle"
clean_idea = sanitize_user_input(idea)
story_prompt = build_story_prompt(clean_idea, genre="Adventure", story_type="Inspirational", tone="Soft", audience="kids", length="short")

# Send groq_payload to Groq API
# groq_payload = build_groq_payload_for_story(story_prompt)
# story_text = call_groq_api(groq_payload)

# Then extract scenes:
# scene_prompt = build_scene_extraction_prompt(story_text)
# scenes_json = call_groq_api(scene_prompt)  # returns JSON list

# Style + image generation
style_tag, palette = choose_style_tag("Adventure", "Inspirational", "Soft")
neg_prompt = build_negative_image_prompt()
image_payloads = []
for scene in ["A glowing cave interior with crystals and a small lantern"]:
    img_prompt = build_image_prompt(scene, style_tag=style_tag, palette=palette, art_details="cel-shaded, high detail", camera="wide shot", aspect="4:3")
    payload = build_image_api_payload(img_prompt, neg_prompt, width=512, height=384)
    image_payloads.append(payload)
```

## Story prompt example (filled)

Story prompt produced by `build_story_prompt`:

```
You are a professional children's story author. Output a complete, self-contained short story that reads like a book for the given idea and parameters. DO NOT use markdown, bullet lists, or explain your reasoning. Output must be plain text only.

Format rules:
1) The first line MUST be the story title (short, <= 6 words).
2) Then output the story paragraphs. Keep total length approximately 220-320 words for length="short". Be logical, emotionally coherent, and descriptive. Use sensory details and natural language. Do not invent modern brand names or copyrighted characters.
3) The final line MUST be a single-sentence quote or moral prefixed exactly as:
— Quote: "The quote text here"

Story parameters:
- Idea: A boy searching for gold in a jungle
- Genre: Adventure
- Story Type: Inspirational
- Tone: Soft
- Audience: kids

Constraints:
- No graphic violence, no sexual content.
- No real-person likenesses or public figures.
- No code blocks, no JSON, no extra text outside the story.
- End with the required quote line.

Now, write the story that follows the rules above.
```

## Image prompt example (filled)

```
storybook illustration, warm pastel palette, cel-shaded, high detail, cinematic lighting, high detail, no text, no watermark, no photorealism, camera: wide shot. Scene: A young boy standing at the dense jungle edge at sunrise, wearing a small backpack and looking hopeful. Character details: young boy with worn backpack, curious expression. Aspect ratio: 4:3. --ar 4:3
```

## Negative prompt example

```
photorealistic, realism, text, watermark, logo, lowres, bad anatomy, extra limbs, deformed, blurred, mutated, signature, ugly, out of frame
```

## Performance tips

- Groq: use `temperature=0.6–0.8` and set `max_tokens` based on length.
- Image API: `512x512` is fast; use `768x512` for higher detail if latency allows.
- Cache images by hash of `(style_tag + scene_description)` to avoid repeated calls.
- Cap image count to `min(5, scenes_returned)`.

## Safety notes

`sanitize_user_input()` removes PII and blocks public figure/copyrighted requests. When blocked, it returns:

```
{"error": "content_not_allowed"}
```

Handle this in the API layer by returning a JSON error response.


