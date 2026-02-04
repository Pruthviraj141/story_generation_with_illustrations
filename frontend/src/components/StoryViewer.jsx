import { useMemo } from "react";

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

  if (!story) {
    return null;
  }

  const imageSlots = images?.length ? images : [];
  const slotSize = Math.max(1, Math.ceil(paragraphs.length / (imageSlots.length || 1)));
  const usedImageIndexes = new Set();
  const rows = paragraphs.map((paragraph, index) => {
    const imageIndex = Math.floor(index / slotSize);
    const showImage = imageSlots[imageIndex] && index % slotSize === 0;
    if (showImage) {
      usedImageIndexes.add(imageIndex);
    }
    return { paragraph, imageIndex, showImage };
  });

  const remainingImages = imageSlots.filter((_, index) => !usedImageIndexes.has(index));

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">Generated Story</p>
        <h2 className="text-3xl font-semibold text-gradient md:text-4xl">
          {title || "Your Story"}
        </h2>
      </div>

      <div className="space-y-8">
        {rows.map((row, index) => (
          <div
            key={`${row.paragraph.slice(0, 12)}-${index}`}
            className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] animate-fade-up"
            style={{ animationDelay: `${index * 0.08}s` }}
          >
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_rgba(15,23,42,0.35)]">
              <p className="story-paragraph">{row.paragraph}</p>
            </div>

            {row.showImage ? (
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-[0_20px_45px_rgba(15,23,42,0.35)]">
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
        ))}
      </div>

      {remainingImages.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-base font-semibold text-slate-100">More illustrations</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {remainingImages.map((image, index) => (
              <div
                key={`gallery-${index}`}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_30px_rgba(15,23,42,0.25)]"
              >
                <img
                  src={resolveImageSrc(image)}
                  alt={`Additional illustration ${index + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
