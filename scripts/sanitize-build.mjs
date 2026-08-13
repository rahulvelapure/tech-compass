/**
 * Strips absolute build-machine paths out of the production output.
 *
 * TanStack Start's route manifest records the source file behind each route,
 * and it records it as an absolute path — so a build produced on a developer's
 * laptop ships a file containing, for every route:
 *
 *   filePath: "C:/Users/<name>/Downloads/<project>/src/routes/__root.tsx"
 *
 * That is inside the deployed Worker bundle. It is not rendered to the page,
 * but it discloses the operator's username and local directory layout to
 * anyone who obtains the bundle, and it makes builds non-reproducible across
 * machines. Neither is acceptable in something published to a public domain.
 *
 * This rewrites those paths to be project-relative. Runs automatically after
 * every build; see the `build` and `build:node` scripts.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";

const ROOT = process.cwd();
const OUTPUT = join(ROOT, ".output");

/** Both separator conventions — Vite normalises some paths and not others. */
const ABSOLUTE_FORMS = [ROOT.split(sep).join("/"), ROOT.split(sep).join("\\\\"), ROOT];

const SKIP_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".woff", ".woff2"]);

let filesChanged = 0;
let replacements = 0;

function walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const info = statSync(full);
    if (info.isDirectory()) walk(full);
    else if (info.isFile()) sanitize(full);
  }
}

function sanitize(file) {
  if (SKIP_EXT.has(extname(file).toLowerCase())) return;

  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    return;
  }

  let updated = content;
  for (const form of ABSOLUTE_FORMS) {
    if (!updated.includes(form)) continue;
    // Leading "." keeps the value a usable relative path rather than turning
    // "/project/src/routes/x.tsx" into a root-absolute "/src/routes/x.tsx".
    const parts = updated.split(form);
    replacements += parts.length - 1;
    updated = parts.join(".");
  }

  if (updated !== content) {
    writeFileSync(file, updated);
    filesChanged += 1;
    console.log(`  sanitised ${relative(ROOT, file).split(sep).join("/")}`);
  }
}

try {
  statSync(OUTPUT);
} catch {
  console.log("sanitize-build: no .output directory, nothing to do.");
  process.exit(0);
}

walk(OUTPUT);

console.log(
  filesChanged === 0
    ? "sanitize-build: no build-machine paths found in .output."
    : `sanitize-build: removed ${replacements} absolute path(s) from ${filesChanged} file(s).`,
);
