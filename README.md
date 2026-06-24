# Karan Kapur — Personal Portfolio

A fast, minimal, recruiter-friendly portfolio with a technical/terminal personality.
Built to be skimmed in 60 seconds and edited from **one file**.

**Stack:** React + Vite + TypeScript + Tailwind CSS + Framer Motion.

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
