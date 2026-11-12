import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The essays section: the index lists every essay newest first, each entry
// links to its page, and both pages wear the section's Abhay-modeled skin
// (STIX Two Text, his paper and ink, the saved theme, the same toggle
// behavior as the home page).
test.describe('essays: index and essay pages', () => {
  test('the index lists each essay with its title, year, hook and topics', async ({ page }) => {
    await page.goto('/essays', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle('Essays - Karan Kapur');
    await expect(page.locator('.story h1')).toHaveText('Essays');
    const rows = page.locator('.list li');
    await expect(rows).toHaveCount(1);
    const link = rows.first().locator('a').first();
    await expect(link).toHaveAttribute('href', '/essays/relayiq/');
    await expect(link.locator('h2')).not.toBeEmpty();
    await expect(link.locator('time')).toHaveText('2026');
    await expect(link.locator('p')).not.toBeEmpty();
    await expect(link.locator('.meta')).not.toBeEmpty();
    // the way back to the home page, and a canonical URL for search
    await expect(page.locator('.chrome-mark')).toHaveAttribute('href', '/');
    await expect(page.locator('.crumb a').first()).toHaveAttribute('href', '/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://karankapur.com/essays/');
  });

  test('an essay page renders its title, date and prose, and links back to the index', async ({ page }) => {
    await page.goto('/essays/relayiq', { waitUntil: 'networkidle' });
    await expect(page.locator('.story h1')).not.toBeEmpty();
    await expect(page.locator('.byline')).toContainText('2026');
    await expect(page.locator('.essay p').first()).not.toBeEmpty();
    await expect(page.locator('.jump a').first()).toHaveAttribute('href', '/essays/');
    await expect(page.locator('.crumb a').nth(1)).toHaveAttribute('href', '/essays/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://karankapur.com/essays/relayiq/');
    // one h1 per page, and the prose uses the section's reading face
    await expect(page.locator('h1')).toHaveCount(1);
    const family = await page.evaluate(() => getComputedStyle(document.querySelector('.essay') as HTMLElement).fontFamily);
    expect(family).toContain('STIX Two Text');
  });

  test('the theme toggle on essays pages mirrors the home behavior and persists the choice', async ({ page }) => {
    await page.goto('/essays', { waitUntil: 'networkidle' });
    // night is the default
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await page.evaluate(() => localStorage.getItem('kk-theme'))).toBe('light');
    // the saved choice survives navigation to an essay page
    await page.locator('.list li a').first().click();
    await page.waitForLoadState('networkidle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });

  test('no serious or critical axe violations on the essays pages', async ({ page }) => {
    for (const path of ['/essays', '/essays/relayiq']) {
      await page.goto(path, { waitUntil: 'networkidle' });
      const results = await new AxeBuilder({ page }).analyze();
      const serious = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      expect(serious.map((v) => `${path}: ${v.id}`)).toEqual([]);
    }
  });
});
