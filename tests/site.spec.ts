import { test, expect, type Page } from '@playwright/test';
import http from 'node:http';

const PATH = '/';
const AUDIO = '/audio/';
// The eight songs, in tile order; secs is the file's own length (checked loosely against the browser's duration).
const TRACKS = [
  { id: 'pretty-green-eyes', artist: 'KETTAMA', title: 'Pretty Green Eyes (Sunset Ibiza Mix)', secs: 259 },
  { id: 'on2nite', artist: 'Silva Bumpa', title: 'On2nite', secs: 160 },
  { id: 'talk-to-you', artist: 'ANOTR', title: 'Talk To You (ft. 54 Ultra)', secs: 191 },
  { id: 'relax-my-eyes', artist: 'ANOTR, Abel Balder', title: 'Relax My Eyes', secs: 235 },
  { id: 'miracle-maker', artist: 'Dom Dolla', title: 'Miracle Maker (feat. Clementine Douglas)', secs: 189 },
  { id: 'left-to-right', artist: 'Odd Mob', title: 'Left To Right', secs: 276 },
  { id: 'if-u-need-it', artist: 'Sammy Virji', title: 'If U Need It', secs: 180 },
  { id: 'this-rhythm', artist: 'Prospa (feat. RAHH)', title: 'This Rhythm', secs: 190 },
];
const ALLOWED = new RegExp('/audio/(' + TRACKS.map((t) => t.id).join('|') + ')\\.mp3$');
const pressed = (i: number) => TRACKS.map((_, k) => (k === i ? 'true' : 'false'));

async function open18(page: Page) {
  await page.goto(PATH, { waitUntil: 'networkidle' });
}
async function creepTo(page: Page, y: number) {
  await page.evaluate(async (target) => {
    const step = Math.round(window.innerHeight * 0.06);
    while (Math.abs(window.scrollY - target) > step) {
      window.scrollBy({ top: window.scrollY < target ? step : -step, behavior: 'instant' });
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 16)));
    }
    window.scrollTo({ top: target, behavior: 'instant' });
  }, y);
}
async function topOf(page: Page, sel: string) {
  return page.evaluate((s) => (document.querySelector(s) as HTMLElement).getBoundingClientRect().top + window.scrollY, sel);
}
async function minLetterOpacity(page: Page, sel: string) {
  return page.evaluate((s) => {
    let min = 1;
    document.querySelectorAll(`${s} .il`).forEach((l) => { const o = parseFloat(getComputedStyle(l).opacity); if (o < min) min = o; });
    return min;
  }, sel);
}
async function rect(page: Page, sel: string) {
  return page.evaluate((s) => { const r = (document.querySelector(s) as HTMLElement).getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, right: r.right, bottom: r.bottom }; }, sel);
}
async function routeServed(page: Page) {
  const r = await page.request.head(AUDIO + 'pretty-green-eyes.mp3');
  return r.status() === 200;
}

test.describe('portfolio: eight song tiles under Listening lately, the outside list gone, everything from v17 kept', () => {
  test('substance carried from v15: hero text, method, facts, Ledgewood row exact, indexable, canonical root', async ({ page }) => {
    await open18(page);
    await expect(page.locator('#hero-name')).toHaveText('Karan Kapur');
    await expect(page.locator('#hero-line')).toHaveText('I build software with AI agents and the tooling around them.');
    // v17: the method and origin lines live in the hero's second paragraph;
    // the interests stay with it, and Off the clock keeps the table tennis line.
    await expect(page.locator('#hero-p')).toContainText('checking whether a number holds up');
    await expect(page.locator('#hero-p')).toContainText('IPL');
    await expect(page.locator('#hero-p')).toContainText('DJ sets, the NBA and Manchester United');
    await expect(page.locator('#about-1')).toContainText('Data Analyst at the Wisconsin Union');
    await expect(page.locator('#life-line')).toContainText('table tennis');
    await expect(page.locator('#photos figure')).toHaveCount(4);
    for (const id of ['proj-thaw', 'proj-relayiq', 'proj-foreman', 'proj-tell', 'proj-delivery-doctor']) await expect(page.locator(`#${id}`)).toHaveCount(1);
    await expect(page.locator('#proj-thaw .proj-l a').nth(0)).toHaveAttribute('href', 'https://github.com/thaw-ai/thaw');
    await expect(page.locator('#proj-thaw .proj-l a').nth(1)).toHaveAttribute('href', 'https://github.com/thaw-ai/thaw/blob/main/site/receipts/2026-04-20_h100_fork_pool_rl.json');
    await expect(page.locator('#proj-relayiq .proj-l a').nth(1)).toHaveAttribute('href', 'https://github.com/karank2512/RelayIQ/blob/main/docs/benchmarks/results.md');
    await expect(page.locator('#proj-tell .proj-l a').nth(0)).toHaveAttribute('href', 'https://karankapur.com/tell-data/');
    await expect(page.locator('#proj-thaw .proj-d')).toContainText('0.885 s median fork');
    await expect(page.locator('#proj-relayiq .proj-d')).toContainText('3.3x (13.24 to 4.07 credits)');
    // the Ledgewood row, exactly as v15 lists it: one line, no link
    const led = page.locator('#more-ledgewood');
    await expect(led).toHaveCount(1);
    await expect(led.locator('.row-n')).toHaveText('Ledgewood');
    await expect(led.locator('.row-m')).toHaveText('in progress · vendor evaluation');
    await expect(led.locator('.row-l')).toHaveText('Comparing data vendors field by field, starting with company data, to test which source fits a job at what cost.');
    await expect(led.locator('a')).toHaveCount(0);
    await expect(page.locator('#grp-in-progress .row')).toHaveCount(1);
    const names = await page.locator('#all-work .row-n').allTextContents();
    expect(names).toEqual(['thaw', 'RelayIQ', 'Foreman', 'Tell', 'Delivery Doctor', 'Postmaster', 'sports-data-mcp', 'imessage-mcp', 'Ledgewood', 'Wisconsin Union', 'Eurofins', 'OpenAI x UW-Madison SAIL', 'pitchsmith', 'Ref Ball', 'Illini ScoutBoard', 'TorqueSeal']);
    expect(new Set(names).size).toBe(names.length);
    await expect(page.locator('.foot-mail a')).toHaveAttribute('href', 'mailto:kapur04karan@gmail.com');
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://karankapur.com/');
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://karankapur.com/');
    await expect(page).toHaveTitle('Karan Kapur. Engineer, co-founder of thaw.');
    const colors = await page.evaluate(() => { const cs = getComputedStyle(document.querySelector('.v17') as HTMLElement); return { paper: cs.getPropertyValue('--paper').trim(), ink: cs.getPropertyValue('--ink').trim(), font: cs.fontFamily }; });
    expect(colors).toMatchObject({ paper: '#ece9e2', ink: '#1a1815' });
    expect(colors.font).toContain('STIX Two Text');
  });

  test('hero: name left, tagline right and centered on the name block (desktop) or stacked (phone), See all work bottom-left', async ({ page }, testInfo) => {
    await open18(page);
    await page.waitForTimeout(300);
    const phone = testInfo.project.name === 'mobile-390';
    const stacked = (testInfo.project.use.viewport?.width || 1440) <= 900;
    const pad = await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.first') as HTMLElement).paddingLeft));
    const name = await rect(page, '#hero-name');
    const line = await rect(page, '#hero-line');
    const cta = await rect(page, '.to-work');
    const hero = await rect(page, '.first');
    const vw = await page.evaluate(() => window.innerWidth);
    expect(Math.abs(name.x - pad), 'name starts at the left padding').toBeLessThan(2);
    expect(Math.abs(cta.x - pad), 'See all work starts at the left padding').toBeLessThan(2);
    expect(cta.bottom, 'See all work sits at the foot of the hero').toBeGreaterThan(hero.bottom - 60);
    expect(cta.y, 'See all work is below the name and the line').toBeGreaterThan(Math.max(name.bottom, line.bottom));
    const align = await page.evaluate(() => ['#hero-name', '#hero-line'].map((s) => getComputedStyle(document.querySelector(s) as HTMLElement).textAlign));
    expect(align.map((a) => (a === 'start' ? 'left' : a))).toEqual(['left', 'left']);
    // v17: the name is one calm serif line, not stacked display type
    const nameLines = await page.evaluate(() => (document.querySelector('#hero-name') as HTMLElement).getClientRects().length);
    expect(nameLines).toBe(1);
    if (phone) {
      expect(Math.abs(line.x - pad), 'line starts at the left padding').toBeLessThan(2);
      expect(line.y, 'line below the name').toBeGreaterThan(name.bottom - 2);
    } else {
      expect(name.right, 'name stays in the left half').toBeLessThan(vw / 2);
      expect(line.x, 'line starts past the centerline').toBeGreaterThan(vw * 0.45);
      expect(line.right, 'line stays inside the right padding').toBeLessThanOrEqual(vw - pad + 1);
      // v17: the name's vertical center is the right-hand block's vertical center, within 2 px
      const block = await rect(page, '.first-r');
      const nameMid = name.y + name.h / 2, blockMid = block.y + block.h / 2;
      expect(Math.abs(blockMid - nameMid), `block center ${blockMid} vs name center ${nameMid}`).toBeLessThanOrEqual(2);
      expect(line.x, 'line starts at the right block').toBeGreaterThanOrEqual(block.x - 1);
    }
    await expect(page.locator('.to-work')).toHaveAttribute('href', '#work');
    await expect(page.locator('.to-work')).toContainText('See all work');
  });

  test('Selected work: visual on one side, writeup on the other, swapping every project; phones stack', async ({ page }, testInfo) => {
    await open18(page);
    const phone = testInfo.project.name === 'mobile-390';
    const stacked = (testInfo.project.use.viewport?.width || 1440) <= 900;
    const ids = ['thaw', 'relayiq', 'foreman', 'tell', 'delivery-doctor'];
    const g = await page.evaluate((list) => list.map((id) => {
      const m = document.querySelector(`#proj-${id} .proj-media`)!.getBoundingClientRect();
      const c = document.querySelector(`#proj-${id} .proj-cap`)!.getBoundingClientRect();
      const d = document.querySelector(`#proj-${id} .proj-d`) as HTMLElement;
      return { id, m: { x: m.x, right: m.right, y: m.y, bottom: m.bottom, w: m.width, h: m.height }, c: { x: c.x, right: c.right, y: c.y, bottom: c.bottom, w: c.width }, align: getComputedStyle(d).textAlign, aspect: m.width / m.height };
    }), ids);
    const vw = await page.evaluate(() => window.innerWidth);
    for (let i = 0; i < g.length; i++) {
      const p = g[i];
      if (stacked) {
        expect(p.c.y, `${p.id}: writeup under the visual`).toBeGreaterThanOrEqual(p.m.bottom);
        expect(Math.abs(p.m.x + p.m.w / 2 - vw / 2), `${p.id}: visual centered`).toBeLessThan(2);
        expect(p.align, `${p.id}: centered text`).toBe('center');
        expect(p.aspect, `${p.id}: responsive frame`).toBeCloseTo(phone ? 16 / 9 : 2, 1);
      } else {
        const visualLeft = i % 2 === 0;
        if (visualLeft) expect(p.m.right, `${p.id}: visual left of the writeup`).toBeLessThanOrEqual(p.c.x);
        else expect(p.c.right, `${p.id}: writeup left of the visual`).toBeLessThanOrEqual(p.m.x);
        // both in one row
        expect(p.c.y, `${p.id}: writeup within the visual's row`).toBeLessThan(p.m.bottom);
        expect(p.c.bottom, `${p.id}: writeup within the visual's row`).toBeGreaterThan(p.m.y);
        expect(p.align === 'start' ? 'left' : p.align, `${p.id}: writeup set left`).toBe('left');
        expect(p.m.w, `${p.id}: the visual is the wider column`).toBeGreaterThan(p.c.w);
        expect(p.aspect, `${p.id}: 2:1 frame`).toBeCloseTo(2, 1);
      }
    }
    if (!stacked) {
      // sides really alternate: odd projects' visuals share a left edge, even ones another
      expect(Math.abs(g[0].m.x - g[2].m.x)).toBeLessThan(2);
      expect(Math.abs(g[1].m.x - g[3].m.x)).toBeLessThan(2);
      expect(g[1].m.x).toBeGreaterThan(g[0].m.x + 100);
    }
  });

  test('All work: centered, text only, with five categories and all projects categorized exactly once', async ({ page }) => {
    await open18(page);
    await expect(page.locator('#more-h .label-t')).toHaveText('All work');
    await expect(page.locator('#all-work img, #all-work figure, #all-work picture')).toHaveCount(0);
    const cats = page.locator('#all-work-cats a');
    await expect(cats).toHaveCount(5);
    const hrefs = await cats.evaluateAll((els) => els.map((e) => (e as HTMLAnchorElement).getAttribute('href')));
    expect(hrefs).toEqual(['#grp-agent-tooling', '#grp-in-progress', '#grp-in-use', '#grp-sports', '#grp-prototypes']);
    const labels = await cats.allTextContents();
    expect(labels).toEqual(['AI and data tooling', 'In progress', 'Shipped and used', 'Sports analytics', 'Prototypes']);
    for (const h of hrefs) await expect(page.locator(h!)).toHaveCount(1);
    // All work inventories every project once, categorized, no Above shortcuts.
    await expect(page.locator('#grp-featured')).toHaveCount(0);
    await expect(page.locator('#all-work .row')).toHaveCount(16);
    await expect(page.locator('#grp-agent-tooling .row')).toHaveCount(8);
    await expect(page.locator('#all-work a[href^="#proj-"]')).toHaveCount(0);
    for (const id of ['thaw', 'relayiq', 'foreman', 'tell', 'delivery-doctor']) {
      await expect(page.locator('#grp-agent-tooling #all-' + id)).toHaveCount(1);
      await expect(page.locator('#proj-' + id)).toHaveCount(1);
    }
    const pos = await page.evaluate(() => {
      const h = document.querySelector('#more-h')!.getBoundingClientRect();
      const c = document.querySelector('#all-work-cats')!.getBoundingClientRect();
      const g = document.querySelector('#grp-agent-tooling')!.getBoundingClientRect();
      const cs = getComputedStyle(document.querySelector('#all-work-cats') as HTMLElement);
      return { underHeading: c.top >= h.bottom, aboveGroups: c.bottom <= g.top, rule: cs.borderBottomWidth, centerOff: Math.abs(c.x + c.width / 2 - window.innerWidth / 2) };
    });
    expect(pos.underHeading).toBe(true);
    expect(pos.aboveGroups).toBe(true);
    // v17: the jump links carry 1 px hairline underlines, not a thick rule
    expect(parseFloat(pos.rule)).toBeGreaterThanOrEqual(0);
    expect(await page.evaluate(() => parseFloat(getComputedStyle(document.querySelector('#all-work-cats a') as HTMLElement).borderBottomWidth))).toBeGreaterThanOrEqual(1);
    expect(pos.centerOff).toBeLessThan(2);
    const sels = ['#grp-agent-tooling', '#grp-sports .row-l', '.exp-line', '.foot-mail', '#life-line', '.about-t', '#photos'];
    const offs = await page.evaluate((list) => list.map((s) => { const r = (document.querySelector(s) as HTMLElement).getBoundingClientRect(); return { s, off: Math.abs(r.x + r.width / 2 - window.innerWidth / 2) }; }), sels);
    for (const o of offs) expect(o.off, `${o.s} off center`).toBeLessThan(2);
    const align = await page.evaluate(() => ['#about-1', '#life-line', '.row-l', '.row-h'].map((s) => getComputedStyle(document.querySelector(s) as HTMLElement).textAlign));
    for (const a of align) expect(a).toBe('center');
  });

  test('category jumps land below the fixed bar; a hash in the URL lands there too', async ({ page }) => {
    await open18(page);
    const clear = () => page.evaluate(() => {
      const bar = document.querySelector('.chrome')!.getBoundingClientRect();
      const id = location.hash.slice(1);
      const t = document.getElementById(id)!.getBoundingClientRect();
      return { id, barBottom: bar.bottom, top: t.top, gap: t.top - bar.bottom };
    });
    // the site scrolls smoothly (global.css), so wait for the jump to settle
    const settled = async (id: string) => {
      await expect.poll(async () => { const g = (await clear()).gap; return g >= 0 && g < 120; }, { timeout: 4000, message: `${id} settles just under the bar` }).toBe(true);
      await page.waitForTimeout(150);
      const c = await clear();
      expect(c.id).toBe(id);
      expect(c.gap, `${id} not hidden under the bar`).toBeGreaterThanOrEqual(0);
      return c;
    };
    for (const href of ['#grp-agent-tooling', '#grp-in-progress', '#grp-in-use', '#grp-sports', '#grp-prototypes']) {
      await page.locator(`#all-work-cats a[href="${href}"]`).click();
      await settled(href.slice(1));
    }
    // See all work
    await page.locator('.to-work').click();
    await settled('work');
    // a direct load with a hash
    await page.goto(PATH + '#grp-sports', { waitUntil: 'networkidle' });
    await settled('grp-sports');
  });

  test('bar: quick links, the transport beside them, the stamp; one audio element; nothing loads before a gesture', async ({ page }) => {
    const third: string[] = [];
    const audio: string[] = [];
    page.on('request', (req) => {
      const u = req.url();
      if (!u.startsWith('http://localhost') && !u.startsWith('http://127.0.0.1') && !u.startsWith('data:')) third.push(u);
      if (/\.mp3|\/audio\//.test(u)) audio.push(u);
    });
    await open18(page);
    const nav = page.locator('.chrome-nav a');
    await expect(nav).toHaveCount(3);
    await expect(nav.nth(0)).toHaveAttribute('href', 'https://github.com/karank2512');
    await expect(nav.nth(1)).toHaveAttribute('href', 'https://www.linkedin.com/in/karankapur5');
    await expect(nav.nth(2)).toHaveAttribute('href', '/resume.pdf');
    await expect(page.locator('.chrome .stamp')).toContainText('Open to work');
    await expect(page.locator('.chrome #bar')).toHaveCount(1);
    await expect(page.locator('#bar-play')).toBeVisible();
    await expect(page.locator('#bar-play')).toHaveText('Play');
    await expect(page.locator('#bar-play')).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#bar-play')).toBeEnabled();
    // the default is the second song of eight (On2nite): at idle both previous and next can step
    await expect(page.locator('#bar-prev')).toBeEnabled();
    await expect(page.locator('#bar-prev')).toHaveAttribute('aria-label', 'Previous track');
    await expect(page.locator('#bar-next')).toBeEnabled();
    await expect(page.locator('#bar-next')).toHaveAttribute('aria-label', 'Next track');
    await expect(page.locator('#bar-status')).toHaveText('No track loaded');
    await expect(page.locator('#bar')).toHaveAttribute('data-state', 'idle');
    // compact: the bar's buttons are smaller than the section's old ones, and the bar stays one strip on desktop
    const sizes = await page.evaluate(() => ({ btn: document.querySelector('#bar-play')!.getBoundingClientRect().height, chrome: document.querySelector('.chrome')!.getBoundingClientRect().height, vw: window.innerWidth }));
    expect(sizes.btn).toBeLessThanOrEqual(36);
    expect(sizes.chrome).toBeLessThanOrEqual(sizes.vw < 768 ? 112 : sizes.vw <= 900 ? 96 : 72);
    // song selection stays in Off the clock; the transport is not duplicated there
    await expect(page.locator('#life #player')).toHaveCount(1);
    // v18: eight tiles, one per local file, real buttons with a pressed state, in the order the songs arrived; artist and title on each
    const tiles = page.locator('#player-tracks .tile');
    await expect(tiles).toHaveCount(8);
    await expect(page.locator('#player-tracks button.track.tile[type="button"]')).toHaveCount(8);
    for (let i = 0; i < 8; i++) {
      await expect(tiles.nth(i).locator('.tile-a')).toHaveText(TRACKS[i].artist);
      await expect(tiles.nth(i).locator('.tile-t')).toHaveText(TRACKS[i].title);
      await expect(tiles.nth(i)).toBeEnabled();
      await expect(tiles.nth(i)).toHaveAttribute('aria-pressed', 'false');
    }
    expect(await tiles.evaluateAll((els) => els.map((e) => (e as HTMLButtonElement).getAttribute('data-track')))).toEqual(TRACKS.map((t) => t.id));
    const tileGeom = await tiles.evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), border: getComputedStyle(e).borderBottomWidth }; }));
    for (const g of tileGeom) { expect(g.w).toBeGreaterThan(100); expect(g.h).toBeGreaterThan(40); expect(parseFloat(g.border)).toBeGreaterThanOrEqual(1); }
    // v17: one tile per row, eight quiet rows; each row sits below the last and inside the box
    for (let k = 0; k < 8; k++) {
      if (k >= 1) expect(tileGeom[k].y, `tile ${k} below the row above`).toBeGreaterThanOrEqual(tileGeom[k - 1].y + tileGeom[k - 1].h - 1); // 1px slack for fractional-height rounding
    }
    const boxR = await rect(page, '#player');
    for (const g of tileGeom) { expect(g.x).toBeGreaterThanOrEqual(boxR.x); expect(g.x + g.w).toBeLessThanOrEqual(boxR.right + 1); }
    expect(await page.locator('#player-tracks').getAttribute('data-default')).toBe('1');
    await expect(page.locator('#player .player-hint')).toContainText('Tap a song to play it');
    await expect(page.locator('#player button:not(.track)')).toHaveCount(0);
    await expect(page.locator('#player-range')).toBeDisabled();
    await expect(page.locator('#player-status')).toHaveText('No track loaded');
    await expect(page.locator('#player-status')).toHaveAttribute('aria-live', 'polite');
    await expect(page.locator('audio')).toHaveCount(1);
    const au = page.locator('#player-audio');
    await expect(au).toHaveAttribute('preload', 'none');
    expect(await au.getAttribute('src')).toBeNull();
    expect(await au.getAttribute('autoplay')).toBeNull();
    await expect(page.locator('audio source, iframe, video')).toHaveCount(0);
    // v18: the separate list of outside links is gone; "Listening lately" is the title over the tiles (once); the playlist is one small line inside the box, under the tiles
    await expect(page.locator('#listening, .listen-l, a[href*="open.spotify.com/track"]')).toHaveCount(0);
    await expect(page.locator('#player-k')).toHaveText('Listening lately');
    await expect(page.locator('#player-tracks')).toHaveAttribute('aria-label', 'Listening lately');
    const bodyText = await page.evaluate(() => Array.from(document.body.querySelectorAll('p, h1, h2, h3, span, a, li, button')).map((e) => e.textContent || '').join('\n'));
    expect(bodyText.split('Listening lately').length - 1, 'the title appears once').toBe(1);
    expect(bodyText.includes('Local tracks')).toBe(false);
    const music = page.locator('#player .music-a');
    await expect(music).toHaveCount(1);
    await expect(music).toHaveAttribute('href', 'https://open.spotify.com/playlist/3RQb1MUtERqcwUlZdncPRN');
    await expect(music).toHaveAttribute('rel', 'noopener');
    await expect(page.locator('a[href*="open.spotify.com"]')).toHaveCount(1);
    expect(await music.evaluate((e) => parseFloat(getComputedStyle(e).fontSize)), 'playlist line is small').toBeLessThanOrEqual(15);
    const mg = await rect(page, '#player .music-a');
    expect(mg.y, 'playlist line under the last tile').toBeGreaterThan(tileGeom[7].y + tileGeom[7].h);
    const tileText = await tiles.evaluateAll((els) => els.map((e) => e.textContent || ''));
    for (const t of tileText) expect(t).not.toMatch(/\.mp3|\/tmp\/|user-audio/);
    // previous while stopped only selects (from the default, On2nite, back to the first song)
    await page.locator('#bar-prev').click();
    await expect(page.locator('#bar')).toHaveAttribute('data-state', 'selected');
    await expect(page.locator('#bar-status')).toHaveText('Selected: KETTAMA - Pretty Green Eyes (Sunset Ibiza Mix). Press play.');
    await expect(page.locator('#player-status')).toHaveText('Selected: KETTAMA - Pretty Green Eyes (Sunset Ibiza Mix). Press play.');
    await expect(page.locator('#player-tracks .track').nth(0)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#bar-prev')).toBeDisabled();
    await expect(page.locator('#bar-next')).toBeEnabled();
    await page.locator('#bar-next').click();
    await expect(page.locator('#bar-status')).toHaveText('Selected: Silva Bumpa - On2nite. Press play.');
    await expect(page.locator('#player-tracks .track').nth(1)).toHaveAttribute('aria-pressed', 'true');
    await page.locator('#bar-next').click();
    await expect(page.locator('#bar-status')).toHaveText('Selected: ANOTR - Talk To You (ft. 54 Ultra). Press play.');
    await expect(page.locator('#player-tracks .track').nth(2)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#bar-prev')).toBeEnabled();
    await expect(page.locator('#bar-next')).toBeEnabled();
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await page.waitForTimeout(600);
    expect(await au.getAttribute('src')).toBeNull();
    expect(audio).toEqual([]);
    expect(third).toEqual([]);
    // no script of the page's own by src (the dev server injects its client and toolbar; the build has none)
    const ownScripts = await page.evaluate(() => Array.from(document.querySelectorAll('script[src]')).map((s) => s.getAttribute('src') || '').filter((u) => !/^\/@vite\/|^\/@fs\/|^\/@id\/|^\/src\/styles\//.test(u)));
    expect(ownScripts).toEqual([]);
    const ids = await page.evaluate(() => { const seen = new Map<string, number>(); document.querySelectorAll('[id]').forEach((e) => seen.set(e.id, (seen.get(e.id) || 0) + 1)); return Array.from(seen).filter(([, n]) => n > 1).map(([id]) => id); });
    expect(ids).toEqual([]);
  });

  test('first bar Play is On2nite; seek, pause, resume, previous; tiles load and play from paused, playing and idle; one audio element (same-origin audio)', async ({ page }) => {
    await open18(page);
    expect(await routeServed(page), 'all shipped audio must exist').toBe(true);
    const reqs: { url: string; range: string | null }[] = [];
    page.on('request', (req) => { if (/audio/.test(req.url())) reqs.push({ url: req.url(), range: req.headers()['range'] || null }); });
    const snap = () => page.evaluate(() => {
      const a = document.getElementById('player-audio') as HTMLAudioElement;
      const q = (s: string) => document.querySelector(s) as HTMLElement;
      return { audios: document.querySelectorAll('audio').length, bar: q('#bar').getAttribute('data-state'), box: q('#player').getAttribute('data-state'), barText: q('#bar-status').textContent, boxText: q('#player-status').textContent, src: a.getAttribute('src'), t: a.currentTime, d: a.duration, paused: a.paused, play: q('#bar-play').textContent, pressed: q('#bar-play').getAttribute('aria-pressed'), rangeOn: !(q('#player-range') as HTMLInputElement).disabled, range: +(q('#player-range') as HTMLInputElement).value, cur: q('#player-cur').textContent, dur: q('#player-dur').textContent, sel: Array.from(document.querySelectorAll('.track')).map((b) => b.getAttribute('aria-pressed')), prevOff: (q('#bar-prev') as HTMLButtonElement).disabled, nextOff: (q('#bar-next') as HTMLButtonElement).disabled };
    });
    expect(reqs.length, 'nothing requested before the gesture').toBe(0);
    expect(await page.locator('#player-audio').getAttribute('src')).toBeNull();
    // 1. the first press of Play: On2nite by Silva Bumpa, the default, with no pick
    await page.locator('#bar-play').click();
    await expect(page.locator('#bar')).toHaveAttribute('data-state', 'playing', { timeout: 15000 });
    await expect.poll(() => page.locator('#player-audio').evaluate((a) => (a as HTMLAudioElement).currentTime), { timeout: 10000 }).toBeGreaterThan(0.8);
    let s = await snap();
    expect(s.audios).toBe(1);
    expect(s.src).toBe(AUDIO + 'on2nite.mp3');
    expect(s.box).toBe('playing');
    expect(s.barText).toBe('Playing: Silva Bumpa - On2nite');
    expect(s.boxText).toBe(s.barText);
    expect(s.play).toBe('Pause');
    expect(s.pressed).toBe('true');
    expect(s.paused).toBe(false);
    expect(s.t).toBeGreaterThan(0.8);
    expect(s.d).toBeGreaterThan(150);
    expect(s.rangeOn).toBe(true);
    expect(s.dur).toBe('2:40');
    expect(s.sel).toEqual(pressed(1));
    expect(s.prevOff).toBe(false);
    expect(s.nextOff).toBe(false);
    expect(reqs.length).toBe(1);
    expect(reqs[0].url).toMatch(/on2nite\.mp3$/);
    // 2. seek from the box: the audio follows
    await page.evaluate(() => { const rg = document.getElementById('player-range') as HTMLInputElement; rg.value = '500'; rg.dispatchEvent(new Event('input', { bubbles: true })); rg.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.waitForTimeout(700);
    s = await snap();
    expect(s.t / s.d).toBeGreaterThan(0.49);
    expect(s.t / s.d).toBeLessThan(0.52);
    expect(s.range).toBeGreaterThan(490);
    // 3. pause from the bar: the clock holds, both statuses agree
    await page.locator('#bar-play').click();
    await expect(page.locator('#bar')).toHaveAttribute('data-state', 'paused');
    const p1 = await snap();
    await page.waitForTimeout(1200);
    const p2 = await snap();
    expect(p1.paused).toBe(true);
    expect(p2.t).toBe(p1.t);
    expect(p2.play).toBe('Play');
    expect(p2.pressed).toBe('false');
    expect(p2.boxText).toBe('Paused: Silva Bumpa - On2nite');
    expect(p2.barText).toBe(p2.boxText);
    expect(reqs.length).toBe(1);
    // 4. paused: the On2nite tile starts On2nite again (the same loaded file, no reload), clock running
    await page.locator('#player-tracks .tile[data-track="on2nite"]').click();
    await expect(page.locator('#bar')).toHaveAttribute('data-state', 'playing', { timeout: 15000 });
    await page.waitForTimeout(1200);
    s = await snap();
    expect(s.src).toBe(AUDIO + 'on2nite.mp3');
    expect(s.barText).toBe('Playing: Silva Bumpa - On2nite');
    expect(s.paused).toBe(false);
    expect(s.t).toBeGreaterThan(p2.t);
    expect(s.sel).toEqual(pressed(1));
    expect(s.audios).toBe(1);
    expect(reqs.length).toBe(1);
    // 5. previous from the bar while playing: the first file, one more request, the tile follows
    await page.locator('#bar-prev').click();
    await expect(page.locator('#bar-status')).toHaveText('Playing: KETTAMA - Pretty Green Eyes (Sunset Ibiza Mix)', { timeout: 15000 });
    await page.waitForTimeout(1200);
    s = await snap();
    expect(s.src).toBe(AUDIO + 'pretty-green-eyes.mp3');
    expect(s.sel).toEqual(pressed(0));
    expect(s.boxText).toBe('Playing: KETTAMA - Pretty Green Eyes (Sunset Ibiza Mix)');
    expect(s.dur).toBe('4:18');
    expect(s.t).toBeGreaterThan(0.5);
    expect(s.t).toBeLessThan(10);
    expect(s.prevOff).toBe(true);
    expect(s.nextOff).toBe(false);
    expect(reqs.length).toBe(2);
    // 6. the tile of the song already playing: it restarts from the top, still one audio element, no second stream
    await page.waitForTimeout(1500);
    const before = await snap();
    expect(before.t).toBeGreaterThan(2);
    await page.locator('#player-tracks .tile[data-track="pretty-green-eyes"]').click();
    await page.waitForTimeout(600);
    s = await snap();
    expect(s.src).toBe(AUDIO + 'pretty-green-eyes.mp3');
    expect(s.t, 'restarted from the top').toBeLessThan(before.t);
    expect(s.t).toBeLessThan(2.5);
    expect(s.paused).toBe(false);
    expect(s.audios).toBe(1);
    expect(s.barText).toBe('Playing: KETTAMA - Pretty Green Eyes (Sunset Ibiza Mix)');
    // 7. the other tile while playing: On2nite loads and plays, the bar follows
    await page.locator('#player-tracks .tile[data-track="on2nite"]').click();
    await expect(page.locator('#bar-status')).toHaveText('Playing: Silva Bumpa - On2nite', { timeout: 15000 });
    await page.waitForTimeout(800);
    s = await snap();
    expect(s.src).toBe(AUDIO + 'on2nite.mp3');
    expect(s.audios).toBe(1);
    expect(s.play).toBe('Pause');
    expect(s.sel).toEqual(pressed(1));
    expect(s.t).toBeLessThan(10);
    // the second On2nite load may come from the browser's cache (no new request) or the route (one more); either way the first two requests stand
    expect(reqs.length).toBeGreaterThanOrEqual(2);
    expect(reqs.every((r) => /\/audio\/(on2nite|pretty-green-eyes)\.mp3$/.test(r.url))).toBe(true);
    await page.locator('#bar-play').click();
    await expect(page.locator('#bar')).toHaveAttribute('data-state', 'paused');
    await expect(page.locator('#player-status')).toHaveText('Paused: Silva Bumpa - On2nite');
  });

  test('idle: a tile click loads and plays that song (KETTAMA), the bar follows; keyboard works on a tile (same-origin audio)', async ({ page }) => {
    await open18(page);
    expect(await routeServed(page), 'all shipped audio must exist').toBe(true);
    const reqs: string[] = [];
    page.on('request', (req) => { if (/audio/.test(req.url())) reqs.push(req.url()); });
    await expect(page.locator('#bar')).toHaveAttribute('data-state', 'idle');
    const tile = page.locator('#player-tracks .tile[data-track="pretty-green-eyes"]');
    await tile.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#bar')).toHaveAttribute('data-state', 'playing', { timeout: 15000 });
    // Wait for actual playback and its rendered clock, not a fixed 1.5s sleep.
    // Slow CI scheduling can update currentTime before the next UI timeupdate.
    await expect.poll(() => page.locator('#player-cur').textContent(), { timeout: 10000 }).not.toBe('0:00');
    await expect.poll(() => page.locator('#player-audio').evaluate((a) => (a as HTMLAudioElement).currentTime), { timeout: 10000 }).toBeGreaterThan(0.8);
    const s = await page.evaluate(() => {
      const a = document.getElementById('player-audio') as HTMLAudioElement;
      return { audios: document.querySelectorAll('audio').length, src: a.getAttribute('src'), t: a.currentTime, paused: a.paused, bar: document.getElementById('bar-status')!.textContent, box: document.getElementById('player-status')!.textContent, play: document.getElementById('bar-play')!.textContent, pressed: Array.from(document.querySelectorAll('.tile')).map((b) => b.getAttribute('aria-pressed')), dur: document.getElementById('player-dur')!.textContent, cur: document.getElementById('player-cur')!.textContent };
    });
    expect(s.audios).toBe(1);
    expect(s.src).toBe(AUDIO + 'pretty-green-eyes.mp3');
    expect(s.paused).toBe(false);
    expect(s.t).toBeGreaterThan(0.8);
    expect(s.t).toBeLessThan(10);
    expect(s.bar).toBe('Playing: KETTAMA - Pretty Green Eyes (Sunset Ibiza Mix)');
    expect(s.box).toBe(s.bar);
    expect(s.play).toBe('Pause');
    expect(s.pressed).toEqual(pressed(0));
    expect(s.dur).toBe('4:18');
    expect(s.cur).not.toBe('0:00');
    expect(reqs.length).toBe(1);
    expect(reqs[0]).toMatch(/pretty-green-eyes\.mp3$/);
    await page.locator('#bar-play').click();
    await expect(page.locator('#bar')).toHaveAttribute('data-state', 'paused');
  });

  test('each of the eight tiles loads and plays its own file: clock advances, statuses agree, pause holds, previous/next stop at the ends, seek follows (same-origin audio)', async ({ page }) => {
    await open18(page);
    expect(await routeServed(page), 'all shipped audio must exist').toBe(true);
    const reqs: string[] = [];
    page.on('request', (req) => { if (/audio/.test(req.url())) reqs.push(req.url()); });
    const snap = () => page.evaluate(() => {
      const a = document.getElementById('player-audio') as HTMLAudioElement;
      const q = (s: string) => document.querySelector(s) as HTMLElement;
      return { audios: document.querySelectorAll('audio').length, bar: q('#bar').getAttribute('data-state'), box: q('#player').getAttribute('data-state'), barText: q('#bar-status').textContent, boxText: q('#player-status').textContent, src: a.getAttribute('src'), t: a.currentTime, d: a.duration, paused: a.paused, play: q('#bar-play').textContent, rangeOn: !(q('#player-range') as HTMLInputElement).disabled, cur: q('#player-cur').textContent, dur: q('#player-dur').textContent, sel: Array.from(document.querySelectorAll('.track')).map((b) => b.getAttribute('aria-pressed')), prevOff: (q('#bar-prev') as HTMLButtonElement).disabled, nextOff: (q('#bar-next') as HTMLButtonElement).disabled };
    });
    expect(reqs.length).toBe(0);
    for (let i = 0; i < TRACKS.length; i++) {
      const t = TRACKS[i];
      await page.locator(`#player-tracks .tile[data-track="${t.id}"]`).click();
      await expect(page.locator('#bar-status')).toHaveText(`Playing: ${t.artist} - ${t.title}`, { timeout: 15000 });
      await expect.poll(() => page.locator('#player-cur').textContent(), { timeout: 10000 }).not.toBe('0:00');
      await expect.poll(() => page.locator('#player-audio').evaluate((a) => (a as HTMLAudioElement).currentTime), { timeout: 10000 }).toBeGreaterThan(0.6);
      const s = await snap();
      expect(s.audios, t.id).toBe(1);
      expect(s.src, t.id).toBe(AUDIO + t.id + '.mp3');
      expect(s.box, t.id).toBe('playing');
      expect(s.paused, t.id).toBe(false);
      expect(s.t, `${t.id} clock running`).toBeGreaterThan(0.6);
      expect(s.t, t.id).toBeLessThan(10);
      expect(Math.abs(s.d - t.secs), `${t.id} duration ${s.d}`).toBeLessThan(4);
      expect(s.dur, t.id).toMatch(/^\d+:\d\d$/);
      expect(s.cur, t.id).not.toBe('0:00');
      expect(s.boxText, t.id).toBe(s.barText);
      expect(s.play, t.id).toBe('Pause');
      expect(s.rangeOn, t.id).toBe(true);
      expect(s.sel, t.id).toEqual(pressed(i));
      expect(s.prevOff, `${t.id} previous`).toBe(i === 0);
      expect(s.nextOff, `${t.id} next`).toBe(i === TRACKS.length - 1);
      await page.waitForTimeout(700);
      const s2 = await snap();
      expect(s2.t, `${t.id} clock still advancing`).toBeGreaterThan(s.t);
      expect(s2.src).toBe(s.src);
    }
    // every request went to one of the eight allowed files, and every file was asked for exactly by its id
    expect(reqs.every((u) => ALLOWED.test(u)), reqs.join(' ')).toBe(true);
    expect(Array.from(new Set(reqs.map((u) => u.replace(/^.*\//, '')))).sort()).toEqual(TRACKS.map((t) => t.id + '.mp3').sort());
    // at the last tile: pause holds the clock, next has nowhere to go, previous while paused only selects (no load)
    await page.locator('#bar-play').click();
    await expect(page.locator('#bar')).toHaveAttribute('data-state', 'paused');
    const p1 = await snap();
    await page.waitForTimeout(1200);
    const p2 = await snap();
    expect(p2.paused).toBe(true);
    expect(p2.t).toBe(p1.t);
    expect(p2.play).toBe('Play');
    expect(p2.barText).toBe('Paused: Prospa (feat. RAHH) - This Rhythm');
    expect(p2.boxText).toBe(p2.barText);
    expect(p2.nextOff).toBe(true);
    expect(p2.prevOff).toBe(false);
    const n = reqs.length;
    await page.locator('#bar-prev').click();
    await expect(page.locator('#bar-status')).toHaveText('Selected: Sammy Virji - If U Need It. Press play.');
    const s3 = await snap();
    expect(s3.src).toBeNull();
    expect(s3.sel).toEqual(pressed(6));
    expect(s3.rangeOn).toBe(false);
    expect(s3.cur).toBe('0:00');
    expect(reqs.length).toBe(n);
    // play from the bar loads the selection; a seek from the box follows
    await page.locator('#bar-play').click();
    await expect(page.locator('#bar-status')).toHaveText('Playing: Sammy Virji - If U Need It', { timeout: 15000 });
    await page.waitForTimeout(800);
    await page.evaluate(() => { const rg = document.getElementById('player-range') as HTMLInputElement; rg.value = '500'; rg.dispatchEvent(new Event('input', { bubbles: true })); rg.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.waitForTimeout(700);
    const s4 = await snap();
    expect(s4.src).toBe(AUDIO + 'if-u-need-it.mp3');
    expect(s4.t / s4.d).toBeGreaterThan(0.49);
    expect(s4.t / s4.d).toBeLessThan(0.52);
    // the first tile while playing: previous has nowhere to go, still one audio element
    await page.locator('#player-tracks .tile[data-track="pretty-green-eyes"]').click();
    await expect(page.locator('#bar-status')).toHaveText('Playing: KETTAMA - Pretty Green Eyes (Sunset Ibiza Mix)', { timeout: 15000 });
    const s5 = await snap();
    expect(s5.prevOff).toBe(true);
    expect(s5.nextOff).toBe(false);
    expect(s5.audios).toBe(1);
    expect(s5.sel).toEqual(pressed(0));
    await page.locator('#bar-play').click();
    await expect(page.locator('#bar')).toHaveAttribute('data-state', 'paused');
    expect(reqs.every((u) => ALLOWED.test(u))).toBe(true);
  });

  test('public same-origin audio: all eight assets exist as MPEG with byte lengths; no local paths leak', async ({ page }) => {
    await open18(page);
    for (const t of TRACKS) {
      const h = await page.request.head(AUDIO + t.id + '.mp3');
      expect(h.status()).toBe(200);
      expect(h.headers()['content-type']).toContain('audio/mpeg');
      expect(Number(h.headers()['content-length'])).toBeGreaterThan(1000000);
    }
    expect((await page.request.head(AUDIO + 'unknown.mp3')).status()).toBe(404);
    const html = await (await page.request.get(PATH)).text();
    expect(html).not.toMatch(/__private|\/tmp\/|user-audio|second-provided/);
  });

  test('dividers: each labeled section is cut once, by its own title rules; no full-width border above it', async ({ page }) => {
    await open18(page);
    const v = await page.evaluate(() => ['#about', '#life', '#work', '#all-work', '#experience'].map((s) => {
      const el = document.querySelector(s) as HTMLElement; const cs = getComputedStyle(el);
      return { s, top: cs.borderTopWidth, bottom: cs.borderBottomWidth, rules: el.querySelectorAll(':scope > .label > .label-rule').length, label: el.querySelectorAll(':scope > .label').length };
    }));
    for (const r of v) {
      expect(parseFloat(r.top), `${r.s} has no full-width top border`).toBe(0);
      expect(parseFloat(r.bottom), `${r.s} has no full-width bottom border`).toBe(0);
      expect(r.label, `${r.s} has one label`).toBe(1);
      expect(r.rules, `${r.s} label has its two rules`).toBe(2);
    }
    // the rules are drawn (not zero-width) once the label is on screen
    await page.locator('#h-about').scrollIntoViewIfNeeded();
    await expect(page.locator('#h-about .label-t')).toHaveClass(/on|set/);
    await page.waitForTimeout(1300);
    const rules = await page.evaluate(() => Array.from(document.querySelectorAll('#h-about .label-rule')).map((r) => { const b = r.getBoundingClientRect(); return { w: b.width, h: b.height, t: getComputedStyle(r).transform }; }));
    for (const r of rules) { expect(r.w).toBeGreaterThan(40); expect(r.h).toBeGreaterThanOrEqual(1); expect(r.t === 'none' || /matrix\(1,/.test(r.t)).toBe(true); }
    // v17: the footer has no label and no rule; calm space separates it
    expect(parseFloat(await page.evaluate(() => getComputedStyle(document.querySelector('.foot') as HTMLElement).borderTopWidth))).toBe(0);
    // nothing in the page draws a full-width rule directly above a label (the "double divider")
    const doubles = await page.evaluate(() => Array.from(document.querySelectorAll('.v17 section')).filter((el) => parseFloat(getComputedStyle(el).borderTopWidth) > 0 && el.querySelector(':scope > .label')).map((el) => el.id));
    expect(doubles).toEqual([]);
  });

  test('a missing audio asset reports failure honestly without fake progress', async ({ page }) => {
    await page.route('**/audio/on2nite.mp3', route => route.fulfill({ status: 404, body: 'not found' }));
    await open18(page);
    await page.locator('#bar-play').click();
    await expect(page.locator('#bar')).toHaveAttribute('data-state', 'error');
    await expect(page.locator('#bar-status')).toContainText('Could not load Silva Bumpa - On2nite');
    expect(await page.locator('#player-audio').getAttribute('src')).toBeNull();
    await expect(page.locator('#player-range')).toBeDisabled();
    await expect(page.locator('#player-cur')).toHaveText('0:00');
  });

  test('hero entrance: timed ink, 250 ms beat, letters settle by about 1.6 s', async ({ browser }, testInfo) => {
    const ctx = await browser.newContext({ viewport: testInfo.project.use.viewport, isMobile: testInfo.project.use.isMobile, hasTouch: testInfo.project.use.hasTouch });
    const page = await ctx.newPage();
    await page.goto(PATH, { waitUntil: 'commit' });
    await page.waitForSelector('#hero-name .il');
    const t0 = Date.now();
    const early = await page.evaluate(() => ({ cls: (document.querySelector('#hero-name') as HTMLElement).className, ms: performance.now() }));
    if (early.ms < 230) expect(early.cls).not.toContain('on');
    await page.waitForTimeout(Math.max(0, 600 - (Date.now() - t0)));
    const mid = await minLetterOpacity(page, '#hero-line');
    const midName = await page.evaluate(() => { const ls = Array.from(document.querySelectorAll('#hero-name .il')).map((l) => parseFloat(getComputedStyle(l).opacity)); return { max: Math.max(...ls), min: Math.min(...ls) }; });
    expect(midName.max).toBeGreaterThan(0.05);
    expect(mid).toBeLessThan(1);
    const spec = await page.evaluate(() => { const cs = getComputedStyle(document.querySelector('#hero-name .il') as HTMLElement); return { dur: cs.animationDuration, tf: cs.animationTimingFunction, name: cs.animationName }; });
    expect(spec).toEqual({ dur: '0.9s', tf: 'cubic-bezier(0.2, 0, 0, 1)', name: 'v17ink' });
    await page.waitForTimeout(Math.max(0, 1900 - (Date.now() - t0)));
    expect(await minLetterOpacity(page, '#hero-name')).toBeGreaterThan(0.99);
    expect(await minLetterOpacity(page, '#hero-line')).toBeGreaterThan(0.99);
    await expect(page.locator('.chrome-nav a').first()).toBeVisible();
    await expect(page.locator('#bar-play')).toBeVisible();
    await page.reload({ waitUntil: 'commit' });
    await page.waitForSelector('#hero-name .il');
    expect(await page.locator('#hero-name').getAttribute('class')).toContain('set');
    await ctx.close();
  });

  test('leaving smears, coming back re-inks; a flick settles at once', async ({ page }) => {
    await open18(page);
    const vh = await page.evaluate(() => window.innerHeight);
    const y = (await topOf(page, '#about-1')) - vh * 0.45;
    await creepTo(page, y);
    await page.waitForTimeout(2200);
    expect(await minLetterOpacity(page, '#about-1')).toBeGreaterThan(0.99);
    const h = await page.evaluate(() => (document.querySelector('#about-1') as HTMLElement).getBoundingClientRect().height);
    await creepTo(page, y + vh * 0.45 + h + 20);
    await page.waitForTimeout(100);
    expect(await page.locator('#about-1').getAttribute('class')).toContain('off');
    const smear = await page.evaluate(() => { const cs = getComputedStyle(document.querySelector('#about-1 .il') as HTMLElement); return { name: cs.animationName, dur: cs.animationDuration }; });
    expect(smear).toEqual({ name: 'v17smear', dur: '0.45s' });
    await page.waitForTimeout(800);
    expect(await minLetterOpacity(page, '#about-1')).toBeLessThan(0.01);
    await page.evaluate(() => {
      const el = document.querySelector('#about-1') as HTMLElement;
      (window as any).__reink = null;
      new MutationObserver(() => {
        if (!el.classList.contains('on') || (window as any).__reink) return;
        (window as any).__reink = { at: performance.now(), min: -1 };
        setTimeout(() => { let min = 1; el.querySelectorAll('.il').forEach((l) => { min = Math.min(min, parseFloat(getComputedStyle(l).opacity)); }); (window as any).__reink.min = min; }, 120);
      }).observe(el, { attributes: true, attributeFilter: ['class'] });
    });
    await creepTo(page, y);
    await page.waitForTimeout(200);
    expect(await page.locator('#about-1').getAttribute('class')).toContain('on');
    const reink = await page.evaluate(() => (window as any).__reink);
    expect(reink).not.toBeNull();
    expect(reink.min, 'letters mid-ink 120 ms after re-entry').toBeLessThan(1);
    await page.waitForTimeout(2200);
    expect(await minLetterOpacity(page, '#about-1')).toBeGreaterThan(0.99);
    // flick
    const yy = (await topOf(page, '#grp-agent-tooling')) - 100;
    await page.evaluate((t) => window.scrollTo({ top: t, behavior: 'instant' }), yy);
    await page.waitForTimeout(120);
    const r = await page.evaluate(() => {
      const out: { id: string; cls: string; min: number }[] = [];
      document.querySelectorAll('[data-ink]').forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.1) {
          let min = 1;
          el.querySelectorAll('.il').forEach((l) => { const o = parseFloat(getComputedStyle(l).opacity); if (o < min) min = o; });
          out.push({ id: el.id || el.className, cls: el.className, min });
        }
      });
      return out;
    });
    expect(r.length).toBeGreaterThan(2);
    for (const row of r) { expect(row.cls, `${row.id} settled`).toContain('set'); expect(row.min, `${row.id} opacity`).toBeGreaterThan(0.99); }
  });

  test('motion inside the project visuals survives the two-column layout: clip entrance, slow pan, frame never shows', async ({ page }, testInfo) => {
    await open18(page);
    const y = (await topOf(page, '#proj-thaw')) - 90;
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
    await page.waitForTimeout(150);
    await expect(page.locator('#proj-thaw .proj-media')).toHaveClass(/in/);
    expect(await page.locator('#proj-thaw .proj-media .vis').evaluate((el) => getComputedStyle(el).transitionDuration)).toContain('1.8s');
    const img = page.locator('#proj-thaw .proj-media img');
    const anim = await img.evaluate((el) => ({ name: getComputedStyle(el).animationName, dur: getComputedStyle(el).animationDuration }));
    expect(anim.name).toMatch(/^v17panm?$/);
    expect(parseFloat(anim.dur)).toBeGreaterThan(8);
    const t1 = await img.evaluate((el) => getComputedStyle(el).transform);
    await page.waitForTimeout(1200);
    expect(await img.evaluate((el) => getComputedStyle(el).transform)).not.toBe(t1);
    await page.waitForTimeout(2200);
    const safe = await page.evaluate(() => {
      const out: { id: string; frame: number; img: number; travel: number; sideCut: number; sideAllowed: number; topAtRest: number }[] = [];
      document.querySelectorAll('.proj-media').forEach((f) => {
        const im = f.querySelector('img') as HTMLImageElement;
        const fr = (f.querySelector('.vis') as HTMLElement).getBoundingClientRect();
        const ir = im.getBoundingClientRect();
        const travel = Math.abs(parseFloat(getComputedStyle(im).getPropertyValue('--travel'))) / 100 * ir.height;
        out.push({ id: f.closest('article')!.id, frame: fr.height, img: ir.height, travel, sideCut: (ir.width - fr.width) / 2 / ir.width, sideAllowed: parseFloat((f as HTMLElement).dataset.side!), topAtRest: parseFloat(getComputedStyle(im).top) });
      });
      return out;
    });
    const phone = testInfo.project.name === 'mobile-390';
    const stacked = (testInfo.project.use.viewport?.width || 1440) <= 900;
    const least: Record<string, number> = phone
      ? { 'proj-thaw': 0.09, 'proj-relayiq': 0.12, 'proj-foreman': 0.25, 'proj-tell': 0.13, 'proj-delivery-doctor': 0.03 }
      : { 'proj-thaw': 0.23, 'proj-relayiq': 0.25, 'proj-foreman': 0.25, 'proj-tell': 0.25, 'proj-delivery-doctor': 0.15 };
    expect(safe.map((s) => s.id).sort()).toEqual(Object.keys(least).sort());
    for (const s of safe) {
      expect(s.img - s.frame + 1, `${s.id} overflow covers the whole travel`).toBeGreaterThanOrEqual(s.travel);
      expect(s.topAtRest, `${s.id} starts at the top edge`).toBe(0);
      expect(s.sideCut, `${s.id} side cut within its band`).toBeLessThanOrEqual(s.sideAllowed + 0.003);
      expect(s.travel / s.frame, `${s.id} travel as a share of the frame`).toBeGreaterThanOrEqual(least[s.id]);
    }
  });

  test('no runtime errors, no console errors, no horizontal overflow', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await open18(page);
    const widths: number[] = [];
    await page.evaluate(async () => {
      const h = document.documentElement.scrollHeight;
      for (let y = 0; y <= h; y += 400) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 30)); }
    });
    widths.push(await page.evaluate(() => document.documentElement.scrollWidth));
    await page.waitForTimeout(400);
    expect(errors).toEqual([]);
    const iw = await page.evaluate(() => window.innerWidth);
    for (const w of widths) expect(w).toBeLessThanOrEqual(iw + 1);
  });

  test('reduced motion: no splitting, no pan, everything visible, the bar still works as a plain control', async ({ browser }, testInfo) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: testInfo.project.use.viewport, isMobile: testInfo.project.use.isMobile, hasTouch: testInfo.project.use.hasTouch });
    const page = await ctx.newPage();
    await page.goto(PATH, { waitUntil: 'networkidle' });
    await expect(page.locator('html.ink-js')).toHaveCount(0);
    await expect(page.locator('#life-line .il')).toHaveCount(0);
    const v = await page.evaluate(() => {
      const el = document.querySelector('#life-line') as HTMLElement;
      const img = document.querySelector('#proj-thaw .proj-media img') as HTMLElement;
      const vis = document.querySelector('#proj-thaw .proj-media .vis') as HTMLElement;
      return { opacity: parseFloat(getComputedStyle(el).opacity), h: el.getBoundingClientRect().height, anim: getComputedStyle(img).animationName, clip: getComputedStyle(vis).clipPath, dot: getComputedStyle(document.querySelector('.stamp-dot') as HTMLElement).animationName, name: parseFloat(getComputedStyle(document.querySelector('#hero-name') as HTMLElement).opacity) };
    });
    expect(v).toMatchObject({ opacity: 1, anim: 'none', clip: 'none', dot: 'none', name: 1 });
    expect(v.h).toBeGreaterThan(10);
    for (const t of await page.evaluate(() => Array.from(document.querySelectorAll('.label-rule')).map((r) => getComputedStyle(r).transform))) expect(t).toBe('none');
    await expect(page.locator('#bar-play')).toBeEnabled();
    await page.locator('#bar-prev').click();
    await expect(page.locator('#bar-status')).toHaveText('Selected: KETTAMA - Pretty Green Eyes (Sunset Ibiza Mix). Press play.');
    expect(await page.locator('#player-audio').getAttribute('src')).toBeNull();
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('.tile') as HTMLElement).transitionDuration)).toBe('0s');
    await ctx.close();
  });

  test('no JavaScript: every word readable, visuals shown, the bar honest and disabled, category links still jump', async ({ browser }, testInfo) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport, isMobile: testInfo.project.use.isMobile, hasTouch: testInfo.project.use.hasTouch });
    const page = await ctx.newPage();
    await page.goto(PATH, { waitUntil: 'networkidle' });
    await expect(page.locator('.il')).toHaveCount(0);
    const v = await page.evaluate(() => ['hero-name', 'hero-line', 'hero-p', 'about-1', 'life-line', 'exp-0'].map((id) => { const el = document.getElementById(id) as HTMLElement; const cs = getComputedStyle(el); return { id, o: parseFloat(cs.opacity), vis: cs.visibility, h: el.getBoundingClientRect().height }; }));
    for (const r of v) { expect(r.o, r.id).toBe(1); expect(r.vis, r.id).toBe('visible'); expect(r.h, r.id).toBeGreaterThan(10); }
    expect(await page.evaluate(() => getComputedStyle(document.querySelector('#proj-thaw .proj-media .vis') as HTMLElement).clipPath)).toBe('none');
    await expect(page.locator('#bar-status')).toHaveText('No track loaded');
    for (const id of ['#bar-play', '#bar-prev', '#bar-next', '#player-range']) await expect(page.locator(id)).toBeDisabled();
    await expect(page.locator('#player-tracks .track:disabled')).toHaveCount(8);
    await expect(page.locator('#all-work-cats a')).toHaveCount(5);
    await page.locator('#all-work-cats a[href="#grp-sports"]').click();
    await page.waitForTimeout(250);
    const c = await page.evaluate(() => ({ hash: location.hash, gap: document.querySelector('#grp-sports')!.getBoundingClientRect().top - document.querySelector('.chrome')!.getBoundingClientRect().bottom }));
    expect(c.hash).toBe('#grp-sports');
    expect(c.gap).toBeGreaterThanOrEqual(0);
    await ctx.close();
  });
});

test('confirmed metrics: current Eurofins scale, Tell outcomes and ECE computers and servers', async ({ page }, testInfo) => {
  await open18(page);
  await expect(page.locator('#more-eurofins .row-m')).toContainText('100,000+ records');
  await expect(page.locator('#more-eurofins .row-l')).toContainText('lab technicians still use');
  const outcome = '40+ clients tracked funded companies and found customers with it and reported closing deals.';
  await expect(page.locator('#proj-tell .proj-d')).toContainText(outcome);
  await expect(page.locator('#all-tell .row-l')).toContainText(outcome);
  await expect(page.locator('body')).toContainText('1,500+ computers and servers');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.locator('#proj-tell').scrollIntoViewIfNeeded();
  await page.locator('#proj-tell').screenshot({ path: `/tmp/metrics-${testInfo.project.name}-tell.png` });
  await page.locator('#grp-in-use').scrollIntoViewIfNeeded();
  await page.locator('#grp-in-use').screenshot({ path: `/tmp/metrics-${testInfo.project.name}-eurofins.png` });
  await page.locator('#all-tell').scrollIntoViewIfNeeded();
  await page.locator('#all-tell').screenshot({ path: `/tmp/metrics-${testInfo.project.name}-all-tell.png` });
  await page.locator('#experience').scrollIntoViewIfNeeded();
  await page.locator('#experience').screenshot({ path: `/tmp/metrics-${testInfo.project.name}-footer.png` });
});
