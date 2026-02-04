import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/story": "http://localhost:8000",
      "/illustrate": "http://localhost:8000",
      "/create": "http://localhost:8000"
    }
  }
});
