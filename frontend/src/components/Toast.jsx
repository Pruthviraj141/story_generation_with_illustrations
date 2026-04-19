// src/components/Toast.jsx
import { motion } from "framer-motion";

export default function Toast({ msg, type = "success" }) {
  const isError = type === "error";

  return (
    <motion.aside
      className={`toast ${isError ? "toast-error" : "toast-success"}`}
      role={isError ? "alert" : "status"}
      aria-live="polite"
      initial={{ y: 60, scale: 0.95, opacity: 0 }}
      animate={{ y: 0, scale: 1, opacity: 1 }}
      exit={{ y: 60, scale: 0.95, opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <span aria-hidden="true">{isError ? "⚠️" : "✓"}</span>
      <span>{msg}</span>
    </motion.aside>
  );
}
