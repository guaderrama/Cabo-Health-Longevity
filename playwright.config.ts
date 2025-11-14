import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E tests
 * Supports both local development and production testing
 */
export default defineConfig({
  testDir: './tests/e2e',

  // Timeout for each test
  timeout: 60 * 1000,

  // Configuración de retries
  retries: process.env.CI ? 2 : 1,

  // Configuración de workers
  workers: process.env.CI ? 1 : undefined,

  // Configuración de reporter
  reporter: [
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  // Configuración de use
  use: {
    // Use production URL by default, or local for dev
    baseURL: process.env.TEST_URL || 'https://cabo-health-longevity.vercel.app',

    // Capturar screenshot en failure
    screenshot: 'only-on-failure',

    // Grabar video en failure
    video: 'retain-on-failure',

    // Trace en failure
    trace: 'on-first-retry',

    // Timeout for actions
    actionTimeout: 15 * 1000,

    // Timeout for navigation
    navigationTimeout: 30 * 1000,
  },

  // Configuración de proyectos para diferentes navegadores
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment for cross-browser testing
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // }
  ],

  // Only start webServer if testing locally
  ...(process.env.TEST_URL ? {} : {
    webServer: {
      command: 'pnpm dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  }),
});
