# DESIGN.md: karankapur.com, v4 "Poster"

This is the design contract for the site. Code that disagrees with this file is wrong, not the file. The v3 branch holds the previous contract ("Fork", dark with three.js scenes) and the v2 branch the one before ("Crate").

## 1. Visual theme and atmosphere

A screen-printed poster. One warm paper sheet, flat ink, three pure pigments (red, blue, yellow), and condensed uppercase display type at billboard size. Everything is cut by thick rules; nothing is rounded, blurred, shadowed softly or gradient. The only shadows are hard ink offsets that appear when a poster or a button lifts. One photograph in the hero, untreated, in a yellow frame with a corner stamp; four more photographs in paper frames on a blue field, tilted a degree or two, with no captions. The four projects are four posters of the same size and the same parts, each in its own pigment: no project is featured and none has a section of its own.

Audience: a recruiter skimming for 30 seconds, then a hiring manager reading the bullets. The hero names the target roles as three stamps under the intro. Every bullet on the page is the resume wording.

## 2. Color palette and roles

| Role | Hex | Use | Contrast (WCAG, sRGB luminance) |
|---|---|---|---|
| Paper | `#F4F0E6` | The sheet. Also the fill of the fourth poster and the text on red and blue fills. | Luminance 0.872 |
| Ink | `#121212` | Text, rules, borders, the hard shadows, button fill, the photo stamp. | 15.7:1 on Paper, 13.0:1 on Yellow |
| Mute | `#5E5A52` | Org lines, the education line, the footer. Only on Paper. | 6.0:1 on Paper |
| Red | `#E8321E` | Display type (the second line of the name, "Email is fastest"), the blinking dot, intro link underlines, the experience bullet markers, hover shadows. Large text and marks only. | 3.8:1 on Paper (large text) |
| Red fill | `#C62914` | The fill of the thaw poster, which carries Paper text. | 4.9:1 with Paper |
| Blue | `#1B3FD6` | The RelayIQ poster fill, the "Off the clock" field, the intro bullet markers, focus rings, button hover shadows. | 6.8:1 with Paper |
| Yellow | `#FFD21E` | The Foreman poster fill, the photo frame, the three role stamps, selection, contact link underlines. Ink text only. | 13.0:1 with Ink |

Every text pairing is at least 4.5:1; Red is never used for text under 24px. No other colors, no gradients, no transparency.

## 3. Typography rules

- Display: Anton 400, uppercase, line-height 0.86, tracking -0.005em. Self-hosted latin subset from `@fontsource/anton`, preloaded from the page head. Used for the name, the section headings, the poster titles, the role names and the skill group titles.
- Body: Archivo 400, 500 and 700, `@fontsource/archivo`, 1.05rem/1.5.
- Labels, dates, stamps, eyebrows: JetBrains Mono 400 and 600, `@fontsource/jetbrains-mono`, 0.78rem, uppercase, tracking 0.02em. The only uppercase on the site outside display type.
- Fallbacks: Impact or Arial Narrow sized to Anton, Helvetica Neue or Arial sized to Archivo, Menlo sized to JetBrains Mono (`src/styles/fonts.css`), so the first paint and the swapped paint line up.
- Sizes: H1 `clamp(4.2rem, 12.5vw, 11rem)` in two lines, the second in Red and stepped right by `clamp(0, 10vw, 11rem)`. Section H2 `clamp(3rem, 8vw, 7rem)`; the contact H2 up to 16rem in Red. Poster H3 `clamp(3rem, 6vw, 5.5rem)`. Role names 1.6rem. Section labels (the mono line with a rule after it) are H2 elements in sections without a display heading, so headings always descend in order.
- All fonts together are about 105 KB, under the 160 KB budget.
- Copy is sentence case. No em dashes, no emoji, no "elevate", no puns. The hero tagline and intro are approved wording in `src/content/profile/main.json` and are not paraphrased. Project and role bullets are the resume wording.

## 4. Component stylings

- **Header**: sticky, Paper, a 4px rule under it. The name in Anton on the left, the section links in mono (Projects, Experience, Skills, Off the clock, Contact) with a 3px Red underline that grows from the left on hover, and the "Open to work" stamp: a 3px Ink border and a Red dot that blinks on a 1.6 s step. At 640px and below the links wrap under the name and the stamp.
- **Hero**: the name in two lines. Under it a grid: the photo frame on the left, the copy on the right. The frame is a 4px Ink border on a Yellow block, 20rem wide at most (the source photo is 300 x 400, so the frame never asks it for more than that at 1x), the photo inside with its own Ink border, and a rotated Ink stamp on the bottom right reading the location. The copy: the tagline in 700, the four intro bullets with Blue square markers (thaw and RelayIQ linked to their posters), the three role stamps (Yellow, 3px Ink border, each rotated a degree or two), then the buttons: "Email me" filled, Resume, GitHub and LinkedIn outlined. Every button lifts 3px and drops a hard 5px shadow on hover, Red for the filled button and Blue for the outlined ones. At 1440 x 900 the buttons sit inside the first screen; at 390 the name, the photo and the tagline do.
- **Posters**: label "Four projects". A two-by-two grid (one column at 640px and below) of four articles with the same parts in the same order: a mono date stamp in the top right corner with a 2px border, a mono eyebrow, the title in Anton, one bold line, the bullets with square markers in the text color, and a footer with the repo links underlined 3px (or "Repo opens soon" in plain text when `links` is empty). Fills: thaw Red fill with Paper text, RelayIQ Blue with Paper, Foreman Yellow with Ink, tell Paper with Ink. Each `tone` is used once. Hover lifts the poster 5px and drops an 8px Ink shadow. A poster is not a link, so its footer can carry more than one.
- **Experience**: label "Background", H2 "Where I've worked", then every role and then every leadership entry as rows on one list under a 4px rule, each closed by a 3px rule: dates in mono on the left (7rem column), the role in Anton with the org and location under it in Mute, the bullets on the right with Red square markers. Below the list, the degree and coursework line in mono, Mute, sentence case.
- **Skills**: label "Skills", three boxes with a 4px border: the group title in Anton, the items in one line of body text.
- **Off the clock**: a Blue section with Paper text and a Paper rule after the label. Four photographs from `src/assets/photos` through the image pipeline (webp, 480 wide at 1x, 720 at 1.5x, lazy), each in a 4px Paper frame at 3:4, rotated by its own degree or two, straightening and growing 3% on hover; no captions. Under them one line of body text and the playlist link: bold, a 3px Yellow underline, Yellow on hover, opening in a new tab with `rel="noopener"`. That link is the only thing on the site about music; no audio plays and no player exists.
- **Contact**: label "Say hey", H2 "Email is fastest" in Red up to 16rem, then the email, GitHub, LinkedIn and the resume as 700-weight links with a 4px Yellow underline that turns Blue on hover.
- **Footer**: mono in Mute, one line: the typefaces.
- **Links and controls**: rectangular, no radius. Focus ring 3px solid Blue offset 3px. Selection Yellow with Ink text. Every link and control has a hit area at least 24px tall; buttons are 3.2rem tall, 3.6rem and half the row each at 640px and below.
- **404**: the same shell, label "404", "Wrong page" in Anton, one line with a link home. `noindex`, no canonical.

## 5. Layout principles

- One Paper sheet. Content sits in a centered column, `max-width: 1280px`, `padding-inline: clamp(1rem, 4vw, 3rem)`. Sections are separated by a 4px Ink rule, and by a color change only for "Off the clock".
- Page order is fixed: header, hero, projects, experience (with leadership), skills, off the clock, contact, footer.
- Reading measures: intro 56ch, poster copy 58ch, role bullets 62ch, the life line 62ch.
- Section vertical padding `clamp(3rem, 7vw, 6rem)`.
- Images declare width and height. The headshot is `src/assets/pro-headshot.jpg` through the pipeline at 300 x 400 (1x and 2x webp), eager with `fetchpriority="high"`. The OG image is 1200 x 630 in `public/og-image.png`: the v4 hero rendered at that size with the header, the stamps and the buttons hidden. Regenerate it when the hero copy or the photo changes.

## 6. Depth and elevation

Flat. Hierarchy comes from size, weight, the rules and the four fills. The only shadows are hard Ink offsets on hover (5px on buttons, 8px on posters), which read as a lifted sheet, never as soft elevation. No blur, no glow, no gradient, no transparency.

## 7. Motion

Motion is small and has a job. All of it is CSS, transform or opacity only, and the page ships no script at all (the JSON-LD block is data, not a script that runs).

1. **Lift.** Buttons lift 3px and posters 5px on hover and focus, with the hard shadow appearing under them: says the thing is a target.
2. **Underline.** Header links grow a Red underline from the left on hover; contact links swap their underline color.
3. **Straighten.** A photograph in "Off the clock" rotates to 0 and grows 3% on hover: says it can be looked at.
4. **Blink.** The Red dot in the "Open to work" stamp blinks on a 1.6 s step, the one thing that moves at rest.

`prefers-reduced-motion: reduce` removes every transition and animation, including the blink, and turns smooth scrolling off. Nothing on the page depends on motion to be readable.

Banned: count-ups, typing effects, cursor followers, parallax, scroll-driven reveals (everything is visible at rest), tilt on hover beyond the photo straightening, autoplaying audio or video, gradients, blurs, soft shadows, purple.

## 8. Responsive behavior

| Width | Behavior |
|---|---|
| 1440 | Name at 11rem in two lines; photo frame 20rem beside the copy; buttons on one row inside the first 900px. Posters two by two; role rows in three columns (dates, role, bullets); skills in three boxes; four photos in a row. |
| 900 and below | Hero stacks: photo frame, then the copy. Role rows stack to one column. Skills two boxes per row; photos two per row. |
| 640 and below | Name without the step. Header links wrap under the name and the stamp. Posters one column, the date stamp inline above the eyebrow. Skills one column. Buttons half the row each, 3.6rem tall. Photo frame 17rem. |
| 390 | The name, the photo and the tagline fill the first screen; no horizontal scroll at any point. |

## 9. Agent prompt guide

When asked to change the site:

- Read this file, then `CLAUDE.md`, then the content in `src/content`. Bullets are resume wording; the hero tagline and intro are approved verbatim. Do not add a number that is not on the resume or in a receipt.
- Add copy in sentence case with periods. No em dashes, no emoji, no "elevate" or "seamless", no puns.
- Use only the seven colors in section 2 and the three typefaces in section 3. No radius, no soft shadow, no gradient, no blur, no new font.
- Keep the page order in section 5 and the four posters equal: same parts, same size, one tone each. A fifth project needs a fifth tone decision here before it ships.
- No script on the page, no third-party request, no iframe, no audio. The only thing about music is the playlist link in "Off the clock".
- Search engines: the build writes `sitemap-index.xml` (the `@astrojs/sitemap` integration) and `public/robots.txt` points at it. The home page carries one `application/ld+json` block, a `ProfilePage` whose `mainEntity` is a `Person`, built in `index.astro` from the profile and experience content: no number goes in it. The 404 page is `noindex` and has no canonical link.
- Run `npm run check`, `npm run build`, `npm run test:e2e` and `npm run lhci` before calling work done. The budgets in `lighthouserc.cjs` are the exit criteria.
