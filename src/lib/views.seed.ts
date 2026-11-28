import { seededLikeCount } from "./reactions.seed";

/**
 * Deterministic per-article view baselines and organic compounded growth.
 *
 * 1. Initial baseline (`seededViewCount`):
 *    - Pure function of `slug` in [2,000, 8,000].
 *    - Strictly higher than `seededLikeCount(slug)` and never divisible by 50.
 *
 * 2. Scheduled organic growth (`currentBaselineViewCount`):
 *    - Anchored at 2026-11-28T00:00:00Z (`VIEW_GROWTH_ANCHOR_MS`).
 *    - Each 30-day month `m` assigns each article its own high-precision
 *      deterministic growth rate in [3.00000000%, 5.00000000%] (`0.03` to `0.05`)
 *      using 32-bit FNV-1a + avalanche hashing over `(slug, m)`.
 *    - Each subsequent 12-month year compounds the monthly growth base by +10%
 *      (`1.10 ** yearIndex`), accruing smoothly day by day (`remDays / 30`) so
 *      counts never jump overnight and never decrease across boundaries.
 */

export const VIEW_SEED_MIN = 2_000;
export const VIEW_SEED_MAX = 8_000;

export const MONTHLY_GROWTH_MIN = 0.03;
export const MONTHLY_GROWTH_MAX = 0.05;
export const ANNUAL_COMPOUND_FACTOR = 1.1;

/** 2026-11-28T00:00:00.000Z in epoch milliseconds (pure constant for Workers). */
export const VIEW_GROWTH_ANCHOR_MS = 1_795_824_000_000;

const DAY_MS = 86_400_000;
const DAYS_PER_MONTH = 30;
const MONTHS_PER_YEAR = 12;

const VIEW_SEED_DOMAIN = "views:v1:";
const VIEW_RATE_DOMAIN = "views:monthly-rate:v1:";
const MIN_MARGIN_OVER_LIKES = 420;

function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

function avalanche(value: number): number {
  let hash = value;
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d) >>> 0;
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b) >>> 0;
  hash ^= hash >>> 16;
  return hash >>> 0;
}

/** Initial frozen baseline in [2,000, 8,000] on the anchor date. */
export function seededViewCount(slug: string): number {
  const hash = avalanche(fnv1a(VIEW_SEED_DOMAIN + slug));
  const floor = Math.max(VIEW_SEED_MIN, seededLikeCount(slug) + MIN_MARGIN_OVER_LIKES);
  const span = VIEW_SEED_MAX - floor + 1;
  let candidate = floor + (hash % span);

  if (candidate % 50 === 0) {
    candidate = candidate < VIEW_SEED_MAX ? candidate + 1 : candidate - 1;
  }

  return candidate;
}

/**
 * Deterministic floating-point monthly growth fraction in [0.03, 0.05]
 * (i.e. 3.00000000% to 5.00000000%) for a given article slug and month index.
 */
export function monthlyGrowthRate(slug: string, monthIndex = 0): number {
  const hash = avalanche(fnv1a(`${VIEW_RATE_DOMAIN}${slug}:${monthIndex}`));
  const unit = hash / 0xffffffff;
  return MONTHLY_GROWTH_MIN + unit * (MONTHLY_GROWTH_MAX - MONTHLY_GROWTH_MIN);
}

function monthGain(base: number, slug: string, monthIndex: number): number {
  const yearIndex = Math.floor(monthIndex / MONTHS_PER_YEAR);
  return base * monthlyGrowthRate(slug, monthIndex) * ANNUAL_COMPOUND_FACTOR ** yearIndex;
}

/**
 * Current baseline view count at `nowMs`, combining `seededViewCount(slug)`
 * with smooth daily-pro-rated 3.00000000%–5.00000000% monthly growth and
 * +10% annual compounding since `VIEW_GROWTH_ANCHOR_MS`.
 */
export function currentBaselineViewCount(slug: string, nowMs = Date.now()): number {
  const base = seededViewCount(slug);
  const totalDays = Math.max(0, Math.floor((nowMs - VIEW_GROWTH_ANCHOR_MS) / DAY_MS));
  if (totalDays === 0) return base;

  const fullMonths = Math.floor(totalDays / DAYS_PER_MONTH);
  const remDays = totalDays % DAYS_PER_MONTH;

  let accrued = 0;
  for (let m = 0; m < fullMonths; m += 1) {
    accrued += monthGain(base, slug, m);
  }
  if (remDays > 0) {
    accrued += monthGain(base, slug, fullMonths) * (remDays / DAYS_PER_MONTH);
  }

  return base + Math.floor(accrued);
}
