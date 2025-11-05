import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/__tests__/e2e',
  
  // Configuración de retries
  retries: process.env.CI ? 2 : 0,
  
  // Configuración de workers
  workers: process.env.CI ? 1 : undefined,
  
  // Configuración de reporter
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }]
  ],
  
  // Configuración de use
  use: {
    baseURL: 'http://localhost:5173',
    
    // Capturar screenshot en failure
    screenshot: 'only-on-failure',
    
    // Grabar video en failure
    video: 'retain-on-failure',
    
    // Trace en failure
    trace: 'retain-on-failure'
  },

  // Configuración de proyectos para diferentes navegadores
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }
  ],

  // Configuración del servidor web
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
