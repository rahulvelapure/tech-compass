/**
 * CLI wrapper for the content validator.
 *
 * Kept separate from validate-content.ts so that module stays a pure library
 * the test suite can import without a process exit as a side effect.
 *
 *   bun run validate:content
 *
 * Errors exit non-zero and fail the build. Warnings are printed and do not,
 * so an editorial nit never blocks a deploy.
 */

import { formatIssues, summarise, validateContent } from "./validate-content";

const issues = validateContent();

if (issues.length > 0) console.log(formatIssues(issues));
console.log(`\n${summarise(issues)}`);

if (issues.some((issue) => issue.severity === "error")) process.exit(1);
