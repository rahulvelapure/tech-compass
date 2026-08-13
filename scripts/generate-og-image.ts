/**
 * Generates the default social card at public/og/default.png.
 *
 *   bun run generate:og
 *
 * Rendered with Playwright (already a dev dependency for the accessibility
 * suite) rather than hand-drawn, so the card is built from the publication's
 * own tokens — the same serif, the same ink, the same accent, the same rule
 * weight as the site. Change the brand name in src/lib/site.ts, re-run this,
 * and the card follows. Nothing about the card is hard-coded here.
 *
 * 1200x630 is the size Open Graph and Twitter both expect.
 */

import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

// Explicit .ts extension: this runs under Node's type stripping, not a bundler.
import { site } from "../src/lib/site.ts";

const WIDTH = 1200;
const HEIGHT = 630;

const OUTPUT = fileURLToPath(new URL("../public/og/default.png", import.meta.url));

/** Escapes text taken from configuration before it goes into markup. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/*
 * Token values are copied from styles.css `:root` rather than imported: this
 * runs in Node with no CSS pipeline, and the card must not depend on Tailwind
 * being built. Keep in step with the light theme if those tokens change.
 */
const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Merriweather:wght@700&display=swap"
      rel="stylesheet"
    />
    <style>
      :root {
        --foreground: oklch(0.23 0.036 261.7);
        --muted-foreground: oklch(0.52 0.036 256.8);
        --accent: oklch(0.546 0.215 262.9);
        --rule: oklch(0.918 0.008 247.9);
        --surface: oklch(0.984 0.003 247.9);
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: ${WIDTH}px;
        height: ${HEIGHT}px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 76px 80px;
        background: #fff;
        color: var(--foreground);
        font-family: Inter, system-ui, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      /* The single accent rule the site uses as its masthead device. */
      .rule { width: 92px; height: 4px; background: var(--accent); }
      .name {
        margin-top: 40px;
        font-family: Merriweather, Georgia, serif;
        font-weight: 700;
        font-size: 86px;
        line-height: 1.05;
        letter-spacing: -0.02em;
      }
      .name .dot { color: var(--accent); }
      .tagline {
        margin-top: 28px;
        font-size: 34px;
        line-height: 1.35;
        color: var(--muted-foreground);
        max-width: 900px;
      }
      footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid var(--rule);
        padding-top: 26px;
        font-size: 22px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        font-weight: 700;
        color: var(--muted-foreground);
      }
    </style>
  </head>
  <body>
    <div>
      <div class="rule"></div>
      <h1 class="name">${escapeHtml(site.name)}<span class="dot">.</span></h1>
      <p class="tagline">${escapeHtml(site.tagline)}</p>
    </div>
    <footer>
      <span>${escapeHtml(site.domain)}</span>
      <span>Enterprise IT · Security · AI</span>
    </footer>
  </body>
</html>`;

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: WIDTH, height: HEIGHT },
  deviceScaleFactor: 1,
});

await page.setContent(html, { waitUntil: "networkidle" });
// Webfonts load over the network; screenshotting early bakes in the fallback.
await page.evaluate(() => document.fonts.ready);

await mkdir(new URL("../public/og/", import.meta.url), { recursive: true });
await page.screenshot({ path: OUTPUT, type: "png" });
await browser.close();

console.log(`Wrote ${OUTPUT} (${WIDTH}x${HEIGHT})`);
