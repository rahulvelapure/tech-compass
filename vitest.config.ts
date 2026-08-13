import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

/**
 * Unit tests run against plain modules — the content store, the ranking logic
 * and the anti-spam primitives — so this config deliberately does not load the
 * TanStack Start plugin. Browser-level checks (accessibility, Core Web Vitals)
 * run separately against a real build; see playwright.config.ts and lighthouserc.json.
 *
 * The `@` alias is declared explicitly rather than read from tsconfig, because
 * tests/ and scripts/ sit outside the app's `include` globs.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // Playwright specs live alongside these and have their own runner.
    exclude: ["tests/**/*.spec.ts", "node_modules/**"],
    reporters: process.env["CI"] ? ["default", "junit"] : ["default"],
    outputFile: { junit: "test-results/unit.xml" },
  },
});
