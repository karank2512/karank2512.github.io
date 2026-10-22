import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** The one link about music: the Spotify playlist, in "Off the clock". */
const PLAYLIST = { label: "Songs I'm listening to lately", url: 'https://open.spotify.com/playlist/3RQb1MUtERqcwUlZdncPRN' };

type Box = { x: number; y: number; width: number; height: number };
const fmt = (b: Box): string => `x ${b.x.toFixed(0)} y ${b.y.toFixed(0)} w ${b.width.toFixed(0)} h ${b.height.toFixed(0)}`;

/** The page body never scrolls sideways. */
async function noSideScroll(page: Page): Promise<void> {
  const [sw, cw] = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
  expect(sw, `scrollWidth ${sw} within clientWidth ${cw}`).toBeLessThanOrEqual(cw);
}

test.describe('home page', () => {
  test('has no serious or critical axe violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    await testInfo.attach('axe', { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
    expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  });

  test('search engines get a sitemap, a canonical link and one Person structured-data block', async ({ page, request }) => {
    const robots = await request.get('/robots.txt');
    expect(robots.ok()).toBe(true);
    expect(await robots.text()).toContain('Sitemap: https://karankapur.com/sitemap-index.xml');
    const index = await request.get('/sitemap-index.xml');
    expect(index.ok()).toBe(true);
    expect(await index.text()).toContain('https://karankapur.com/sitemap-0.xml');
    const sitemap = await request.get('/sitemap-0.xml');
    expect(sitemap.ok()).toBe(true);
    const urls = (await sitemap.text()).match(/<loc>([^<]+)<\/loc>/g) ?? [];
    expect(urls).toEqual(['<loc>https://karankapur.com/</loc>']);

    await page.goto('/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://karankapur.com/');
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('h1')).toHaveCount(1);
    const blocks = page.locator('script[type="application/ld+json"]');
    await expect(blocks).toHaveCount(1);
    const data = JSON.parse((await blocks.textContent()) ?? '{}');
    expect(data['@type']).toBe('ProfilePage');
    expect(data.mainEntity['@type']).toBe('Person');
    expect(data.mainEntity.name).toBe('Karan Kapur');
    expect(data.mainEntity.sameAs).toEqual(['https://github.com/karank2512', 'https://www.linkedin.com/in/karankapur5']);
    // the job title belongs to the employer in worksFor, whichever role is listed first
    expect(data.mainEntity.jobTitle).toBe('Co-founder and cloud storage engineer, thaw');
    expect(data.mainEntity.worksFor.name).toBe('thaw');
    // no number is claimed in structured data; the bullets on the page carry them
    expect(JSON.stringify(data)).not.toMatch(/\d+(\.\d+)?\s?(GB\/s|s\b|×|x\b)/);

    const notFound = await page.goto('/404.html');
    expect(notFound?.ok()).toBe(true);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });

  test('renders the approved hero: name, tagline, four intro bullets, three stamps, four buttons', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('KaranKapur');
    await expect(page.locator('#hero .role')).toHaveText('Engineer. Co-founder of thaw. Based in Madison, WI. Open to relocating in the US.');
    const intro = page.locator('#hero .intro li');
    await expect(intro).toHaveCount(4);
    await expect(intro.nth(0)).toContainText('I started coding to settle an argument with my dad about IPL.');
    await expect(intro.nth(3)).toHaveText("I'm looking for a founding engineer, forward deployed or GTM engineering role at an AI startup.");
    await expect(intro.nth(1).getByRole('link', { name: 'thaw' })).toHaveAttribute('href', '#thaw');
    await expect(intro.nth(1).getByRole('link', { name: 'RelayIQ' })).toHaveAttribute('href', '#relayiq');
    await expect(page.locator('#hero .targets li')).toHaveText(['Founding engineer', 'Forward deployed', 'GTM engineering']);
    const acts = page.locator('#hero .acts a');
    await expect(acts).toHaveText(['Email me', 'Resume', 'GitHub', 'LinkedIn']);
    await expect(acts.nth(0)).toHaveAttribute('href', 'mailto:kkapur5@wisc.edu');
    await expect(acts.nth(1)).toHaveAttribute('href', '/resume.pdf');
    await expect(acts.nth(2)).toHaveAttribute('href', 'https://github.com/karank2512');
    await expect(acts.nth(3)).toHaveAttribute('href', 'https://www.linkedin.com/in/karankapur5');
  });

  test('the headshot is in the hero, sized, prioritised and served as webp', async ({ page }) => {
    await page.goto('/');
    const pic = page.locator('#hero .pic img');
    await expect(pic).toHaveAttribute('alt', /Karan Kapur/);
    await expect(pic).toHaveAttribute('width', '300');
    await expect(pic).toHaveAttribute('height', '400');
    await expect(pic).toHaveAttribute('fetchpriority', 'high');
    await expect(pic).toHaveAttribute('src', /\.webp$/);
    const box = await pic.boundingBox();
    expect(box!.width, 'the frame never asks the 300px source for more than its size at 1x').toBeLessThanOrEqual(300);
  });

  test('sections run hero, projects, experience, skills, life, contact, and the nav matches', async ({ page }) => {
    await page.goto('/');
    const ids = await page.$$eval('main > section', (els) => els.map((el) => el.id));
    expect(ids).toEqual(['hero', 'projects', 'experience', 'skills', 'life', 'contact']);
    const nav = page.getByRole('navigation', { name: 'Sections' });
    await expect(nav.getByRole('link')).toHaveText(['Projects', 'Experience', 'Skills', 'Off the clock', 'Contact']);
  });

  test('five posters on equal footing, in order, each in its own tone, with real repo links', async ({ page }, testInfo) => {
    await page.goto('/');
    const posters = page.locator('#projects .poster');
    await expect(posters).toHaveCount(5);
    expect(await posters.evaluateAll((els) => els.map((el) => el.id))).toEqual(['thaw', 'relayiq', 'foreman', 'tell', 'delivery-doctor']);
    const tones = await posters.evaluateAll((els) => els.map((el) => [...el.classList].filter((c) => c !== 'poster').join('')));
    expect(new Set(tones).size, `tones ${tones.join(', ')} are all different`).toBe(5);
    // no poster is wider than another, and in two columns no poster is taller than its row mate
    const boxes = (await Promise.all((await posters.all()).map((p) => p.boundingBox()))) as Box[];
    const widths = new Set(boxes.map((b) => Math.round(b.width)));
    expect(widths.size, boxes.map(fmt).join('\n')).toBe(1);
    if (testInfo.project.name !== 'mobile-390') {
      expect(Math.round(boxes[0]!.height)).toBe(Math.round(boxes[1]!.height));
      expect(Math.round(boxes[2]!.height)).toBe(Math.round(boxes[3]!.height));
    }
    const hrefs = (n: number) => posters.nth(n).locator('.foot a').evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(await hrefs(0)).toEqual(['https://github.com/thaw-ai/thaw', 'https://thaw.sh']);
    expect(await hrefs(1)).toEqual(['https://github.com/karank2512/RelayIQ']);
    expect(await hrefs(2)).toEqual(['https://github.com/karank2512/Foreman']);
    expect(await hrefs(3)).toEqual(['https://github.com/karank2512/tell-ai', 'https://github.com/karank2512/tell-data']);
    expect(await hrefs(4)).toEqual(['https://github.com/karank2512/delivery-doctor']);
    // the thaw fork number and tell's job-board finding carry their public receipts
    await expect(posters.nth(0).getByRole('link', { name: 'Receipt' })).toHaveAttribute('href', /thaw-ai\/thaw\/blob\/main\/site\/receipts/);
    await expect(posters.nth(3).getByRole('link', { name: 'Receipt' })).toHaveAttribute('href', 'https://github.com/karank2512/tell-ai/blob/main/docs/methods/snapshot-2026-10-14.md');
  });

  test('every role and leadership entry is a row with dates, org and at least one bullet', async ({ page }) => {
    await page.goto('/');
    const rows = page.locator('#experience .roles > li');
    await expect(rows).toHaveCount(8);
    await expect(rows.nth(0).locator('.r .d')).toHaveText('Data analyst');
    await expect(rows.nth(0).locator('.o')).toContainText('Wisconsin Union');
    await expect(rows.nth(1).locator('.r .d')).toHaveText('Co-founder and cloud storage engineer');
    await expect(rows.nth(2).locator('.r .d')).toHaveText('Software engineer, senior capstone');
    await expect(rows.nth(2).locator('.o')).toContainText('Eurofins Scientific');
    await expect(rows.nth(6).locator('.r .d')).toHaveText('VP, National Executive Council');
    for (const row of await rows.all()) {
      await expect(row.locator('.w')).toHaveText(/\w+ \d{4} to (\w+ \d{4}|Present)/);
      await expect(row.locator('.bul li')).not.toHaveCount(0);
    }
    await expect(page.locator('#experience .edu')).toContainText('Minor in Entrepreneurship');
    await expect(page.locator('#skills .skills li')).toHaveCount(3);
  });

  test('"Off the clock" shows four unlabelled photos and the one playlist link', async ({ page }) => {
    await page.goto('/');
    const strip = page.locator('#life .strip li');
    await expect(strip).toHaveCount(4);
    await expect(page.locator('#life figcaption')).toHaveCount(0);
    for (const li of await strip.all()) {
      const img = li.locator('img');
      await expect(img).toHaveAttribute('alt', /Karan/);
      await expect(img).toHaveAttribute('loading', 'lazy');
      await expect(img).toHaveAttribute('src', /\.webp$/);
    }
    await expect(page.locator('a[href*="spotify"]')).toHaveCount(1);
    const link = page.locator('#life').getByRole('link', { name: PLAYLIST.label });
    await expect(link).toHaveAttribute('href', PLAYLIST.url);
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', /noopener/);
  });

  test('contact links are real', async ({ page }) => {
    await page.goto('/');
    const links = page.locator('#contact a');
    await expect(links).toHaveText(['kkapur5@wisc.edu', 'GitHub', 'LinkedIn', 'Resume, PDF']);
    await expect(links.nth(0)).toHaveAttribute('href', 'mailto:kkapur5@wisc.edu');
    await expect(links.nth(3)).toHaveAttribute('href', '/resume.pdf');
    const pdf = await page.request.get('/resume.pdf');
    expect(pdf.ok()).toBe(true);
  });

  test('loads no script, no third-party request, no iframe, no audio, ever', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const origin = new URL(page.url()).origin;
    const foreign = () => requests.filter((u) => !u.startsWith(origin) && !u.startsWith('data:'));
    expect(foreign(), 'nothing off-origin on load').toEqual([]);
    expect(requests.filter((u) => /\.js(\?|$)/.test(u)), 'no script on the wire').toEqual([]);
    await expect(page.locator('script:not([type="application/ld+json"])')).toHaveCount(0);
    await expect(page.locator('iframe, audio, video, embed, object')).toHaveCount(0);
    const html = await page.content();
    for (const re of [/soundcloud/i, /<iframe/i, /<audio/i, /auto_play/i]) {
      expect(html, `the page holds no ${re}`).not.toMatch(re);
    }
    for (const id of ['#projects', '#experience', '#life', '#contact']) {
      await page.locator(id).scrollIntoViewIfNeeded();
    }
    await page.waitForLoadState('networkidle');
    expect(foreign(), 'nothing off-origin after scrolling the page').toEqual([]);
  });

  test('every image declares width and height and has alt text', async ({ page }) => {
    await page.goto('/');
    const missing = await page.$$eval('img', (imgs) =>
      imgs.filter((i) => !i.getAttribute('width') || !i.getAttribute('height') || i.getAttribute('alt') === null).map((i) => i.getAttribute('src')),
    );
    expect(missing).toEqual([]);
  });

  test('nothing scrolls sideways and the name, the photo and the buttons share the first screen', async ({ page }, testInfo) => {
    await page.goto('/');
    await noSideScroll(page);
    const vh = testInfo.project.use.viewport!.height;
    const h1 = (await page.locator('h1').boundingBox())!;
    expect(h1.y, 'the name starts on the first screen').toBeLessThan(vh / 2);
    if (testInfo.project.name === 'desktop-1440') {
      const email = (await page.locator('#hero .acts a').first().boundingBox())!;
      expect(email.y + email.height, `Email me ${fmt(email)} inside the first 900px`).toBeLessThanOrEqual(vh + 1);
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await noSideScroll(page);
  });

  test('respects prefers-reduced-motion: the stamp dot stays still', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
    expect(running).toBe(0);
  });

  test('captures a reference screenshot', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot({ fullPage: true });
    await testInfo.attach('full-page', { body: png, contentType: 'image/png' });
  });
});
