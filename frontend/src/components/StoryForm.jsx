import { useEffect, useRef, useState } from "react";
import API from "../services/api";

const GENRES = ["Adventure", "Fantasy", "Mystery", "Mythology", "Sci-Fi"];
const TYPES = ["Funny", "Learning", "Inspirational", "Kids"];
const TONES = ["Soft", "Emotional", "Dark", "Happy"];
const EXAMPLE_PROMPTS = [
  "A lonely robot finds a small plant on Mars",
  "A bedtime story about a dragon who hates fire",
  "A cyberpunk city where rain controls time",
  "A magical school hidden under the ocean",
  "An astronaut child lost inside a living spaceship"
];
const LOADING_MESSAGES = [
  "Weaving your story...",
  "Painting scenes with imagination...",
  "Composing luminous chapters...",
  "Summoning starlit illustrations..."
];

export default function StoryForm({ onResult }) {
  const [idea, setIdea] = useState("");
  const [genre, setGenre] = useState(GENRES[0]);
  const [type, setType] = useState(TYPES[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);
  const textareaRef = useRef(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { idea: idea.trim(), genre, type, tone };
      const response = await API.createStorybook(payload);
      onResult(response);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIdea("");
    setGenre(GENRES[0]);
    setType(TYPES[0]);
    setTone(TONES[0]);
    setError("");
  };

  useEffect(() => {
    if (!loading) {
      setMessageIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2200);

    return () => clearInterval(interval);
  }, [loading]);

  const handlePromptClick = (prompt) => {
    setIdea(prompt);
    requestAnimationFrame(() => textareaRef.current?.focus());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="story-idea" className="mb-2 block text-sm text-slate-200">
          Your story spark
        </label>
        <textarea
          id="story-idea"
          ref={textareaRef}
          required
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="A moonlit library where books whisper back to their readers..."
          rows={6}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-100 shadow-[0_15px_40px_rgba(15,23,42,0.35)] focus:border-indigo-300/60 focus:outline-none"
        />
        <p className="mt-2 text-xs text-slate-300">
          The story title is generated for you automatically.
        </p>
      </div>

      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-slate-300">Try an example</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => handlePromptClick(prompt)}
              className="chip"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label htmlFor="story-genre" className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-300">
            Genre
          </label>
          <select
            id="story-genre"
            value={genre}
            onChange={(event) => setGenre(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
          >
            {GENRES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="story-type" className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-300">
            Story type
          </label>
          <select
            id="story-type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
          >
            {TYPES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="story-tone" className="mb-1 block text-xs uppercase tracking-[0.3em] text-slate-300">
            Tone
          </label>
          <select
            id="story-tone"
            value={tone}
            onChange={(event) => setTone(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100"
          >
            {TONES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={loading || !idea.trim()} className="button-glow">
          {loading ? "Crafting your story..." : "Generate Storybook"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          disabled={loading}
          className="rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-[0.3em] text-slate-200 transition hover:border-white/30"
        >
          Reset
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-sm text-slate-200">
          <span>{LOADING_MESSAGES[messageIndex]}</span>
          <span className="loader-dots">
            <span />
            <span />
            <span />
          </span>
        </div>
      )}
    </form>
  );
}
