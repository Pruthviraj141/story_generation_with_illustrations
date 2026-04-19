// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/illustrate": { target: "http://localhost:8000", changeOrigin: true },
      "/story": { target: "http://localhost:8000", changeOrigin: true },
      "/create": { target: "http://localhost:8000", changeOrigin: true }
    }
  }
});
