# karankapur.com

Personal site for Karan Kapur. Static Astro 5, no JavaScript on the page at all. This is v4, "Poster": one warm paper sheet, flat ink, three pigments (red, blue, yellow), condensed uppercase display type at billboard size, and four projects as four posters of the same size. Every bullet is the resume wording. The contract is in `DESIGN.md`. The v3 branch holds the "Fork" design (dark, three.js scenes) and the v2 branch "Crate".

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
| `profile/main.json` | Name, approved tagline and intro bullets, the three role stamps, education and coursework, contact links, the playlist link, the headshot's alt text and stamp, the three skill groups, the "Off the clock" photos and line |
| `projects/*.json` | One poster each. `tone` is the fill (`red`, `blue`, `yellow`, `paper`), used once each; `order` is the reading order; `bullets` are resume wording, with an optional `link` printed after a bullet (a receipt). Leave `links` empty and set `soon` for an unreleased project |
| `experience/*.json` | One role each, with `bullets` from the resume |
| `leadership/*.json` | Leadership roles, rendered after the work history in the same list |

Photos for "Off the clock" live in `src/assets/photos/` and are named in `profile/main.json` by file name without the extension. The headshot is `src/assets/pro-headshot.jpg` (300 x 400). Both go through the Astro image pipeline and come out as webp.

## Files

| File | What |
|---|---|
| `src/layouts/Base.astro` | The head: title, description, canonical or noindex, the Anton preload, Open Graph, a slot for structured data |
| `src/pages/index.astro` | Loads the content collections, builds the Person structured data, renders the sections in order |
| `src/components/*.astro` | Header, Hero, Projects, Experience, Skills, Life, Contact, Footer; each carries its own scoped styles |
| `src/styles/global.css` | Tokens, the sheet, sections, rules, buttons, bullets |
| `src/styles/fonts.css` | The six self-hosted woff2 faces and their size-adjusted fallbacks |
| `tests/site.spec.ts` | Playwright and axe: content, order, links, images, no script, no third party, no side scroll, reduced motion, sitemap and structured data |
| `lighthouserc.cjs` | The budgets: performance 0.95, accessibility 1, SEO 0.95, LCP 1.9 s, CLS 0.02, fonts 160 KB, scripts 12 KB, total 600 KB, zero third-party requests |

## Deploy

`deploy.yml` builds `main` and publishes `dist/` to GitHub Pages. `public/CNAME` keeps the custom domain. Merging a `v4` pull request into `main` deploys it.
