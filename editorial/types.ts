/**
 * Editorial backlog model.
 *
 * This directory is planning data, not site content. Nothing under src/ may
 * import it — a 1,500-entry backlog has no business in the client bundle, and
 * tests/editorial-isolation.test.ts enforces the boundary.
 *
 * A Topic is an intent to write. An Article is a thing that exists. The two are
 * joined by `articleSlug` once a topic reaches PUBLISHED.
 */

/**
 * Where a topic sits in the pipeline.
 *
 * The order here is the order of progression, and `statusOrder` below depends
 * on it. ARCHIVED is terminal and deliberately last: a topic that was
 * considered and rejected is worth keeping so it is not re-proposed.
 */
export const TOPIC_STATUSES = [
  "IDEA",
  "RESEARCHING",
  "RESEARCHED",
  "DRAFT",
  "EDITORIAL_REVIEW",
  "TECHNICAL_REVIEW",
  "READY",
  "PUBLISHED",
  "NEEDS_UPDATE",
  "ARCHIVED",
] as const;

export type TopicStatus = (typeof TOPIC_STATUSES)[number];

export const statusOrder = (status: TopicStatus): number => TOPIC_STATUSES.indexOf(status);

/**
 * What kind of article this is. Drives the template the writer reaches for and,
 * more usefully, stops the backlog filling with fifteen explainers on one
 * subject when what is missing is a troubleshooting piece.
 *
 * Re-exported from the content model rather than declared here. A topic's
 * `contentType` becomes the published article's `contentType`, so one
 * definition has to serve both — two lists would drift the first time a format
 * was added to one and not the other.
 *
 * The dependency deliberately runs editorial -> src and never the reverse:
 * `tests/editorial.test.ts` fails the build if anything under `src/` imports
 * this directory. As a type-only import it is erased at compile time and costs
 * neither bundle anything.
 */
import type { ContentType } from "../src/content/types";

export type { ContentType };

/**
 * The shape of the query, not the funnel stage. This publication's SEO strategy
 * targets intent rather than volume, so this field is what the backlog is
 * prioritised against.
 */
export type SearchIntent =
  | "failure-mode" // "X is stuck", "Y not working" — highest urgency, lowest competition
  | "decision" // "should we", "which one", "when to use"
  | "how-to" // "how do I"
  | "architecture" // "how does X work", "design for Y"
  | "comparison" // "X vs Y"
  | "buying" // "best X for Y"
  | "question"; // PAA-style direct questions

/** P0 is next up. P3 is worth writing eventually. */
export type Priority = "P0" | "P1" | "P2" | "P3";

/**
 * How the topic ages. Drives the review cadence once published, and warns
 * against investing heavily in something that will be wrong in six months.
 */
export type UpdateClass =
  | "evergreen" // principles; review every 24 months
  | "annual" // stable but versioned; review every 12 months
  | "volatile"; // vendor-driven, licensing, regulation; review every 6 months

export interface Topic {
  /** Stable identifier, `<segment>-<nn>`. Never reused, even after ARCHIVED. */
  id: string;
  /** Working title. The published headline may differ. */
  title: string;
  /** Must match a slug in src/content/categories.ts. */
  category: string;
  subcategory?: string;
  contentType: ContentType;
  searchIntent: SearchIntent;
  priority: Priority;
  status: TopicStatus;
  targetKeyword: string;
  secondaryKeywords?: string[];
  /** Other topic ids this should link to or be linked from. */
  relatedTopics?: string[];
  /**
   * The primary sources that must be consulted before writing — titles, or
   * direct URLs where known, first-party first. Naming them at planning time is
   * what stops an article later being written from memory.
   *
   * This is the topic's primary-source record; there is deliberately no second
   * field for the same idea.
   */
  requiredSources?: string[];
  updateClass: UpdateClass;

  /**
   * The cluster this topic will anchor, named. Mirrors `Article.pillar`.
   *
   * Set on the hub and on cluster pillars. A hub has `pillar` and no
   * `pillarSlug`; a cluster pillar has both, because it anchors its own cluster
   * while reporting to the hub above it.
   */
  pillar?: string;
  /**
   * The slug this topic's article will have once written.
   *
   * Distinct from `articleSlug`, which only appears when the article actually
   * exists. A cluster has to be plannable before anything in it is written, and
   * that means a pillar needs a stable name for its children to point at.
   */
  plannedSlug?: string;
  /**
   * Slug of the article that anchors this topic's cluster — matching the
   * pillar's `plannedSlug`, or its `articleSlug` once published.
   *
   * Planning intent, so it may name a pillar that does not exist yet; that is
   * the normal case while a cluster is being built. Once the target article
   * does exist it must actually be a pillar, which `tests/editorial.test.ts`
   * checks.
   */
  pillarSlug?: string;
  /**
   * Slugs or topic ids this article should link to, decided at planning time.
   *
   * The roadmap requires every substantial article to link up to its pillar and
   * across to siblings. Deciding that here rather than at the end is what makes
   * the link graph deliberate instead of whatever the writer happened to
   * remember.
   */
  plannedInternalLinks?: string[];
  /**
   * What a diagram would show, if one would genuinely help — the mechanism, not
   * "an architecture diagram". Empty means prose is sufficient, which is a
   * legitimate and common answer.
   */
  diagramOpportunity?: string;

  /** Set when status reaches PUBLISHED. Must match a real article slug. */
  articleSlug?: string;
  /** Anything a future writer needs that the title does not convey. */
  notes?: string;
}

/** One backlog file per segment. */
export interface Segment {
  /** Display name used in the dashboard. */
  name: string;
  /** Category slug this segment maps to, for coverage reporting. */
  category: string;
  topics: Topic[];
}
