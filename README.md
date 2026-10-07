# karankapur.com

Personal site for Karan Kapur. Static Astro 5, zero framework JavaScript, one small page script (`src/scripts/page.ts`: sound control, fork control, offscreen pause, tour scroll, lazy scene loading) and three WebGL scenes in three.js that load only when their canvas nears the viewport and the device has hardware WebGL. This branch is v3, "Fork": minimalist and dark, warm near-black with one ember accent, built around a session that forks into branches. The hero is a draggable 3D KV cache lattice that forks, the thaw section is a scroll-driven engineering tour, and the projects are tilted cards floating in perspective. All geometry is procedural, in `src/scenes`. The contract is in `DESIGN.md`. The v2 branch holds the "Crate" design.

## Quick start

Needs Node 20 or newer.

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs dist/
npm run preview    # serves dist/ on 127.0.0.1:4321
```

## Checks

```bash
npm run check                          # astro check
npm run build
npx playwright install chromium        # once
npm run test:e2e                       # Playwright + axe at 390, 820, 1440
npm run lhci                           # Lighthouse CI budgets against dist/
```

CI runs the same plus a lychee link check over the built HTML. See `.github/workflows/ci.yml`.

## Editing content

Everything the page says lives in `src/content/`, validated by `src/content.config.ts`:

| File | What |
|---|---|
| `profile/main.json` | Name, approved tagline and intro bullets, contact links, playlist, photo |
| `projects/thaw.json` | Featured work. Each metric needs `setup` and a `source` URL or the build fails |
| `projects/*.json` with `"kind": "crate"` | The other projects. Leave `links` empty to render a sleeve with no link |
| `experience/*.json` | One sentence per role |

Metric numbers must come from `_brief/RECEIPTS.md`. Rationale for every direction change is in `_brief/DECISIONS.md`.

## 3D scenes

| File | What |
|---|---|
| `src/scripts/page.ts` | The only script in the first load: controls, offscreen pause, the tour scroll, and the dynamic imports below |
| `src/scenes/boot.ts` | Helpers for the page script: the one WebGL probe (software rasterizers count as none), near-viewport and idle callbacks |
| `src/scenes/lattice.ts` | Pure geometry of the forking KV cache lattice, shared by the SVG fallback and the hero |
| `src/scenes/iso.ts` | Build-time isometric SVG of the lattice (the hero fallback) |
| `src/scenes/gl.ts` | Shared three.js helpers: renderer with capped pixel ratio, instanced boxes with hairline edges, the pausing render loop, disposal |
| `src/scenes/hero.ts` | The hero: drag to orbit, drag or scroll to fork, parallax, inertia |
| `src/scenes/tour.ts` | The thaw tour: five camera views, highlight, the fork flyout |
| `src/scenes/cards.ts` | Card drift, tilt and lift in CSS 3D (no three.js) |
| `src/scenes/cardsGl.ts` | The deck backdrop: floor hairlines and a wire frame per card, camera matched to the CSS perspective |

Unused v2 components (`Crate.astro`, `Turntable.astro`, `Liner.astro`, `Background.astro`) and the v3 SVG `Session.astro` are not imported anywhere and should be deleted; the lane this was built in blocks `rm` and `git rm`.

## Deploy

`deploy.yml` builds `main` and publishes `dist/` to GitHub Pages. `public/CNAME` keeps the custom domain. The `v2` and `v3` branches are not wired to deploy yet.
