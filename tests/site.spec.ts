import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** The visible sound control: the turntable button on wide fine-pointer screens, the touch button otherwise. */
const playButton = (page: Page) => page.locator('button.snd:visible');

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

  test('phone: Press play and Contact me share the first screen', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile-390', 'phone layout only');
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // The phone project emulates touch, so the touch button is the one shown.
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
    // Let the hero entrance finish so the boxes are at rest.
    await page.evaluate(() =>
      Promise.all(
        (document.querySelector('.acts')?.getAnimations({ subtree: true }) ?? []).map((a) => a.finished),
      ),
    );
    const viewport = page.viewportSize();
    expect(viewport).toEqual({ width: 390, height: 844 });
    const play = playButton(page);
    await expect(play).toHaveCount(1);
    await expect(play).toHaveId('snd-touch');
    await expect(play).toHaveAccessibleName(/Press play/);
    // the plain button carries the small disc icon, not the turntable stage
    await expect(play.locator('.disc-ico')).toHaveCount(1);
    await expect(play.locator('canvas')).toHaveCount(0);
    const contact = page.getByRole('link', { name: 'Contact me' });
    const [pb, cb] = await Promise.all([play.boundingBox(), contact.boundingBox()]);
    expect(pb).not.toBeNull();
    expect(cb).not.toBeNull();
    for (const box of [pb!, cb!]) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(390);
      expect(box.y + box.height).toBeLessThanOrEqual(844);
      expect(box.width).toBeGreaterThanOrEqual(48);
      expect(box.height).toBeGreaterThanOrEqual(48);
    }
    // Beside each other: same row, play to the right of contact.
    expect(Math.abs(pb!.y - cb!.y)).toBeLessThan(4);
    expect(pb!.x).toBeGreaterThanOrEqual(cb!.x + cb!.width);
    // The boxes are viewport coordinates, so the page must not have scrolled.
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test('desktop: the turntable control sits beside Contact me', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop-1440', 'wide fine-pointer layout only');
    await page.goto('/');
    const play = playButton(page);
    await expect(play).toHaveId('snd');
    await expect(play).toHaveAccessibleName(/Press play/);
    // the stage holds the static drawing and an empty canvas until a scene draws
    await expect(play.locator('#vinyl-stage svg.fb')).toHaveCount(1);
    await expect(play.locator('#vinyl-gl')).toHaveCount(1);
    const contact = page.getByRole('link', { name: 'Contact me' });
    const [pb, cb] = await Promise.all([play.boundingBox(), contact.boundingBox()]);
    expect(Math.abs(pb!.y - cb!.y)).toBeLessThan(4);
    expect(pb!.x).toBeGreaterThanOrEqual(cb!.x + cb!.width);
    // the disc in the drawing spins only while sound is on
    const disc = play.locator('.fb .disc');
    expect(await disc.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
    await play.click();
    expect(await disc.evaluate((el) => getComputedStyle(el).animationName)).toBe('spin');
    await play.click();
    expect(await disc.evaluate((el) => getComputedStyle(el).animationName)).toBe('none');
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
    const button = playButton(page);
    await expect(button).toHaveCount(1);
    await expect(button).toHaveAccessibleName(/Press play/);
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await button.click();
    await expect(button).toHaveAttribute('aria-pressed', 'true');
    // Both controls report the same state, whichever one is shown.
    await expect(page.locator('button.snd[aria-pressed="true"]')).toHaveCount(2);
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
    // The background field and the sound bars are off, the hero copy sits in
    // its finished state, and the tour is a static list of captions.
    const field = await page.locator('.field').evaluate((el) => getComputedStyle(el).animationName);
    expect(field).toBe('none');
    const h1 = await page.locator('h1 .l').first().evaluate((el) => getComputedStyle(el).opacity);
    expect(parseFloat(h1)).toBe(1);
    await page.locator('#tour-more summary').click();
    const stick = await page.locator('#tour-stick').evaluate((el) => getComputedStyle(el).position);
    expect(stick).toBe('static');
    await playButton(page).click();
    const bar = await page.locator('.bars i').first().evaluate((el) => getComputedStyle(el).animationName);
    expect(bar).toBe('none');
    const disc = await page.locator('#snd .fb .disc').evaluate((el) => getComputedStyle(el).animationName);
    expect(disc).toBe('none');
    const ico = await page.locator('#snd-touch .disc-ico').evaluate((el) => getComputedStyle(el).animationName);
    expect(ico).toBe('none');
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
