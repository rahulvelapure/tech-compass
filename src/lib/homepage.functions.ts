import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, setResponseHeader } from "@tanstack/react-start/server";

import { getCategory } from "@/content/categories";
import { allArticles, articlesForCategory } from "./content";
import { composeHomepage, type HomepageComposition } from "./homepage.selection";

/**
 * Front-page composition, chosen per request.
 *
 * This runs as a server function rather than inside the route loader, and the
 * distinction matters. A loader executes on the server for the first paint but
 * in the browser for a client-side navigation, so anything reading cookies or
 * generating entropy would have to behave differently in each. A server
 * function always executes on the server: in-process during SSR, over RPC when
 * a reader navigates back to the homepage. One code path, both cases, and the
 * cookie is readable in both.
 *
 * The browser never chooses anything. It receives a list of slugs already
 * decided, which is what keeps the server-rendered HTML and the hydrated page
 * identical.
 */

/**
 * Which subject sections the front page renders, in order.
 *
 * These are category slugs, and they must name a category that actually has
 * published articles. The AI slot points at `ai-enterprise-it` rather than the
 * `ai` category: `ai` holds a single draft and has never had a published
 * article, so the section selected nothing and `routes/index.tsx` dropped it
 * silently — the front page rendered without an AI section at all. The two
 * categories both exist and both stay; only which one the front page features
 * changes here. No slug, URL or category definition is touched.
 */
export const HOMEPAGE_SECTIONS: {
  slug: string;
  title: string;
  form: "feature" | "grid" | "briefs";
}[] = [
  { slug: "ai-enterprise-it", title: "AI", form: "feature" },
  { slug: "microsoft-intune", title: "Enterprise IT", form: "grid" },
  { slug: "cybersecurity-ciso", title: "Cybersecurity", form: "briefs" },
  { slug: "how-to", title: "How-to and troubleshooting", form: "grid" },
];

/**
 * How many articles each section shape puts on the page.
 *
 * The selector reserves exactly this many, so a section never holds back
 * articles it will not show. These must track the layouts in routes/index.tsx:
 * feature renders a lead plus a four-item rail, grid renders three, briefs
 * renders a lead plus up to eight.
 */
const SECTION_RENDER_COUNT: Record<"feature" | "grid" | "briefs", number> = {
  feature: 5,
  grid: 3,
  briefs: 9,
};

/** Remembers the last few leads so consecutive visits do not repeat one. */
const LEAD_HISTORY_COOKIE = "tc_home";

/** Long enough to matter within a session, short enough not to be tracking. */
const LEAD_HISTORY_MAX_AGE_SECONDS = 60 * 60 * 6;

/** How many previous leads to skip. Below the pool size, or nothing is eligible. */
const LEAD_HISTORY_LENGTH = 4;

/** Slugs are the vocabulary; anything else in the cookie is discarded. */
const SLUG_PATTERN = /^[a-z0-9-]{1,128}$/;

function readLeadHistory(): string[] {
  const raw = getCookie(LEAD_HISTORY_COOKIE);
  if (typeof raw !== "string" || raw.length > 700) return [];
  return raw
    .split(",")
    .filter((slug) => SLUG_PATTERN.test(slug))
    .slice(0, LEAD_HISTORY_LENGTH);
}

function writeLeadHistory(history: string[], leadSlug: string): void {
  const next = [leadSlug, ...history.filter((slug) => slug !== leadSlug)].slice(
    0,
    LEAD_HISTORY_LENGTH,
  );
  setCookie(LEAD_HISTORY_COOKIE, next.join(","), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env["NODE_ENV"] === "production",
    path: "/",
    maxAge: LEAD_HISTORY_MAX_AGE_SECONDS,
  });
}

export const selectHomepageComposition = createServerFn({ method: "GET" }).handler(
  async (): Promise<HomepageComposition> => {
    /*
     * The response must not be cached.
     *
     * A front page that varies per request and a cached document are mutually
     * exclusive: whichever composition happened to be rendered first would be
     * served to everyone until the entry expired, which is exactly the symptom
     * this is meant to fix. Static assets keep their long-lived caching; only
     * this response opts out.
     */
    setResponseHeader("cache-control", "no-store");

    /*
     * Entropy is generated here, inside the request. Cloudflare Workers
     * forbids random values in global scope, so this cannot be hoisted to a
     * module constant — and it should not be anyway, since a per-module seed
     * would give every request the same front page for the isolate's lifetime.
     */
    const seed = crypto.getRandomValues(new Uint32Array(1))[0] ?? 1;

    const history = readLeadHistory();

    const sections = HOMEPAGE_SECTIONS.map((section) => {
      const category = getCategory(section.slug);
      return {
        slug: section.slug,
        articles: category ? articlesForCategory(category) : [],
        renderCount: SECTION_RENDER_COUNT[section.form],
      };
    });

    const composition = composeHomepage({
      articles: allArticles,
      sections,
      seed,
      recentLeads: history,
    });

    if (composition.leadSlug) writeLeadHistory(history, composition.leadSlug);

    return composition;
  },
);
