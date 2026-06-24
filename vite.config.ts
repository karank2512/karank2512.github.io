import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base: "./" keeps asset paths relative so the build works on GitHub Pages
// project sites (e.g. username.github.io/repo-name) without extra config.
export default defineConfig({
  plugins: [react()],
  base: "./",
});
