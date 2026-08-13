/**
 * Site-wide configuration.
 *
 * No secrets belong in this file. Anything environment-specific is read
 * from import.meta.env (VITE_*) with safe, non-tracking defaults.
 */

export const site = {
  name: "Rahul Velapure",
  /** Short brand used in tight spaces. */
  shortName: "RV",
  domain: "rahulvelapure.dpdns.org",
  url: "https://rahulvelapure.dpdns.org",
  tagline: "Practical technology for the real world",
  /**
   * Default social card, 1200x630. Used for every page that does not set its
   * own, and as the fallback image in Article structured data.
   * Regenerate with: bun run generate:og
   */
  ogImage: "/og/default.png",
  description:
    "A practical technology publication covering enterprise IT, AI, cybersecurity, software, electronics and gadgets — explained, compared and tested where possible.",
  newsletter: {
    pitch: "Practical technology insights. No noise.",
    detail:
      "Occasional email with new analysis on enterprise IT, security and the technology worth your attention.",
  },
} as const;

/**
 * Build-time environment.
 *
 * Guarded so this module can also be imported by plain Node — the content
 * validator and the social-card generator both read `site` — where
 * `import.meta.env` does not exist. Inside Vite it behaves exactly as before.
 */
const env: Record<string, string | undefined> = import.meta.env ?? {};

/**
 * Feature flags. Monetization is architected but disabled: nothing renders
 * until the corresponding flag is switched on, and disabled slots occupy
 * zero layout space.
 */
export const flags = {
  /** Master switch for every ad position. */
  adsEnabled: env["VITE_ADS_ENABLED"] === "true",
  /** Affiliate links / disclosures. */
  affiliateEnabled: env["VITE_AFFILIATE_ENABLED"] === "true",
  /** Newsletter form submits to a provider. When false the form explains it. */
  newsletterEnabled: env["VITE_NEWSLETTER_ENABLED"] === "true",
} as const;

/** Analytics integration point. Intentionally empty until configured. */
export const analytics = {
  googleAnalyticsId: env["VITE_GA_MEASUREMENT_ID"] ?? "",
  googleSiteVerification: env["VITE_GOOGLE_SITE_VERIFICATION"] ?? "",
  bingSiteVerification: env["VITE_BING_SITE_VERIFICATION"] ?? "",
} as const;
