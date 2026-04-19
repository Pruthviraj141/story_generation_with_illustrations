// src/App.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import GeneratingOverlay from "./components/GeneratingOverlay";
import StoryReader from "./components/StoryReader";
import Toast from "./components/Toast";

const STARTER_CHIPS = [
  "🐉 Dragon Kingdom",
  "🚀 Space Explorer",
  "🌊 Ocean Mystery",
  "🧙 Enchanted Forest",
  "🏴‍☠️ Pirate Adventure",
  "🤖 Robot World"
];

const MAX_CHARS = 500;

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] }
  }
};

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const deriveTitleFromStory = (storyText) => {
  const firstParagraph = (storyText || "")
    .split(/\n+/)
    .map((item) => item.trim())
    .find(Boolean);

  if (!firstParagraph) return "Untitled Story";

  const firstSentence = firstParagraph.split(/[.!?]/)[0].trim();
  if (!firstSentence) return "Untitled Story";

  return firstSentence.length > 64 ? `${firstSentence.slice(0, 61)}...` : firstSentence;
};

const toDataUri = (value) => {
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("http")) return value;
  return `data:image/png;base64,${value}`;
};

const buildStoryPayload = (data) => {
  const rawStoryText = data?.story_text || data?.story || data?.text || "";
  const rawScenes = Array.isArray(data?.scenes) ? data.scenes : [];
  const rawImages = Array.isArray(data?.images) ? data.images : [];

  const scenes = rawScenes.map((scene, index) => {
    const caption = typeof scene === "string" ? scene : scene?.caption || scene?.description || "";
    return {
      scene_number: index + 1,
      caption,
      description: typeof scene === "string" ? scene : scene?.description || caption,
      image_url: toDataUri(rawImages[index] || "")
    };
  });

  return {
    title:
      data?.title && data.title.trim() && data.title.trim().toLowerCase() !== "untitled story"
        ? data.title.trim()
        : deriveTitleFromStory(rawStoryText),
    story_text: rawStoryText,
    scenes
  };
};

const defaultStoryRequest = (prompt) => ({
  idea: prompt,
  genre: "Fantasy",
  type: "Inspirational",
  tone: "Soft"
});

async function fetchStorybook(prompt) {
  const res = await fetch("/create/storybook", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(defaultStoryRequest(prompt))
  });

  if (!res.ok) {
    throw new Error("Could not generate storybook.");
  }

  return buildStoryPayload(await res.json());
}

async function fetchStoryFallback(prompt) {
  const res = await fetch("/story/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(defaultStoryRequest(prompt))
  });

  if (!res.ok) {
    throw new Error("Could not generate story.");
  }

  return buildStoryPayload(await res.json());
}

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [story, setStory] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generatingImages, setGeneratingImages] = useState(false);
  const [toast, setToast] = useState(null);

  const storyRef = useRef(null);
  const textareaRef = useRef(null);

  const remaining = useMemo(() => MAX_CHARS - prompt.length, [prompt.length]);

  const autoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 240)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [prompt, autoResize]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || generating) return;

    setGenerating(true);
    setStory(null);

    try {
      let data;
      try {
        data = await fetchStorybook(prompt.trim());
      } catch {
        data = await fetchStoryFallback(prompt.trim());
      }

      setGenerating(false);
      setGeneratingImages(true);
      setStory(data);
      setToast({ msg: "Story crafted successfully.", type: "success" });

      await sleep(800);
      setGeneratingImages(false);

      requestAnimationFrame(() => {
        storyRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      setGenerating(false);
      setGeneratingImages(false);
      setToast({ msg: err.message || "Something went wrong while generating.", type: "error" });
    }
  }, [generating, prompt]);

  const handleKeyDown = useCallback(
    (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        handleGenerate();
      }
    },
    [handleGenerate]
  );

  return (
    <div className="app-root">
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />

      <main className="main-container">
        <motion.header
          className="app-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="app-title">StoryWeaver</h1>
          <p className="app-subtitle">Turn a single spark into an illustrated tale.</p>
        </motion.header>

        <section className="composer-card" aria-label="Story prompt composer">
          <label className="prompt-label" htmlFor="story-prompt">
            Story prompt
          </label>

          <div className="prompt-wrap">
            <textarea
              id="story-prompt"
              ref={textareaRef}
              className="prompt-textarea"
              value={prompt}
              maxLength={MAX_CHARS}
              onChange={(event) => setPrompt(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="A curious child finds an ancient map in a silent library..."
            />
            <p className={`prompt-counter ${remaining < 50 ? "is-warning" : ""}`}>
              {remaining} left
            </p>
          </div>

          <p className="shortcut-hint">⌘ Enter</p>

          <motion.div
            className="chips-row"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
          >
            {STARTER_CHIPS.map((chip) => (
              <motion.button
                key={chip}
                type="button"
                className="starter-chip"
                variants={fadeUp}
                onClick={() => setPrompt(chip.replace(/^[^\s]+\s/, ""))}
              >
                {chip}
              </motion.button>
            ))}
          </motion.div>

          <motion.button
            type="button"
            className="generate-btn"
            onClick={handleGenerate}
            disabled={!prompt.trim() || generating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {generating ? "Crafting your story..." : "Generate Story"}
          </motion.button>
        </section>

        <section ref={storyRef} className="story-output">
          <AnimatePresence mode="wait">
            {story && (
              <motion.div key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <StoryReader story={story} imagesLoading={generatingImages} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>

      <AnimatePresence>{generating ? <GeneratingOverlay key="overlay" /> : null}</AnimatePresence>

      <AnimatePresence>
        {toast ? <Toast key="toast" msg={toast.msg} type={toast.type} /> : null}
      </AnimatePresence>
    </div>
  );
}
