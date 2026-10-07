import { defineConfig } from '@playwright/test';

/** PW_PORT lets several worktrees run their e2e tests at once. */
const port = Number(process.env.PW_PORT ?? 4173);

/** The game targets one device: iPad (11th gen), landscape. */
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: `http://localhost:${port}`,
    // Every test starts signed in to the cloud save, as Jasper's iPad is
    // after the first time (tests/e2e/cloud.ts fakes the cloud itself).
    storageState: {
      cookies: [],
      origins: [{ origin: `http://localhost:${port}`, localStorage: [{ name: 'faraway-maths:auth', value: JSON.stringify({ token: 'test-jasper', who: 'jasper' }) }] }],
    },
    hasTouch: true,
    isMobile: false,
    deviceScaleFactor: 2,
    launchOptions: process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {},
  },
  projects: [
    { name: 'home-screen', use: { viewport: { width: 1180, height: 820 } } },
    { name: 'safari-tab', use: { viewport: { width: 1180, height: 760 } } },
  ],
  webServer: {
    command: `npm run build && npx vite preview --port ${port} --strictPort`,
    port,
    // The game's cloud API points at an address nothing answers, so tests
    // never reach the real one: they play offline unless they fake it.
    env: { VITE_API_URL: 'http://127.0.0.1:9/faraway-api' },
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
