import { articles } from "../../src/content/articles";
import type { Article } from "../../src/content/types";

const STATE_ISSUE_TITLE = "Automation State — LinkedIn Publisher";
const LINKEDIN_API = "https://api.linkedin.com/rest/posts";
const LINKEDIN_VERSION = process.env.LINKEDIN_VERSION ?? "202608";
const TIME_ZONE = "Asia/Kolkata";
const POST_START_HOUR = 10;
const POST_END_HOUR = 17;
const GAP_DAYS = 2;
const DEFAULT_START_DATE = "2026-08-24";

interface PostedArticle {
  postedAt: string;
  localDate: string;
  postId: string;
}

interface PublisherState {
  version: 1;
  startDate: string;
  lastPostedAt: string | null;
  lastPostedLocalDate: string | null;
  nextPostAt: string | null;
  posted: Record<string, PostedArticle>;
}

interface IssueSnapshot {
  number: number;
  body: string;
}

function fail(message: string): never {
  throw new Error(message);
}

function localParts(date: Date) {
  const shifted = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
    hour: shifted.getUTCHours(),
    minute: shifted.getUTCMinutes(),
  };
}

function localDateString(date: Date): string {
  const p = localParts(date);
  return `${p.year}-${String(p.month + 1).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

function istDateTimeToUtc(date: { year: number; month: number; day: number; hour: number; minute: number }): Date {
  return new Date(Date.UTC(date.year, date.month, date.day, date.hour - 5, date.minute - 30));
}

function randomInt(min: number, max: number): number {
  if (max < min) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addDays(date: Date, days: number): { year: number; month: number; day: number } {
  const p = localParts(date);
  const d = new Date(Date.UTC(p.year, p.month, p.day + days));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth(), day: d.getUTCDate() };
}

function randomSlot(date: Date, daysAhead: number): Date {
  const target = addDays(date, daysAhead);
  const hour = randomInt(POST_START_HOUR, POST_END_HOUR);
  const minute = randomInt(0, 59);
  return istDateTimeToUtc({ ...target, hour, minute });
}

function defaultState(): PublisherState {
  return {
    version: 1,
    startDate: process.env.LINKEDIN_START_DATE ?? DEFAULT_START_DATE,
    lastPostedAt: null,
    lastPostedLocalDate: null,
    nextPostAt: null,
    posted: {},
  };
}

function parseStateFromIssue(body: string): PublisherState {
  const match = body.match(/```json\s*([\s\S]*?)\s*```/i);
  if (!match) return defaultState();
  try {
    const parsed = JSON.parse(match[1]) as Partial<PublisherState>;
    return {
      ...defaultState(),
      ...parsed,
      posted: parsed.posted ?? {},
    };
  } catch {
    return defaultState();
  }
}

function stateBody(state: PublisherState): string {
  return [
    "<!-- Managed by scripts/linkedin/publish-alternate-day.ts. Do not edit manually. -->",
    "# Tech Compass LinkedIn Publisher State",
    "",
    "The publisher posts at most one article per calendar day and uses a two-day gap between successful posts. Posting time is randomized within the configured IST window.",
    "",
    "```json",
    JSON.stringify(state, null, 2),
    "```",
    "",
  ].join("\n");
}

async function githubRequest(path: string, init: RequestInit = {}): Promise<Response> {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo) fail("GITHUB_TOKEN and GITHUB_REPOSITORY are required.");

  return fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

async function findOrCreateStateIssue(): Promise<IssueSnapshot> {
  const repo = process.env.GITHUB_REPOSITORY!;
  const params = new URLSearchParams({ state: "open", per_page: "100" });
  const response = await githubRequest(`/repos/${repo}/issues?${params}`);
  if (!response.ok) fail(`GitHub issue lookup failed: ${response.status} ${await response.text()}`);

  const issues = (await response.json()) as Array<{ number: number; title: string; body: string | null }>;
  const found = issues.find((issue) => issue.title === STATE_ISSUE_TITLE);
  if (found) return { number: found.number, body: found.body ?? "" };

  const created = await githubRequest(`/repos/${repo}/issues`, {
    method: "POST",
    body: JSON.stringify({
      title: STATE_ISSUE_TITLE,
      body: stateBody(defaultState()),
    }),
  });
  if (!created.ok) fail(`GitHub state issue creation failed: ${created.status} ${await created.text()}`);

  const issue = (await created.json()) as { number: number; body: string | null };
  return { number: issue.number, body: issue.body ?? "" };
}

async function saveStateIssue(issueNumber: number, state: PublisherState): Promise<void> {
  const repo = process.env.GITHUB_REPOSITORY!;
  const response = await githubRequest(`/repos/${repo}/issues/${issueNumber}`, {
    method: "PATCH",
    body: JSON.stringify({ body: stateBody(state) }),
  });
  if (!response.ok) fail(`GitHub state issue update failed: ${response.status} ${await response.text()}`);
}

function eligibleArticles(state: PublisherState, today: string): Article[] {
  return articles
    .filter((article) => article.draft !== true)
    .filter((article) => article.publishedAt >= state.startDate)
    .filter((article) => article.publishedAt <= today)
    .filter((article) => !state.posted[article.slug])
    .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt) || a.slug.localeCompare(b.slug));
}

function articleUrl(article: Article): string {
  const origin = (process.env.PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
  if (!origin) fail("PUBLIC_SITE_URL is required.");
  return `${origin}/${article.category}/${article.slug}`;
}

async function assertLive(url: string): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "TechCompass-LinkedIn-Publisher/1.0" },
      signal: controller.signal,
    });
    if (!response.ok) fail(`Article is not live yet: ${url} returned HTTP ${response.status}.`);
    const html = await response.text();
    if (!html.includes("<title")) fail(`Article URL returned HTML without a title: ${url}`);
  } finally {
    clearTimeout(timer);
  }
}

function hashtags(article: Article): string {
  const values = [article.category, ...article.tags, ...article.secondaryKeywords]
    .map((value) => value.replace(/[^A-Za-z0-9]+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 3);
  return values.map((value) => `#${value.replace(/\s+/g, "")}`).join(" ");
}

function commentary(article: Article): string {
  const hook = article.standfirst || article.excerpt;
  const url = articleUrl(article);
  return `${hook}\n\nRead the full Tech Compass article:\n${url}\n\n${hashtags(article)}`;
}

async function getAccessToken(): Promise<string> {
  const direct = process.env.LINKEDIN_ACCESS_TOKEN;
  if (direct) return direct;

  const refreshToken = process.env.LINKEDIN_REFRESH_TOKEN;
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  if (!refreshToken || !clientId || !clientSecret) {
    fail("Set LINKEDIN_ACCESS_TOKEN, or provide LINKEDIN_REFRESH_TOKEN + LINKEDIN_CLIENT_ID + LINKEDIN_CLIENT_SECRET.");
  }

  const response = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  if (!response.ok) fail(`LinkedIn token refresh failed: ${response.status} ${await response.text()}`);
  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) fail("LinkedIn token refresh returned no access_token.");
  return payload.access_token;
}

async function publish(article: Article): Promise<string> {
  const author = process.env.LINKEDIN_AUTHOR_URN;
  if (!author) fail("LINKEDIN_AUTHOR_URN is required (person or organization URN).\nExample: urn:li:person:... or urn:li:organization:...");

  const token = await getAccessToken();
  const url = articleUrl(article);
  const response = await fetch(LINKEDIN_API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
      "Linkedin-Version": LINKEDIN_VERSION,
    },
    body: JSON.stringify({
      author,
      commentary: commentary(article),
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      content: {
        article: {
          source: url,
          title: article.title,
          description: (article.excerpt || article.standfirst).slice(0, 300),
        },
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    }),
  });

  const responseText = await response.text();
  if (!response.ok) fail(`LinkedIn post failed: ${response.status} ${responseText}`);
  const postId = response.headers.get("x-restli-id");
  if (!postId) fail("LinkedIn returned success but no x-restli-id header.");
  return postId;
}

function log(message: string): void {
  console.log(`[linkedin] ${message}`);
}

async function main(): Promise<void> {
  const now = new Date();
  const today = localDateString(now);
  const issue = await findOrCreateStateIssue();
  const state = parseStateFromIssue(issue.body);
  const queue = eligibleArticles(state, today);

  if (queue.length === 0) {
    log("No eligible unpublished articles in the automation window.");
    return;
  }

  if (!state.nextPostAt) {
    state.nextPostAt = randomSlot(now, 1).toISOString();
    await saveStateIssue(issue.number, state);
    log(`First LinkedIn slot planned for ${state.nextPostAt}.`);
    return;
  }

  if (state.lastPostedLocalDate === today) {
    log(`Already posted one article on ${today}; skipping.`);
    return;
  }

  if (now.getTime() < new Date(state.nextPostAt).getTime()) {
    log(`Next slot is ${state.nextPostAt}; not due yet.`);
    return;
  }

  const article = queue[0];
  const url = articleUrl(article);
  await assertLive(url);

  log(`Publishing ${article.slug} to LinkedIn: ${url}`);
  const postId = await publish(article);
  const postedAt = new Date();

  state.lastPostedAt = postedAt.toISOString();
  state.lastPostedLocalDate = localDateString(postedAt);
  state.posted[article.slug] = {
    postedAt: postedAt.toISOString(),
    localDate: localDateString(postedAt),
    postId,
  };
  state.nextPostAt = randomSlot(postedAt, GAP_DAYS).toISOString();

  // Keep the state compact. Old records remain deduplicating, but the issue body
  // should not grow without bound in a long-running publication.
  const postedEntries = Object.entries(state.posted);
  if (postedEntries.length > 500) {
    const trimmed = postedEntries
      .sort((a, b) => a[1].postedAt.localeCompare(b[1].postedAt))
      .slice(-500);
    state.posted = Object.fromEntries(trimmed);
  }

  await saveStateIssue(issue.number, state);
  log(`Posted ${article.slug} as ${postId}. Next slot: ${state.nextPostAt}`);
}

if (import.meta.main) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
