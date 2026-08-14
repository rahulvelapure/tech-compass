import { describe, expect, it } from "vitest";

import { articles } from "../src/content/articles";
import { findNestedInlineMarkup } from "../scripts/validate-content";

/**
 * Regression guard for nested inline markup.
 *
 * `RichText` (src/components/article/ArticleBody.tsx) parses inline constructs
 * in a single non-recursive pass: the first alternative to match consumes its
 * entire run, and nothing inside that run is parsed again. So `**bold with
 * `code`**` emits the backticks as literal characters on the page.
 *
 * This defect reached the rendered site three times. It is invisible to
 * typecheck, lint and every other content rule — the string is valid, the
 * markers are balanced, and only the rendered DOM shows the problem. These
 * tests pin both halves: the detector recognises each nesting combination, and
 * no article in the store contains one.
 *
 * If the renderer is ever upgraded to parse nested markup, the first block
 * here is what should be revisited — deleting the rule without changing the
 * renderer is what lets the defect back in.
 */
describe("nested inline markup detection", () => {
  it("flags inline code inside bold", () => {
    expect(findNestedInlineMarkup("**Reading `IntuneManagementExtension.log` first.**")).toContain(
      "inline code inside bold",
    );
  });

  it("flags a link inside bold", () => {
    expect(
      findNestedInlineMarkup("**See [the policy guide](/microsoft-intune/policy) before this.**"),
    ).toContain("a link inside bold");
  });

  it("flags italic inside bold", () => {
    expect(findNestedInlineMarkup("**Never *ever* do this.**")).toContain("italic inside bold");
  });

  it("flags inline code inside italic", () => {
    expect(findNestedInlineMarkup("*run `setup.exe` quietly*")).toContain(
      "inline code inside italic",
    );
  });

  it("accepts the same constructs when they are siblings rather than nested", () => {
    const safe = [
      "**Bold text.** Followed by `code` and *italic* separately.",
      "`code` then **bold** then [a link](/about).",
      "Plain prose with no markup at all.",
      "**Two bold runs** in one sentence, **both fine**, plus `code` outside them.",
      "*Italic first*, then `code` afterwards.",
    ];
    for (const text of safe) {
      expect(findNestedInlineMarkup(text), text).toEqual([]);
    }
  });
});

describe("content store", () => {
  it("contains no nested inline markup in any RichText-parsed field", () => {
    const offenders: string[] = [];

    for (const article of articles) {
      const check = (where: string, text: string) => {
        for (const kind of findNestedInlineMarkup(text)) {
          offenders.push(`${article.slug} — ${where}: ${kind}`);
        }
      };

      // Only the fields RichText parses. Headings, table captions, quotes and
      // FAQ answers render raw, so markup there is a different problem.
      article.body.forEach((block, i) => {
        if (block.type === "p") check(`body[${i}] p`, block.text);
        else if (block.type === "ul" || block.type === "ol") {
          block.items.forEach((item, j) => check(`body[${i}] ${block.type}[${j}]`, item));
        } else if (block.type === "table") {
          block.rows.forEach((row, r) =>
            row.forEach((cell, c) => check(`body[${i}] table [${r}][${c}]`, cell)),
          );
        } else if (block.type === "callout") check(`body[${i}] callout`, block.text);
      });
    }

    expect(offenders, `\n${offenders.join("\n")}\n`).toEqual([]);
  });
});
