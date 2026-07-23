import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Repo name used as the GitHub Pages base path (https://<user>.github.io/vacances/).
// Override with VITE_BASE at build time if the repo is renamed.
const base = process.env.VITE_BASE ?? "/vacances/";

export default defineConfig({
  base,
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ["firebase/app", "firebase/firestore"],
          motion: ["framer-motion"],
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
});
