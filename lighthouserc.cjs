/**
 * Lighthouse CI: performance, Core Web Vitals, SEO and accessibility budgets.
 *
 * Two modes, one budget:
 *
 *  - Default (push, pull request, local): builds are served by the Node
 *    adapter on 127.0.0.1 and audited there.
 *  - LHCI_TARGET_URL set (post-deployment): audits the real origin instead,
 *    so the numbers include the CDN, compression and TLS rather than a
 *    loopback approximation.
 *
 * CommonJS because LHCI `require()`s this file and package.json is ESM.
 */

const PORT = process.env.PORT || "4173";

/*
 * Publish the port back to the environment.
 *
 * `startServerCommand` below spawns a child that inherits this process's
 * environment, so setting PORT here is what makes the server listen on the
 * port LHCI is about to audit. Doing it in the config rather than as a
 * `PORT=… lhci` prefix in package.json keeps the npm script shell-agnostic —
 * that prefix is not valid syntax in cmd.exe and broke the command on Windows.
 */
process.env.PORT = PORT;
const targetUrl = (process.env.LHCI_TARGET_URL || "").replace(/\/$/, "");

/** Audited on every run: one URL per page archetype, not per article. */
const PATHS = [
  "/",
  "/microsoft-intune",
  "/microsoft-intune/enrollment-status-page-troubleshooting",
  "/search",
  "/newsletter",
];

const origin = targetUrl || `http://127.0.0.1:${PORT}`;

const collect = {
  url: PATHS.map((path) => `${origin}${path}`),
  numberOfRuns: 3,
  settings: {
    preset: "desktop",
    // http2 and http-to-https redirects are properties of the edge, not the
    // application, and text compression is applied there too. Auditing them
    // against a loopback Node server measures the harness, not the site.
    skipAudits: targetUrl ? [] : ["uses-http2", "redirects-http", "uses-text-compression"],
  },
};

// Only start a server when there is no deployed origin to point at.
if (!targetUrl) {
  collect.startServerCommand = "node .output/server/index.mjs";
  collect.startServerReadyPattern = "Listening on:";
  collect.startServerReadyTimeout = 120000;
}

module.exports = {
  ci: {
    collect,
    assert: {
      /*
       * Deliberately no preset. The bundled presets assert audits that have
       * been renamed or removed across Lighthouse versions, which turns a
       * Lighthouse upgrade into a red build for no real regression. This list
       * is explicit: every entry is something worth blocking a deploy over,
       * or an advisory warning.
       */
      assertions: {
        // Aggregate scores. Performance is the noisiest number on a shared
        // runner, so the real gate is the numeric Core Web Vitals below.
        "categories:performance": ["error", { minScore: 0.85 }],
        "categories:accessibility": ["error", { minScore: 1 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 1 }],

        // Core Web Vitals, at Google's "good" thresholds.
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
        "first-contentful-paint": ["error", { maxNumericValue: 1800 }],
        "speed-index": ["warn", { maxNumericValue: 3400 }],

        // Delivery correctness.
        "unminified-javascript": "error",
        "unminified-css": "error",
        "errors-in-console": "error",
        "font-display": "error",
        viewport: "error",

        // SEO fundamentals. Every one of these silently costs traffic.
        "meta-description": "error",
        "document-title": "error",
        "html-has-lang": "error",
        "link-text": "error",
        "crawlable-anchors": "error",
        "http-status-code": "error",

        // Accessibility. The axe suite is the deeper check; these stop an
        // obvious regression from reaching a deploy even if that suite is skipped.
        "color-contrast": "error",
        "heading-order": "error",
        "link-name": "error",
        "button-name": "error",
        "image-alt": "error",
        label: "error",
        list: "error",
        "aria-allowed-attr": "error",
        "aria-required-attr": "error",
        "aria-valid-attr-value": "error",
        "duplicate-id-aria": "error",

        // Advisory: worth watching, not worth blocking a deploy.
        "unused-javascript": ["warn", { maxLength: 0 }],
        "unused-css-rules": ["warn", { maxLength: 0 }],
        "render-blocking-resources": ["warn", { maxLength: 0 }],
        "uses-responsive-images": "warn",
        "modern-image-formats": "warn",
        "efficient-animated-content": "warn",
        "dom-size": "warn",
      },
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci/reports",
    },
  },
};
