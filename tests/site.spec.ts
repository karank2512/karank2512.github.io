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
    // The hero drawing, the background field and the sound bars are all off,
    // and the drawing sits in its finished state.
    const field = await page.locator('.field').evaluate((el) => getComputedStyle(el).animationName);
    expect(field).toBe('none');
    const stroke = await page
      .locator('#session .draw')
      .first()
      .evaluate((el) => ({ name: getComputedStyle(el).animationName, offset: getComputedStyle(el).strokeDashoffset }));
    expect(stroke.name).toBe('none');
    expect(parseFloat(stroke.offset)).toBe(0);
    await page.locator('#snd').click();
    const bar = await page.locator('.bars i').first().evaluate((el) => getComputedStyle(el).animationName);
    expect(bar).toBe('none');
  });

  test('the fork button adds a branch to the hero graphic', async ({ page }) => {
    await page.goto('/');
    const extra = page.locator('#extra > *');
    await expect(extra).toHaveCount(0);
    await page.locator('#fork-btn').click();
    await expect(extra).toHaveCount(3);
    await expect(page.locator('#fork-btn')).toHaveText(/again/);
  });

  test('captures a reference screenshot', async ({ page }, testInfo) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const shot = await page.screenshot({ fullPage: true });
    await testInfo.attach(`home-${testInfo.project.name}`, { body: shot, contentType: 'image/png' });
  });
});
