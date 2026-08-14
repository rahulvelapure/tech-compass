/**
 * Content model for the publication.
 *
 * Articles are data, never JSX. Adding an article means adding one object to
 * src/content/articles/ — the templates, SEO, schema, TOC, related content and
 * search index all derive from these fields.
 */

export type ReviewStatus =
  | "hands-on" // author used the product/feature directly
  | "lab-verified" // verified in a test environment
  | "research-based" // documentation, specifications and public sources
  | "opinion"; // analysis and argument

/**
 * Editorial format — what kind of article this is.
 *
 * The subject category owns the URL; the format is an attribute. That is what
 * stops a comparison of two networking standards having to choose between
 * living in `comparisons` and living in `enterprise-networking`, and what stops
 * the same article being counted as two topical targets.
 *
 * `/comparisons`, `/how-to`, `/reviews` and `/buying-guides` are derived index
 * routes over this field. They are never an article's `category`.
 *
 * Declared here rather than in `editorial/types.ts` because nothing under
 * `src/` may import the backlog — `tests/editorial.test.ts` enforces that, and
 * the client bundle must never carry 1,500 planning entries. The backlog
 * imports this type instead, so the planning and publishing vocabularies
 * cannot drift.
 */
export type ContentType =
  | "troubleshooting" // a specific failure and how to diagnose it
  | "how-to" // a procedure with a defined end state
  | "explainer" // how something works and why it behaves that way
  | "decision-framework" // choosing between options against stated criteria
  | "comparison" // X vs Y, on the dimensions that change a decision
  | "buying-guide" // what to buy and the criteria that actually matter
  | "review" // assessment of a specific product actually used
  | "reference" // lookup material: tables, mappings, matrices
  | "analysis"; // argument or assessment, clearly labelled as such

export const CONTENT_TYPES: ContentType[] = [
  "troubleshooting",
  "how-to",
  "explainer",
  "decision-framework",
  "comparison",
  "buying-guide",
  "review",
  "reference",
  "analysis",
];

/** Human-readable labels for the derived content-type index routes. */
export const contentTypeLabels: Record<ContentType, { title: string; plural: string }> = {
  troubleshooting: { title: "Troubleshooting", plural: "Troubleshooting guides" },
  "how-to": { title: "How-to", plural: "How-to guides" },
  explainer: { title: "Explainers", plural: "Explainers" },
  "decision-framework": { title: "Decision frameworks", plural: "Decision frameworks" },
  comparison: { title: "Comparisons", plural: "Comparisons" },
  "buying-guide": { title: "Buying guides", plural: "Buying guides" },
  review: { title: "Reviews", plural: "Reviews" },
  reference: { title: "Reference", plural: "Reference material" },
  analysis: { title: "Analysis", plural: "Analysis" },
};

export interface Author {
  id: string;
  name: string;
  /** Short, deliberately limited professional bio. No personal details. */
  bio: string;
  role: string;
  initials: string;
}

export interface Category {
  /** URL segment. Frozen for the seven enterprise pillars. */
  slug: string;
  title: string;
  /** Short label used in navigation and eyebrows. */
  label: string;
  /** One-paragraph editorial introduction shown on the category page. */
  intro: string;
  /** Meta description for the category page. */
  description: string;
  /** Grouping used by navigation and the footer sitemap. */
  group: "enterprise" | "technology" | "formats" | "site";
  /** Optional named subcategories used as article tags. */
  subcategories?: string[];
  /** Adjacent categories, for cross-linking. */
  related?: string[];
  /**
   * Marks this as a derived index route rather than an article container.
   *
   * The page lists every article with this `contentType`, wherever it lives.
   * No article may use the slug as its own `category` — the validator rejects
   * it — so a format never becomes a canonical article URL and no article is
   * reachable at two addresses.
   */
  contentTypeIndex?: ContentType;
}

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string; id: string }
  | { type: "h3"; text: string; id: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | {
      type: "code";
      language: string;
      filename?: string;
      code: string;
      /** Renders as a shell/command block rather than a source file. */
      command?: boolean;
    }
  | {
      type: "table";
      caption?: string;
      head: string[];
      rows: string[][];
    }
  | {
      type: "callout";
      variant: "note" | "warning" | "tip";
      title: string;
      text: string;
    }
  | {
      type: "diagram";
      title: string;
      /** Monospaced ASCII architecture diagram. */
      ascii: string;
      caption?: string;
    }
  | {
      /**
       * Hand-authored technical diagram, inlined as SVG.
       *
       * Inline rather than a linked asset: no extra request, no layout shift,
       * and the drawing inherits the page's colours directly so it works in
       * both themes without a second copy.
       *
       * The house style is monochrome pencil/stencil — depth comes from stroke
       * weight and hatching, never colour. Every stroke and fill uses
       * `currentColor`; a hard-coded hex breaks dark mode.
       *
       * The markup is injected as raw HTML, so the validator rejects `<script>`,
       * `<image>` and external references. Content is authored in this
       * repository and trusted, but the check exists regardless.
       */
      type: "figure";
      title: string;
      /** Root `<svg>` with a `viewBox` and no width/height, so it scales. */
      svg: string;
      /**
       * Text alternative describing what the diagram shows — not what it is
       * called. Becomes the accessible name; "diagram" is not an alternative.
       */
      alt: string;
      caption?: string;
    }
  | { type: "quote"; text: string; attribution?: string };

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface Source {
  title: string;
  publisher: string;
  url: string;
}

export interface Article {
  slug: string;
  /**
   * Subject category slug. Combined they form the URL: /{category}/{slug}
   *
   * Must be a subject category. Format categories (`comparisons`, `how-to`,
   * `reviews`, `buying-guides`) are derived indexes and are rejected here.
   */
  category: string;
  subcategory?: string;
  /**
   * Editorial format. Drives the derived index routes and, more usefully,
   * keeps the backlog's `contentType` classification instead of discarding it
   * at publication.
   */
  contentType: ContentType;
  title: string;
  /** Overrides <title> when the headline is too long for search. */
  seoTitle?: string;
  metaDescription: string;
  /** One-sentence standfirst under the H1. */
  standfirst: string;
  /** Card/list excerpt. */
  excerpt: string;
  authorId: string;
  publishedAt: string; // ISO date — never backdated
  updatedAt?: string; // ISO date

  /**
   * Last time someone deliberately checked the article was still correct,
   * whether or not anything changed. Distinct from `updatedAt`, which only
   * moves when the content does — an article can be verified-correct and
   * unchanged, and that is worth recording.
   */
  lastReviewedAt?: string; // ISO date
  /**
   * When the next check is due. Derived from the topic's update class at
   * publication (volatile 6 months, annual 12, evergreen 24) but stored
   * explicitly so an individual article can be put on a shorter leash.
   *
   * `bun run inventory` reports anything past this date as due for review.
   */
  nextReviewAt?: string; // ISO date
  readingMinutes: number;
  primaryKeyword: string;
  secondaryKeywords: string[];
  tags: string[];
  reviewStatus: ReviewStatus;
  /**
   * Social/share image, site-root-relative (e.g. "/og/intune-esp.png") or
   * absolute. 1200x630. Falls back to the publication's default card, so an
   * article without one still shares correctly.
   */
  heroImage?: string;
  /** Required whenever heroImage is set. Describes the image, not the article. */
  heroImageAlt?: string;
  /** How the piece was researched. Shown verbatim in the methodology block. */
  methodology?: string;
  /**
   * Staged but not published.
   *
   * A draft keeps its URL so it can be previewed and shared, but it is
   * excluded from every listing, the sitemap, RSS and search, and it renders
   * `noindex`. The content validator holds drafts to a lower bar — this is the
   * flag that lets an unfinished piece live in the repository without
   * dragging the site's quality signal down with it.
   */
  draft?: boolean;
  featured?: boolean;

  /**
   * This article anchors a cluster, and this is the cluster's name.
   *
   * Set on subject hubs and on cluster pillars. A hub has `pillar` and no
   * `pillarSlug`; a cluster pillar has both, because it anchors its own cluster
   * while reporting to the hub above it.
   */
  pillar?: string;
  /**
   * The article one level up — the cluster pillar this one supports, or the
   * subject hub for a cluster pillar.
   *
   * Must resolve to an article that has `pillar` set. The hierarchy is at most
   * three deep (hub → pillar → supporting) and may not contain a cycle; both
   * are enforced by the content validator.
   */
  pillarSlug?: string;

  /**
   * Editorially chosen sibling articles — the sideways relationships.
   *
   * Falls back to tag similarity when unset, which is a coincidence rather than
   * a judgement, so substantial articles are expected to set this explicitly.
   * The upward link is structural (`pillarSlug`) and renders separately; do not
   * repeat it here.
   */
  relatedSlugs?: string[];
  body: Block[];
  faq?: FaqEntry[];
  sources?: Source[];
}

/** Reusable product model for reviews, comparisons and buying guides. */
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  specs: { label: string; value: string }[];
  pros: string[];
  cons: string[];
  bestFor: string;
  notFor: string;
  /** Price is display-only text so it can be updated without code changes. */
  price?: string;
  priceCheckedAt?: string;
  reviewStatus: ReviewStatus;
  /** Only set when an editorial rating is justified. */
  rating?: number;
  purchaseUrl?: string;
  /** Development-only sample data must be marked so it never ships as content. */
  sample?: boolean;
}
