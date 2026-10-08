import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** The one link about music: the Spotify playlist, beside "Contact me" in the hero. */
const PLAYLIST = { label: "Songs I'm listening to lately", url: 'https://open.spotify.com/playlist/3RQb1MUtERqcwUlZdncPRN' };
const playlistLink = (page: Page) => page.locator('.hero .acts').getByRole('link', { name: PLAYLIST.label });

type Box = { x: number; y: number; width: number; height: number };
/** True when two boxes share any area (touching edges do not count). */
const overlaps = (a: Box, b: Box): boolean =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
const fmt = (b: Box): string => `x ${b.x.toFixed(0)} y ${b.y.toFixed(0)} w ${b.width.toFixed(0)} h ${b.height.toFixed(0)}`;

/**
 * Wait for the hero entrance to finish: the finite time-based animations
 * under the hero (the rise). Looping ones (the field) and scroll-driven ones
 * never settle, so they are left out.
 */
async function settleHero(page: Page): Promise<void> {
  await page.evaluate(() =>
    Promise.all(
      (document.querySelector('.hero')?.getAnimations({ subtree: true }) ?? [])
        .filter((a) => a.timeline instanceof DocumentTimeline && a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished),
    ),
  );
}

/** Two frames, so a scroll reveal has settled after scrollIntoView. */
const twoFrames = (page: Page) =>
  page.evaluate(() => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r()))));

test.describe('home page', () => {
  test('has no serious or critical axe violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Entrance animations fade text in; axe samples blended colours mid-fade and
    // reports false contrast failures. Wait for every finite animation to settle
    // so it measures the real, final colours. Infinite loops (drift, spin) and scroll-driven reveals (they only finish on scroll) are skipped.
    await page.evaluate(() =>
      Promise.all(
        document
          .getAnimations()
          .filter((a) => a.timeline instanceof DocumentTimeline && a.effect && a.effect.getComputedTiming().iterations !== Infinity)
          .map((a) => a.finished.catch(() => undefined)),
      ),
    );
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
      .analyze();
    const bad = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    await testInfo.attach('axe', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
    expect(bad, bad.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`).join('\n')).toEqual([]);
  });

  test('renders the approved hero and contact button', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Karan\s*Kapur/);
    await expect(page.getByText('Engineer. Co-founder of thaw. Based in Madison, WI. Open to relocating in the US.')).toBeVisible();
    const contact = page.getByRole('link', { name: 'Contact me' });
    await expect(contact).toHaveAttribute('href', 'mailto:kkapur5@wisc.edu');
  });

  test('the playlist link sits beside Contact me and opens the Spotify playlist in a new tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await settleHero(page);
    const link = playlistLink(page);
    await expect(link).toHaveCount(1);
    await expect(link).toHaveText(PLAYLIST.label);
    await expect(link).toHaveAttribute('href', PLAYLIST.url);
    await expect(link).toHaveAttribute('target', '_blank');
    expect((await link.getAttribute('rel'))?.split(/\s+/)).toContain('noopener');
    // a plain link, not a button, and the only link to the playlist on the page
    expect(await link.evaluate((el) => el.tagName)).toBe('A');
    await expect(page.locator('a[href*="open.spotify.com"]')).toHaveCount(1);
    // beside Contact me: to its right, on the same row (the link is centred
    // on the button's row, so its middle lies inside the button's box)
    const contact = page.getByRole('link', { name: 'Contact me' });
    const [lb, cb] = await Promise.all([link.boundingBox(), contact.boundingBox()]);
    expect(lb).not.toBeNull();
    expect(cb).not.toBeNull();
    expect(lb!.x).toBeGreaterThanOrEqual(cb!.x + cb!.width);
    const mid = lb!.y + lb!.height / 2;
    expect(mid).toBeGreaterThanOrEqual(cb!.y);
    expect(mid).toBeLessThanOrEqual(cb!.y + cb!.height);
    // a hit area of at least 24px
    expect(lb!.height).toBeGreaterThanOrEqual(24);
    // nothing on the page says play, pause, or now playing
    for (const re of [/press play/i, /now playing/i, /sound off/i, /sound stays off/i]) {
      await expect(page.locator('body')).not.toContainText(re);
    }
    await expect(page.locator('button.snd, #snd, #snd-touch, #snd-prev, #snd-next, #np, #sleeve, #player, #widget')).toHaveCount(0);
  });

  test('sections run hero, experience, projects, contact; leadership only when it has entries', async ({ page }) => {
    await page.goto('/');
    const ids = await page.$$eval('main > section', (els) => els.map((el) => el.id));
    const leadership = ids.includes('leadership');
    expect(ids).toEqual(leadership ? ['hero', 'experience', 'projects', 'leadership', 'contact'] : ['hero', 'experience', 'projects', 'contact']);
    const nav = page.getByRole('navigation', { name: 'Sections' });
    const labels = await nav.getByRole('link').allTextContents();
    expect(labels).toEqual(leadership ? ['Experience', 'Projects', 'Leadership', 'Contact'] : ['Experience', 'Projects', 'Contact']);
    if (leadership) {
      await expect(page.locator('#leadership .roles li')).not.toHaveCount(0);
    }
  });

  test('the headshot is in the hero, sized, prioritised and served as webp', async ({ page }) => {
    await page.goto('/');
    const pic = page.locator('#hero .id img.pic');
    await expect(pic).toHaveCount(1);
    await expect(pic).toHaveAttribute('alt', /Karan Kapur/);
    await expect(pic).toHaveAttribute('width', '150');
    await expect(pic).toHaveAttribute('height', '200');
    await expect(pic).toHaveAttribute('fetchpriority', 'high');
    await expect(pic).toHaveAttribute('loading', 'eager');
    await expect(pic).toHaveAttribute('src', /\.webp$/);
    await expect(pic).toHaveAttribute('srcset', /2x/);
    // the photo is in the first screen on every width, and no longer under Experience
    const box = await pic.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    await expect(page.locator('#experience img')).toHaveCount(0);
    await expect(page.locator('#experience .lab .edu')).toContainText('University of Wisconsin-Madison');
  });

  test('every experience and leadership entry has its own graphic with a static drawing', async ({ page }) => {
    await page.goto('/');
    const rows = page.locator('#experience .roles > li, #leadership .roles > li');
    const n = await rows.count();
    expect(n).toBeGreaterThanOrEqual(5);
    for (let i = 0; i < n; i++) {
      const stage = rows.nth(i).locator('.tile .stage[data-scene="role"]');
      await expect(stage).toHaveCount(1);
      await expect(stage.locator('svg.fb.mark')).toHaveCount(1);
      await expect(stage.locator('canvas')).toHaveCount(1);
      expect(await stage.getAttribute('data-role')).toMatch(/^[a-z-]+$/);
    }
    // every role has a drawing of its own: no two tiles share one
    const roles = await page.locator('.tile .stage').evaluateAll((els) => els.map((el) => el.getAttribute('data-role')));
    expect(new Set(roles).size).toBe(roles.length);
    // the thaw fork scene is visible without opening the disclosure
    await expect(page.locator('#thaw .tile .stage[data-role="thaw"]')).toBeVisible();
    await expect(page.locator('#tour-more')).toHaveJSProperty('open', false);
    await expect(page.locator('#leadership .tile .stage[data-role="kek-vp"]')).toHaveCount(1);
    await expect(page.locator('#leadership .tile .stage[data-role="kek-delta-president"]')).toHaveCount(1);
    // the static drawing is not empty: every tile's mark has at least one path
    await expect(page.locator('#leadership .tile .stage[data-role="kek-delta-president"] svg.fb.mark path')).not.toHaveCount(0);
  });

  test('thaw is the first experience entry with its credit line and links', async ({ page }) => {
    await page.goto('/');
    const thaw = page.locator('#experience .roles > li').first();
    await expect(thaw).toHaveId('thaw');
    await expect(thaw).toContainText('Co-founder, cloud storage');
    await expect(thaw).toContainText('Co-founded thaw with N. Matteson and M. Yu');
    await expect(thaw.getByRole('link', { name: 'github.com/thaw-ai/thaw' })).toHaveAttribute('href', 'https://github.com/thaw-ai/thaw');
    await expect(thaw.getByRole('link', { name: 'thaw.sh' })).toHaveAttribute('href', 'https://thaw.sh');
    // the other roles follow as rows
    await expect(page.locator('#experience .roles > li')).toHaveCount(5);
    // the hero's first mention of thaw lands on the entry
    await expect(page.locator('.hero .intro a[href="#thaw"]')).toHaveCount(1);
  });

  test('contact links are real', async ({ page }) => {
    await page.goto('/');
    const say = page.locator('#contact');
    await expect(say.getByRole('link', { name: 'kkapur5@wisc.edu' })).toHaveAttribute('href', 'mailto:kkapur5@wisc.edu');
    await expect(say.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/karank2512');
    await expect(say.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://www.linkedin.com/in/karankapur5');
    await expect(say.getByRole('link', { name: /Resume/ })).toHaveAttribute('href', '/resume.pdf');
    const resume = await page.request.get('/resume.pdf');
    expect(resume.status()).toBe(200);
    expect(resume.headers()['content-type']).toContain('pdf');
  });

  test('phone: Contact me and the playlist link share the first screen', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'phone layout only');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // The phone project emulates touch, where the turntable is a strip under the buttons.
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    // Let the hero entrance finish so the boxes are at rest.
    await page.evaluate(() =>
      Promise.all(
        (document.querySelector('.acts')?.getAnimations({ subtree: true }) ?? [])
          // the turntable disc spins forever; only wait for the entrance
          .filter((a) => a.effect && a.effect.getComputedTiming().iterations !== Infinity)
          .map((a) => a.finished),
      ),
    );
    const viewport = page.viewportSize();
    expect(viewport).toEqual({ width: 390, height: 844 });
    await expect(page.locator('#vinyl-stage')).toBeVisible();
    const link = playlistLink(page);
    const contact = page.getByRole('link', { name: 'Contact me' });
    const [lb, cb] = await Promise.all([link.boundingBox(), contact.boundingBox()]);
    expect(lb).not.toBeNull();
    expect(cb).not.toBeNull();
    for (const box of [lb!, cb!]) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(390);
      expect(box.y + box.height).toBeLessThanOrEqual(844);
      expect(box.width).toBeGreaterThanOrEqual(48);
      expect(box.height).toBeGreaterThanOrEqual(48);
    }
    // Beside each other: same row, the link to the right of contact.
    expect(Math.abs(lb!.y - cb!.y)).toBeLessThan(4);
    expect(lb!.x).toBeGreaterThanOrEqual(cb!.x + cb!.width);
    // The boxes are viewport coordinates, so the page must not have scrolled.
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('desktop: the turntable is decoration on the buttons row and turns on its own', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1440', 'wide fine-pointer layout only');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await settleHero(page);
    const tt = page.locator('#vinyl-stage');
    await expect(tt).toBeVisible();
    await expect(tt).toHaveAttribute('aria-hidden', 'true');
    // the stage holds the static drawing and an empty canvas until a scene draws
    await expect(tt.locator('svg.fb')).toHaveCount(1);
    await expect(tt.locator('#vinyl-gl')).toHaveCount(1);
    // not a control: no button or link around it, nothing focusable inside
    expect(await tt.evaluate((el) => el.closest('button, a, [role="button"]'))).toBeNull();
    await expect(tt.locator('button, a, [tabindex]')).toHaveCount(0);
    // on the row after the playlist link, inside the first screen
    const link = playlistLink(page);
    const [tb, lb, head] = await Promise.all([tt.boundingBox(), link.boundingBox(), page.locator('header.top').boundingBox()]);
    expect(tb!.x).toBeGreaterThanOrEqual(lb!.x + lb!.width);
    expect(tb!.y).toBeGreaterThanOrEqual(head!.y + head!.height);
    expect(tb!.y + tb!.height).toBeLessThanOrEqual(900);
    // the record in the drawing turns slowly on its own, by CSS, and pauses with the hero
    const disc = tt.locator('.fb .disc');
    const anim = await disc.evaluate((el) => {
      const s = getComputedStyle(el);
      return { name: s.animationName, duration: s.animationDuration, state: s.animationPlayState };
    });
    expect(anim).toEqual({ name: 'spin', duration: '12s', state: 'running' });
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(page.locator('#hero')).toHaveClass(/paused/);
    expect(await disc.evaluate((el) => getComputedStyle(el).animationPlayState)).toBe('paused');
  });

  test('the HUD shows only receipted numbers with receipt links', async ({ page }) => {
    await page.goto('/');
    const hud = page.locator('.hud');
    await expect(hud.getByText('0.88', { exact: false })).toBeVisible();
    await expect(hud.getByText('14.6', { exact: false })).toBeVisible();
    await expect(hud.getByText('28.8', { exact: false })).toBeVisible();
    const receipts = hud.getByRole('link', { name: 'Receipt' });
    await expect(receipts).toHaveCount(2);
    for (const link of await receipts.all()) {
      await expect(link).toHaveAttribute('href', /github\.com\/thaw-ai\/thaw\/blob\/main\/site\/receipts\//);
    }
  });

  test('loads no third-party script or iframe, ever', async ({ page }) => {
    // every request the page makes, from the first navigation on
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const origin = new URL(page.url()).origin;
    const foreign = () => requests.filter((u) => !u.startsWith(origin) && !u.startsWith('data:'));
    await expect(page.locator('iframe')).toHaveCount(0);
    expect(foreign(), 'nothing off-origin on load').toEqual([]);
    // nothing in the markup points at a player, a widget or an audio host
    const html = await page.content();
    for (const re of [/soundcloud/i, /<iframe/i, /<audio/i, /<embed/i, /auto_play/i]) {
      expect(html, `the page holds no ${re}`).not.toMatch(re);
    }
    await expect(page.locator('script[src]:not([src^="/"])')).toHaveCount(0);
    // use the page: the fork control, the tour, every section, the playlist
    // link's hover; still no iframe and nothing off-origin
    await page.locator('#fork-btn').click();
    await playlistLink(page).hover();
    await page.locator('#tour-more summary').click();
    for (const id of ['#experience', '#projects', '#contact']) {
      await page.locator(id).scrollIntoViewIfNeeded();
      await twoFrames(page);
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForLoadState('networkidle');
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.locator('audio, video, embed, object')).toHaveCount(0);
    expect(foreign(), 'nothing off-origin after using the page').toEqual([]);
    // the one link about music is the plain playlist link in the hero
    await expect(page.locator('a[href*="spotify"]')).toHaveCount(1);
    await expect(playlistLink(page)).toHaveAttribute('href', PLAYLIST.url);
  });

  test('every image declares width and height', async ({ page }) => {
    await page.goto('/');
    const missing = await page.$$eval('img', (imgs) =>
      imgs.filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).map((i) => i.getAttribute('src')),
    );
    expect(missing).toEqual([]);
  });

  test('the name and intro are visible from the first paint', async ({ page }) => {
    await page.goto('/');
    // The entrance only moves the largest text; it never starts transparent,
    // so the largest contentful paint is not delayed by a fade.
    const opacities = await page.$$eval('h1 .l, .hero .intro', (els) => els.map((el) => getComputedStyle(el).opacity));
    for (const o of opacities) expect(parseFloat(o)).toBe(1);
  });

  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    // The background field and the turntable's record are still, the hero
    // copy sits in its finished state, and the tour is a static list of captions.
    const field = await page.locator('.field').evaluate((el) => getComputedStyle(el).animationName);
    expect(field).toBe('none');
    const h1 = await page.locator('h1 .l').first().evaluate((el) => getComputedStyle(el).opacity);
    expect(parseFloat(h1)).toBe(1);
    await page.locator('#tour-more summary').click();
    const stick = await page.locator('#tour-stick').evaluate((el) => getComputedStyle(el).position);
    expect(stick).toBe('static');
    const disc = await page.locator('#vinyl-stage .fb .disc').evaluate((el) => getComputedStyle(el).animationName);
    expect(disc).toBe('none');
  });

  test('the background field is one translate animation that pauses off screen', async ({ page }) => {
    await page.goto('/');
    const field = page.locator('.field');
    const anim = await field.evaluate((el) => {
      const s = getComputedStyle(el);
      return { name: s.animationName, state: s.animationPlayState, image: s.backgroundImage };
    });
    expect(anim.name).toBe('drift');
    expect(anim.state).toBe('running');
    expect(anim.image).not.toContain('gradient');
    await page.locator('#contact').scrollIntoViewIfNeeded();
    await expect(page.locator('#hero')).toHaveClass(/paused/);
    expect(await field.evaluate((el) => getComputedStyle(el).animationPlayState)).toBe('paused');
  });

  test('the fork control toggles without the canvas', async ({ page }) => {
    await page.goto('/');
    const button = page.locator('#fork-btn');
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await expect(button).toHaveText('Fork it');
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    await expect(button).toHaveText('Reset');
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
  });

  test('every stage has its static drawing in the DOM before any scene loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#stage svg.fb')).toHaveCount(1);
    await expect(page.locator('#tour-stage svg.fb')).toHaveCount(1);
    await expect(page.locator('#vinyl-stage svg.fb')).toHaveCount(1);
    await expect(page.locator('#cards .stage svg.fb')).toHaveCount(3);
    const tiles = await page.locator('.tile .stage').count();
    await expect(page.locator('.tile .stage svg.fb')).toHaveCount(tiles);
    // no stage has drawn a frame: headless Chrome has no hardware WebGL
    await expect(page.locator('.stage.is-3d')).toHaveCount(0);
  });

  test('three.js is not in the first load', async ({ page }) => {
    const scripts: string[] = [];
    let parsed = false;
    const early: string[] = [];
    page.on('request', (r) => {
      if (r.resourceType() !== 'script') return;
      scripts.push(r.url());
      if (!parsed) early.push(r.url());
    });
    page.once('domcontentloaded', () => {
      parsed = true;
    });
    await page.goto('/');
    // One page script in the document. The scene chunks (and the three.js
    // chunk they share) come later, on idle or on approach, and only with
    // hardware WebGL, which headless Chrome does not have.
    const atParse = early.filter((u) => /\/_astro\/.*\.js$/.test(u));
    expect(atParse.length, atParse.join('\n')).toBe(1);
    expect(scripts.some((u) => /\/_astro\/gl\./.test(u)), scripts.join('\n')).toBe(false);
  });

  test('project cards link to the public repos and tell has no link', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('#cards .slot');
    await expect(cards).toHaveCount(3);
    await expect(page.locator('#cards a.card', { hasText: 'RelayIQ' })).toHaveAttribute('href', 'https://github.com/karank2512/RelayIQ');
    await expect(page.locator('#cards a.card', { hasText: 'Foreman' })).toHaveAttribute('href', 'https://github.com/karank2512/Foreman');
    const tell = page.locator('#cards div.card', { hasText: 'tell' });
    await expect(tell).toHaveCount(1);
    await expect(tell.getByRole('link')).toHaveCount(0);
    await expect(tell).toContainText('Open source soon.');
    // thaw is no longer a card; it lives under Experience
    await expect(page.locator('#cards .card h3', { hasText: /^thaw$/ })).toHaveCount(0);
    // each card has its own scene stage and caption
    await expect(page.locator('#cards .card .stage[data-scene]')).toHaveCount(3);
    await expect(page.locator('#cards .card', { hasText: 'RelayIQ' }).locator('.cap')).toContainText('simulated providers');
  });

  test('project cards carry the approved copy and hold all of it', async ({ page }) => {
    await page.goto('/');
    const relay = page.locator('#cards .card', { hasText: 'RelayIQ' });
    await expect(relay).toContainText('Spend control for lead enrichment. Sits between Clay-style workflows and the CRM.');
    await expect(relay.locator('.note')).toContainText('Providers were simulated, not live vendors.');
    const foreman = page.locator('#cards .card', { hasText: 'Foreman' });
    await expect(foreman).toContainText('Describe a job in plain English and Foreman designs a worker for it.');
    await expect(foreman.locator('.note')).toContainText('An agent harness for recurring work.');
    await expect(foreman).not.toContainText('Early and opinionated');
    await expect(foreman).not.toContainText('most want to talk about');
    const tell = page.locator('#cards div.card', { hasText: 'tell' });
    await expect(tell).toContainText("Who's hiring for the problem you solve?");
    await expect(tell).toContainText('Every score links to the posts behind it. Open source soon.');
    await expect(tell.locator('.note')).toHaveCount(0);
    // the longer copy fits: before the motion module runs, the CSS card height
    // holds every card's content; after it, the measured height does
    const deck = page.locator('#deck');
    // the three boxes of a slot are read in the same frame: the cards drift
    // in depth once the module runs, so separate round trips could disagree
    const check = async (when: string): Promise<void> => {
      const slots = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>('#cards .slot')).map((slot) => {
          const r = (el: Element | null): Box => {
            const b = el?.getBoundingClientRect() ?? new DOMRect();
            return { x: b.x, y: b.y, width: b.width, height: b.height };
          };
          return { title: slot.querySelector('h3')?.textContent ?? '', slot: r(slot), card: r(slot.querySelector('.card')), copy: r(slot.querySelector('.card > p')) };
        }),
      );
      expect(slots).toHaveLength(3);
      for (const { title, slot, card, copy } of slots) {
        expect(card.height, `${when}: the ${title} card is no taller than its slot`).toBeLessThanOrEqual(slot.height + 1);
        expect(copy.y + copy.height, `${when}: the ${title} copy ends inside the card`).toBeLessThanOrEqual(card.y + card.height - 8);
      }
    };
    await expect(deck).not.toHaveClass(/live/);
    await check('before the motion module');
    await deck.scrollIntoViewIfNeeded();
    await expect(deck).toHaveClass(/live/);
    await twoFrames(page);
    await check('after the motion module');
  });

  test('the tour opens inside the thaw entry and its captions follow the scroll', async ({ page }) => {
    await page.goto('/');
    const more = page.locator('#tour-more');
    await expect(more).toHaveJSProperty('open', false);
    await more.locator('summary').click();
    await expect(more).toHaveJSProperty('open', true);
    const caps = page.locator('#tour-caps .cap');
    await expect(caps).toHaveCount(5);
    await expect(caps.nth(0)).toHaveClass(/on/);
    // the receipts list is inside the entry too
    await expect(page.locator('#thaw .rcpt .row')).not.toHaveCount(0);
    // the tour stage spans the full content column, past the tile column
    const [tourBox, roleBox] = await Promise.all([page.locator('#tour-stick').boundingBox(), page.locator('#thaw .r').boundingBox()]);
    if (page.viewportSize()!.width > 599) expect(tourBox!.x).toBeLessThan(roleBox!.x);
    await page.locator('#projects').scrollIntoViewIfNeeded();
    await expect(caps.nth(4)).toHaveClass(/on/);
  });

  test('entry tiles have their own column or banner and never cover the text', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const width = page.viewportSize()!.width;
    const wide = width > 599;
    const rows = page.locator('#experience .roles > li, #leadership .roles > li');
    const n = await rows.count();
    expect(n).toBeGreaterThanOrEqual(7);
    for (let i = 0; i < n; i++) {
      const row = rows.nth(i);
      await row.scrollIntoViewIfNeeded();
      await twoFrames(page);
      const tile = await row.locator('.tile').boundingBox();
      expect(tile, `row ${i} has a tile`).not.toBeNull();
      const texts: Array<[string, Box]> = [];
      for (const sel of ['.r', '.w', '.ln']) {
        const box = await row.locator(sel).first().boundingBox();
        expect(box, `row ${i} ${sel}`).not.toBeNull();
        texts.push([sel, box!]);
      }
      for (const [sel, box] of texts) {
        expect(overlaps(tile!, box), `row ${i}: the tile (${fmt(tile!)}) covers ${sel} (${fmt(box)})`).toBe(false);
        expect(box.x, `row ${i} ${sel} starts inside the viewport`).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width, `row ${i} ${sel} ends inside the viewport`).toBeLessThanOrEqual(width);
        if (wide) {
          // the tile's own column: every text box starts to the right of it
          expect(box.x, `row ${i} ${sel} sits right of the tile`).toBeGreaterThanOrEqual(tile!.x + tile!.width);
        } else {
          // a full-width banner: every text box starts below it
          expect(box.y, `row ${i} ${sel} sits under the tile`).toBeGreaterThanOrEqual(tile!.y + tile!.height);
        }
      }
      if (width > 820) {
        // about twice the old 11 by 8.5rem area on desktop
        expect(tile!.width).toBeGreaterThanOrEqual(250);
        expect(tile!.height).toBeGreaterThanOrEqual(185);
        expect(tile!.width * tile!.height).toBeGreaterThanOrEqual(47000);
      } else if (wide) {
        expect(tile!.width).toBeGreaterThanOrEqual(220);
        expect(tile!.height).toBeGreaterThanOrEqual(165);
      } else {
        // the banner spans the row and is at least 200px tall
        const rowBox = (await row.boundingBox())!;
        expect(tile!.height).toBeGreaterThanOrEqual(200);
        expect(tile!.x + tile!.width).toBeGreaterThanOrEqual(rowBox.x + rowBox.width - 1);
        expect(tile!.width).toBeGreaterThanOrEqual(rowBox.width - 32);
      }
    }
    // the thaw project copy starts under the tile row and is never covered either
    const thaw = page.locator('#thaw');
    await thaw.scrollIntoViewIfNeeded();
    await twoFrames(page);
    const [thawTile, more] = await Promise.all([thaw.locator('.tile').boundingBox(), thaw.locator('.more').boundingBox()]);
    expect(more!.y).toBeGreaterThanOrEqual(thawTile!.y + thawTile!.height);
    // the Delta chapter entry carries its three sentences in full, laid out in the text column
    const delta = page.locator('#leadership .roles > li', { hasText: 'President, Delta Chapter' });
    await expect(delta).toHaveCount(1);
    await expect(delta.locator('.ln')).toContainText('Liaison to the national council and alumni boards.');
    const [deltaTile, deltaLine] = await Promise.all([delta.locator('.tile').boundingBox(), delta.locator('.ln').boundingBox()]);
    expect(overlaps(deltaTile!, deltaLine!)).toBe(false);
    expect(deltaLine!.height).toBeGreaterThan(40);
  });

  test('Contact me and the playlist link are inside the first screen', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await settleHero(page);
    const { width, height } = page.viewportSize()!;
    const link = playlistLink(page);
    await expect(link).toHaveCount(1);
    const contact = page.getByRole('link', { name: 'Contact me' });
    const [pb, cb, head] = await Promise.all([link.boundingBox(), contact.boundingBox(), page.locator('header.top').boundingBox()]);
    expect(pb).not.toBeNull();
    expect(cb).not.toBeNull();
    for (const [name, box] of [['the playlist link', pb!], ['Contact me', cb!]] as const) {
      expect(box.x, `${name} left edge`).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width, `${name} right edge`).toBeLessThanOrEqual(width);
      expect(box.y, `${name} under the header`).toBeGreaterThanOrEqual(head!.y + head!.height);
      expect(box.y + box.height, `${name} bottom edge inside ${width} by ${height}`).toBeLessThanOrEqual(height);
    }
    // viewport coordinates, so the page must not have scrolled
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('no section clips its content or shows a blank graphic', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await settleHero(page);
    const { width } = page.viewportSize()!;
    // nothing spills past the viewport width
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    // the headshot and the HUD leave the name alone
    const [pic, h1] = await Promise.all([page.locator('#hero img.pic').boundingBox(), page.locator('#hero h1').boundingBox()]);
    expect(overlaps(pic!, h1!), `headshot ${fmt(pic!)} over the name ${fmt(h1!)}`).toBe(false);
    if (width > 820) {
      // the top-left label ends a real distance above the name, not just short of it
      const tl = (await page.locator('.hud-tl').boundingBox())!;
      expect(h1!.y - (tl.y + tl.height), `HUD ${fmt(tl)} clears the name ${fmt(h1!)} by at least 6px`).toBeGreaterThanOrEqual(6);
    }
    // every visible static drawing has a real box inside its stage: the hero
    // lattice, the turntable, the three card scenes and every entry tile.
    // Measured in one pass inside the page (scroll each into view, wait two
    // frames for the scroll reveal, read both boxes) so the test does not
    // make five round trips per drawing and stall under load.
    const drawings = await page.evaluate(async () => {
      const settle = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
      const rect = (el: Element): Box => {
        const r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      const out: Array<{ id: string; box: Box; stage: Box }> = [];
      for (const svg of Array.from(document.querySelectorAll<SVGSVGElement>('.stage svg.fb'))) {
        // the same visibility rule as Playwright's :visible: a non-empty box and no visibility: hidden
        const r0 = svg.getBoundingClientRect();
        if (r0.width === 0 || r0.height === 0 || getComputedStyle(svg).visibility === 'hidden') continue;
        svg.scrollIntoView({ block: 'center', behavior: 'instant' });
        await settle();
        const stage = svg.parentElement as HTMLElement;
        out.push({ id: stage.id || `${stage.dataset.scene ?? 'stage'}:${stage.dataset.role ?? ''}`, box: rect(svg), stage: rect(stage) });
      }
      return out;
    });
    expect(drawings.length).toBeGreaterThanOrEqual(width > 820 ? 12 : 11);
    for (const { id, box, stage } of drawings) {
      expect(box.width, `drawing ${id} width`).toBeGreaterThanOrEqual(40);
      expect(box.height, `drawing ${id} height`).toBeGreaterThanOrEqual(30);
      expect(box.x, `drawing ${id} inside its stage`).toBeGreaterThanOrEqual(stage.x - 1);
      expect(box.x + box.width, `drawing ${id} inside its stage`).toBeLessThanOrEqual(stage.x + stage.width + 1);
      expect(box.y, `drawing ${id} inside its stage`).toBeGreaterThanOrEqual(stage.y - 1);
      expect(box.y + box.height, `drawing ${id} inside its stage`).toBeLessThanOrEqual(stage.y + stage.height + 1);
    }
    // the entry drawings fill their tiles: each role mark's paths span at
    // least 80% of its own viewBox on the longer axis, so no tile is mostly
    // empty frame around a small picture
    const fills = await page.evaluate(() =>
      Array.from(document.querySelectorAll<SVGSVGElement>('.tile .stage svg.fb')).map((svg) => {
        const vb = svg.viewBox.baseVal;
        let x0 = Infinity;
        let y0 = Infinity;
        let x1 = -Infinity;
        let y1 = -Infinity;
        for (const path of Array.from(svg.querySelectorAll('path'))) {
          const b = path.getBBox();
          x0 = Math.min(x0, b.x);
          y0 = Math.min(y0, b.y);
          x1 = Math.max(x1, b.x + b.width);
          y1 = Math.max(y1, b.y + b.height);
        }
        return { role: svg.parentElement?.getAttribute('data-role') ?? '', w: (x1 - x0) / vb.width, h: (y1 - y0) / vb.height };
      }),
    );
    expect(fills.length).toBeGreaterThanOrEqual(7);
    for (const f of fills) {
      expect(Math.max(f.w, f.h), `the ${f.role} drawing fills its frame (w ${f.w.toFixed(2)}, h ${f.h.toFixed(2)})`).toBeGreaterThanOrEqual(0.8);
      expect(Math.max(f.w, f.h), `the ${f.role} drawing stays inside its frame`).toBeLessThanOrEqual(1);
    }
    // the contact links sit inside the page width
    for (const link of await page.locator('#contact a').all()) {
      const box = (await link.boundingBox())!;
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
  });

  test('captures a reference screenshot', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const shot = await page.screenshot({ fullPage: true });
    await testInfo.attach(`home-${testInfo.project.name}`, { body: shot, contentType: 'image/png' });
  });
});
