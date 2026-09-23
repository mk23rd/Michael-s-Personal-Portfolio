import { defineConfig, devices } from "@playwright/test";

const CI = Boolean(process.env.CI);
// Not Vite's default 4173/5173: other checkouts of this repo may be serving there, and reusing a
// stranger's server would silently test the wrong code. Override with E2E_PORT if it is taken.
const PORT = Number(process.env.E2E_PORT ?? 4319);
const baseURL = `http://localhost:${PORT}`;

/**
 * End-to-end tests live in `e2e/` and run against the real site: the Vite dev server locally, the
 * production build (`npm run build` → `vite preview`) in CI. See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 0,
  workers: CI ? 2 : undefined,
  // Every test starts with a full page load; WebKit and Firefox need more headroom than Chromium.
  timeout: 45_000,
  reporter: CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "on-failure" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // The suite runs with reduced motion so scroll reveals, the boot log, the marquee and the custom
    // cursor never race an assertion. `e2e/motion.spec.ts` opts back in to cover those behaviours.
    reducedMotion: "reduce"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 14"] } }
  ],
  webServer: {
    command: CI
      ? `npm run preview -- --port ${PORT} --strictPort`
      : `npm run dev -- --port ${PORT} --strictPort`,
    url: baseURL,
    // Always start our own server: if the port is busy, fail loudly rather than test whatever is there.
    reuseExistingServer: false,
    timeout: 120_000
  }
});
