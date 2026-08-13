/**
 * Content schema and metadata validation.
 *
 * The content store is plain TypeScript, so the compiler already guarantees
 * shape. What it cannot check is everything that makes the content *correct*:
 * that a category slug resolves, that no two articles claim the same URL, that
 * a heading id is unique enough to anchor a table of contents, that a meta
 * description is a length Google will actually render, that a published date
 * is not in the future.
 *
 * Those are the mistakes that ship silently and are expensive to find later,
 * so they are checked here and enforced in CI on every push and deployment.
 *
 * Run directly:   bun run validate:content
 * Run in CI:      part of `bun run test`, via tests/content.test.ts
 */

import { articles } from "@/content/articles";
import { authors } from "@/content/authors";
import { categories, footerColumns, primaryNav } from "@/content/categories";
import { articleWordCount, estimateReadingMinutes } from "@/lib/content";
import type { Article, Block, Category } from "@/content/types";

export type Severity = "error" | "warning";

export interface Issue {
  severity: Severity;
  /** Where the problem is, e.g. `article:enrollment-status-page-troubleshooting`. */
  subject: string;
  /** The specific field, when there is one. */
  field?: string;
  message: string;
}

/* ------------------------------------------------------------------ */
/* Rules                                                               */
/* ------------------------------------------------------------------ */

/**
 * Google truncates around 155–160 characters and pads out anything much
 * shorter, so both ends are worth flagging.
 */
const META_DESCRIPTION_MIN = 70;
const META_DESCRIPTION_MAX = 165;

/** Beyond this a title is rewritten in the SERP; `seoTitle` exists to avoid that. */
const SEO_TITLE_MAX = 62;
const TITLE_MAX = 110;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Below this an article is thin: not enough substance to rank, and not enough
 * to be worth a reader's click. Google's own guidance is about value rather
 * than length, but in practice a technical article that answers a real
 * question does not come in under 600 words.
 */
const THIN_WORD_COUNT = 600;

/** Under this it is a stub — a placeholder that should not be indexed at all. */
const STUB_WORD_COUNT = 300;

/** An article this long with no subheadings is an unnavigable wall of text. */
const HEADINGS_REQUIRED_ABOVE = 400;

/**
 * Phrases that signal generated filler rather than a practitioner writing.
 *
 * These are not banned words — several have legitimate uses — but a cluster of
 * them in one article is the reliable tell, so they are reported for a human
 * to judge rather than failed automatically.
 */
const FILLER_PHRASES = [
  "in today's fast-paced",
  "in the ever-evolving",
  "ever-evolving landscape",
  "in the digital age",
  "it is important to note that",
  "it's important to note that",
  "when it comes to",
  "at the end of the day",
  "delve into",
  "delving into",
  "unlock the power",
  "harness the power",
  "game-changer",
  "game changer",
  "revolutionize",
  "revolutionise",
  "cutting-edge solution",
  "seamlessly integrate",
  "robust and scalable",
  "in conclusion",
  "this comprehensive guide",
  "in this article, we will",
  "let's dive in",
  "the world of",
  "navigate the complexities",
  "tapestry of",
  "testament to",
];

/**
 * Placeholder text that must never reach production.
 *
 * "Placeholder" is deliberately matched only in its marker forms — bracketed,
 * shouted, or followed by text/content/copy. As an ordinary English word it
 * appears legitimately in technical writing ("the counter is a fixed
 * placeholder"), and a rule that flags that trains people to ignore the rule.
 */
const PLACEHOLDER_PATTERNS = [
  /\blorem ipsum\b/i,
  /\bTODO\b/,
  /\bFIXME\b/,
  /\bTBD\b/,
  /\bXXX\b/,
  /\[\s*placeholder\s*\]/i,
  /\bPLACEHOLDER\b/,
  /\bplaceholder (?:text|content|copy|value)\b/i,
  /\bcoming soon\b/i,
  /\bexample\.com\b/i,
  /\blorem\b/i,
];

/** The seven pillars the information architecture is built on. */
const FROZEN_PILLARS = [
  "microsoft-intune",
  "microsoft-365-entra-id",
  "cybersecurity-ciso",
  "enterprise-networking",
  "ai-enterprise-it",
  "it-automation",
  "technology-leadership",
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

/** All prose in an article, for duplicate and filler detection. */
function articleText(article: Article): string {
  const parts: string[] = [article.title, article.standfirst, article.excerpt];
  for (const block of article.body) {
    switch (block.type) {
      case "p":
      case "h2":
      case "h3":
      case "quote":
        parts.push(block.text);
        break;
      case "ul":
      case "ol":
        parts.push(block.items.join(" "));
        break;
      case "table":
        parts.push([block.caption ?? "", ...block.head, ...block.rows.flat()].join(" "));
        break;
      case "callout":
        parts.push(`${block.title} ${block.text}`);
        break;
      default:
        break;
    }
  }
  for (const entry of article.faq ?? []) parts.push(`${entry.question} ${entry.answer}`);
  return parts.join(" ");
}

/** Non-article routes an inline link may legitimately point at. */
const KNOWN_STATIC_PATHS = [
  "/",
  "/about",
  "/resources",
  "/newsletter",
  "/search",
  "/privacy",
  "/terms",
  "/disclaimer",
];

/** Inline links written as [label](target) in body prose. */
function inlineLinks(article: Article): {
  internal: number;
  external: number;
  internalTargets: string[];
} {
  const text = articleText(article);
  const internalTargets: string[] = [];
  let external = 0;
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)\s]+)\)/g)) {
    const target = match[1];
    if (!target) continue;
    if (target.startsWith("/")) internalTargets.push(target);
    else external += 1;
  }
  return { internal: internalTargets.length, external, internalTargets };
}

/**
 * Normalised sentence set, for cross-article duplicate detection. Short
 * sentences are ignored — boilerplate like "This is not legal advice."
 * repeating is fine and expected.
 */
function sentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9 ]+/g, " ")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((s) => s.split(" ").length >= 10);
}

/* ------------------------------------------------------------------ */
/* Category checks                                                     */
/* ------------------------------------------------------------------ */

function validateCategories(issues: Issue[]): void {
  const seen = new Set<string>();
  const known = new Set(categories.map((c) => c.slug));

  for (const category of categories) {
    const subject = `category:${category.slug}`;
    const add = (message: string, field?: string, severity: Severity = "error") =>
      issues.push({ severity, subject, message, ...(field ? { field } : {}) });

    if (!SLUG_PATTERN.test(category.slug)) {
      add("Slug must be lowercase words separated by single hyphens.", "slug");
    }
    if (seen.has(category.slug)) {
      add("Duplicate category slug — two categories would share one URL.", "slug");
    }
    seen.add(category.slug);

    for (const field of ["title", "label", "intro", "description"] as const) {
      if (!category[field]?.trim()) add("Must not be empty.", field);
    }

    const length = category.description.trim().length;
    if (length < META_DESCRIPTION_MIN || length > META_DESCRIPTION_MAX) {
      add(
        `Meta description is ${length} characters; aim for ${META_DESCRIPTION_MIN}–${META_DESCRIPTION_MAX}.`,
        "description",
        "warning",
      );
    }

    for (const related of category.related ?? []) {
      if (related === category.slug) add("Category lists itself as related.", "related");
      else if (!known.has(related)) add(`Unknown related category "${related}".`, "related");
    }

    for (const sub of category.subcategories ?? []) {
      if (!sub.trim()) add("Empty subcategory name.", "subcategories");
    }
  }

  for (const pillar of FROZEN_PILLARS) {
    if (!known.has(pillar)) {
      issues.push({
        severity: "error",
        subject: "categories",
        message: `Frozen pillar "${pillar}" is missing. Pillar slugs are permanent URLs and must not be removed or renamed.`,
      });
    }
  }

  // A category nobody can navigate to is invisible regardless of its content.
  const linked = new Set([
    ...primaryNav.map((item) => item.slug),
    ...footerColumns.flatMap((column) => column.slugs),
  ]);
  for (const slug of linked) {
    if (!known.has(slug)) {
      issues.push({
        severity: "error",
        subject: "navigation",
        message: `Navigation links to unknown category "${slug}".`,
      });
    }
  }
  for (const category of categories) {
    if (category.group !== "site" && !linked.has(category.slug)) {
      issues.push({
        severity: "warning",
        subject: `category:${category.slug}`,
        message: "Not reachable from the primary navigation or the footer.",
      });
    }
  }
}

/* ------------------------------------------------------------------ */
/* Article checks                                                      */
/* ------------------------------------------------------------------ */

function validateArticle(
  article: Article,
  context: { categoryMap: Map<string, Category>; authorIds: Set<string>; slugs: Set<string> },
  issues: Issue[],
): void {
  const subject = `article:${article.slug}`;
  const add = (message: string, field?: string, severity: Severity = "error") =>
    issues.push({ severity, subject, message, ...(field ? { field } : {}) });

  /*
   * Severity for "is this finished" problems — an empty title, no tags, too few
   * words. A draft is unfinished by definition, is noindex and appears in no
   * listing, so holding it to the published bar would mean a freshly scaffolded
   * article breaks everyone's build until it is complete.
   *
   * Problems that would break the site regardless of publication state —
   * an unknown category, a bad date, a duplicate slug, a malformed table —
   * stay errors for drafts too. Removing `draft: true` restores full strength
   * to everything below.
   */
  const completeness: Severity = article.draft ? "warning" : "error";

  /* --- identity and routing --- */

  if (!SLUG_PATTERN.test(article.slug)) {
    add("Slug must be lowercase words separated by single hyphens.", "slug");
  }

  const category = context.categoryMap.get(article.category);
  if (!category) {
    add(`Unknown category "${article.category}" — the article would 404.`, "category");
  } else if (article.subcategory) {
    const declared = category.subcategories ?? [];
    if (declared.length > 0 && !declared.includes(article.subcategory)) {
      add(
        `Subcategory "${article.subcategory}" is not declared on category "${article.category}" (${declared.join(", ")}).`,
        "subcategory",
        "warning",
      );
    }
  }

  if (!context.authorIds.has(article.authorId)) {
    add(
      `Unknown author "${article.authorId}" — the byline would silently fall back to the default.`,
      "authorId",
    );
  }

  /* --- dates --- */

  const today = new Date().toISOString().slice(0, 10);

  if (!isIsoDate(article.publishedAt)) {
    add("Must be a real calendar date in YYYY-MM-DD form.", "publishedAt");
  } else if (article.publishedAt > today) {
    add(
      `Published date ${article.publishedAt} is in the future. Never post-date, and never backdate.`,
      "publishedAt",
    );
  }

  if (article.updatedAt !== undefined) {
    if (!isIsoDate(article.updatedAt)) {
      add("Must be a real calendar date in YYYY-MM-DD form.", "updatedAt");
    } else {
      if (article.updatedAt > today) {
        add(`Updated date ${article.updatedAt} is in the future.`, "updatedAt");
      }
      if (article.updatedAt < article.publishedAt) {
        add(
          `Updated date ${article.updatedAt} precedes the published date ${article.publishedAt}.`,
          "updatedAt",
        );
      }
    }
  }

  /* --- SEO metadata --- */

  const metaLength = article.metaDescription.trim().length;
  if (metaLength === 0) {
    add("Meta description is required.", "metaDescription", completeness);
  } else if (metaLength < META_DESCRIPTION_MIN || metaLength > META_DESCRIPTION_MAX) {
    add(
      `Meta description is ${metaLength} characters; aim for ${META_DESCRIPTION_MIN}–${META_DESCRIPTION_MAX}.`,
      "metaDescription",
      "warning",
    );
  }

  if (!article.title.trim()) add("Title is required.", "title", completeness);
  if (article.title.length > TITLE_MAX) {
    add(
      `Title is ${article.title.length} characters; over ${TITLE_MAX} is unwieldy.`,
      "title",
      "warning",
    );
  }
  if (article.seoTitle && article.seoTitle.length > SEO_TITLE_MAX) {
    add(
      `seoTitle is ${article.seoTitle.length} characters; over ${SEO_TITLE_MAX} will be rewritten in search results.`,
      "seoTitle",
      "warning",
    );
  }

  if (!article.standfirst.trim()) add("Standfirst is required.", "standfirst", completeness);
  if (!article.excerpt.trim())
    add("Excerpt is required — it is the card and list copy.", "excerpt", completeness);
  if (!article.primaryKeyword.trim())
    add("A primary keyword is required.", "primaryKeyword", completeness);

  /* --- editorial quality --- */

  const text = articleText(article);
  const words = articleWordCount(article);

  // A draft is allowed to be unfinished — that is what the flag is for. It is
  // noindex and excluded from every listing, so it cannot hurt the site.
  // A published article has no such excuse.
  const publishedSeverity: Severity = article.draft ? "warning" : "error";

  if (words < STUB_WORD_COUNT) {
    add(
      article.draft
        ? `Draft, ${words} words. Needs ${THIN_WORD_COUNT}+ before draft can be lifted.`
        : `Only ${words} words. This is a stub, not an article. Finish it, or set draft: true so it is not indexed.`,
      "body",
      publishedSeverity,
    );
  } else if (words < THIN_WORD_COUNT) {
    add(
      article.draft
        ? `Draft, ${words} words. Needs ${THIN_WORD_COUNT}+ before draft can be lifted.`
        : `Only ${words} words. Thin for a technical article; aim for ${THIN_WORD_COUNT}+ or fold it into a larger piece.`,
      "body",
      "warning",
    );
  }

  const found = FILLER_PHRASES.filter((phrase) => text.toLowerCase().includes(phrase));
  if (found.length >= 3) {
    add(
      `Reads as generated filler — contains ${found.length} stock phrases: ${found.slice(0, 5).join("; ")}.`,
      "body",
    );
  } else if (found.length > 0) {
    add(`Stock phrasing: ${found.join("; ")}. Rewrite in plain terms.`, "body", "warning");
  }

  for (const pattern of PLACEHOLDER_PATTERNS) {
    const hit = text.match(pattern);
    if (hit) add(`Placeholder text left in the article: "${hit[0]}".`, "body");
  }

  // An odd number of asterisks means an unclosed **bold** or *italic* run,
  // which renders the asterisks literally on the page. Cheap to check, and
  // invisible in review until someone looks at the rendered article.
  const asterisks = (text.match(/\*/g) ?? []).length;
  if (asterisks % 2 !== 0) {
    add(
      `Unbalanced emphasis markers (${asterisks} asterisks). An unclosed ** or * renders literally.`,
      "body",
    );
  }
  const backticks = (text.match(/`/g) ?? []).length;
  if (backticks % 2 !== 0) {
    add(
      `Unbalanced inline-code markers (${backticks} backticks). An unclosed backtick renders literally.`,
      "body",
    );
  }

  // A long article with no subheadings cannot be scanned, has no table of
  // contents, and gives search engines nothing to extract as an answer.
  const headings = article.body.filter((b) => b.type === "h2" || b.type === "h3").length;
  if (words > HEADINGS_REQUIRED_ABOVE && headings < 2) {
    add(`${words} words with ${headings} heading(s). Break it up.`, "body");
  }

  // The first block sets up the piece; a one-line opener is not an introduction.
  const opener = article.body[0];
  if (!opener) add("Article has no body.", "body");
  else if (opener.type !== "p") {
    add("Article opens with a heading or block rather than an introduction.", "body", "warning");
  } else if (opener.text.trim().split(/\s+/).length < 25) {
    add("Opening paragraph is too short to introduce the article.", "body", "warning");
  }

  // Internal links make an article part of the site; external ones support
  // claims. Both are structural SEO signals, not decoration.
  const links = inlineLinks(article);

  // Every inline internal link must resolve, and a published article must not
  // send readers to a noindex draft.
  for (const target of links.internalTargets) {
    const match = articles.find((a) => `/${a.category}/${a.slug}` === target);
    if (!match) {
      const isKnownPage =
        KNOWN_STATIC_PATHS.includes(target) || context.categoryMap.has(target.slice(1));
      if (!isKnownPage) add(`Inline link points at "${target}", which does not exist.`, "body");
    } else if (match.draft && !article.draft) {
      add(
        `Inline link points at "${target}", which is a draft — a published article must not link to noindex content.`,
        "body",
      );
    }
  }

  if (words >= THIN_WORD_COUNT && links.internal === 0) {
    add(
      "No inline internal links. Add at least one link to a related article so the piece is not an island.",
      "body",
      "warning",
    );
  }
  if (words >= THIN_WORD_COUNT && (article.sources?.length ?? 0) === 0) {
    add(
      "No sources. An article this length making factual claims needs authoritative references.",
      "sources",
      "warning",
    );
  }

  /* --- social card --- */

  if (article.heroImage) {
    if (!/^(https?:\/\/|\/)/.test(article.heroImage)) {
      add(
        "heroImage must be an absolute URL or start with / — a relative path resolves differently per page.",
        "heroImage",
      );
    }
    if (!article.heroImageAlt?.trim()) {
      add("heroImageAlt is required whenever heroImage is set.", "heroImageAlt");
    }
  } else if (article.heroImageAlt) {
    add("heroImageAlt is set but there is no heroImage.", "heroImageAlt", "warning");
  }

  /* --- tags --- */

  if (article.tags.length === 0) {
    add(
      "At least one tag is required; related-article ranking depends on them.",
      "tags",
      completeness,
    );
  }
  const tagSet = new Set(article.tags);
  if (tagSet.size !== article.tags.length) add("Duplicate tags.", "tags");
  for (const tag of article.tags) {
    if (tag !== tag.trim()) add(`Tag "${tag}" has leading or trailing whitespace.`, "tags");
  }

  /* --- body structure --- */

  const headingIds = new Set<string>();
  let h2Count = 0;

  for (const [index, block] of article.body.entries()) {
    const at = `body[${index}]`;

    if (block.type === "h2" || block.type === "h3") {
      if (block.type === "h2") h2Count += 1;
      if (!block.text.trim()) add("Empty heading.", at);
      if (!SLUG_PATTERN.test(block.id)) {
        add(`Heading id "${block.id}" must be lowercase and hyphenated to work as an anchor.`, at);
      }
      if (headingIds.has(block.id)) {
        add(`Duplicate heading id "${block.id}" — table-of-contents links would collide.`, at);
      }
      headingIds.add(block.id);
    }

    if (block.type === "table") {
      if (block.head.length === 0) add("Table has no header row.", at);
      for (const [rowIndex, row] of block.rows.entries()) {
        if (row.length !== block.head.length) {
          add(
            `Table row ${rowIndex} has ${row.length} cells but the header has ${block.head.length}.`,
            at,
          );
        }
      }
    }

    if (block.type === "code" && !block.language.trim()) {
      add("Code block has no language — syntax highlighting and the label depend on it.", at);
    }

    if (block.type === "diagram" && !block.ascii.trim()) {
      add("Diagram has no content.", at);
    }
  }

  if (h2Count === 0) {
    add("No H2 headings — the article would render an empty table of contents.", "body", "warning");
  }

  // Reading time is derived, not asserted. An inflated figure is a small lie
  // a reader catches within seconds, so drift is an error rather than a nudge.
  const expectedMinutes = estimateReadingMinutes(article);
  if (article.readingMinutes !== expectedMinutes) {
    add(
      `readingMinutes is ${article.readingMinutes} but the body computes to ${expectedMinutes} (${words} words). Set it to ${expectedMinutes}.`,
      "readingMinutes",
    );
  }
  if (!Number.isInteger(article.readingMinutes) || article.readingMinutes < 1) {
    add("readingMinutes must be a positive whole number.", "readingMinutes");
  }

  /* --- internal links --- */

  for (const related of article.relatedSlugs ?? []) {
    if (related === article.slug) add("Article lists itself as related.", "relatedSlugs");
    else if (!context.slugs.has(related)) {
      add(`relatedSlugs points at unknown article "${related}".`, "relatedSlugs");
    }
  }

  /* --- structured data inputs --- */

  for (const [index, entry] of (article.faq ?? []).entries()) {
    if (!entry.question.trim()) add("Empty FAQ question.", `faq[${index}]`);
    if (!entry.answer.trim()) add("Empty FAQ answer.", `faq[${index}]`);
    if (!entry.question.trim().endsWith("?")) {
      add(
        `FAQ question "${entry.question}" does not end with a question mark.`,
        `faq[${index}]`,
        "warning",
      );
    }
  }

  for (const [index, source] of (article.sources ?? []).entries()) {
    if (!source.title.trim()) add("Source has no title.", `sources[${index}]`);
    if (!source.publisher.trim()) add("Source has no publisher.", `sources[${index}]`);
    let url: URL | undefined;
    try {
      url = new URL(source.url);
    } catch {
      add(`Source URL "${source.url}" is not a valid absolute URL.`, `sources[${index}]`);
    }
    if (url && url.protocol !== "https:") {
      add(`Source URL "${source.url}" should use https.`, `sources[${index}]`, "warning");
    }
  }

  // E-E-A-T: a claim about how the work was done should accompany the status.
  if (!article.methodology?.trim()) {
    add(
      "No methodology statement — the article renders a basis-of-assessment block with nothing in it.",
      "methodology",
      "warning",
    );
  }
}

/* ------------------------------------------------------------------ */
/* Entry point                                                         */
/* ------------------------------------------------------------------ */

/**
 * Cross-article checks: duplicate titles, descriptions and prose.
 *
 * Duplicate metadata across two URLs is the classic self-inflicted SEO
 * problem — the pages compete with each other and Google picks one, usually
 * not the one you wanted.
 */
function validateUniqueness(issues: Issue[]): void {
  const seenField = (
    field: "title" | "seoTitle" | "metaDescription" | "standfirst" | "excerpt",
  ) => {
    const byValue = new Map<string, string[]>();
    for (const article of articles) {
      const value = (article[field] ?? "").trim().toLowerCase();
      if (!value) continue;
      byValue.set(value, [...(byValue.get(value) ?? []), article.slug]);
    }
    for (const [, slugsWithValue] of byValue) {
      if (slugsWithValue.length < 2) continue;
      for (const slug of slugsWithValue) {
        issues.push({
          severity: "error",
          subject: `article:${slug}`,
          field,
          message: `Duplicate ${field}, shared with: ${slugsWithValue.filter((s) => s !== slug).join(", ")}.`,
        });
      }
    }
  };

  seenField("title");
  seenField("seoTitle");
  seenField("metaDescription");
  seenField("standfirst");
  seenField("excerpt");

  // Substantial sentences repeated verbatim across articles.
  const bySentence = new Map<string, Set<string>>();
  for (const article of articles) {
    for (const sentence of sentences(articleText(article))) {
      const set = bySentence.get(sentence) ?? new Set<string>();
      set.add(article.slug);
      bySentence.set(sentence, set);
    }
  }
  const reported = new Set<string>();
  for (const [sentence, slugSet] of bySentence) {
    if (slugSet.size < 2) continue;
    const key = [...slugSet].sort().join("|");
    if (reported.has(key)) continue;
    reported.add(key);
    issues.push({
      severity: "warning",
      subject: `article:${[...slugSet].sort()[0]}`,
      field: "body",
      message: `Sentence duplicated across ${[...slugSet].sort().join(", ")}: "${sentence.slice(0, 70)}…"`,
    });
  }

  // Two articles targeting one keyword cannibalise each other's ranking.
  const byKeyword = new Map<string, string[]>();
  for (const article of articles) {
    const keyword = article.primaryKeyword.trim().toLowerCase();
    if (!keyword) continue;
    byKeyword.set(keyword, [...(byKeyword.get(keyword) ?? []), article.slug]);
  }
  for (const [keyword, slugsForKeyword] of byKeyword) {
    if (slugsForKeyword.length < 2) continue;
    issues.push({
      severity: "warning",
      subject: `article:${slugsForKeyword[0]}`,
      field: "primaryKeyword",
      message: `"${keyword}" is the primary keyword for ${slugsForKeyword.length} articles (${slugsForKeyword.join(", ")}) — they will compete.`,
    });
  }
}

export function validateContent(): Issue[] {
  const issues: Issue[] = [];

  validateCategories(issues);

  const categoryMap = new Map(categories.map((c) => [c.slug, c]));
  const authorIds = new Set(authors.map((a) => a.id));
  const slugs = new Set(articles.map((a) => a.slug));

  // Slugs are looked up globally by relatedSlugs, so they must be unique across
  // categories even though the URL is scoped by one.
  const counts = new Map<string, number>();
  for (const article of articles) {
    counts.set(article.slug, (counts.get(article.slug) ?? 0) + 1);
  }
  for (const [slug, count] of counts) {
    if (count > 1) {
      issues.push({
        severity: "error",
        subject: `article:${slug}`,
        field: "slug",
        message: `${count} articles share this slug.`,
      });
    }
  }

  for (const article of articles) {
    validateArticle(article, { categoryMap, authorIds, slugs }, issues);
  }

  validateUniqueness(issues);

  if (articles.length === 0) {
    issues.push({
      severity: "error",
      subject: "articles",
      message: "The article store is empty.",
    });
  }

  return issues;
}

export function formatIssues(issues: Issue[]): string {
  const bySubject = new Map<string, Issue[]>();
  for (const issue of issues) {
    const list = bySubject.get(issue.subject) ?? [];
    list.push(issue);
    bySubject.set(issue.subject, list);
  }

  const lines: string[] = [];
  for (const [subject, list] of [...bySubject].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(subject);
    for (const issue of list) {
      const marker = issue.severity === "error" ? "error  " : "warning";
      lines.push(`  ${marker} ${issue.field ? `${issue.field}: ` : ""}${issue.message}`);
    }
  }
  return lines.join("\n");
}

/** Human-readable tally for the CLI and for CI logs. */
export function summarise(issues: Issue[]): string {
  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  return (
    `${articles.length} articles, ${categories.length} categories checked — ` +
    `${errors} error(s), ${warnings} warning(s).`
  );
}
