# DESIGN.md: karankapur.com, v3 "Fork"

This is the design contract for the site. Code that disagrees with this file is wrong, not the file. Changes to this file need an entry in the brief's DECISIONS.md. The v2 branch holds the previous contract ("Crate").

## 1. Visual theme and atmosphere

A dark room with one lamp on. The whole page is a single warm near-black sheet, cut into sections by hairlines, with a lot of air and a small number of things that move. The recurring object is a session that forks: the hero draws one running line that splits into branches, the thaw section draws a snapshot being restored as three forks, and the favicon is the same mark. The accent is ember, used like a highlighter: fork points, the one button, metric values, the live caret. Nothing glows, nothing blurs, nothing is a gradient. It should feel like a terminal someone with taste set up, not a product landing page.

Audience: a recruiter skimming for 60 seconds, then a senior engineer opening DevTools. The hero names the target roles in the first screen. Every number has its hardware next to it and a receipt link.

## 2. Color palette and roles

| Role | Hex | Use | Contrast (WCAG, computed by hand from sRGB luminance) |
|---|---|---|---|
| Ink | `#17130F` | Page background. The only background color. | Luminance 0.0068 |
| Ink 2 | `#201B17` | Raised fills: snapshot boxes in the thaw diagram, the touch play button. | Luminance 0.0115 |
| Line | `#3A322C` | Hairlines: section borders, rules under rows, box strokes. Decorative only, never text. | |
| Line 2 | `#2A2420` | The crosses in the hero background field. Decorative only. | |
| Bone | `#F1E9DE` | Primary text, the trunk line of the hero graphic. | 15.4:1 on Ink, 14.2:1 on Ink 2 |
| Bone 2 | `#B0A497` | Secondary text: tagline, setups, org lines, labels in diagrams, nav at rest. | 7.6:1 on Ink, 7.0:1 on Ink 2 |
| Mute | `#948878` | Section labels, captions, italic notes, footer. | 5.3:1 on Ink, 4.9:1 on Ink 2 |
| Ember | `#FF6B45` | The accent. "Contact me" fill, fork points and carets, metric values, intro bullets, link underlines, hover lines, focus ring, selection. | 6.5:1 on Ink, 6.1:1 on Ink 2. Ink text on Ember 6.5:1 |
| Sage | `#8FBFB0` | The secondary. Branch lines, the "Playing" state, project taglines, receipt links, the restore lines in the thaw diagram. | 9.0:1 on Ink, 8.3:1 on Ink 2 |

Every text pairing above is at least 4.5:1 (AA for normal text). Mute is never used on Ink 2. No other colors. No gradients anywhere; the background field is an SVG tile of two hairlines, not a gradient. No purple, no indigo, no glow, no shadow.

## 3. Typography rules

- Display and body: Bricolage Grotesque, variable (opsz 12 to 96, wdth 75 to 100, wght 200 to 800), one self-hosted latin woff2 in `src/assets/fonts`, `font-display: swap`.
- Labels, dates, captions, diagram text: DM Mono 400 and 500, self-hosted from `@fontsource/dm-mono`.
- Fallbacks: a size-adjusted `Bricolage Fallback` over Helvetica Neue or Arial, and `DM Mono Fallback` over Menlo, so first paint and swapped paint line up.
- The pairing's character is width: display type is condensed (`wdth 75` to `80`) at large optical size, body is full width at `opsz 14`. H1 `clamp(3.6rem, 11vw, 9rem)`, line-height 0.88, tracking -0.035em, `wdth 75`. H2 `clamp(2.4rem, 6vw, 4.6rem)`, line-height 0.95, `wdth 80`. Project H3 `clamp(1.8rem, 3.6vw, 2.8rem)`, `wdth 78`. Contact H2 up to 11rem, `wdth 75`.
- Body 1.05rem/1.55. Mono labels 0.8rem, sentence case, never uppercase. Metric values are mono 500, `tabular-nums`, the unit a `<small>` at 0.55em.
- Every H2 ends in a period, and the period is Ember (`<span class="dot">`). Headlines are plain statements. Sentence case. No puns, no "elevate", no em dashes anywhere in copy or code comments.
- The hero intro is approved wording and is stored in `src/content/profile/main.json`. Do not paraphrase it.

## 4. Component stylings

- **Header**: sticky, Ink, hairline below. Name in mono on the left, four mono links on the right in Bone 2. Hovering a link turns it Bone and grows an Ember hairline under it from the left. No logo, no status dot.
- **Hero**: two columns. Left: H1 in two lines, the tagline in Bone 2, the four intro bullets with small Ember squares as markers, then one row with the Ember "Contact me" button (mailto) and the sound control. Right: the session graphic. Behind everything, the cross field.
- **Session graphic**: an inline SVG. A Bone trunk labelled "one running session" with token ticks runs to an Ember ring labelled "fork", where three Sage branches (a, b, c) peel off; b forks again into "b, again". Each branch ends in a blinking Ember caret. Under it, a mono caption and a "Fork it" button that adds up to four more branches from random points on the trunk, drawn with the same animation, then resets.
- **Sound control**: a hairline-bordered button, "Press play" with a play glyph and a mono "Sound off" caption. Pressed, it turns Sage, reads "Stop" and "Playing", and three bars move. The Spotify player opens below in a panel. On `pointer: coarse` it is a plain 4.5rem-tall Ink 2 button with a large glyph. The iframe never exists in the DOM until pressed.
- **Featured (thaw)**: section label "Featured work" in the left rail. H2 "thaw.", tagline in Sage mono, summary, credit line "Co-founded thaw with N. Matteson and M. Yu", links. Then the **fork diagram**: a bordered figure where a running session enters a stack of four Ink 2 boxes (weights, KV cache, prefix-cache metadata, scheduler state) labelled "saved as one snapshot", which fans out in Sage to three restored sessions (fork a, b, c) with carets. Then the receipts list: label in 600, value in large Ember mono on the right, setup in Bone 2 with a Sage "Receipt" link. One mono hardware caption. No "README claim" tags, no badges, no numbers without a receipt.
- **Other projects**: label "Other projects", H2 "Three more." Rows separated by hairlines: a 3rem line-drawn mark, the title in condensed type with the tagline in Sage mono under it, the summary with the note in Mute, and a diagonal arrow glyph at the right for linked rows. The whole row is the link target. Each project has its own mark: RelayIQ is a gate with three records, one blocked; Foreman is three workers and a floor; tell is a signal with three rings.
- **Experience**: the left rail holds the label, the headshot at 7.5rem with a hairline border, and the degree line. Right: H2 "Background." and the roles on a vertical hairline rail, each with a 7px Ember square marker, role in 600, org and location in Bone 2, dates in mono right-aligned, one sentence.
- **Contact**: H2 "Say hey." up to 11rem, one sentence in Bone 2, then email, GitHub, LinkedIn, Resume as 600-weight links with a 2px Ember underline that starts at a quarter width and fills on hover.
- **Footer**: mono in Mute, two lines: the typefaces and "Sound stays off until you press play".
- **Buttons and links**: rectangular, no radius, no shadow. Focus ring is a 2px solid Ember outline offset 3px. Selection is Ember with Ink text.

## 5. Layout principles

- One Ink sheet. Content sits in a centered column, `max-width: 1180px`, `padding-inline: var(--gut)` where `--gut` is `clamp(1rem, 4vw, 3rem)`. Sections are separated by a single hairline, never by a color change.
- Every section after the hero is a two-column grid: an 11rem left rail holding the sticky mono label (and, in Experience, the photo), then the content. The hero is its own grid, 1.05fr/1fr, text left, graphic right, `min-height: 100vh` minus the header.
- Reading measures: intro 46ch, thaw summary 58ch, project copy 42ch, role lines 60ch.
- Section vertical padding `clamp(3rem, 7vw, 6rem)`; contact `clamp(4rem, 10vw, 8rem)`.
- Page order is fixed: header, hero with intro and controls, thaw, other projects, experience, contact, footer. thaw does not lead.

## 6. Depth and elevation

Flat. There is no elevation system. Hierarchy comes from type size, Bone versus Bone 2 versus Mute, and hairlines. Ink 2 is a fill for small boxes, not a card surface. Hover states move things (translate, scale, rotate) or change a color; they never add a shadow, a glow, a blur or a border thickness.

## 7. Motion

Motion has a job or it is not here. Everything continuous is compositor-only (transform, opacity, clip-path on a single layer). The one paint-property exception is the hero drawing, which runs once on load for about three seconds and never again. CSS does the work; three small scripts toggle classes, create the iframe and append branches.

1. **Hero rise.** The two H1 lines, tagline, intro, actions and hint rise 0.5rem and fade in, 90 to 100 ms apart. Sets reading order without hiding the name.
2. **Session draw.** Trunk, ticks, ring, three branches, the second fork, labels, carets, in that order over about three seconds, each path drawn with `stroke-dashoffset` on `pathLength="1"`, ticks revealed with a `clip-path` wipe, rings popping with `scale`. The site's thesis drawn once.
3. **Carets blink** (opacity steps, 1.1 s) at every branch tip. Says the branches are live. Paused when the hero is off screen or the tab is hidden.
4. **Background field.** A 48px tile of hairline crosses on one composited layer drifts one tile diagonally every 14 s (`translate`). One layer, one transform, under 2% CPU; paused when the hero is off screen or the tab is hidden; off under reduced motion.
5. **Fork it.** Each press appends a ring, an Ember branch and a caret with the same draw animation. The visitor does what thaw does.
6. **Sound bars.** Three bars `scaleY` between 0.25 and 1 while sound is on. The only "playing" indicator; no dot, no badge.
7. **Scroll reveals.** Headings, copy, rows and the diagram figure (`.rv`) rise 1.5rem on a `view()` timeline over the first 35% of entry. Experience markers scale in on the same timeline.
8. **Thaw diagram on scroll.** The session line, the four snapshot boxes, the fan and the three restore lines reveal in order on the figure's named view timeline, with `scale` and a `clip-path` wipe. Reads as save, then restore.
9. **Project hover.** Title shifts 0.4rem right, the mark animates (gate swings, workers line up, rings expand), an Ember hairline grows under the row and the arrow glyph slides in. Tells you the whole row is a target.
10. **Links.** Header links grow an Ember underline; contact links fill theirs; the Contact button lifts 2px.

Engines without scroll-driven animations get the finished state: every scroll keyframe defines only `from`, so the base state is the end state. `prefers-reduced-motion: reduce` collapses every duration, removes the hero entrance, sets the drawing to its finished state, stops the carets, the field and the bars, and drops every scroll animation. Nothing is half drawn in that mode.

Banned: count-ups, typing effects, cursor followers, parallax on content, scroll hijacking, hover tilt on cards, glows, blurs, autoplaying audio or video.

## 8. Responsive behavior

| Width | Behavior |
|---|---|
| 1440 | Two-column hero with the graphic at 560px, two-column sections with the sticky rail, four-column project rows. |
| 820 | Hero one column, graphic under the copy. Rails stack above content and stop being sticky. Project rows: mark, title, arrow on the first line, copy under the title. |
| 520 and below | Header stacks name over nav. Receipt rows one column with the value under the label. Project arrow hidden, mark 2.4rem. Role rows one column. |
| `pointer: coarse` | Actions stack; the sound control is a plain 4.5rem-tall play button. |

Images declare width and height. The only raster image is the headshot. The OG image is 1200 x 630 in `public/og-image.png` (still the v2 render; regenerate before launch).

## 9. Agent prompt guide

When asked to change the site:

- Read this file, then `CLAUDE.md`, then the content in `src/content`. Numbers come from `_brief/RECEIPTS.md` only; a metric without a `source` URL will not build and should not exist. The 340 s cold boot figure has no receipt link and stays off the page.
- Add copy in sentence case with periods. No em dashes, no emoji, no numbered eyebrows, no uppercase labels, no "elevate" or "seamless", no puns.
- Use only the nine colors in section 2 and the two typefaces in section 3. No new radii, shadows, gradients, blurs or fonts.
- Keep the page order in section 5. Do not move thaw above the hero.
- Sound stays off until pressed; the Spotify iframe must never exist in the DOM on load.
- Every animation must have a one-line job in section 7, use transform, opacity or clip-path, pause when off screen if it loops, and be covered by the reduced-motion block with a finished static state.
- Run `npm run check`, `npm run build`, `npm run test:e2e` and `npm run lhci` before calling work done. The budgets in `lighthouserc.cjs` are the exit criteria.
