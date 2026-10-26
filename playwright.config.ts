import { existsSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173/';
const previewBase = new URL(baseURL).pathname;
const quotedPreviewBase = `'${previewBase.replaceAll("'", "'\\''")}'`;
const browserCache = join(homedir(), '.cache', 'ms-playwright');
const cachedChromium = existsSync(browserCache)
  ? readdirSync(browserCache)
      .filter((entry) => entry.startsWith('chromium-'))
      .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
      .map((entry) => join(browserCache, entry, 'chrome-linux64', 'chrome'))
      .find((path) => existsSync(path))
  : undefined;

export default defineConfig({
  testDir: './tests',
  outputDir: './tests/results',
  fullyParallel: true,
  workers: 2,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { outputFolder: 'tests/report', open: 'never' }]],
  use: {
    baseURL,
    browserName: 'chromium',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ?? cachedChromium,
    },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.E2E_NO_WEBSERVER
    ? undefined
    : {
        command: `npm run preview -- --host 127.0.0.1 --port 4173 --strictPort --base=${quotedPreviewBase}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
      },
});
