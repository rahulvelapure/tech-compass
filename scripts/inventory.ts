/**
 * Editorial dashboard.
 *
 *   bun run inventory              pipeline by segment
 *   bun run inventory --articles   per-article detail
 *   bun run inventory --review     only what is due for review
 *   bun run inventory --next       the next things worth writing
 *
 * Joins two sources: the published articles under src/content/articles, and
 * the planned backlog under editorial/. A topic and an article are the same
 * thing at different stages, linked by `articleSlug`.
 */

import { articles } from "@/content/articles";
import { categories } from "@/content/categories";
import {
  articleWordCount,
  estimateReadingMinutes,
  reviewState,
  type ReviewState,
} from "@/lib/content";
import { segments, type Topic, type TopicStatus } from "../editorial";
import type { Article } from "@/content/types";

const args = new Set(process.argv.slice(2));
const TARGET_WORDS = 1800;

/* ------------------------------------------------------------------ */
/* Article view                                                        */
/* ------------------------------------------------------------------ */

function inlineLinks(article: Article): number {
  const text = article.body
    .map((b) =>
      "text" in b
        ? b.text
        : "items" in b
          ? b.items.join(" ")
          : "rows" in b
            ? b.rows.flat().join(" ")
            : "",
    )
    .join(" ");
  return [...text.matchAll(/\[[^\]]+\]\((\/[^)\s]+)\)/g)].length;
}

const REVIEW_LABEL: Record<ReviewState, string> = {
  current: "",
  due: "DUE",
  overdue: "OVERDUE",
  unscheduled: "unscheduled",
};

function articleTable() {
  const rows = articles
    .map((article) => ({
      slug: article.slug,
      category: article.category,
      state: article.draft ? "draft" : "PUBLISHED",
      words: articleWordCount(article),
      minutes: estimateReadingMinutes(article),
      h2: article.body.filter((b) => b.type === "h2").length,
      faq: article.faq?.length ?? 0,
      sources: article.sources?.length ?? 0,
      links: inlineLinks(article),
      review: article.draft ? "" : REVIEW_LABEL[reviewState(article)],
      short: !article.draft && articleWordCount(article) < TARGET_WORDS,
    }))
    .sort((a, b) => {
      if (a.state !== b.state) return a.state === "PUBLISHED" ? -1 : 1;
      return b.words - a.words;
    });

  console.log(
    "\nstate      slug                                       category                words  min  h2 faq src link  review",
  );
  console.log("-".repeat(122));
  for (const r of rows) {
    console.log(
      `${r.state.padEnd(10)} ${r.slug.padEnd(42)} ${r.category.padEnd(22)}` +
        `${String(r.words).padStart(6)}${String(r.minutes).padStart(5)}` +
        `${String(r.h2).padStart(4)}${String(r.faq).padStart(4)}${String(r.sources).padStart(4)}` +
        `${String(r.links).padStart(5)}  ${r.review}` +
        (r.short ? "  << below standard" : ""),
    );
  }

  const published = rows.filter((r) => r.state === "PUBLISHED");
  const words = published.reduce((n, r) => n + r.words, 0);
  console.log(
    `\n${rows.length} articles: ${published.length} published, ${rows.length - published.length} draft`,
  );
  console.log(
    `Published corpus: ${words.toLocaleString()} words, ` +
      `${published.length ? Math.round(words / published.length) : 0} average, ` +
      `${published.filter((r) => !r.short).length}/${published.length} at the ${TARGET_WORDS}-word standard`,
  );
}

/* ------------------------------------------------------------------ */
/* Pipeline view                                                       */
/* ------------------------------------------------------------------ */

/** Statuses shown as columns, in pipeline order. */
const COLUMNS: { key: TopicStatus | "NEEDS_UPDATE"; label: string }[] = [
  { key: "PUBLISHED", label: "Published" },
  { key: "READY", label: "Ready" },
  { key: "TECHNICAL_REVIEW", label: "Tech rev" },
  { key: "EDITORIAL_REVIEW", label: "Ed rev" },
  { key: "DRAFT", label: "Draft" },
  { key: "RESEARCHED", label: "Researchd" },
  { key: "RESEARCHING", label: "Researchg" },
  { key: "IDEA", label: "Ideas" },
];

/**
 * A topic's effective status. PUBLISHED topics whose article has passed its
 * review date are reported as NEEDS_UPDATE — the backlog should reflect the
 * article's real state, not the state it was left in.
 */
function effectiveStatus(topic: Topic): TopicStatus {
  if (topic.status !== "PUBLISHED") return topic.status;
  const article = articles.find((a) => a.slug === topic.articleSlug);
  if (!article || article.draft) return topic.status;
  const state = reviewState(article);
  return state === "due" || state === "overdue" ? "NEEDS_UPDATE" : "PUBLISHED";
}

function pipeline() {
  console.log(
    "\nsegment                        " +
      COLUMNS.map((c) => c.label.padStart(10)).join("") +
      "   Needs upd     Total",
  );
  console.log("-".repeat(126));

  const totals = new Map<string, number>();
  let grandTotal = 0;
  let needsUpdateTotal = 0;

  for (const segment of segments) {
    const counts = new Map<string, number>();
    let needsUpdate = 0;

    for (const topic of segment.topics) {
      const status = effectiveStatus(topic);
      if (status === "NEEDS_UPDATE") needsUpdate += 1;
      else counts.set(status, (counts.get(status) ?? 0) + 1);
      totals.set(status, (totals.get(status) ?? 0) + 1);
    }

    grandTotal += segment.topics.length;
    needsUpdateTotal += needsUpdate;

    console.log(
      segment.name.padEnd(31) +
        COLUMNS.map((c) => String(counts.get(c.key) ?? 0).padStart(10)).join("") +
        String(needsUpdate).padStart(12) +
        String(segment.topics.length).padStart(10),
    );
  }

  console.log("-".repeat(126));
  console.log(
    "TOTAL".padEnd(31) +
      COLUMNS.map((c) => String(totals.get(c.key) ?? 0).padStart(10)).join("") +
      String(needsUpdateTotal).padStart(12) +
      String(grandTotal).padStart(10),
  );

  /* Segments with no backlog at all. */
  const planned = new Set(segments.map((s) => s.category));
  const unplanned = categories.filter((c) => c.group !== "site" && !planned.has(c.slug));
  if (unplanned.length > 0) {
    console.log(`\nNo backlog yet (${unplanned.length} categories):`);
    console.log("  " + unplanned.map((c) => c.slug).join(", "));
  }
}

/* ------------------------------------------------------------------ */
/* Review view                                                         */
/* ------------------------------------------------------------------ */

function review() {
  const published = articles.filter((a) => !a.draft);
  const rows = published
    .map((a) => ({ slug: a.slug, due: a.nextReviewAt ?? "—", state: reviewState(a) }))
    .filter((r) => r.state !== "current")
    .sort((a, b) => a.due.localeCompare(b.due));

  if (rows.length === 0) {
    console.log("\nEvery published article is within its review window.");
    return;
  }

  console.log("\nslug                                       next review   state");
  console.log("-".repeat(72));
  for (const r of rows) {
    console.log(`${r.slug.padEnd(42)} ${r.due.padEnd(13)} ${REVIEW_LABEL[r.state]}`);
  }
  console.log(`\n${rows.length} of ${published.length} published articles need attention.`);
}

/* ------------------------------------------------------------------ */
/* Next-up view                                                        */
/* ------------------------------------------------------------------ */

function next() {
  const rank = { P0: 0, P1: 1, P2: 2, P3: 3 } as const;
  const candidates = segments
    .flatMap((s) => s.topics.map((t) => ({ segment: s.name, topic: t })))
    .filter(({ topic }) => topic.status !== "PUBLISHED" && topic.status !== "ARCHIVED")
    .sort(
      (a, b) =>
        rank[a.topic.priority] - rank[b.topic.priority] || a.topic.id.localeCompare(b.topic.id),
    )
    .slice(0, 15);

  console.log("\npri  status      id           title");
  console.log("-".repeat(100));
  for (const { topic } of candidates) {
    console.log(
      `${topic.priority.padEnd(5)}${topic.status.padEnd(12)}${topic.id.padEnd(13)}${topic.title}`,
    );
  }
  console.log(
    `\nShowing ${candidates.length} highest-priority unwritten topics. ` +
      `Start one with: bun run content:new <category> <slug>`,
  );
}

/* ------------------------------------------------------------------ */

if (args.has("--articles")) articleTable();
else if (args.has("--review")) review();
else if (args.has("--next")) next();
else {
  pipeline();
  articleTable();
}
