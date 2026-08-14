import { describe, expect, it } from "vitest";

import { articles } from "../src/content/articles";
import { findMojibake } from "../scripts/validate-content";

/**
 * Regression guard for encoding corruption.
 *
 * A tool once rewrote 26 article files as Windows-1252 and saved them back as
 * UTF-8, turning every em dash into `â€"` and prepending a byte-order mark.
 * The result reached the rendered page. Nothing caught it: the files were
 * still *valid* UTF-8, so TypeScript, ESLint, Prettier and every existing
 * content rule passed. Only reading the page revealed it.
 *
 * The detector is deliberately conservative. `Ã` and `Â` are real letters in
 * French, Portuguese and Welsh, so they are only flagged when followed by the
 * continuation character that a double-encoding produces. A rule that fired on
 * "Ão" would be ignored within a week.
 */
describe("mojibake detection", () => {
  it("flags a double-encoded em dash", () => {
    expect(findMojibake("the last page â€” before assignments")).toContain(
      "double-encoded punctuation",
    );
  });

  it("flags a double-encoded right single quote", () => {
    expect(findMojibake("Microsoftâ€™s documentation")).toContain("double-encoded punctuation");
  });

  it("flags a double-encoded accented letter", () => {
    // "café" mis-encoded: é (C3 A9) read as cp1252 becomes Ã©
    expect(findMojibake("cafÃ© latte")).toContain("double-encoded accented letter");
  });

  it("flags a double-encoded non-breaking space", () => {
    expect(findMojibake("100Â MB limit")).toContain("double-encoded Latin-1");
  });

  it("flags a byte-order mark", () => {
    expect(findMojibake("﻿import type { Article }")).toContain("byte-order mark");
  });

  it("flags the Unicode replacement character", () => {
    expect(findMojibake("value is � here")).toContain("Unicode replacement character");
  });

  it("does not flag correctly encoded text", () => {
    const safe = [
      "The rule applies — with one exception — to every device.",
      "Microsoft’s documentation says “conflict” means something specific.",
      "An en dash range: 10–20 minutes, and an ellipsis…",
      "Plain ASCII with no special characters at all.",
      "Bullet • separated • values",
    ];
    for (const text of safe) expect(findMojibake(text), text).toEqual([]);
  });

  it("does not flag legitimate accented words", () => {
    // These contain Ã / Â as real letters, not as corruption lead bytes.
    const safe = [
      "São Paulo data centre",
      "Angângueira", // Â followed by a letter, not punctuation
      "Résumé, naïve, Zürich, Ångström",
      "François configured the façade",
    ];
    for (const text of safe) expect(findMojibake(text), text).toEqual([]);
  });
});

describe("content store encoding", () => {
  it("contains no encoding corruption in any article", () => {
    const offenders: string[] = [];
    for (const a of articles) {
      const fields: [string, string][] = [
        ["title", a.title],
        ["seoTitle", a.seoTitle ?? ""],
        ["metaDescription", a.metaDescription],
        ["standfirst", a.standfirst],
        ["excerpt", a.excerpt],
        ["methodology", a.methodology ?? ""],
        ["faq", (a.faq ?? []).map((f) => `${f.question} ${f.answer}`).join(" ")],
        ["body", JSON.stringify(a.body)],
      ];
      for (const [field, value] of fields) {
        for (const kind of findMojibake(value)) offenders.push(`${a.slug} — ${field}: ${kind}`);
      }
    }
    expect(offenders, `\n${offenders.join("\n")}\n`).toEqual([]);
  });
});
