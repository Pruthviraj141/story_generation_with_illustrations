import unittest

from services.prompt_builder import (
    build_story_prompt,
    build_scene_extraction_prompt,
    build_image_prompt,
    build_negative_image_prompt,
    build_image_api_payload,
    build_groq_payload_for_story,
    sanitize_user_input,
    choose_style_tag,
)


class PromptBuilderTests(unittest.TestCase):
    def test_build_story_prompt_format_rules(self):
        prompt = build_story_prompt(
            idea="A boy searching for gold in a jungle",
            genre="Adventure",
            story_type="Inspirational",
            tone="Soft",
            audience="kids",
            length="short",
        )
        self.assertIn("The first line MUST be the story title", prompt)
        self.assertIn("— Quote:", prompt)
        self.assertIn("220-320", prompt)

    def test_scene_extraction_prompt_json_only(self):
        prompt = build_scene_extraction_prompt("Title\nStory text\n— Quote: \"x\"")
        self.assertIn("Return a JSON array (only the JSON array, nothing else)", prompt)
        self.assertIn("Example output", prompt)
        self.assertIn("Now, extract scenes from this story", prompt)

    def test_image_prompt_contains_scene_and_constraints(self):
        scene = "A glowing cave interior with crystals and a small lantern"
        prompt = build_image_prompt(scene)
        self.assertIn(scene, prompt)
        self.assertIn("no photorealism", prompt)
        self.assertIn("no text", prompt)

    def test_negative_prompt_contains_key_terms(self):
        negative = build_negative_image_prompt()
        self.assertIn("photorealistic", negative)
        self.assertIn("watermark", negative)

    def test_payload_helpers(self):
        payload = build_image_api_payload("scene", "neg", width=512, height=384)
        self.assertEqual(payload["width"], 512)
        self.assertEqual(payload["height"], 384)
        groq = build_groq_payload_for_story("prompt", max_tokens=512, temperature=0.6)
        self.assertEqual(groq["max_tokens"], 512)
        self.assertEqual(groq["temperature"], 0.6)

    def test_sanitize_user_input_blocks_disallowed(self):
        text = sanitize_user_input("Make a story about Harry Potter")
        self.assertIn("content_not_allowed", text)

    def test_choose_style_tag(self):
        style_tag, palette = choose_style_tag("Adventure", "Inspirational", "Soft")
        self.assertTrue(style_tag)
        self.assertTrue(palette)


if __name__ == "__main__":
    unittest.main()
