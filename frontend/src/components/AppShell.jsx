import { useCallback } from "react";
import StoryComposer from "./StoryComposer";
import StoryRenderer from "./StoryRenderer";

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: "⌂" },
  { key: "create", label: "Create Story", icon: "✦" },
  { key: "stories", label: "My Stories", icon: "☰" },
  { key: "settings", label: "Settings", icon: "⚙" }
];

const getStoryTitle = (story) => {
  const first = (story || "").split("\n").find((line) => line.trim());
  if (!first) return "Untitled Story";
  const sentence = first.split(/[.!?]/)[0].trim();
  if (!sentence) return "Untitled Story";
  return sentence.length > 62 ? `${sentence.slice(0, 59)}...` : sentence;
};

export default function AppShell({
  activeTab,
  onTabChange,
  storyData,
  onGenerate,
  isGenerating,
  onShare,
  stories,
  onSelectStory,
  errorSignal
}) {
  const showComposer = activeTab === "home" || activeTab === "create";

  const renderCenter = useCallback(() => {
    if (showComposer) {
      return (
        <>
          <StoryComposer onGenerate={onGenerate} isGenerating={isGenerating} errorSignal={errorSignal} />
          {storyData?.story && <StoryRenderer storyData={storyData} />}
        </>
      );
    }

    if (activeTab === "stories") {
      return (
        <section className="stories-library glass-surface" aria-label="Saved stories">
          <h2 className="panel-heading">My Stories</h2>
          {stories.length === 0 ? (
            <p className="panel-copy">Generate a story and it will appear here for quick revisit.</p>
          ) : (
            <ul className="story-list" role="list">
              {stories.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="story-list-item"
                    onClick={() => onSelectStory(item.id)}
                  >
                    <span>{getStoryTitle(item.story)}</span>
                    <span aria-hidden="true">→</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      );
    }

    return (
      <section className="settings-panel glass-surface" aria-label="Settings">
        <h2 className="panel-heading">Settings</h2>
        <p className="panel-copy">
          Use scene-level <strong>Read Aloud</strong> to narrate any moment. Additional controls can be added here.
        </p>
      </section>
    );
  }, [activeTab, errorSignal, isGenerating, onGenerate, onSelectStory, showComposer, stories, storyData]);

  return (
    <div className="app-shell">
      <header className="top-nav glass-surface" role="banner">
        <h1 className="brand-title">StoryLens</h1>
        <nav aria-label="Primary navigation" className="desktop-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => onTabChange(item.key)}
              className={`nav-link ${activeTab === item.key ? "is-active" : ""}`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="main-content" id="main-content">
        {renderCenter()}
      </main>

      {storyData?.story && (
        <button type="button" className="share-fab" onClick={onShare} aria-label="Share Story">
          <span aria-hidden="true">⤴</span>
        </button>
      )}

      <footer>
        <nav className="mobile-bottom-nav" aria-label="Mobile bottom navigation">
          {NAV_ITEMS.map((item) => (
            <button
              key={`mobile-${item.key}`}
              type="button"
              onClick={() => onTabChange(item.key)}
              className={`bottom-nav-item ${activeTab === item.key ? "is-active" : ""}`}
              aria-current={activeTab === item.key ? "page" : undefined}
            >
              <span className="bottom-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </footer>
    </div>
  );
}
