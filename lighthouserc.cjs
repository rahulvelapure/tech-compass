const PORT = process.env.PORT || "4173";
process.env.PORT = PORT;
const targetUrl = (process.env.LHCI_TARGET_URL || "").replace(/\/$/, "");
const isDeployedAudit = Boolean(targetUrl);

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
    // Edge-only audits do not represent the local Node preview.
    skipAudits: targetUrl ? [] : ["uses-http2", "redirects-http", "uses-text-compression"],
  },
};

if (!targetUrl) {
  collect.startServerCommand = "node .output/server/index.mjs";
  collect.startServerReadyPattern = "Listening on:";
  collect.startServerReadyTimeout = 120000;
}

const strict = (value) => ["error", value];
const advisory = (value) => ["warn", value];

module.exports = {
  ci: {
    collect,
    assert: {
      assertions: {
        // The deployed-origin job is the strict performance gate. A loopback
        // preview has no CDN, TLS, compression or edge cache, so strict FCP
        // and aggregate-performance scores there would measure the harness.
        "categories:performance": isDeployedAudit
          ? strict({ minScore: 0.85 })
          : advisory({ minScore: 0.60 }),
        "categories:accessibility": strict({ minScore: 1 }),
        "categories:best-practices": strict({ minScore: 0.95 }),
        "categories:seo": isDeployedAudit
          ? strict({ minScore: 1 })
          : advisory({ minScore: 0.60 }),

        "largest-contentful-paint": isDeployedAudit
          ? strict({ maxNumericValue: 2500 })
          : advisory({ maxNumericValue: 4000 }),
        "cumulative-layout-shift": isDeployedAudit
          ? strict({ maxNumericValue: 0.1 })
          : advisory({ maxNumericValue: 0.25 }),
        "total-blocking-time": isDeployedAudit
          ? strict({ maxNumericValue: 200 })
          : advisory({ maxNumericValue: 500 }),
        "first-contentful-paint": isDeployedAudit
          ? strict({ maxNumericValue: 1800 })
          : advisory({ maxNumericValue: 3000 }),
        "speed-index": advisory({ maxNumericValue: 3400 }),

        "unminified-javascript": "error",
        "unminified-css": "error",
        "errors-in-console": "error",
        "font-display": "error",
        viewport: "error",

        // Keep structural SEO and accessibility checks strict in both modes.
        "meta-description": "error",
        "document-title": "error",
        "html-has-lang": "error",
        "link-text": "error",
        "crawlable-anchors": "error",
        "http-status-code": "error",
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

        "unused-javascript": advisory({ maxLength: 0 }),
        "unused-css-rules": advisory({ maxLength: 0 }),
        "render-blocking-resources": advisory({ maxLength: 0 }),
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
