// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://karankapur.com',
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    // The one stylesheet (about 25 KB, 6.6 KB over the wire) goes into the
    // page as a style element instead of a render-blocking request: the
    // first paint no longer waits for a second round trip, and the fonts it
    // declares are discovered from the HTML itself. A single-page site gets
    // nothing from caching the sheet separately.
    inlineStylesheets: 'always',
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
