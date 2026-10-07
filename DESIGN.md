# DESIGN.md: karankapur.com, v3 "Fork"

This is the design contract for the site. Code that disagrees with this file is wrong, not the file. Changes to this file need an entry in the brief's DECISIONS.md. The v2 branch holds the previous contract ("Crate").

## 1. Visual theme and atmosphere

A dark room with one lamp on. The whole page is a single warm near-black sheet, cut into sections by hairlines, with a lot of air and a small number of things that move. The recurring object is a session that forks: the hero is a real 3D lattice of KV cache blocks that forks into four branches, the thaw section is a scroll-driven camera tour through what the storage layer saves, and the favicon is the same mark. The accent is ember, used like a highlighter: fork points, the one button, metric values, the live token. Nothing glows, nothing blurs, nothing is a gradient. The 3D is flat shaded with hairline edges, like an engineering drawing that happens to move. It should feel like a terminal someone with taste set up, not a product landing page.

The 3D references are Vektr (near-black hero, one accent, a draggable object, readouts at the sides in mono, a scroll-driven engineering tour) and a photographer template's tilted cards floating in perspective. Every piece of geometry is procedural and built in code: no downloaded models, no stock images.

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
- **Hero**: a full-bleed WebGL stage on the Ink sheet, the fork field behind it. The copy sits in the left column over the stage: H1 in two lines, the tagline in Bone 2, the four intro bullets with small Ember squares as markers, then the Ember "Contact me" button (mailto) and, on touch devices and narrow screens, the plain "Press play" button beside it. The right half belongs to the hero object. Four HUD readouts sit in the corners (see below).
- **Hero object**: a live LLM session as a 3D lattice of small blocks, the KV cache: ten token columns of six layers by two (keys and values) in Bone 2, then four branches of eight columns in Sage that fork at an Ember hairline ring. At rest the branches lie straight behind the trunk, so it reads as one session; drag sideways, scroll, or press "Fork it" and the four branches fly apart along curves and settle, the new token columns growing in and each tip in Ember. An Ember head steps along the trunk to say the session is running. Drag to orbit within limits (yaw ±0.7 rad, pitch ±0.38) with inertia on release; the pointer adds a small parallax. Flat Lambert faces with an Ink hairline edge on every block. Before three.js loads, and wherever WebGL is missing, the same geometry is drawn once at build time as an isometric hairline SVG.
- **HUD**: four corner blocks in DM Mono on solid Ink so the text never loses contrast to the scene. Top left: "One running session. Drag to orbit, scroll to fork." and the "Fork it" button (pressed: "Reset", holds the fork open). Top right: the median session fork, 0.88 s in Ember, "vs about 340 s cold boot", the hardware line, and a Sage "Receipt" link. Bottom right: the two weight restore numbers (14.6 GB/s and 28.8 GB/s) with their setups and one receipt link. Bottom left: the sound control. Every number is read from `thaw.json`, so it has a receipt URL. No invented telemetry, no ticking counters.
- **Sound control**: a hairline-bordered button in the bottom-left HUD corner, "Press play" with a play glyph and a mono "Sound off" caption, with the playlist hint under it. Pressed, it turns Sage, reads "Stop" and "Playing", and three bars move. The Spotify player opens in a strip under the stage, and the page brings the strip into view once it has opened. On `pointer: coarse`, and at 820px and below where the HUD stacks under the stage, the HUD button is replaced by a plain 4rem-tall Ink 2 button with a large glyph that sits directly beside "Contact me" in the first screen (at 520px and below the two share one row, half the width each). Both buttons are in the DOM; the page script keeps their state in step. The iframe never exists in the DOM until pressed.
- **Featured (thaw)**: section label "Featured work" in the left rail. H2 "thaw.", tagline in Sage mono, summary, credit line "Co-founded thaw with N. Matteson and M. Yu", links. Then the **engineering tour**: a sticky full-height stage with five views, weights (a stack of slabs), KV cache (the lattice), prefix-hash table (a flat grid of buckets, hits raised in Sage with hairlines back to the cache), scheduler state (a rail with a queue, the running request in Ember) and the fork (three Sage copies of the whole snapshot flown out along Ember curves). Scrolling moves the camera from view to view with a zoom; the subsystem in view gets Ember hairlines. One caption at a time, bottom left on solid Ink: a mono "01 of 05" counter, a condensed H3, one or two sentences. The fallback and the screen-reader picture is the static snapshot-and-restore SVG. Then the receipts list under its own "Receipts" rail label: label in 600, value in large Ember mono on the right, setup in Bone 2 with a Sage "Receipt" link. One mono hardware caption. No "README claim" tags, no badges, no numbers without a receipt.
- **Projects**: label "Projects", H2 "Four projects.", one lead sentence. Then the **deck**: four Ink 2 cards (thaw, RelayIQ, Foreman, tell) floating in a CSS perspective of 1200px over a WebGL floor of hairlines, each card inside a Bone 2 wire frame that turns Ember when the card lifts. Cards drift slowly, tilt toward the pointer, and lift 70px on hover or focus; cards with a link are the link. tell has no link until it is public. Each card: a 2rem line-drawn mark, the title in condensed type, the tagline in Sage mono, one or two sentences in Bone 2, the note, and a diagonal arrow glyph for linked cards. Marks: thaw is a trunk forking twice around an Ember ring; RelayIQ is a gate with three records, one blocked; Foreman is three workers and a floor; tell is a signal with three rings.
- **Experience**: the left rail holds the label, the headshot at 7.5rem with a hairline border, and the degree line. Right: H2 "Background." and the roles on a vertical hairline rail, each with a 7px Ember square marker, role in 600, org and location in Bone 2, dates in mono right-aligned, one sentence.
- **Contact**: H2 "Say hey." up to 11rem, one sentence in Bone 2, then email, GitHub, LinkedIn, Resume as 600-weight links with a 2px Ember underline that starts at a quarter width and fills on hover.
- **Footer**: mono in Mute, two lines: the typefaces and "Sound stays off until you press play".
- **Buttons and links**: rectangular, no radius, no shadow. Focus ring is a 2px solid Ember outline offset 3px. Selection is Ember with Ink text. Every control and inline link has a hit area at least 24px tall (the small mono links and the fork control carry block padding for it); the two first-screen buttons are at least 4rem tall on touch.

## 5. Layout principles

- One Ink sheet. Content sits in a centered column, `max-width: 1180px`, `padding-inline: var(--gut)` where `--gut` is `clamp(1rem, 4vw, 3rem)`. Sections are separated by a single hairline, never by a color change.
- Every section after the hero is a two-column grid: an 11rem left rail holding the sticky mono label (and, in Experience, the photo), then the content. The hero is its own grid, 1.05fr/1fr, text left, graphic right, `min-height: 100vh` minus the header.
- Reading measures: intro 46ch, thaw summary 58ch, project copy 42ch, role lines 60ch.
- Section vertical padding `clamp(3rem, 7vw, 6rem)`; contact `clamp(4rem, 10vw, 8rem)`.
- Page order is fixed: header, hero with intro and controls, thaw, other projects, experience, contact, footer. thaw does not lead.

## 6. Depth and elevation

Flat. There is no elevation system. Hierarchy comes from type size, Bone versus Bone 2 versus Mute, and hairlines. Ink 2 is a fill for small boxes, not a card surface. Hover states move things (translate, scale, rotate) or change a color; they never add a shadow, a glow, a blur or a border thickness.

## 7. Motion

Motion has a job or it is not here. CSS motion is compositor-only (transform, opacity). The three WebGL scenes run on their own canvases and follow the same rules written out in section 10. The page script stays small: it toggles classes, creates the iframe, and imports a scene chunk when its canvas nears the viewport.

1. **Hero rise.** The two H1 lines, tagline, intro, the buttons and the four HUD blocks rise 0.5rem, 90 ms apart. The name and the intro only move; they are the largest text on the page and stay visible from the first paint, so the largest contentful paint is the first paint. The tagline, buttons and HUD also fade in. Sets reading order without hiding the name.
2. **Hero fork.** The lattice forks when you drag sideways, scroll the first 60% of a viewport, or press "Fork it": the four branches fly apart along quadratic curves on a damped spring (a touch of overshoot, then settle), the new token columns grow in one after another, the branch ends drift by a few hundredths of a unit once settled. The site's thesis, done by the visitor.
3. **Hero orbit and parallax.** Drag to orbit within the limits, release for inertia that decays in about a second and eases back inside the limits; the pointer position nudges the rig and camera by a few degrees. The object floats 0.06 units on a slow sine. An Ember head steps along the trunk three columns a second: the session is running.
4. **Fork field.** The hero's background is one 64px tile in Line 2, a short token tick and a tiny fork mark, repeated as a flat hairline pattern on one composited layer that drifts one tile diagonally every 18 s (`translate` only, so the compositor moves it and the main thread does nothing: under 2% CPU). Paused when the hero is off screen or the tab is hidden (the page script sets `.paused`); off under reduced motion. No gradient, no glow, no second layer.
5. **Sound bars.** Three bars `scaleY` between 0.25 and 1 while sound is on. The only "playing" indicator; no dot, no badge.
6. **Scroll reveals.** Headings, copy and rows (`.rv`) rise 1.5rem on a `view()` timeline over the first 35% of entry. Experience markers scale in on the same timeline.
7. **Tour camera.** Native scrolling drives the camera through the five views: position and target lerp between keyframes with a smoothstep and a small lift mid-move, a damped follow smooths the scroll input, the subsystem in view fades its hairlines from Ink to Ember, and in the last view three copies of the snapshot travel out along Ember curves that draw as they go. Captions cross-fade and rise 0.6rem. No scroll hijacking: the page scrolls as usual, the stage is merely sticky.
8. **Card drift, tilt, lift.** Each card drifts on three slow sines (12, 9 and 16 px), tilts up to 10 degrees so the edge nearest the pointer comes forward, and lifts 70px on hover or focus; its wire frame follows exactly and turns Ember. The floor slides a little with the pointer. The cards are HTML, so the text stays crisp and every link is a real link.
9. **Links.** Header links grow an Ember underline; contact links fill theirs; the Contact button lifts 2px; the card arrow nudges diagonally.

Engines without scroll-driven animations get the finished state: every scroll keyframe defines only `from`, so the base state is the end state. `prefers-reduced-motion: reduce` collapses every duration, removes the hero entrance, stops the field and the bars, drops every scroll animation, lays the tour out as a still frame with its five captions listed under it, and makes each scene render exactly one frame (the hero forked and settled, the tour at the fork view, the cards in their resting slots) with no loop and no pointer handling. Nothing is half drawn in that mode.

Banned: count-ups, typing effects, cursor followers, parallax on text, scroll hijacking, glows, bloom, halos, gradient fills as decoration, blurs, shadows, autoplaying audio or video, purple. Hover tilt is allowed on the project deck only, where it is the point.

## 8. Responsive behavior

| Width | Behavior |
|---|---|
| 1440 | Hero stage fills the section; the object is centred at 72% of the width and fitted so it never crosses the copy column; HUD in the four corners. Two-column sections with the sticky rail. Tour stage full height under the header with the caption bottom left and the object centred at 65%. Deck 520px tall, four cards in a row. |
| 960 to 639 | Deck 632px, cards two by two. |
| 820 | Hero stacks: copy, then the stage at 70vw (280 to 440px) with the object centred, then the HUD as a two-column grid with hairline rules. The plain "Press play" button moves up beside "Contact me"; the HUD keeps the playlist hint. Rails stack above content and stop being sticky. Tour caption spans the width. |
| 639 and below | Deck 1144px, cards in one column. |
| 520 and below | Header stacks name over nav; `--head` grows to 5.6rem for the sticky tour. "Contact me" and "Press play" share one row, half the width each, 4rem tall, inside the first 844px at 390 wide. HUD one column. Receipt rows one column with the value under the label. Role rows one column. |
| `pointer: coarse` | The sound control is the plain 4rem-tall play button beside "Contact me"; device pixel ratio is capped at 1.5 instead of 2; vertical touch gestures scroll the page, horizontal ones orbit the hero. |

Images declare width and height. The only raster image is the headshot. The OG image is 1200 x 630 in `public/og-image.png` (still the v2 render; regenerate before launch).

## 9. Agent prompt guide

When asked to change the site:

- Read this file, then `CLAUDE.md`, then the content in `src/content`. Numbers come from `_brief/RECEIPTS.md` only; a metric without a `source` URL will not build and should not exist. The HUD's "about 340 s cold boot" comparison is the one figure shown by owner request before its receipt is on thaw.sh; it is linked to the fork receipt JSON and must go if that link stops holding it.
- Add copy in sentence case with periods. No em dashes, no emoji, no numbered eyebrows, no uppercase labels, no "elevate" or "seamless", no puns.
- Use only the nine colors in section 2 and the two typefaces in section 3. No new radii, shadows, gradients, blurs or fonts.
- Keep the page order in section 5. Do not move thaw above the hero.
- Sound stays off until pressed; the Spotify iframe must never exist in the DOM on load.
- Every animation must have a one-line job in section 7, use transform, opacity or clip-path, pause when off screen if it loops, and be covered by the reduced-motion block with a finished static state.
- 3D work follows section 10. Geometry is procedural and lives in `src/scenes`; never add a model file or a texture image.
- Run `npm run check`, `npm run build`, `npm run test:e2e` and `npm run lhci` before calling work done. The budgets in `lighthouserc.cjs` are the exit criteria. The script budget there covers the one page script; the three.js chunks load only on hardware WebGL, which headless Chrome in CI does not have, so they sit outside that run (see section 10).

## 10. WebGL rules

- One library, three.js, imported with a dynamic `import()` from `src/scenes/*.ts` only when the scene's canvas comes within 320px of the viewport (and, for the hero, after an idle callback so it never competes with first paint). Three chunks (hero, tour, cards backdrop) share one three.js chunk. The page loads exactly one script of its own, `src/scripts/page.ts`, bundled to a single module of a few KB with no preload helper; nothing else is in the first load.
- One WebGL probe per page, in `hasWebGL()`. A software rasterizer (SwiftShader, llvmpipe, the Windows basic driver) counts as no WebGL: it would draw these scenes at a few frames a second while pinning a CPU core, and the static drawings are the better page. Headless Chrome without a GPU, which is what CI, Playwright and Lighthouse run, takes this path.
- Device pixel ratio capped at 2, or 1.5 on `pointer: coarse`.
- Every loop runs through `Loop` in `src/scenes/gl.ts`: it stops when the stage leaves the viewport (IntersectionObserver) or the tab is hidden, and dt is clamped so nothing jumps on return. The tour renders only while the camera is still moving.
- Every mount returns a handle with `dispose()`, called on `pagehide`: geometries, materials, the renderer.
- Materials: Lambert faces with an ambient plus one key and one fill light, so a block reads as three flat tones; a hairline `LineSegments` edge set in Ink on every box, rebuilt from the instance matrices. No bloom, no halos, no fog, no transparency, no gradients, no textures. Colors are the nine palette hexes.
- `prefers-reduced-motion: reduce`: one frame, no loop, no pointer handlers.
- No WebGL: the static SVG in each stage stays (`.stage.is-3d` is never set), the cards still lay out and move with the small CSS-only motion module.
- Nothing a keyboard user needs is on a canvas. Canvases are `aria-hidden`; the HUD, the fork control, the play control, the captions and every card link are HTML.
