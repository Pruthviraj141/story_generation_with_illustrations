import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STARTERS = [
  "Dragon Kingdom",
  "Space Explorer",
  "Ocean Mystery",
  "Enchanted Forest",
  "Clockwork City",
  "Moonlight Detective"
];

const MAX_CHARS = 600;

export default function StoryComposer({ onGenerate, isGenerating, errorSignal }) {
  const [prompt, setPrompt] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const textareaRef = useRef(null);
  const resizeTimeoutRef = useRef(null);

  const remaining = useMemo(() => MAX_CHARS - prompt.length, [prompt.length]);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => {
    window.clearTimeout(resizeTimeoutRef.current);
    resizeTimeoutRef.current = window.setTimeout(autoResize, 100);
    return () => window.clearTimeout(resizeTimeoutRef.current);
  }, [prompt, autoResize]);

  useEffect(() => {
    if (!errorSignal) return;
    setIsShaking(true);
    const timer = window.setTimeout(() => setIsShaking(false), 420);
    return () => window.clearTimeout(timer);
  }, [errorSignal]);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (!prompt.trim() || isGenerating) return;
      await onGenerate(prompt.trim());
    },
    [isGenerating, onGenerate, prompt]
  );

  const handleChipClick = useCallback((value) => {
    setPrompt(`Once upon a time, in a world where ${value.toLowerCase()} ruled the horizon...`);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  return (
    <section className="composer-wrap glass-surface" aria-label="Create your story">
      <header className="composer-header">
        <h1 className="hero-title">StoryLens AI</h1>
        <p className="hero-subtitle">Turn one spark into an illustrated storybook.</p>
      </header>

      <form className="composer-form" onSubmit={handleSubmit}>
        <label htmlFor="storyPrompt" className="composer-label">
          Story Prompt
        </label>

        <div className="textarea-shell">
          <textarea
            id="storyPrompt"
            ref={textareaRef}
            value={prompt}
            maxLength={MAX_CHARS}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Once upon a time, in a world where..."
            className="composer-textarea"
            rows={4}
            required
          />
          <p className="char-counter" aria-live="polite">
            {remaining}/{MAX_CHARS}
          </p>
        </div>

        <div className="starter-chip-row" role="list" aria-label="Story starter ideas">
          {STARTERS.map((starter) => (
            <button
              key={starter}
              type="button"
              role="listitem"
              className="starter-chip"
              onClick={() => handleChipClick(starter)}
            >
              {starter}
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className={`generate-btn ${isShaking ? "is-shaking" : ""}`}
        >
          {isGenerating ? "Generating Story..." : "Generate Story"}
        </button>
      </form>
    </section>
  );
}
