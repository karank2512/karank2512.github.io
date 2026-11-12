import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// The essays section: the index lists every essay newest first, each entry
// links to its page, and both pages carry the site's Dawn identity (EB
// Garamond, the saved theme, the same toggle behavior as the home page).
test.describe('essays: index and essay pages', () => {
  test('the index lists each essay with its title, year, hook and topics', async ({ page }) => {
    await page.goto('/essays', { waitUntil: 'networkidle' });
    await expect(page).toHaveTitle('Essays - Karan Kapur');
    await expect(page.locator('h1.page-title')).toHaveText('Essays');
    const rows = page.locator('.essay-row');
    await expect(rows).toHaveCount(1);
    const link = rows.first().locator('.essay-title a');
    await expect(link).toHaveAttribute('href', '/essays/relayiq');
    await expect(rows.first().locator('.essay-year')).toHaveText('2026');
    await expect(rows.first().locator('.essay-hook')).not.toBeEmpty();
    await expect(rows.first().locator('.essay-topics')).not.toBeEmpty();
    // the way back to the home page, and a canonical URL for search
    await expect(page.locator('.chrome-name')).toHaveAttribute('href', '/');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://karankapur.com/essays/');
  });

  test('an essay page renders its title, date and prose, and links back to the index', async ({ page }) => {
    await page.goto('/essays/relayiq', { waitUntil: 'networkidle' });
    await expect(page.locator('h1.essay-title')).not.toBeEmpty();
    await expect(page.locator('.essay-meta')).toContainText('2026');
    await expect(page.locator('.essay-body p').first()).not.toBeEmpty();
    await expect(page.locator('.essay-back a')).toHaveAttribute('href', '/essays');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://karankapur.com/essays/relayiq/');
    // one h1 per page, and the prose uses the reading face
    await expect(page.locator('h1')).toHaveCount(1);
    const family = await page.evaluate(() => getComputedStyle(document.querySelector('.essay-body') as HTMLElement).fontFamily);
    expect(family).toContain('EB Garamond');
  });

  test('the theme toggle on essays pages mirrors the home behavior and persists the choice', async ({ page }) => {
    await page.goto('/essays', { waitUntil: 'networkidle' });
    // night is the default
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.locator('#theme-toggle').click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    expect(await page.evaluate(() => localStorage.getItem('kk-theme'))).toBe('light');
    // the saved choice survives navigation to an essay page
    await page.locator('.essay-title a').first().click();
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
