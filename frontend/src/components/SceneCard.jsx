// src/components/SceneCard.jsx
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function SceneCard({ scene, isLoading }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [imgError, setImgError] = useState(false);

  const imageSrc = useMemo(() => scene?.image_url || "", [scene]);
  const sceneNumber = scene?.scene_number ?? "?";
  const caption = scene?.caption || "";
  const readText = scene?.description || scene?.caption || "";

  useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
  }, [imageSrc]);

  const handleReadAloud = useCallback(() => {
    if (!("speechSynthesis" in window) || !readText) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(readText);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    window.speechSynthesis.cancel();
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [readText, speaking]);

  const showSkeleton = isLoading || (!imgLoaded && Boolean(imageSrc) && !imgError);

  return (
    <article className="scene-card" aria-label={`Scene ${sceneNumber}`}>
      <div className="scene-image-wrap">
        <span className="scene-badge">Scene {sceneNumber}</span>

        <AnimatePresence>
          {showSkeleton && (
            <motion.div
              className="scene-shimmer"
              key={`shimmer-${sceneNumber}`}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="scene-shimmer-wave" />
              <div className="scene-shimmer-content">
                <motion.span
                  aria-hidden="true"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  style={{ color: "var(--gold)", fontSize: "1.5rem" }}
                >
                  ✦
                </motion.span>
                <p className="scene-shimmer-label">Painting scene {sceneNumber}...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isLoading && imageSrc && !imgError && (
          <motion.img
            src={imageSrc}
            alt={caption || `Illustration for scene ${sceneNumber}`}
            loading="lazy"
            className="scene-img"
            initial={{ opacity: 0 }}
            animate={{ opacity: imgLoaded ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        )}

        {!isLoading && (imgError || !imageSrc) && (
          <div className="scene-image-fallback">
            <span aria-hidden="true" style={{ fontSize: "1.4rem" }}>
              🖼️
            </span>
            <p>Scene illustration unavailable</p>
          </div>
        )}

        <motion.button
          type="button"
          className="read-aloud-btn"
          onClick={handleReadAloud}
          aria-label={speaking ? `Stop reading scene ${sceneNumber}` : `Read scene ${sceneNumber} aloud`}
          whileTap={{ scale: 0.92 }}
        >
          {speaking ? (
            <motion.span animate={{ scale: [1, 1.18, 1] }} transition={{ repeat: Infinity, duration: 1.1 }}>
              ⏹
            </motion.span>
          ) : (
            <span>🔊</span>
          )}
        </motion.button>
      </div>

      <p className="scene-caption">{caption || "A new scene unfolds."}</p>
    </article>
  );
}

export default memo(SceneCard);
