# karankapur.com

Personal site for Karan Kapur. Static Astro 5, zero framework JavaScript, one small script for the opt-in sound control. Design direction B, "Crate": a record sleeve in sunset colors with a CSS turntable. The contract is in `DESIGN.md`.

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

## Deploy

`deploy.yml` builds `main` and publishes `dist/` to GitHub Pages. `public/CNAME` keeps the custom domain. The `v2` branch is not wired to deploy yet.
