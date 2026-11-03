import { defineConfig } from '@playwright/test';

const port = Number(process.env.PORTFOLIO_TEST_PORT || 4321);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  throw new Error('PORTFOLIO_TEST_PORT must be an integer from 1024 to 65535');
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    // Use the independently updated browser, not Playwright's bundled Chromium.
    channel: 'chrome',
    launchOptions: { chromiumSandbox: true },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `node node_modules/astro/astro.js preview --host 127.0.0.1 --port ${port}`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 60_000,
  },
  projects: [
    { name: 'mobile-390', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
    { name: 'tablet-820', use: { browserName: 'chromium', viewport: { width: 820, height: 1180 } } },
    { name: 'desktop-1440', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
  ],
});
