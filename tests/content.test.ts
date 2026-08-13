import { describe, expect, it } from "vitest";

import { formatIssues, validateContent } from "../scripts/validate-content";

/**
 * The same validator the `validate:content` script runs, wired into the test
 * suite so a broken article fails CI whichever entry point runs first.
 *
 * Errors fail. Warnings are surfaced in the test output but tolerated — they
 * are editorial guidance (a meta description slightly out of range) rather
 * than something that breaks a page.
 */
describe("content store", () => {
  const issues = validateContent();
  const errors = issues.filter((issue) => issue.severity === "error");
  const warnings = issues.filter((issue) => issue.severity === "warning");

  it("has no schema or metadata errors", () => {
    expect(errors, `\n${formatIssues(errors)}\n`).toEqual([]);
  });

  it("reports warnings without failing", () => {
    if (warnings.length > 0) {
      console.warn(`\nContent warnings:\n${formatIssues(warnings)}\n`);
    }
    expect(Array.isArray(warnings)).toBe(true);
  });
});
