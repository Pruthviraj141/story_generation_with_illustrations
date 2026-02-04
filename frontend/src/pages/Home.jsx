import { useMemo, useState } from "react";
import StoryForm from "../components/StoryForm";
import IllustrateForm from "../components/IllustrateForm";
import StoryViewer from "../components/StoryViewer";

export default function Home() {
  const [mode, setMode] = useState("story");
  const [result, setResult] = useState(null);

  const title = useMemo(() => {
    if (!result?.story) return "";
    const firstLine = result.story.split("\n").find((line) => line.trim().length > 0) || "";
    const sentence = firstLine.split(/[.!?]/)[0].trim();
    if (!sentence) return "Untitled Story";
    return sentence.length > 60 ? `${sentence.slice(0, 57)}...` : sentence;
  }, [result?.story]);

  const handleResult = (payload) => {
    setResult(payload);
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setResult(null);
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 pb-20 pt-10 md:px-10">
      <div className="orb orb-indigo left-[-80px] top-[-80px] animate-float" />
      <div className="orb orb-rose right-[-120px] top-[120px] animate-float" />

      <header className="relative z-10 mx-auto mb-10 max-w-5xl text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-indigo-200">StoryLens AI</p>
        <h1 className="mt-4 text-4xl font-semibold text-gradient md:text-6xl">
          Spin luminous tales with a single spark
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-200 md:text-base">
          A magical studio for storybook creation. Describe a single idea and watch it
          become a full narrative with cinematic illustrations.
        </p>
      </header>

      <section className="relative z-10 mx-auto max-w-5xl">
        <div className="glass-panel p-6 md:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => handleModeChange("story")}
              className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                mode === "story"
                  ? "bg-white text-slate-900"
                  : "border border-white/15 text-slate-200 hover:border-white/30"
              }`}
            >
              Create Storybook
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("illustrate")}
              className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                mode === "illustrate"
                  ? "bg-white text-slate-900"
                  : "border border-white/15 text-slate-200 hover:border-white/30"
              }`}
            >
              Illustrate My Story
            </button>
          </div>

          <div className="mt-8">
            {mode === "story" ? (
              <StoryForm onResult={handleResult} />
            ) : (
              <IllustrateForm onResult={handleResult} />
            )}
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto mt-16 max-w-5xl">
        {result ? (
          <div className="glass-panel p-6 md:p-10 animate-fade-up">
            <StoryViewer story={result.story} images={result.images || []} title={title} />
          </div>
        ) : (
          <div className="glass-panel p-6 text-center">
            <p className="text-sm text-slate-200">
              Your generated story and illustrations will appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
