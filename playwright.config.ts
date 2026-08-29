import { defineConfig, devices } from "@playwright/test";

// E2E runs against a dev server Playwright starts itself. DATABASE_URL is forced empty
// so the flow stays hermetic — /api/save returns no slug, sharing falls back to the
// fully URL-encoded /r/<code> path, and no test rows are written to the real database.
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      DATABASE_URL: "",
      BETTER_AUTH_SECRET: "e2e-placeholder-secret-value-000000000000",
      BETTER_AUTH_URL: "http://localhost:3000",
    },
  },
});
