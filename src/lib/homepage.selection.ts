import type { Article } from "@/content/types";

/**
 * Front-page composition.
 *
 * The homepage picks a lead, a short "Also today" rail beside it, a "Latest"
 * list, and a set of articles for each subject section. This module decides
 * which articles fill those slots.
 *
 * Two properties matter and pull against each other:
 *
 *  - A reader who comes back should not see the same front page. That needs
 *    variation between requests.
 *  - Server and browser must render the same HTML for one request. That needs
 *    the selection to be fixed once the request starts.
 *
 * Both are satisfied by seeding: the caller supplies one random number per
 * request, and everything here is a pure function of that seed. Vary the seed
 * and the page varies; hold it and the page is stable. Nothing in this file
 * calls `Math.random`, reads a clock, or touches a request — which is also
 * what keeps it testable.
 */

/** What the front page needs in order to render. */
export interface HomepageComposition {
  leadSlug: string;
  /** The "Also today" rail. Newest first. */
  secondarySlugs: string[];
  /** The "Latest" list. Strictly newest first. */
  latestSlugs: string[];
  /** Per subject section, in the order that section should render them. */
  sectionSlugs: Record<string, string[]>;
}

export interface CompositionInput {
  /** Published articles, newest first. Drafts must already be excluded. */
  articles: Article[];
  /**
   * Subject sections the page renders. `renderCount` is how many that section
   * actually shows, so a section never reserves articles it will not display.
   */
  sections: { slug: string; articles: Article[]; renderCount: number }[];
  /** One random 32-bit value for this request. */
  seed: number;
  /** Slugs recently used as the lead, so they can be skipped. */
  recentLeads?: string[];
}

/** How many articles are eligible to lead. */
const LEAD_POOL_SIZE = 8;

/** Size of the "Also today" rail. */
const SECONDARY_COUNT = 3;

/** How many recent articles the rail may draw from, before picking. */
const SECONDARY_CANDIDATES = 8;

/** Size of the "Latest" list. */
const LATEST_COUNT = 6;

/* ------------------------------------------------------------------ */
/* Deterministic randomness                                            */
/* ------------------------------------------------------------------ */

/**
 * mulberry32.
 *
 * A small, fast, well-distributed PRNG. It is used rather than `Math.random`
 * for one reason: it can be seeded, so the same seed always produces the same
 * front page. That is what lets the server and the browser agree, and what
 * lets a test pin an exact composition.
 */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Fisher-Yates, driven by the seeded generator. Does not mutate the input. */
function shuffled<T>(items: T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/**
 * Weighted pick, with earlier entries favoured.
 *
 * A flat shuffle would lead as often with the eighth-newest article as with
 * today's. Weighting the pool by position keeps the front page broadly current
 * while still giving older entries a real chance — which is the difference
 * between a front page that varies and one that looks arbitrary.
 */
function weightedPick<T>(items: T[], rng: () => number): T | undefined {
  if (items.length === 0) return undefined;
  const weights = items.map((_, index) => items.length - index);
  const total = weights.reduce((sum, weight) => sum + weight, 0);

  let threshold = rng() * total;
  for (let index = 0; index < items.length; index += 1) {
    threshold -= weights[index]!;
    if (threshold <= 0) return items[index];
  }
  return items[items.length - 1];
}

/* ------------------------------------------------------------------ */
/* Selection                                                           */
/* ------------------------------------------------------------------ */

/**
 * Articles eligible to lead.
 *
 * Editorially flagged articles come first and stay eligible however old they
 * are — that is what the flag has always meant. The pool is then backfilled by
 * recency so the front page cannot end up rotating between two pieces from
 * last spring.
 */
export function leadCandidates(articles: Article[]): Article[] {
  const pool = articles.filter((article) => article.featured);
  for (const article of articles) {
    if (pool.length >= LEAD_POOL_SIZE) break;
    if (!pool.includes(article)) pool.push(article);
  }
  return pool;
}

const byDateDesc = (a: Article, b: Article) => b.publishedAt.localeCompare(a.publishedAt);

/**
 * Build one front page.
 *
 * Slots are filled in order — lead, then sections, then the rail, then Latest
 * — and every chosen article is recorded, so nothing appears twice on the
 * page. Sections are filled early because they are the constrained slots; the
 * reasoning is at that step.
 */
export function composeHomepage({
  articles,
  sections,
  seed,
  recentLeads = [],
}: CompositionInput): HomepageComposition {
  const rng = createRng(seed);
  const used = new Set<string>();

  /* --- lead --- */
  const candidates = leadCandidates(articles);
  const unseen = candidates.filter((article) => !recentLeads.includes(article.slug));
  // Everything in the pool has led recently: fall back to the whole pool
  // rather than refuse to render a front page.
  const lead = weightedPick(unseen.length > 0 ? unseen : candidates, rng) ?? articles[0];

  if (!lead) {
    return { leadSlug: "", secondarySlugs: [], latestSlugs: [], sectionSlugs: {} };
  }
  used.add(lead.slug);

  /* --- subject sections claim next ---
   *
   * Sections are filled before the rail and the Latest list, and the ordering
   * is deliberate. A subject category can be small — Cybersecurity currently
   * has one published article — so if the general lists took their pick first,
   * that section would either render empty or repeat an article already shown
   * above. Letting constrained sections reserve what they need keeps every
   * section populated and keeps the page free of duplicates. Sections claim
   * only what they render, so this costs the general lists very little.
   */
  const sectionSlugs: Record<string, string[]> = {};
  for (const section of sections) {
    const available = section.articles.filter((article) => !used.has(article.slug));
    // Reachable only if two sections overlap heavily — a content-type index
    // shares articles with the subject categories it draws from. An empty
    // section is worse than a repeat, so the category's own list is the floor.
    const source = available.length > 0 ? available : section.articles;

    // The section keeps its most recent article at the front — a section lead
    // should be current — and varies the entries behind it.
    const [head, ...tail] = source;
    const ordered = head ? [head, ...shuffled(tail, rng)] : [];

    const picked = ordered.slice(0, section.renderCount);
    for (const article of picked) used.add(article.slug);
    sectionSlugs[section.slug] = picked.map((article) => article.slug);
  }

  /* --- "Also today": recent, but not always the same three --- */
  const railPool = articles
    .filter((article) => !used.has(article.slug))
    .slice(0, SECONDARY_CANDIDATES);
  const secondary = shuffled(railPool, rng).slice(0, SECONDARY_COUNT).sort(byDateDesc);
  for (const article of secondary) used.add(article.slug);

  /* --- "Latest": strictly chronological ---
   *
   * Deliberately not shuffled. The heading says Latest, so it lists the newest
   * unused articles in date order. It still changes between requests, because
   * which articles the lead and the rail consumed changes.
   */
  const latest = articles.filter((article) => !used.has(article.slug)).slice(0, LATEST_COUNT);
  for (const article of latest) used.add(article.slug);

  return {
    leadSlug: lead.slug,
    secondarySlugs: secondary.map((article) => article.slug),
    latestSlugs: latest.map((article) => article.slug),
    sectionSlugs,
  };
}
