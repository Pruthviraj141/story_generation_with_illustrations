// src/components/StoryReader.jsx
import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import SceneCard from "./SceneCard";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  }
};

export default function StoryReader({ story, imagesLoading }) {
  const [isNarrating, setIsNarrating] = useState(false);

  const segments = useMemo(() => {
    if (!story?.story_text) return [];

    const lines = story.story_text.split(/\n/);
    const trimmedLastLine = (lines[lines.length - 1] || "").trim();
    const hasTerminalQuoteLine = /^[-–—]?\s*quote\s*:\s*/i.test(trimmedLastLine);

    const textForParagraphs = hasTerminalQuoteLine ? lines.slice(0, -1).join("\n").trim() : story.story_text;

    const paragraphs = textForParagraphs
      .split(/\n\n+/)
      .map((item) => item.trim())
      .filter(Boolean);

    const scenes = Array.isArray(story.scenes) ? story.scenes : [];
    if (!paragraphs.length) return scenes.map((scene) => ({ type: "scene", scene }));

    const step = Math.max(1, Math.floor(paragraphs.length / (scenes.length + 1 || 1)));
    const built = [];
    let sceneIndex = 0;

    paragraphs.forEach((para, index) => {
      built.push({ type: "paragraph", text: para, key: `p-${index}` });
      const shouldInsert = scenes.length > 0 && (index + 1) % step === 0 && sceneIndex < scenes.length;
      if (shouldInsert) {
        built.push({ type: "scene", scene: scenes[sceneIndex], key: `s-${sceneIndex}` });
        sceneIndex += 1;
      }
    });

    while (sceneIndex < scenes.length) {
      built.push({ type: "scene", scene: scenes[sceneIndex], key: `s-tail-${sceneIndex}` });
      sceneIndex += 1;
    }

    return built;
  }, [story]);

  const endingQuote = useMemo(() => {
    const text = story?.story_text || "";
    if (!text) return "";

    const lines = text
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);

    const last = lines[lines.length - 1] || "";
    const prefixedMatch = last.match(/^[-–—]?\s*quote\s*:\s*["“”']?(.+?)["“”']?\s*$/i);
    if (prefixedMatch?.[1]) return prefixedMatch[1].trim();

    const dashQuoteMatch = last.match(/^[-–—]\s*quote\s*:\s*["“”']?(.+?)["“”']?\s*$/i);
    if (dashQuoteMatch?.[1]) return dashQuoteMatch[1].trim();

    return "";
  }, [story?.story_text]);

  const handleShare = useCallback(async () => {
    if (!story?.story_text) return;

    const payload = {
      title: story.title || "StoryWeaver Story",
      text: story.story_text.slice(0, 1800)
    };

    try {
      if (navigator.share) {
        await navigator.share(payload);
        return;
      }
      await navigator.clipboard.writeText(story.story_text);
    } catch {
      // silent fallback by design
    }
  }, [story]);

  const handleBackToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleReadWholeStory = useCallback(() => {
    if (!("speechSynthesis" in window) || !story?.story_text) return;

    if (isNarrating) {
      window.speechSynthesis.cancel();
      setIsNarrating(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(story.story_text);
    utterance.rate = 0.94;
    utterance.pitch = 1.02;
    utterance.onend = () => setIsNarrating(false);
    utterance.onerror = () => setIsNarrating(false);

    window.speechSynthesis.cancel();
    setIsNarrating(true);
    window.speechSynthesis.speak(utterance);
  }, [isNarrating, story?.story_text]);

  if (!story) return null;

  return (
    <article className="story-reader" aria-live="polite">
      <header className="story-reader-header">
        <span className="story-rule" aria-hidden="true" />
        <h2 className="story-reader-title">{story.title || "Untitled Tale"}</h2>
        <span className="story-rule" aria-hidden="true" />
      </header>

      <motion.section
        className="story-segments"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {segments.map((segment, idx) => {
          if (segment.type === "paragraph") {
            return (
              <motion.p
                key={segment.key || `para-${idx}`}
                className="story-para"
                variants={itemVariants}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                {segment.text}
              </motion.p>
            );
          }

          return (
            <motion.div
              key={segment.key || `scene-${idx}`}
              variants={itemVariants}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <SceneCard scene={segment.scene} isLoading={imagesLoading} />
            </motion.div>
          );
        })}

        {endingQuote && (
          <motion.blockquote
            className="story-ending-quote"
            variants={itemVariants}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            “{endingQuote}”
          </motion.blockquote>
        )}
      </motion.section>

      <footer className="story-actions">
        <motion.button
          type="button"
          className="story-action-btn"
          onClick={handleReadWholeStory}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 360, damping: 24 }}
        >
          {isNarrating ? "⏹ Stop Reading" : "🔊 Read Whole Story"}
        </motion.button>
        <motion.button
          type="button"
          className="story-action-btn"
          onClick={handleShare}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 360, damping: 24 }}
        >
          ↗ Share Story
        </motion.button>
        <motion.button
          type="button"
          className="story-action-btn"
          onClick={handleBackToTop}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 360, damping: 24 }}
        >
          ↑ New Story
        </motion.button>
      </footer>
    </article>
  );
}
