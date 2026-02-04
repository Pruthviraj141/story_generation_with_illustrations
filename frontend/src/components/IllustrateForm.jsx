import { useEffect, useState } from "react";
import API from "../services/api";

const LOADING_MESSAGES = [
  "Reading every scene...",
  "Sketching with starlight...",
  "Painting moments in motion..."
];

export default function IllustrateForm({ onResult }) {
  const [story, setStory] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messageIndex, setMessageIndex] = useState(0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { story };
      const response = await API.illustrateStory(payload);
      onResult(response);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="illustrate-story" className="mb-2 block text-sm text-slate-200">
          Paste your story draft
        </label>
        <textarea
          id="illustrate-story"
          required
          value={story}
          onChange={(event) => setStory(event.target.value)}
          placeholder="Once upon a midnight train ride, the windows began to glow..."
          rows={8}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-100 shadow-[0_15px_40px_rgba(15,23,42,0.35)] focus:border-indigo-300/60 focus:outline-none"
        />
        <p className="mt-2 text-xs text-slate-300">
          We will extract scenes and create a full illustration gallery from your story.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading || story.trim().length < 20}
          className="button-glow"
        >
          {loading ? "Generating illustrations..." : "Generate Illustrations"}
        </button>
        <button
          type="button"
          onClick={() => setStory("")}
          disabled={loading}
          className="rounded-full border border-white/15 px-5 py-2 text-xs uppercase tracking-[0.3em] text-slate-200 transition hover:border-white/30"
        >
          Clear
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
