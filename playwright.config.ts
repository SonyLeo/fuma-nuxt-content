import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://127.0.0.1:8888'
const configuredWorkers = Number(process.env.PLAYWRIGHT_WORKERS)
const workers =
  Number.isFinite(configuredWorkers) && configuredWorkers > 0
    ? configuredWorkers
    : process.env.CI
      ? 2
      : 4

export default defineConfig({
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  outputDir: '.playwright/test-results',
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: {
          height: 1000,
          width: 1440,
        },
      },
    },
    {
      name: 'chromium-tablet',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: {
          height: 935,
          width: 994,
        },
      },
    },
    {
      name: 'chromium-mobile',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        isMobile: false,
        viewport: {
          height: 844,
          width: 390,
        },
      },
    },
  ],
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  retries: process.env.CI ? 1 : 0,
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  workers,
  webServer: {
    command: 'pnpm exec nuxt dev --host 127.0.0.1 --port 8888',
    reuseExistingServer: true,
    timeout: 60_000,
    url: baseURL,
  },
})
