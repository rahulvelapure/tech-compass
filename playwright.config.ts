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
  forbidOnly: Boolean(process.env["CI"]),
  workers: 2,
  retries: 1,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  reporter: process.env["CI"]
    ? [["github"], ["html", { open: "never" }], ["list"]]
    : [["list"]],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },

  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],

  // CI starts the production server once so the accessibility suite and the
  // following crawl can inspect the exact same running build. Reuse it rather
  // than attempting to start a second server on the same port.
  ...(DEPLOYED_URL
    ? {}
    : {
        webServer: {
          command: "node .output/server/index.mjs",
          url: BASE_URL,
          env: { PORT: String(PORT) },
          reuseExistingServer: true,
          timeout: 120_000,
        },
      }),
});
