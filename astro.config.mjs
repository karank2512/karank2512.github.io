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
    build: {
      // No preload helper in the page script. The scene chunks are imported
      // lazily on idle or on approach, so the one extra round trip for their
      // shared three.js chunk costs nothing visible and the page script stays
      // a single small module.
      modulePreload: false,
    },
  },
});
