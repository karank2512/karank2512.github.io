import { defineConfig } from '@playwright/test';

const port = 4321;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview',
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  projects: [
    { name: 'mobile-390', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
    { name: 'tablet-820', use: { browserName: 'chromium', viewport: { width: 820, height: 1180 } } },
    { name: 'desktop-1440', use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
  ],
});
