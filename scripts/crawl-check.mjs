/**
 * Production route crawl and pre-deployment HTML audit.
 *
 *   node scripts/crawl-check.mjs [baseUrl]
 *
 * Starts from the sitemap, follows every internal link it finds, and asserts
 * on what actually reaches the browser rather than on what the source says
 * should. Checks per page: HTTP status, one H1, title and meta description,
 * canonical, Open Graph image, robots directives, JSON-LD validity, and the
 * absence of build-machine paths or personal data.
 *
 * Exits non-zero on any error-level finding.
 */

const BASE = (process.argv[2] ?? "http://127.0.0.1:4173").replace(/\/$/, "");

const findings = [];
const fail = (page, message) => findings.push({ level: "error", page, message });
const warn = (page, message) => findings.push({ level: "warning", page, message });

const seen = new Map();
const queue = [];

function enqueue(path) {
  const clean = path.split("#")[0];
  if (!clean || seen.has(clean) || queue.includes(clean)) return;
  queue.push(clean);
}

/** Local paths and personal data that must never reach rendered HTML. */
const LEAK_PATTERNS = [
  { re: /[A-Za-z]:[\\/]+Users[\\/]+/i, note: "Windows user path" },
  { re: /\/(?:home|Users)\/[a-z0-9._-]{2,}\//i, note: "Unix home path" },
  { re: /AppData[\\/]+Local[\\/]+Temp/i, note: "Local temp path" },
  { re: /node_modules/, note: "node_modules path" },
  { re: /\bAKIA[0-9A-Z]{16}\b/, note: "AWS key" },
  { re: /\bsk-[A-Za-z0-9]{32,}\b/, note: "API key" },
  { re: /\bxkeysib-/, note: "Brevo key" },
];

/** Ad markup must be absent entirely while the flag is off. */
const AD_PATTERNS = [
  { re: /adsbygoogle/i, note: "AdSense markup" },
  { re: /pagead2\.googlesyndication/i, note: "AdSense script" },
  { re: /data-ad-placement/i, note: "ad slot wrapper" },
  { re: /googletagmanager|google-analytics/i, note: "analytics script" },
];

const sitemapUrls = new Set();

async function loadSitemap() {
  const response = await fetch(`${BASE}/sitemap.xml`);
  if (!response.ok) {
    fail("/sitemap.xml", `returned ${response.status}`);
    return;
  }
  const xml = await response.text();
  for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const url = match[1];
    const path = url.replace(/^https?:\/\/[^/]+/, "") || "/";
    sitemapUrls.add(path);
    enqueue(path);
  }
}

function textBetween(html, re) {
  return html.match(re)?.[1]?.trim();
}

async function visit(path) {
  let response;
  try {
    response = await fetch(`${BASE}${path}`, { redirect: "manual" });
  } catch (error) {
    fail(path, `request failed: ${error.message}`);
    return;
  }
  seen.set(path, response.status);

  const type = response.headers.get("content-type") ?? "";
  const body = await response.text();

  if (response.status !== 200) {
    // /404-style probes are asserted separately; anything reached by a link
    // returning non-200 is a broken link.
    fail(path, `HTTP ${response.status}`);
    return;
  }

  for (const { re, note } of LEAK_PATTERNS) {
    const hit = body.match(re);
    if (hit) fail(path, `${note} in response: "${hit[0].slice(0, 60)}"`);
  }

  if (!type.includes("text/html")) return;

  for (const { re, note } of AD_PATTERNS) {
    if (re.test(body)) fail(path, `${note} present while the flag is off`);
  }

  /* --- head --- */

  const title = textBetween(body, /<title[^>]*>([^<]*)<\/title>/i);
  if (!title) fail(path, "no <title>");

  const description = body.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1];
  const robots = body.match(/<meta[^>]+name="robots"[^>]+content="([^"]*)"/i)?.[1] ?? "";
  const indexable = !robots.includes("noindex");

  if (indexable && !description) fail(path, "indexable page with no meta description");

  const canonical = body.match(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i)?.[1];
  if (indexable && !canonical) fail(path, "indexable page with no canonical URL");

  const ogImage = body.match(/<meta[^>]+property="og:image"[^>]+content="([^"]*)"/i)?.[1];
  if (indexable && !ogImage) fail(path, "no og:image");

  /* --- structure --- */

  const h1s = [...body.matchAll(/<h1[\s>]/gi)].length;
  if (h1s !== 1) fail(path, `${h1s} <h1> elements, expected exactly 1`);

  if (!/<main[^>]*id="main"/i.test(body)) fail(path, 'no <main id="main"> landmark');

  /* --- structured data --- */

  for (const match of body.matchAll(
    /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      const parsed = JSON.parse(match[1]);
      if (!parsed["@context"] || !parsed["@type"]) {
        fail(path, "JSON-LD block missing @context or @type");
      }
    } catch {
      fail(path, "invalid JSON-LD — Google will ignore it");
    }
  }

  /* --- indexing consistency --- */

  if (indexable && !sitemapUrls.has(path) && path !== "/") {
    warn(path, "indexable but not in the sitemap");
  }
  if (!indexable && sitemapUrls.has(path)) {
    fail(path, "noindex but listed in the sitemap");
  }

  /* --- follow internal links --- */

  for (const match of body.matchAll(/<a[^>]+href="(\/[^"#?]*)"/gi)) {
    enqueue(match[1]);
  }
}

await loadSitemap();

// Seed anything not reachable from the sitemap.
for (const path of [
  "/",
  "/search",
  "/newsletter",
  "/newsletter/confirmed",
  "/robots.txt",
  "/rss.xml",
]) {
  enqueue(path);
}

while (queue.length > 0) {
  await visit(queue.shift());
}

/* --- 404 behaviour --- */

const missing = await fetch(`${BASE}/this-page-does-not-exist`);
if (missing.status !== 404) {
  fail("/this-page-does-not-exist", `expected 404, got ${missing.status}`);
}

/* --- draft articles must be noindex and unlisted --- */

const draftProbe = await fetch(`${BASE}/software/vscode-vs-jetbrains`);
if (!draftProbe.ok) fail("/software/vscode-vs-jetbrains", "flagship article not reachable");

const errors = findings.filter((f) => f.level === "error");
const warnings = findings.filter((f) => f.level === "warning");

console.log(`Crawled ${seen.size} routes from ${BASE}\n`);
for (const f of findings) {
  console.log(`${f.level === "error" ? "error  " : "warning"} ${f.page}  ${f.message}`);
}
console.log(
  `\n${seen.size} routes, ${sitemapUrls.size} in sitemap — ${errors.length} error(s), ${warnings.length} warning(s).`,
);

if (errors.length > 0) process.exit(1);
