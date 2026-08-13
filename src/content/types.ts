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
  /** Category slug. Combined they form the URL: /{category}/{slug} */
  category: string;
  subcategory?: string;
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
  /** Manual override for related articles; otherwise derived from tags. */
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
