import { seededLikeCount } from "./reactions.seed";

/**
 * Deterministic per-article view baselines in the [2,000, 8,000] band.
 *
 *  - Pure function of `slug` (identical across SSR, builds, and deployments).
 *  - Always within [2,000, 8,000] and strictly higher than the article's
 *    seeded like count so views always exceed likes naturally.
 *  - Never lands on a round multiple of 50.
 */

export const VIEW_SEED_MIN = 2_000;
export const VIEW_SEED_MAX = 8_000;

const VIEW_SEED_DOMAIN = "views:v1:";
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
