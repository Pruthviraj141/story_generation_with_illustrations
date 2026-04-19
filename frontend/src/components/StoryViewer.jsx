import { useEffect, useMemo, useState } from "react";

const splitStory = (story) =>
  story
    .split(/\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

const resolveImageSrc = (value) => {
  if (!value) return "";
  if (value.startsWith("data:") || value.startsWith("http")) {
    return value;
  }
  return `data:image/png;base64,${value}`;
};

export default function StoryViewer({ story, images, title }) {
  const paragraphs = useMemo(() => splitStory(story), [story]);
  const [typedText, setTypedText] = useState("");

  if (!story) {
    return null;
  }

  const imageSlots = images?.length ? images : [];
  const closingParagraph = paragraphs.length ? paragraphs[paragraphs.length - 1] : "";
  const mainParagraphs = paragraphs.slice(0, Math.max(0, paragraphs.length - 1));

  const rows = useMemo(() => {
    const layout = [];
    if (mainParagraphs.length > 0) {
      layout.push({ type: "both", paragraph: mainParagraphs[0], imageIndex: 0 });
      for (let i = 1; i < mainParagraphs.length; i += 1) {
        layout.push({ type: "paragraph", paragraph: mainParagraphs[i] });
        if (imageSlots[i]) {
          layout.push({ type: "image", imageIndex: i });
        }
      }
    }

    for (let i = Math.max(1, mainParagraphs.length); i < imageSlots.length; i += 1) {
      if (!layout.some((row) => row.type === "image" && row.imageIndex === i)) {
        layout.push({ type: "image", imageIndex: i });
      }
    }

    return layout;
  }, [imageSlots, mainParagraphs]);

  useEffect(() => {
    setTypedText("");
    if (!closingParagraph) return;

    let index = 0;
    const speed = Math.max(18, Math.min(40, Math.floor(1200 / closingParagraph.length)));
    const interval = setInterval(() => {
      index += 1;
      setTypedText(closingParagraph.slice(0, index));
      if (index >= closingParagraph.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [closingParagraph]);

  return (
    <div className="space-y-12">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">Generated Story</p>
        <h2 className="mt-3 text-4xl font-semibold text-gradient md:text-5xl animate-fade-up">
          {title || "Your Story"}
        </h2>
      </div>

      <div className="space-y-8">
        {rows.map((row, index) => {
          const rowKey = row.type === "paragraph" ? row.paragraph?.slice(0, 12) : `image-${row.imageIndex}`;
          return (
            <div
              key={`${rowKey}-${index}`}
              className="grid gap-6 md:grid-cols-2 items-start"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {row.type !== "image" ? (
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.35)] animate-slide-left">
                  <p className="story-paragraph">{row.paragraph}</p>
                </div>
              ) : (
                <div className="hidden md:block" />
              )}

              {row.type === "image" || row.type === "both" ? (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-[0_20px_45px_rgba(15,23,42,0.35)] animate-slide-right md:col-start-2">
                  <img
                    src={resolveImageSrc(imageSlots[row.imageIndex])}
                    alt={`Illustration for scene ${row.imageIndex + 1}`}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="hidden md:block" />
              )}
            </div>
          );
        })}
      </div>

      {closingParagraph && (
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-8 shadow-[0_20px_50px_rgba(15,23,42,0.35)]">
            <p className="text-lg italic text-slate-100 md:text-xl">
              <span className="typing-text">{typedText}</span>
              {typedText.length < closingParagraph.length && <span className="typing-cursor" />}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
