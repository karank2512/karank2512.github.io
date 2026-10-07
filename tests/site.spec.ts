import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('home page', () => {
  test('has no serious or critical axe violations', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
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

  test('loads no third-party iframe until the play control is pressed', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('iframe')).toHaveCount(0);
    const button = page.locator('#snd');
    await expect(button).toHaveAccessibleName(/Press play/);
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    const frame = page.locator('iframe');
    await expect(frame).toHaveCount(1);
    await expect(frame).toHaveAttribute('src', /open\.spotify\.com\/embed\/playlist\/3RQb1MUtERqcwUlZdncPRN/);
    await button.click();
    await expect(page.locator('iframe')).toHaveCount(0);
  });

  test('every image declares width and height', async ({ page }) => {
    await page.goto('/');
    const missing = await page.$$eval('img', (imgs) =>
      imgs.filter((i) => !i.getAttribute('width') || !i.getAttribute('height')).map((i) => i.getAttribute('src')),
    );
    expect(missing).toEqual([]);
  });

  test('respects prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    // The background field and the sound bars are off, the hero copy sits in
    // its finished state, and the tour is a static list of captions.
    const field = await page.locator('.field').evaluate((el) => getComputedStyle(el).animationName);
    expect(field).toBe('none');
    const h1 = await page.locator('h1 .l').first().evaluate((el) => getComputedStyle(el).opacity);
    expect(parseFloat(h1)).toBe(1);
    const stick = await page.locator('#tour-stick').evaluate((el) => getComputedStyle(el).position);
    expect(stick).toBe('static');
    await page.locator('#snd').click();
    const bar = await page.locator('.bars i').first().evaluate((el) => getComputedStyle(el).animationName);
    expect(bar).toBe('none');
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

  test('the static lattice is in the DOM before any scene loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#stage svg.fb')).toHaveCount(1);
    await expect(page.locator('#tour-stage svg.fb')).toHaveCount(1);
  });

  test('project cards link to the public repos and tell has no link', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('#cards .slot');
    await expect(cards).toHaveCount(4);
    await expect(page.locator('#cards a.card', { hasText: 'RelayIQ' })).toHaveAttribute('href', 'https://github.com/karank2512/RelayIQ');
    await expect(page.locator('#cards a.card', { hasText: 'Foreman' })).toHaveAttribute('href', 'https://github.com/karank2512/Foreman');
    await expect(page.locator('#cards a.card', { hasText: 'thaw' })).toHaveAttribute('href', 'https://github.com/thaw-ai/thaw');
    await expect(page.locator('#cards div.card', { hasText: 'tell' })).toHaveCount(1);
  });

  test('the tour captions follow the scroll', async ({ page }) => {
    await page.goto('/');
    const caps = page.locator('#tour-caps .cap');
    await expect(caps).toHaveCount(5);
    await expect(caps.nth(0)).toHaveClass(/on/);
    await page.locator('#projects').scrollIntoViewIfNeeded();
    await expect(caps.nth(4)).toHaveClass(/on/);
  });

  test('captures a reference screenshot', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const shot = await page.screenshot({ fullPage: true });
    await testInfo.attach(`home-${testInfo.project.name}`, { body: shot, contentType: 'image/png' });
  });
});
