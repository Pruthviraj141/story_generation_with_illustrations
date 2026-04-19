import { useEffect, useMemo, useRef } from "react";
import SceneCard from "./SceneCard";

const splitStory = (story) =>
  (story || "")
    .split(/\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

const toTitle = (story) => {
  const firstLine = (story || "").split("\n").find((line) => line.trim());
  if (!firstLine) return "Your Story";
  const sentence = firstLine.split(/[.!?]/)[0].trim();
  if (!sentence) return "Your Story";
  return sentence.length > 70 ? `${sentence.slice(0, 67)}...` : sentence;
};

export default function StoryRenderer({ storyData }) {
  const containerRef = useRef(null);

  const paragraphs = useMemo(() => splitStory(storyData?.story), [storyData?.story]);

  const title = useMemo(() => toTitle(storyData?.story), [storyData?.story]);

  const sceneItems = useMemo(() => {
    const scenes = storyData?.scenes || [];
    const images = storyData?.images || [];
    return scenes.map((scene, index) => ({
      sceneText: typeof scene === "string" ? scene : scene?.caption || scene?.text || "",
      image: images[index] || "",
      sceneNumber: index + 1
    }));
  }, [storyData?.images, storyData?.scenes]);

  const flow = useMemo(() => {
    if (!paragraphs.length) return [];

    const sceneBuckets = paragraphs.map(() => []);
    sceneItems.forEach((scene, index) => {
      const slot = Math.min(
        paragraphs.length - 1,
        Math.max(0, Math.floor(((index + 1) * paragraphs.length) / (sceneItems.length + 1)))
      );
      sceneBuckets[slot].push(scene);
    });

    return paragraphs.map((paragraph, index) => ({
      paragraph,
      index,
      scenes: sceneBuckets[index]
    }));
  }, [paragraphs, sceneItems]);

  useEffect(() => {
    const parent = containerRef.current;
    if (!parent) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -5% 0px" }
    );

    const targets = parent.querySelectorAll("[data-reveal]");
    targets.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [flow]);

  if (!storyData?.story) {
    return null;
  }

  return (
    <article className="story-renderer" aria-live="polite" ref={containerRef}>
      <header className="story-header reveal-item visible">
        <p className="story-kicker">Generated Story</p>
        <h2 className="story-title">{title}</h2>
      </header>

      <section className="story-flow" aria-label="Story content">
        {flow.map((item) => (
          <section key={`section-${item.index}`} className="story-block">
            <section
              data-index={item.index}
              data-reveal
              className="story-paragraph-wrap reveal-item"
              style={{ "--i": item.index }}
            >
              <p className="story-paragraph">{item.paragraph}</p>
            </section>

            {item.scenes.length > 0 && (
              <section className="scene-inline-grid" data-reveal>
                {item.scenes.map((scene) => (
                  <SceneCard
                    key={`scene-${scene.sceneNumber}-${item.index}`}
                    sceneNumber={scene.sceneNumber}
                    sceneText={scene.sceneText}
                    image={scene.image}
                  />
                ))}
              </section>
            )}
          </section>
        ))}
      </section>
    </article>
  );
}
