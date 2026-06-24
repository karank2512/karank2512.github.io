# Karan Kapur — Personal Portfolio

A fast, minimal, recruiter-friendly portfolio with a technical/terminal personality.
Built to be skimmed in 60 seconds and edited from **one file**.

**Stack:** React + Vite + TypeScript + Tailwind CSS + Framer Motion.

---

## ✨ What's inside

- **One-page site** with smooth anchor nav, scroll-spy, and a mobile menu
- **Interactive hero terminal** that types rotating system commands
- **Project case-study cards** with cursor spotlight + metrics
- **Vertical experience timeline**
- **Interactive skills** — click a category to see which projects it powers
- **"Life outside the IDE"** hobby cards
- **Spotify section** (auto-converts a normal playlist link into an embed; graceful fallback if empty)
- **Animated stat counters**, magnetic buttons, cursor glow
- Fully **responsive**, **keyboard-accessible**, and **`prefers-reduced-motion`** aware
- **SEO + OpenGraph** metadata and a generated social preview image

---

## 🚀 Quick start

> You need **Node.js 18+** installed. Get it at https://nodejs.org (LTS).

```bash
# 1. install dependencies
npm install

# 2. run the dev server (http://localhost:5173)
npm run dev

# 3. build for production (outputs to /dist)
npm run build

# 4. preview the production build locally
npm run preview
```

Optional type-check: `npm run typecheck`

---

## ✏️ How to edit (everything lives in one file)

Open **`src/data/profile.ts`**. That's the single source of truth. No need to touch components.

| What you want to change | Edit this in `src/data/profile.ts` |
| --- | --- |
| **Name, headline, one-liner, target roles** | `identity` |
| **Email, GitHub, LinkedIn, Resume path** | `links` |
| **Hero terminal commands** | `terminalCommands` |
| **About paragraphs** | `about` |
| **Projects** (title, blurb, metrics, stack, tags, links) | `projects` |
| **Work history / timeline** | `experience` |
| **Skill categories + related projects** | `skillGroups` (and `languages`) |
| **Hobby cards** | `hobbies` |
| **Spotify playlist** | `music.spotifyUrl` |
| **Closing contact line** | `contact` |

### Replace the resume
The "Resume" buttons currently point to a **Google Drive** link (set in `links.resume`) so recruiters can preview + download it. To swap it, just change `links.resume` in `profile.ts` to a new Drive link — or, to host the PDF on the site itself, drop a file at **`public/resume.pdf`** and set `links.resume: "./resume.pdf"`.

### Add your Spotify playlist
1. In Spotify: open a playlist → **Share → Copy link to playlist**
2. Paste it into `music.spotifyUrl`, e.g.
   ```ts
   spotifyUrl: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
   ```
   The component turns it into an embed automatically. Leave it `""` to show the fallback state.

### Re-theme colors / fonts
- **Colors:** `tailwind.config.js` → `theme.extend.colors` (the `accent` value drives the whole look).
- **Fonts:** swap the Google Fonts `<link>` in `index.html` and `theme.extend.fontFamily` in `tailwind.config.js`.

### Update the social preview
- `og-image.png` lives in `public/`. Replace it with any 1200×630 image.
- In `index.html`, set `og:url` and `og:image` to **absolute** URLs once you know your final domain (some platforms like Slack/Twitter require absolute URLs).

---

## 🌐 Deploy to GitHub Pages

There are two ways. **Option A (GitHub Actions) is recommended** — push and forget.

### Option A — GitHub Actions (recommended)
A workflow is already included at `.github/workflows/deploy.yml`.

1. Create a repo and push this project:
   ```bash
   git init
   git add .
   git commit -m "Initial portfolio"
   git branch -M main
   git remote add origin https://github.com/karank2512/<repo-name>.git
   git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment → Source = GitHub Actions**.
3. Every push to `main` builds and deploys automatically. Your site lands at
   `https://karank2512.github.io/<repo-name>/`.

> Tip: for a clean `https://karank2512.github.io/` URL, name the repo **`karank2512.github.io`**.

### Option B — `gh-pages` branch (manual)
```bash
npm run deploy
```
This builds and pushes `/dist` to a `gh-pages` branch (using the `gh-pages` dev dependency).
Then set **Settings → Pages → Source = Deploy from a branch → `gh-pages` / root**.

> The Vite config uses `base: "./"` (relative paths), so the build works under any repo subpath without extra configuration.

---

## ✅ Final QA checklist

Before sharing the link, run through this:

**Content**
- [ ] Name, headline, and one-liner read the way you want
- [ ] All 7 projects have correct metrics, stacks, and links
- [ ] Experience dates and bullets are accurate
- [ ] `public/resume.pdf` is your latest resume
- [ ] Spotify link added (or fallback intentionally left)
- [ ] Email / GitHub / LinkedIn links go to the right places

**Function**
- [ ] `npm run build` completes with no errors
- [ ] Nav links scroll to the right sections; scroll-spy highlights correctly
- [ ] Mobile menu opens/closes and locks scroll
- [ ] Project tag filter works
- [ ] Skills categories switch the "lights up" projects
- [ ] Resume opens in a new tab

**Quality**
- [ ] Looks right at 375px (mobile), 768px (tablet), 1440px (desktop)
- [ ] Test with **reduced motion** on (macOS: Settings → Accessibility → Display → Reduce motion) — animations should calm down, nothing should break
- [ ] Tab through the page — focus rings visible, skip-link appears on first Tab
- [ ] OG preview looks right (test at https://www.opengraph.xyz/ after deploy)
- [ ] Lighthouse: Performance / Accessibility / SEO all green

---

## 🗂 Project structure

```
.
├── index.html                 # SEO + OG meta, font links, app mount
├── package.json
├── vite.config.ts             # base: "./" for GitHub Pages
├── tailwind.config.js         # colors, fonts, animations
├── postcss.config.js
├── .github/workflows/deploy.yml
├── public/
│   ├── resume.pdf             # ← your resume
│   ├── og-image.png           # social preview (1200×630)
│   ├── favicon.svg
│   └── .nojekyll
└── src/
    ├── main.tsx
    ├── App.tsx                # section order
    ├── index.css             # Tailwind layers + base styles
    ├── data/
    │   └── profile.ts        # ← EDIT EVERYTHING HERE
    ├── lib/
    │   └── motion.ts         # shared animation variants
    └── components/
        ├── Nav.tsx
        ├── Hero.tsx
        ├── Terminal.tsx
        ├── About.tsx
        ├── Projects.tsx
        ├── ProjectCard.tsx
        ├── Experience.tsx
        ├── Skills.tsx
        ├── Hobbies.tsx
        ├── Music.tsx
        ├── Contact.tsx
        ├── Footer.tsx
        ├── CursorGlow.tsx
        ├── CountUp.tsx
        ├── Magnetic.tsx
        ├── Reveal.tsx
        ├── Section.tsx
        └── icons.tsx
```

---

Built by Karan Kapur. Fork it, break it, make it yours.
