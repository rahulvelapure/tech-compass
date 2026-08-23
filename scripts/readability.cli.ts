/**
 * Corpus readability report against the editorial gates.
 *
 *   bun run scripts/readability.cli.ts            # every article
 *   bun run scripts/readability.cli.ts <slug>...  # named articles
 *   bun run scripts/readability.cli.ts --json
 */
import { articles } from "../src/content/articles";
import type { Article, Block } from "../src/content/types";
import { measure, stripMarkup } from "./readability";

export const GATES = {
  standfirst: 70,
  faqAnswer: 70,
  openingParagraph: 65,
  body: 55,
  maxAverageSentence: 15,
  maxSentenceWords: 35,
} as const;

/** Prose only. Code, ASCII diagrams and inline SVG carry no sentences. */
function bodyProse(article: Article): string {
  const out: string[] = [];
  for (const block of article.body as Block[]) {
    switch (block.type) {
      case "p":
      case "h2":
      case "h3":
        out.push(block.text);
        break;
      case "ul":
      case "ol":
        out.push(...block.items);
        break;
      case "callout":
        out.push(block.title, block.text);
        break;
      case "quote":
        out.push(block.text);
        break;
      case "table":
      case "diagram":
      case "figure":
        if (block.caption) out.push(block.caption);
        break;
    }
  }
  /*
   * Each block is terminated before the blocks are joined.
   *
   * Headings and list items are not written with a full stop. Joining them
   * raw runs a heading into the paragraph beneath it, and the sentence
   * splitter then reads the pair as one very long sentence — which inflates
   * both the average and the longest-sentence figure, and reports a sentence
   * that nobody wrote. Terminating each block keeps the boundary the author
   * intended.
   */
  return out
    .map(stripMarkup)
    .filter(Boolean)
    .map((text) => (/[.!?]$/.test(text) ? text : `${text}.`))
    .join(" ");
}

export interface ArticleReport {
  slug: string;
  draft: boolean;
  words: number;
  bodyFlesch: number;
  standfirstFlesch: number;
  openingFlesch: number;
  faqWorst: number | null;
  asl: number;
  longestSentence: number;
  failures: string[];
}

export function reportArticle(article: Article): ArticleReport {
  const body = measure(bodyProse(article));
  const standfirst = measure(article.standfirst);
  const firstParagraph = (article.body as Block[]).find((b) => b.type === "p");
  const opening =
    firstParagraph && firstParagraph.type === "p" ? measure(firstParagraph.text) : null;
  const faqScores = (article.faq ?? []).map((f) => measure(f.answer).flesch);
  const faqWorst = faqScores.length ? Math.min(...faqScores) : null;

  const failures: string[] = [];
  if (body.flesch < GATES.body) failures.push(`body ${body.flesch.toFixed(1)} < ${GATES.body}`);
  if (standfirst.flesch < GATES.standfirst)
    failures.push(`standfirst ${standfirst.flesch.toFixed(1)} < ${GATES.standfirst}`);
  if (opening && opening.flesch < GATES.openingParagraph)
    failures.push(`opening ${opening.flesch.toFixed(1)} < ${GATES.openingParagraph}`);
  if (faqWorst !== null && faqWorst < GATES.faqAnswer)
    failures.push(`faq ${faqWorst.toFixed(1)} < ${GATES.faqAnswer}`);
  if (body.asl > GATES.maxAverageSentence)
    failures.push(`asl ${body.asl.toFixed(1)} > ${GATES.maxAverageSentence}`);
  if (body.longestSentence > GATES.maxSentenceWords)
    failures.push(`longest ${body.longestSentence} > ${GATES.maxSentenceWords}`);

  return {
    slug: article.slug,
    draft: !!article.draft,
    words: body.words,
    bodyFlesch: +body.flesch.toFixed(1),
    standfirstFlesch: +standfirst.flesch.toFixed(1),
    openingFlesch: opening ? +opening.flesch.toFixed(1) : 0,
    faqWorst: faqWorst === null ? null : +faqWorst.toFixed(1),
    asl: +body.asl.toFixed(1),
    longestSentence: body.longestSentence,
    failures,
  };
}

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const wanted = args.filter((a) => !a.startsWith("--"));
const selected = wanted.length
  ? articles.filter((a) => wanted.includes(a.slug))
  : (articles as Article[]);

const reports = selected.map(reportArticle);

if (asJson) {
  console.log(JSON.stringify(reports, null, 2));
} else {
  console.log("| Article | Words | Body | Stand | Open | FAQ | ASL | Max | Gate |");
  console.log("|---|--:|--:|--:|--:|--:|--:|--:|---|");
  for (const r of reports) {
    console.log(
      `| ${r.slug}${r.draft ? " *(draft)*" : ""} | ${r.words} | ${r.bodyFlesch} | ${r.standfirstFlesch} | ${r.openingFlesch} | ${r.faqWorst ?? "—"} | ${r.asl} | ${r.longestSentence} | ${r.failures.length ? "FAIL" : "PASS"} |`,
    );
  }
  const failed = reports.filter((r) => r.failures.length);
  console.log(`\n${reports.length - failed.length}/${reports.length} pass all gates.`);
  for (const r of failed) console.log(`  ${r.slug}: ${r.failures.join("; ")}`);
}
