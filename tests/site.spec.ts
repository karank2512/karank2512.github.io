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
    await page.locator('#snd').click();
    const animation = await page.locator('.disc').evaluate((el) => getComputedStyle(el).animationName);
    expect(animation).toBe('none');
  });

  test('captures a reference screenshot', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const shot = await page.screenshot({ fullPage: true });
    await testInfo.attach(`home-${testInfo.project.name}`, { body: shot, contentType: 'image/png' });
  });
});
