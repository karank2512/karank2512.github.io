import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test.describe('site invariants', () => {
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
    expect(urls).toEqual([
      '<loc>https://karankapur.com/</loc>',
      '<loc>https://karankapur.com/essays/</loc>',
      '<loc>https://karankapur.com/essays/relayiq/</loc>',
      '<loc>https://karankapur.com/essays/retries-mid-refund/</loc>',
    ]);

    await page.goto('/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://karankapur.com/');
    await expect(page.locator('meta[name="robots"]')).toHaveCount(0);
    await expect(page.locator('h1')).toHaveCount(1);
    const blocks = page.locator('script[type="application/ld+json"]');
    await expect(blocks).toHaveCount(1);
    const data = JSON.parse((await blocks.textContent()) ?? '{}');
    expect(data['@type']).toBe('ProfilePage');
    // dateModified is a full ISO 8601 DateTime with a timezone offset (Google types it DateTime,
    // and a date-only value fails Search Console), and it is when the profile content was last
    // edited, not the build time
    expect(data.dateModified).toBe('2026-11-09T15:20:00+13:00');
    expect(data.dateModified).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/);
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
  test('every image declares width and height and has alt text', async ({ page }) => {
    await page.goto('/');
    const missing = await page.$$eval('img', (imgs) =>
      imgs.filter((i) => !i.getAttribute('width') || !i.getAttribute('height') || i.getAttribute('alt') === null).map((i) => i.getAttribute('src')),
    );
    expect(missing).toEqual([]);
  });
  test('respects prefers-reduced-motion: the stamp dot stays still', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const running = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running').length);
    expect(running).toBe(0);
  });
});
