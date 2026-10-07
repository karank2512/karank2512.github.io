// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://karankapur.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    inlineStylesheets: 'auto',
  },
  vite: {
    css: {
      // Inline PostCSS config so Vite ignores the legacy postcss.config.js
      // left over from the v1 Tailwind build.
      postcss: { plugins: [] },
    },
  },
});
