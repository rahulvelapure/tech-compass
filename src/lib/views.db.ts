import type { D1Database } from "./reactions.db";

/**
 * Article view counter storage on Cloudflare D1 (`REACTIONS_DB`), with an
 * in-memory adapter under local `vite dev` (`NODE_ENV === "development"`).
 *
 * Self-initialises `article_view_totals` once per isolate so deployments work
 * immediately without manual SQL setup.
 */

interface ViewRow {
  genuine_views: number | null;
}

interface AllViewsRow {
  slug: string;
  genuine_views: number | null;
}

const ENSURE_TABLE = `CREATE TABLE IF NOT EXISTS article_view_totals (
  slug          TEXT    PRIMARY KEY,
  genuine_views INTEGER NOT NULL DEFAULT 0,
  updated_at    TEXT    NOT NULL
)`;

const SELECT_VIEWS = "SELECT genuine_views FROM article_view_totals WHERE slug = ?";
const SELECT_ALL_VIEWS = "SELECT slug, genuine_views FROM article_view_totals";

const INCREMENT_VIEW = `INSERT INTO article_view_totals (slug, genuine_views, updated_at)
  VALUES (?, 1, ?)
  ON CONFLICT(slug) DO UPDATE
    SET genuine_views = genuine_views + 1,
        updated_at = excluded.updated_at`;

const schemaEnsuredForDb = new WeakSet<D1Database>();
let devViewDbInstance: D1Database | undefined;

export function viewDb(): D1Database | null {
  const env = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const binding = env?.["REACTIONS_DB"];
  if (binding && typeof binding === "object") {
    const candidate = binding as Partial<D1Database>;
    if (typeof candidate.prepare === "function" && typeof candidate.batch === "function") {
      return candidate as D1Database;
    }
  }
  if (process.env["NODE_ENV"] === "development") {
    return getDevViewDb();
  }
  return null;
}

function getDevViewDb(): D1Database {
  if (devViewDbInstance) return devViewDbInstance;

  const totals = new Map<string, number>();

  const db: D1Database = {
    prepare(query: string) {
      return {
        bind(...values: unknown[]) {
          return { query, values } as unknown as ReturnType<D1Database["prepare"]>;
        },
      };
    },
    async batch<T>(statements: ReturnType<D1Database["prepare"]>[]) {
      return statements.map((raw) => {
        const { query, values } = raw as unknown as { query?: string; values?: unknown[] };
        const sql = query ?? "";
        const args = values ?? [];

        if (sql === SELECT_VIEWS) {
          const slug = String(args[0] ?? "");
          const current = totals.get(slug);
          return {
            results: (current !== undefined ? [{ genuine_views: current }] : []) as unknown as T[],
          };
        }

        if (sql === SELECT_ALL_VIEWS) {
          const rows: AllViewsRow[] = [...totals.entries()].map(([slug, count]) => ({
            slug,
            genuine_views: count,
          }));
          return { results: rows as unknown as T[] };
        }

        if (sql === INCREMENT_VIEW) {
          const slug = String(args[0] ?? "");
          totals.set(slug, (totals.get(slug) ?? 0) + 1);
          return { results: [] };
        }

        return { results: [] };
      });
    },
  };

  schemaEnsuredForDb.add(db);
  devViewDbInstance = db;
  return db;
}

export async function incrementArticleView(db: D1Database, slug: string): Promise<number> {
  const now = new Date().toISOString();
  const statements = [];

  if (!schemaEnsuredForDb.has(db)) {
    statements.push(db.prepare(ENSURE_TABLE).bind());
  }

  statements.push(db.prepare(INCREMENT_VIEW).bind(slug, now), db.prepare(SELECT_VIEWS).bind(slug));

  const results = await db.batch<ViewRow>(statements);
  schemaEnsuredForDb.add(db);

  const last = results[results.length - 1];
  return last?.results?.[0]?.genuine_views ?? 0;
}

export async function readArticleViews(db: D1Database, slug: string): Promise<number> {
  const statements = [];

  if (!schemaEnsuredForDb.has(db)) {
    statements.push(db.prepare(ENSURE_TABLE).bind());
  }

  statements.push(db.prepare(SELECT_VIEWS).bind(slug));

  const results = await db.batch<ViewRow>(statements);
  schemaEnsuredForDb.add(db);

  const last = results[results.length - 1];
  return last?.results?.[0]?.genuine_views ?? 0;
}

export async function readAllArticleViews(db: D1Database): Promise<Record<string, number>> {
  const statements = [];

  if (!schemaEnsuredForDb.has(db)) {
    statements.push(db.prepare(ENSURE_TABLE).bind());
  }

  statements.push(db.prepare(SELECT_ALL_VIEWS).bind());

  const results = await db.batch<AllViewsRow>(statements);
  schemaEnsuredForDb.add(db);

  const last = results[results.length - 1];
  const out: Record<string, number> = {};
  for (const row of last?.results ?? []) {
    if (row.slug && typeof row.genuine_views === "number") {
      out[row.slug] = row.genuine_views;
    }
  }
  return out;
}
