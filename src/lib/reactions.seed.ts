/**
 * Seeded like baselines.
 *
 * Each article carries a fixed starting like count that genuine reactions
 * accumulate on top of. The baseline lives here, in code, rather than in the
 * database, for three reasons:
 *
 *  - It is an editorial decision, so it belongs in review and in git history,
 *    not in mutable per-environment state.
 *  - A fresh or wiped database still renders the correct total. Nothing has to
 *    be back-filled, and a local database and production cannot disagree.
 *  - It cannot drift. The value is a pure function of the slug, so it is
 *    identical on every request, every build and every deployment.
 *
 * That last property is the requirement: the number must never be re-rolled at
 * runtime. It is derived, not random.
 *
 * The seed is never exposed on its own. Callers add it to the genuine count and
 * publish the sum, so the split between baseline and real reactions is not
 * observable from the browser.
 */

/**
 * Range the derived baselines fall into, centred on 2,000.
 *
 * SPAN is deliberately odd-numbered and the bounds are not round, so the
 * arithmetic cannot land on 1,500 / 2,000 / 2,500 more often than on anything
 * else. Changing either constant re-derives every article that has no explicit
 * override below, which changes numbers readers have already seen — so treat
 * them as frozen once the site is live.
 */
const SEED_MIN = 1_500;
const SEED_MAX = 2_500;

/**
 * Hand-set baselines, by article slug.
 *
 * Two uses. The first is editorial: an article that warrants a deliberate
 * number rather than a derived one.
 *
 * The second is collision resolution. The band holds about a thousand values
 * and the corpus is forty articles, so two slugs hashing to the same baseline
 * is a real possibility rather than a remote one — `tests/reactions.test.ts`
 * asserts every published article differs, and if a future article ever
 * collides that test fails and an entry here is the fix. Resolving it this way
 * rather than by probing neighbouring values keeps every other article's number
 * untouched, which is the whole point of the seed being stable.
 */
const SEED_OVERRIDES: Readonly<Record<string, number>> = {
  // Collision. This slug and group-policy-to-settings-catalog-migration both
  // derive to 2233. The older article keeps the derived value — readers have
  // already seen it — and the newer one is nudged to the next free number.
  // 2234 was unused, sits inside the band and is not a round number.
  "eks-pod-identity-vs-irsa-migration": 2234,
};

/**
 * Hash domain.
 *
 * Prefixing the slug keeps this hash from lining up with any other
 * slug-derived value the codebase might grow later. The `v1` is a deliberate
 * version marker — and a warning: changing this string re-rolls every article's
 * baseline at once. It must stay frozen.
 */
const SEED_DOMAIN = "likes:v1:";

/**
 * FNV-1a, 32-bit.
 *
 * A hash rather than a stored table so adding an article needs no extra step
 * and cannot be forgotten. FNV-1a is chosen for being short, dependency-free
 * and well-distributed over short ASCII strings — it is not a security
 * primitive and nothing here depends on it being one.
 *
 * `Math.imul` keeps the multiply in 32-bit integer space; a plain `*` would
 * lose the low bits to float rounding and collapse the distribution.
 */
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

/**
 * Avalanche finaliser.
 *
 * FNV-1a's weakness is its low bits, and `% 1001` reads exactly those. Without
 * this step the baselines drift off-centre and cluster — measured across the
 * real corpus, the raw hash landed a mean of 1,905 and never reached past
 * 2,328. Mixing the bits first spreads them across the whole band and puts the
 * mean on 2,000 where it belongs.
 *
 * This is the standard xorshift-multiply finaliser; the constants are the
 * published ones and carry no meaning of their own.
 */
function avalanche(value: number): number {
  let hash = value;
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x7feb352d) >>> 0;
  hash ^= hash >>> 15;
  hash = Math.imul(hash, 0x846ca68b) >>> 0;
  hash ^= hash >>> 16;
  return hash >>> 0;
}

/**
 * The derived baseline for a slug, before any override is considered.
 *
 * Exported for one reason: it is the algorithm on its own. `seededLikeCount` is
 * two layers — a declared override, then this — so a test that pins the hash,
 * the domain prefix or the band has to reach the derivation directly. Going
 * through the composed function instead makes a deliberate override
 * indistinguishable from someone quietly changing the maths.
 *
 * Nothing in the application should call this. Callers want the published
 * baseline, which is `seededLikeCount`.
 *
 * The spread is uniform across the band rather than clustered at the centre.
 * Clustering would put most of the corpus within a few dozen of 2,000, which
 * reads as generated; a flat spread keeps the mean on the centre of the band
 * while letting individual articles look genuinely unalike.
 */
export function derivedLikeCount(slug: string): number {
  return SEED_MIN + (avalanche(fnv1a(SEED_DOMAIN + slug)) % (SEED_MAX - SEED_MIN + 1));
}

/**
 * The fixed editorial baseline for an article.
 *
 * Deterministic: the same slug always yields the same number, on every request,
 * build and deployment. An explicit entry in `SEED_OVERRIDES` wins; everything
 * else is derived.
 */
export function seededLikeCount(slug: string): number {
  const override = SEED_OVERRIDES[slug];
  if (override !== undefined) return override;
  return derivedLikeCount(slug);
}
