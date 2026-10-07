# DESIGN.md: karankapur.com, direction B "Crate"

This is the design contract for the site. Code that disagrees with this file is wrong, not the file. Changes to this file need an entry in the brief's DECISIONS.md.

## 1. Visual theme and atmosphere

A record sleeve in sunset colors. The page is a warm cream sheet; the hero is an apricot field with a flat orange sun sinking behind a working CSS turntable; the featured work is printed as liner notes on the brown back of the sleeve; the other projects sit in a crate as colored sleeves; the background section returns to apricot; contact is a wall of orange. It should feel like a confident person laid out a sleeve by hand: flat color, big type, one object with motion, nothing glossy.

Audience: a recruiter skimming for 60 seconds, then a senior engineer opening DevTools. The hero names the target roles in the first screen. Every number has its hardware next to it.

## 2. Color palette and roles

| Role | Hex | Use | Contrast notes |
|---|---|---|---|
| Cream | `#FFF4E3` | Page background. Text on brown, pink and teal. | 15.7:1 on brown, 4.6:1 on pink, 5.3:1 on teal |
| Apricot | `#FFB347` | Hero, header, background section, record label, accents on brown (track numbers, values, links). | Brown text on it is about 9.6:1 |
| Orange | `#F4571F` | The sun, the contact section, one sleeve. Brown text only. | Brown on it is about 5:1. Never cream text on orange below display size |
| Pink | `#D4215E` | One sleeve, the tonearm head, hover state of brown buttons. Cream text only. | 4.6:1 with cream |
| Teal | `#1F6F78` | One sleeve, the pressed state of the play control. Cream text only. | 5.3:1 with cream |
| Brown | `#2A1710` | Liner notes background, plinth, body text, buttons, borders. | |
| Brown 2 | `#6B5248` | Hairlines on brown, italic notes on cream. | About 6:1 on cream |
| Cream 2 | `#E2CDB9` | Secondary text on brown (metric setups, hardware caption). | About 11:1 on brown |

No other colors. No gradients except the record grooves, which are a two-tone `repeating-radial-gradient` between two near-blacks (a texture, not a color blend). No purple anywhere. No colored glows.

## 3. Typography rules

- Display and body: Bricolage Grotesque, variable (opsz 12 to 96, wdth 75 to 100, wght 400 to 800). Self-hosted from `@fontsource-variable/bricolage-grotesque`, latin subset, woff2, `font-display: swap`.
- Labels, track numbers, runtimes, dates: DM Mono 400 and 500, self-hosted from `@fontsource/dm-mono`.
- Fallbacks: a size-adjusted `Bricolage Fallback` over Helvetica Neue or Arial, and `DM Mono Fallback` over Menlo, so the first paint and the swapped paint line up.
- Scale: body 1.1rem/1.5 with `opsz 14`. H1 `clamp(3rem, 8.5vw, 7.5rem)`, line-height 0.92, tracking -0.04em, `opsz 96, wdth 80`. H2 `clamp(2.2rem, 6vw, 4.5rem)`, line-height 0.95, `wdth 85`. Sleeve H3 `clamp(2rem, 4.2vw, 3.6rem)`, `wdth 75`. Contact H2 up to 10rem.
- Mono labels are 0.78rem uppercase with 0.06em tracking. Metric values are mono 500 with `tabular-nums`; the unit is a `<small>` at 0.55em.
- Headlines are plain statements with a period. Sentence case. No puns, no "elevate", no em dashes anywhere in copy or code comments.
- The hero intro is approved wording and is stored in `src/content/profile/main.json`. Do not paraphrase it.

## 4. Component stylings

- **Header**: apricot bar, name in mono on the left, four mono links on the right. No logo, no status dot.
- **Hero**: two columns. Left: H1 in two wiped lines, the tagline as a cream-on-brown inline block, the four intro bullets with round brown markers, a brown "Contact me" button that turns pink on hover. Right: the turntable.
- **Turntable**: brown plinth, grooved disc with an apricot label carrying an SVG `textPath`, a cream tonearm with a pink head. Below it a full-width brown button labelled "Press play" with a play glyph and a mono "Sound off" caption; pressed it turns teal, reads "Lift the needle" and "Playing", the arm swings in and the disc spins at 33 1/3 rpm. The Spotify player slides out below in a sleeve. On `pointer: coarse` the plinth is hidden and the same button renders as a plain large play button reading "Press play" and, when pressed, "Stop".
- **Liner notes (thaw)**: brown section, cream text. H2 "thaw. Liner notes." Summary, credit line "Co-founded thaw with N. Matteson and M. Yu", links to the GitHub repo and thaw.sh in apricot. A tracklist: track number in apricot mono, title in 600 weight, setup line in Cream 2 with a small "Receipt" link, value in large apricot mono on the right. A 3px apricot underline draws under each row on entry. One mono hardware caption under the list. No "README claim" tags, no badges.
- **Crate**: cream section. Three sleeves, square, flat pink, orange and teal with a brown disc peeking from the top-right. Title in huge condensed type, descriptor in mono below. Summary and an italic note under each sleeve. Linked sleeves lift 14px and tilt 2 degrees on hover and focus-within, and the whole sleeve is the link target. An unlinked sleeve (tell) does not lift and has no anchor.
- **Background**: apricot. Left: H2 "Background.", a small bordered headshot (300 x 400 source, shown at 168px), the degree line. Right: a list of roles with the org under the role, mono dates right-aligned, one sentence each.
- **Contact**: orange wall. H2 "Say hey." up to 10rem, one sentence, then email, GitHub, LinkedIn, Resume as 600-weight links with a 3px brown underline that fills cream on hover.
- **Footer**: brown, mono, two lines: the typefaces and "Sound stays off until you press play".
- **Buttons and links**: rectangular, no radius, no shadow. Focus ring is a 3px solid outline offset 3px, brown on light surfaces and cream on brown.

## 5. Layout principles

- Full-bleed color bands, each a `<section>` with `padding-inline: var(--gut)` where `--gut` is `clamp(1rem, 4vw, 3.5rem)`.
- Two-column grids at desktop (hero 1.1fr/1fr, liner top 1fr/1fr, background 1fr/1.6fr), three equal columns for the crate. Everything collapses to one column at 820px; the crate goes 2 then 1 column with the third sleeve spanning the row at tablet width.
- Reading measures: intro 44ch, liner summary 46ch, sleeve copy 36ch, role lines 60ch.
- Section vertical padding `clamp(2.5rem, 6vw, 5rem)`; contact `clamp(3rem, 8vw, 6rem)`.
- Page order is fixed: header, hero with intro, thaw liner notes, crate, background, contact, footer. thaw does not lead.

## 6. Depth and elevation

Flat. Depth comes from stacked color fields and one object (the plinth) sitting on the apricot. The disc has a single 2px hard inset ring. Sleeves overlap nothing and cast no shadow; lift is a transform, not a shadow. No blur, no glass, no gradients as fills.

## 7. Motion

Six animations, each with a job. CSS only; the single script toggles a class and creates the iframe.

1. H1 lines and the tagline wipe in left to right with `clip-path`, 150ms stagger: sleeve-printing feel, no fade.
2. The intro list fades in through `@starting-style` after the headline: keeps the first half second on the name.
3. The sun sinks 45vh over the first 80vh of scroll on the root timeline: the page does the sunset as you reach the liner notes.
4. The disc spins only while sound is on (1.8s per turn); the tonearm rotates from -32deg to -6deg on press: the turntable is both the control and the state indicator.
5. Tracklist rows draw an apricot underline on a `view()` timeline as they enter: paces the eye down the numbers.
6. Crate sleeves lift in on entry with staggered ranges and lift 14px with a 2 degree tilt on hover and focus-within: pulling a record out.

Section headings and copy marked `.rv` slide up 2rem on entry. Everything scroll-driven lives inside `@supports (animation-timeline: scroll())`; engines without it get the finished state. `prefers-reduced-motion: reduce` collapses every duration to 0.01ms, removes the wipe clip, stops the infinite spin and the sun.

Banned: count-ups, typing effects, cursor followers, parallax on content, scroll hijacking, hover tilt on cards other than the sleeve lift, autoplaying audio or video.

## 8. Responsive behavior

| Width | Behavior |
|---|---|
| 1440 | Two-column hero, turntable at 460px, three sleeves, two-column liner top and background. |
| 820 | Everything one column; crate two columns with the third sleeve at 2.2:1 spanning the row; header links tighter. |
| 520 and below | Crate one column; tracklist drops the right-hand value under the title; role rows one column; header stacks name over nav. |
| `pointer: coarse` | Plinth hidden; the play control is a plain 4.5rem-tall button with a large glyph. |

Images declare width and height. The only raster image is the headshot. The OG image is 1200 x 630 in `public/og-image.png`.

## 9. Agent prompt guide

When asked to change the site:

- Read this file, then `CLAUDE.md`, then the content in `src/content`. Numbers come from `_brief/RECEIPTS.md` only; a metric without a `source` URL will not build and should not exist.
- Add copy in sentence case with periods. No em dashes, no emoji, no numbered eyebrows, no "elevate" or "seamless", no puns.
- Use only the eight colors in section 2 and the two typefaces in section 3. No new radii, shadows, gradients or fonts.
- Keep the page order in section 5. Do not move thaw above the hero.
- Sound stays off until pressed; the Spotify iframe must never exist in the DOM on load.
- Every animation must have a one-line job in section 7, be CSS-first, and be covered by the reduced-motion block.
- Run `npm run check`, `npm run build`, `npm run test:e2e` and `npm run lhci` before calling work done. The budgets in `lighthouserc.cjs` are the exit criteria.
