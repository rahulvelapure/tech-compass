import { defineConfig, devices } from "@playwright/test";

/**
 * Browser-level validation: accessibility, and the behaviour that only shows
 * up in a real page load (theme persistence, no-JS rendering).
 *
 * These run against a production build, not the dev server, because the thing
 * being validated is what readers actually receive. `bun run build:node`
 * produces a plain Node server for that purpose — same application and same
 * client bundle as the Cloudflare build, just an adapter that CI can run
 * without cloud credentials.
 */

const PORT = Number(process.env["PREVIEW_PORT"] ?? 4173);

/**
 * When PREVIEW_URL is set — post-deployment validation in CI — the suite audits
 * that origin and starts nothing locally.
 */
const DEPLOYED_URL = process.env["PREVIEW_URL"]?.replace(/\/$/, "");
const BASE_URL = DEPLOYED_URL || `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "tests",
  testMatch: "**/*.spec.ts",
  fullyParallel: true,
  // A stray `test.only` should fail the pipeline, not silently skip the suite.
  forbidOnly: Boolean(process.env["CI"]),

  /*
   * Capped hard at two. Each case loads a page and then runs a full axe-core
   * scan, which is CPU-bound; letting Playwright default to one worker per
   * core saturates the machine and turns genuine passes into timeouts. This
   * suite is a merge gate, so a deterministic three minutes beats a flaky one.
   *
   * A retry locally as well as in CI: an axe scan that loses a CPU slice to a
   * background process should not read as an accessibility regression.
   */
  workers: 2,
  retries: 1,

  // An axe scan on a long article is slower than a normal navigation test.
  timeout: 90_000,
  expect: { timeout: 20_000 },

  reporter: process.env["CI"] ? [["github"], ["html", { open: "never" }], ["list"]] : [["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    // Mobile is a designed layout here, not a shrunk desktop, so it is worth
    // auditing separately — collapsed navigation and scrollable tables are
    // exactly where accessibility regressions hide.
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],

  // Spread rather than assigned: `exactOptionalPropertyTypes` rejects an
  // explicit `undefined` here, and the key must simply be absent.
  ...(DEPLOYED_URL
    ? {}
    : {
        webServer: {
          command: "node .output/server/index.mjs",
          url: BASE_URL,
          env: { PORT: String(PORT) },
          reuseExistingServer: !process.env["CI"],
          timeout: 120_000,
        },
      }),
});
