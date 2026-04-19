// src/components/GeneratingOverlay.jsx
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MESSAGES = [
  "Weaving your world together...",
  "Giving voice to your characters...",
  "Painting the scenes with words...",
  "Sprinkling magic on every page...",
  "Breathing life into your story..."
];

export default function GeneratingOverlay() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(4);

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, idx) => ({
        id: idx,
        x: `${Math.random() * 100}%`,
        y: `${Math.random() * 100}%`,
        size: 3 + Math.random() * 5,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 3
      })),
    []
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2200);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((prev) => prev + (85 - prev) * 0.04);
    }, 120);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <motion.section
      className="generating-overlay"
      aria-live="polite"
      aria-label="Story generation in progress"
      role="status"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="overlay-particle"
          style={{
            left: particle.x,
            top: particle.y,
            width: `${particle.size}px`,
            height: `${particle.size}px`
          }}
          animate={{ y: [0, -40, 0], opacity: [0.2, 0.8, 0.2], scale: [1, 1.4, 1] }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      ))}

      <section className="generating-card" aria-label="Generating content">
        <div className="generating-emblem" aria-hidden="true">
          <motion.div
            className="generating-ring"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.span
            className="generating-star"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            ✦
          </motion.span>
        </div>

        <div className="generating-text">
          <AnimatePresence mode="wait">
            <motion.p
              key={MESSAGES[messageIndex]}
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -14, opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="progress-track" aria-hidden="true">
          <span className="progress-worm" style={{ width: `${Math.min(progress, 85)}%` }} />
        </div>

        <p className="generating-sub">This usually takes 20–40 seconds</p>
      </section>
    </motion.section>
  );
}
