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
 */
export type ContentType =
  | "troubleshooting" // a specific failure and how to diagnose it
  | "how-to" // a procedure with a defined end state
  | "explainer" // how something works and why it behaves that way
  | "decision-framework" // choosing between options against stated criteria
  | "comparison" // X vs Y, on the dimensions that change a decision
  | "buying-guide" // what to buy and the criteria that actually matter
  | "reference" // lookup material: tables, mappings, matrices
  | "analysis"; // argument or assessment, clearly labelled as such

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
   * Primary sources that must be consulted before writing. Naming them at
   * planning time is what stops an article being written from memory.
   */
  requiredSources?: string[];
  updateClass: UpdateClass;
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
