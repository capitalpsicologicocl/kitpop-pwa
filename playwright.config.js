import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [
        ['github'],
        ['html', { open: 'never', outputFolder: 'playwright-report' }],
      ]
    : 'list',
  timeout: 45_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    serviceWorkers: 'block',
  },
  projects: [
    {
      name: 'guest',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: [/auth\.setup\.js/, /sprint4-auth\.spec\.js/, /sprint7-auth-workshop\.spec\.js/],
    },
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.js/,
    },
    {
      name: 'authenticated',
      dependencies: ['auth-setup'],
      testMatch: [/sprint4-auth\.spec\.js/, /sprint7-auth-workshop\.spec\.js/],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/user.json',
      },
    },
  ],
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
