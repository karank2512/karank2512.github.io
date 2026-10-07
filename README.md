# karankapur.com

Personal site for Karan Kapur. Static Astro 5, zero framework JavaScript, one small page script (`src/scripts/page.ts`: sound control, fork control, offscreen pause, tour scroll, lazy scene loading) and seven small WebGL scenes in three.js that load only when their canvas nears the viewport and the device has hardware WebGL. This branch is v3, "Fork": minimalist and dark, warm near-black with one ember accent, built around a session that forks into branches. The hero is a draggable 3D KV cache lattice that forks; thaw is the first entry under Experience and opens into a scroll-driven engineering tour; the three project cards each carry their own procedural scene (a gate, a staffing agency, a signal field) and float in perspective; the sound control is a turntable. All geometry is procedural, in `src/scenes`. The contract is in `DESIGN.md`. The v2 branch holds the "Crate" design.

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

Everything the page says lives in `src/content/`, validated by `src/content.config.ts` and documented in `CLAUDE.md`:

| File | What |
|---|---|
| `profile/main.json` | Name, approved tagline and intro bullets, contact links, the four SoundCloud tracks in play order and the Spotify playlist link, photo |
| `projects/thaw.json` | The featured project, folded into the first experience entry. Each metric needs `setup` and a `source` URL or the build fails |
| `projects/*.json` with `"kind": "crate"` | The project cards. `caption` is the line under the card's scene. Leave `links` empty to render a card with no link |
| `experience/*.json` | One sentence per role. The entry with `"project": "thaw"` renders first and featured |
| `leadership/*.json` | Leadership roles. Empty for now; the section and its nav link appear only when a file exists |

Metric numbers must come from `_brief/RECEIPTS.md`. Rationale for every direction change is in `_brief/DECISIONS.md`.

## 3D scenes

| File | What |
|---|---|
| `src/scripts/page.ts` | The only script in the first load: controls, offscreen pause, the tour scroll, and the dynamic imports below |
| `src/scripts/sound.ts` | The sound control, bundled into the page script: one SoundCloud widget iframe created on the first press, play and pause, Previous and Next, auto-advance and loop; the play state follows the widget's events |
| `src/scenes/boot.ts` | Helpers for the page script: the one WebGL probe (software rasterizers count as none), near-viewport and idle callbacks |
| `src/scenes/lattice.ts` | Pure geometry of the forking KV cache lattice, shared by the SVG fallback and the hero |
| `src/scenes/iso.ts` | Build-time isometric SVG of the lattice (the hero fallback) |
| `src/scenes/gl.ts` | Shared three.js helpers: renderer with capped pixel ratio, instanced boxes with hairline edges, the pausing render loop, the `Stage` shell for the small scenes, disposal |
| `src/scenes/hero.ts` | The hero: drag to orbit, drag or scroll to fork, parallax, inertia |
| `src/scenes/tour.ts` | The thaw tour: five camera views, highlight, the fork flyout |
| `src/scenes/vinyl.ts` | The turntable in the sound control: arm, record, equalizer bars |
| `src/scenes/gate.ts` | RelayIQ: leads stream at a decision plane; pass, drop or hold |
| `src/scenes/agency.ts` | Foreman: a job spec assembles into a worker that walks through approval gates |
| `src/scenes/field.ts` | tell: event particles converge into a ranked list |
| `src/scenes/cards.ts` | Card drift, tilt and lift in CSS 3D (no three.js) |
| `src/scenes/cardsGl.ts` | The deck backdrop: floor hairlines and a wire frame per card, camera matched to the CSS perspective |

Unused v2 components (`Crate.astro`, `Turntable.astro`, `Liner.astro`, `Background.astro`) and the v3 SVG `Session.astro` are not imported anywhere and should be deleted; the lane this was built in blocks `rm` and `git rm`.

## Deploy

`deploy.yml` builds `main` and publishes `dist/` to GitHub Pages. `public/CNAME` keeps the custom domain. The `v2` and `v3` branches are not wired to deploy yet.
