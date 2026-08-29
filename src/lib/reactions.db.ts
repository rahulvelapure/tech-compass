/**
 * Reaction storage, on Cloudflare D1.
 *
 * Two tables:
 *
 *   article_reaction_totals — one row per article, holding the genuine like
 *     and dislike counters. The seeded baseline is NOT here; it is derived in
 *     code (see reactions.seed.ts) so this table only ever contains real
 *     reactions.
 *
 *   article_reaction_votes — one row per (article, visitor), holding that
 *     visitor's current choice. The composite primary key is what makes a
 *     second reaction from the same browser an update instead of a new vote,
 *     so refreshing the page cannot inflate anything.
 *
 * Schema lives in migrations/0001_article_reactions.sql.
 *
 * ---------------------------------------------------------------------------
 * genuine_dislikes is written here and never read into a response.
 *
 * Nothing in this module returns it. The public shape carries the like total
 * and the caller's own choice, and that is all the server function has to give
 * the browser. Recording dislikes is for editorial analytics, queried out of
 * band; publishing them is not a feature of this site.
 * ---------------------------------------------------------------------------
 */

/* ------------------------------------------------------------------ */
/* Binding access                                                      */
/* ------------------------------------------------------------------ */

/**
 * Minimal structural typings for D1.
 *
 * @cloudflare/workers-types is not a dependency of this project, and pulling it
 * in for three method signatures would add a large ambient type package to a
 * codebase that otherwise has none. These describe exactly what is used.
 */
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
}

interface D1Result<T> {
  results?: T[];
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
}

/**
 * The D1 binding, or null when there isn't one.
 *
 * Nitro's Cloudflare presets assign the Worker's `env` to `globalThis.__env__`
 * on every request in production (presets/cloudflare/runtime/_module-handler)
 * and once at startup in dev, from wrangler's platform proxy
 * (presets/cloudflare/runtime/plugin.dev). Reading the global therefore works
 * identically in both, and — the reason it is preferred here — needs no
 * `cloudflare:workers` import, which would not resolve under vitest.
 *
 * Returns null rather than throwing when unbound: under `vite dev` without
 * wrangler, and in unit tests, there is no database and the feature is simply
 * unavailable. Callers withdraw the UI rather than render a control that
 * cannot work.
 */
export function reactionDb(): D1Database | null {
  const env = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const binding = env?.["REACTIONS_DB"];
  if (!binding || typeof binding !== "object") return null;
  const candidate = binding as Partial<D1Database>;
  if (typeof candidate.prepare !== "function" || typeof candidate.batch !== "function") {
    return null;
  }
  return candidate as D1Database;
}

/* ------------------------------------------------------------------ */
/* Queries                                                             */
/* ------------------------------------------------------------------ */

export type Reaction = "like" | "dislike";

/** What storage hands back. Deliberately has no dislike count in it. */
export interface ReactionState {
  genuineLikes: number;
  mine: Reaction | null;
}

interface LikesRow {
  genuine_likes: number | null;
}

interface VoteRow {
  reaction: string | null;
}

const SELECT_LIKES = "SELECT genuine_likes FROM article_reaction_totals WHERE slug = ?";

const SELECT_VOTE = "SELECT reaction FROM article_reaction_votes WHERE slug = ? AND visitor_id = ?";

/**
 * Removes the visitor's previous contribution to a counter, if they had one.
 *
 * Guarded by EXISTS against the votes table rather than by a value read in
 * application code, so the decrement is decided inside the same transaction
 * that then rewrites the vote. That is what makes a double-click safe: there
 * is no window between "read their old vote" and "act on it".
 *
 * max(0, ...) is belt and braces. The counter should never be able to go
 * negative, and if a manual edit or a partial restore ever made it possible, a
 * floor is a better outcome than a negative total on the page.
 *
 * `reaction` is interpolated, not bound: it is one of two literals chosen by
 * this module, never caller input, and a bound parameter inside the EXISTS
 * subquery would complicate the positional binding for no benefit.
 */
function undoPrevious(column: "genuine_likes" | "genuine_dislikes", reaction: Reaction): string {
  return `UPDATE article_reaction_totals
             SET ${column} = max(0, ${column} - 1), updated_at = ?
           WHERE slug = ?
             AND EXISTS (
               SELECT 1 FROM article_reaction_votes
                WHERE slug = ? AND visitor_id = ? AND reaction = '${reaction}'
             )`;
}

const UPSERT_VOTE = `INSERT INTO article_reaction_votes
    (slug, visitor_id, reaction, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?)
  ON CONFLICT(slug, visitor_id) DO UPDATE
    SET reaction = excluded.reaction, updated_at = excluded.updated_at`;

const DELETE_VOTE = "DELETE FROM article_reaction_votes WHERE slug = ? AND visitor_id = ?";

const APPLY_TOTAL = `INSERT INTO article_reaction_totals
    (slug, genuine_likes, genuine_dislikes, updated_at)
  VALUES (?, CASE WHEN ? = 'like' THEN 1 ELSE 0 END,
             CASE WHEN ? = 'dislike' THEN 1 ELSE 0 END, ?)
  ON CONFLICT(slug) DO UPDATE
    SET genuine_likes = genuine_likes + CASE WHEN ? = 'like' THEN 1 ELSE 0 END,
        genuine_dislikes = genuine_dislikes + CASE WHEN ? = 'dislike' THEN 1 ELSE 0 END,
        updated_at = ?`;

/** Current state for one visitor on one article. One round trip. */
export async function readReactionState(
  db: D1Database,
  slug: string,
  visitorId: string | null,
): Promise<ReactionState> {
  if (!visitorId) {
    const [likes] = await db.batch<LikesRow>([db.prepare(SELECT_LIKES).bind(slug)]);
    return { genuineLikes: likes?.results?.[0]?.genuine_likes ?? 0, mine: null };
  }

  const [likes, vote] = await db.batch<LikesRow | VoteRow>([
    db.prepare(SELECT_LIKES).bind(slug),
    db.prepare(SELECT_VOTE).bind(slug, visitorId),
  ]);

  return {
    genuineLikes: (likes?.results?.[0] as LikesRow | undefined)?.genuine_likes ?? 0,
    mine: asReaction((vote?.results?.[0] as VoteRow | undefined)?.reaction),
  };
}

/**
 * Record, change, or withdraw a visitor's reaction.
 *
 * `next` of null clears it — that is how the UI toggles a reaction back off.
 *
 * Every statement runs in a single D1 batch, which is one transaction. The
 * order matters: both undo statements read the votes table before the vote is
 * rewritten, so they see the previous choice; the total is then adjusted for
 * the new one. Re-applying an identical reaction nets to zero rather than
 * double-counting.
 */
export async function applyReaction(
  db: D1Database,
  slug: string,
  visitorId: string,
  next: Reaction | null,
): Promise<ReactionState> {
  const now = new Date().toISOString();

  const statements: D1PreparedStatement[] = [
    db.prepare(undoPrevious("genuine_likes", "like")).bind(now, slug, slug, visitorId),
    db.prepare(undoPrevious("genuine_dislikes", "dislike")).bind(now, slug, slug, visitorId),
  ];

  if (next) {
    statements.push(
      db.prepare(UPSERT_VOTE).bind(slug, visitorId, next, now, now),
      db.prepare(APPLY_TOTAL).bind(slug, next, next, now, next, next, now),
    );
  } else {
    statements.push(db.prepare(DELETE_VOTE).bind(slug, visitorId));
  }

  statements.push(db.prepare(SELECT_LIKES).bind(slug));

  const results = await db.batch<LikesRow>(statements);
  const final = results[results.length - 1];

  return { genuineLikes: final?.results?.[0]?.genuine_likes ?? 0, mine: next };
}

function asReaction(value: string | null | undefined): Reaction | null {
  return value === "like" || value === "dislike" ? value : null;
}
