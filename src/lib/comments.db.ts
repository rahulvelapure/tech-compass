/**
 * Article comment storage on Cloudflare D1 (`REACTIONS_DB`).
 *
 * Schema lives in migrations/0003_article_comments.sql.
 *
 * Privacy invariant: `visitor_id` is stored only to recognize the caller's own
 * recent comments (`canDelete`) and prevent duplicate upvotes (`upvotedByMe`).
 * It never leaves this module's server boundary.
 */

import type { D1Database } from "./reactions.db";

/** Readers can remove a comment they posted from the same browser within 24h. */
export const OWN_DELETE_WINDOW_MS = 24 * 60 * 60_000;

export interface CommentItem {
  id: string;
  parentId: string | null;
  authorName: string;
  authorRole: string | null;
  body: string;
  upvotes: number;
  upvotedByMe: boolean;
  canDelete: boolean;
  createdAt: string;
}

export interface CommentThread extends CommentItem {
  replies: CommentItem[];
}

export interface CommentListState {
  totalCount: number;
  threads: CommentThread[];
}

/* ------------------------------------------------------------------ */
/* Binding access + local `vite dev` fallback                          */
/* ------------------------------------------------------------------ */

export function commentDb(): D1Database | null {
  const env = (globalThis as { __env__?: Record<string, unknown> }).__env__;
  const binding = env?.["REACTIONS_DB"];
  if (binding && typeof binding === "object") {
    const candidate = binding as Partial<D1Database>;
    if (typeof candidate.prepare === "function" && typeof candidate.batch === "function") {
      return candidate as D1Database;
    }
  }
  if (process.env["NODE_ENV"] === "development") {
    return getDevCommentDb();
  }
  return null;
}

interface DevCommentRow {
  id: string;
  slug: string;
  parent_id: string | null;
  visitor_id: string;
  author_name: string;
  author_role: string | null;
  body: string;
  upvotes: number;
  status: "published" | "hidden";
  created_at: string;
}

let devDbInstance: D1Database | undefined;

function getDevCommentDb(): D1Database {
  if (devDbInstance) return devDbInstance;

  const comments = new Map<string, DevCommentRow>();
  const upvotes = new Set<string>();

  devDbInstance = {
    prepare(query: string) {
      return {
        bind(...values: unknown[]) {
          return { query, values } as unknown as ReturnType<D1Database["prepare"]>;
        },
      };
    },
    async batch<T>(statements: ReturnType<D1Database["prepare"]>[]) {
      return statements.map((raw) => {
        const { query, values } = raw as unknown as { query: string; values: unknown[] };

        if (query === SELECT_COMMENTS) {
          const slug = String(values[0]);
          const rows = [...comments.values()]
            .filter((row) => row.slug === slug && row.status === "published")
            .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id));
          return { results: rows as unknown as T[] };
        }

        if (query === SELECT_VISITOR_UPVOTES) {
          const slug = String(values[0]);
          const visitorId = String(values[1]);
          const rows = [...comments.values()]
            .filter(
              (row) =>
                row.slug === slug &&
                row.status === "published" &&
                upvotes.has(`${row.id}:${visitorId}`),
            )
            .map((row) => ({ comment_id: row.id }));
          return { results: rows as unknown as T[] };
        }

        if (query === INSERT_TOP_COMMENT) {
          const [id, slug, visitorId, authorName, authorRole, body, status, createdAt] = values as [
            string,
            string,
            string,
            string,
            string | null,
            string,
            "published" | "hidden",
            string,
          ];
          comments.set(id, {
            id,
            slug,
            parent_id: null,
            visitor_id: visitorId,
            author_name: authorName,
            author_role: authorRole,
            body,
            upvotes: 0,
            status,
            created_at: createdAt,
          });
          return { results: [] };
        }

        if (query === INSERT_REPLY_COMMENT) {
          const [id, slug, parentId, visitorId, authorName, authorRole, body, status, createdAt] =
            values as [
              string,
              string,
              string,
              string,
              string,
              string | null,
              string,
              "published" | "hidden",
              string,
            ];
          const parent = comments.get(parentId);
          if (
            parent &&
            parent.slug === slug &&
            parent.parent_id === null &&
            parent.status === "published"
          ) {
            comments.set(id, {
              id,
              slug,
              parent_id: parentId,
              visitor_id: visitorId,
              author_name: authorName,
              author_role: authorRole,
              body,
              upvotes: 0,
              status,
              created_at: createdAt,
            });
          }
          return { results: [] };
        }

        if (query === INCREMENT_COMMENT_UPVOTE) {
          const [commentId, slug, , visitorId] = values as [string, string, string, string];
          const row = comments.get(commentId);
          const key = `${commentId}:${visitorId}`;
          if (row && row.slug === slug && row.status === "published" && !upvotes.has(key)) {
            row.upvotes += 1;
          }
          return { results: [] };
        }

        if (query === INSERT_COMMENT_UPVOTE) {
          const [commentId, visitorId, , , slug] = values as [
            string,
            string,
            string,
            string,
            string,
          ];
          const row = comments.get(commentId);
          if (row && row.slug === slug && row.status === "published") {
            upvotes.add(`${commentId}:${visitorId}`);
          }
          return { results: [] };
        }

        if (query === DECREMENT_COMMENT_UPVOTE) {
          const [commentId, slug, , visitorId] = values as [string, string, string, string];
          const row = comments.get(commentId);
          const key = `${commentId}:${visitorId}`;
          if (row && row.slug === slug && upvotes.has(key)) {
            row.upvotes = Math.max(0, row.upvotes - 1);
          }
          return { results: [] };
        }

        if (query === DELETE_COMMENT_UPVOTE) {
          const [commentId, visitorId] = values as [string, string];
          upvotes.delete(`${commentId}:${visitorId}`);
          return { results: [] };
        }

        if (query === HIDE_OWN_COMMENT) {
          const [slug, commentId, , , , visitorId, cutoffIso] = values as [
            string,
            string,
            string,
            string,
            string,
            string,
            string,
          ];
          const target = comments.get(commentId);
          if (
            target &&
            target.slug === slug &&
            target.visitor_id === visitorId &&
            target.created_at >= cutoffIso
          ) {
            for (const row of comments.values()) {
              if (row.slug === slug && (row.id === commentId || row.parent_id === commentId)) {
                row.status = "hidden";
              }
            }
          }
          return { results: [] };
        }

        if (query === HIDE_MODERATOR_COMMENT) {
          const [slug, commentId] = values as [string, string, string];
          for (const row of comments.values()) {
            if (row.slug === slug && (row.id === commentId || row.parent_id === commentId)) {
              row.status = "hidden";
            }
          }
          return { results: [] };
        }

        return { results: [] };
      });
    },
  };

  return devDbInstance;
}

/* ------------------------------------------------------------------ */
/* SQL statements                                                      */
/* ------------------------------------------------------------------ */

interface CommentRow {
  id: string;
  parent_id: string | null;
  visitor_id: string;
  author_name: string;
  author_role: string | null;
  body: string;
  upvotes: number;
  created_at: string;
}

interface UpvoteRow {
  comment_id: string;
}

const SELECT_COMMENTS = `SELECT id, parent_id, visitor_id, author_name, author_role, body, upvotes, created_at
   FROM article_comments
  WHERE slug = ? AND status = 'published'
  ORDER BY created_at ASC, id ASC`;

const SELECT_VISITOR_UPVOTES = `SELECT u.comment_id AS comment_id
   FROM article_comment_upvotes u
   JOIN article_comments c ON c.id = u.comment_id
  WHERE c.slug = ? AND c.status = 'published' AND u.visitor_id = ?`;

const INSERT_TOP_COMMENT = `INSERT INTO article_comments
    (id, slug, parent_id, visitor_id, author_name, author_role, body, upvotes, status, created_at)
  VALUES (?, ?, NULL, ?, ?, ?, ?, 0, ?, ?)`;

const INSERT_REPLY_COMMENT = `INSERT INTO article_comments
    (id, slug, parent_id, visitor_id, author_name, author_role, body, upvotes, status, created_at)
  SELECT ?, ?, ?, ?, ?, ?, ?, 0, ?, ?
   WHERE EXISTS (
     SELECT 1 FROM article_comments p
      WHERE p.id = ?
        AND p.slug = ?
        AND p.parent_id IS NULL
        AND p.status = 'published'
   )`;

const INCREMENT_COMMENT_UPVOTE = `UPDATE article_comments
   SET upvotes = upvotes + 1
 WHERE id = ?
   AND slug = ?
   AND status = 'published'
   AND NOT EXISTS (
     SELECT 1 FROM article_comment_upvotes
      WHERE comment_id = ? AND visitor_id = ?
   )`;

const INSERT_COMMENT_UPVOTE = `INSERT INTO article_comment_upvotes
    (comment_id, visitor_id, created_at)
  SELECT ?, ?, ?
   WHERE EXISTS (
     SELECT 1 FROM article_comments
      WHERE id = ? AND slug = ? AND status = 'published'
   )
  ON CONFLICT(comment_id, visitor_id) DO NOTHING`;

const DECREMENT_COMMENT_UPVOTE = `UPDATE article_comments
   SET upvotes = max(0, upvotes - 1)
 WHERE id = ?
   AND slug = ?
   AND EXISTS (
     SELECT 1 FROM article_comment_upvotes
      WHERE comment_id = ? AND visitor_id = ?
   )`;

const DELETE_COMMENT_UPVOTE = `DELETE FROM article_comment_upvotes
  WHERE comment_id = ? AND visitor_id = ?`;

const HIDE_OWN_COMMENT = `UPDATE article_comments
   SET status = 'hidden'
 WHERE slug = ?
   AND (id = ? OR parent_id = ?)
   AND EXISTS (
     SELECT 1 FROM article_comments target
      WHERE target.id = ?
        AND target.slug = ?
        AND target.visitor_id = ?
        AND target.created_at >= ?
   )`;

const HIDE_MODERATOR_COMMENT = `UPDATE article_comments
   SET status = 'hidden'
 WHERE slug = ?
   AND (id = ? OR parent_id = ?)`;

/* ------------------------------------------------------------------ */
/* Operations                                                          */
/* ------------------------------------------------------------------ */

function assembleThreads(
  rows: CommentRow[],
  upvotedIds: Set<string>,
  visitorId: string | null,
  nowMs: number,
): CommentListState {
  const threadMap = new Map<string, CommentThread>();
  const orderedThreads: CommentThread[] = [];

  for (const row of rows) {
    if (row.parent_id !== null) continue;
    const createdMs = Date.parse(row.created_at);
    const canDelete =
      visitorId !== null &&
      row.visitor_id === visitorId &&
      Number.isFinite(createdMs) &&
      nowMs - createdMs <= OWN_DELETE_WINDOW_MS;

    const thread: CommentThread = {
      id: row.id,
      parentId: null,
      authorName: row.author_name,
      authorRole: row.author_role ?? null,
      body: row.body,
      upvotes: row.upvotes,
      upvotedByMe: upvotedIds.has(row.id),
      canDelete,
      createdAt: row.created_at,
      replies: [],
    };
    threadMap.set(row.id, thread);
    orderedThreads.push(thread);
  }

  let totalCount = orderedThreads.length;

  for (const row of rows) {
    if (row.parent_id === null) continue;
    const parent = threadMap.get(row.parent_id);
    if (!parent) continue;

    const createdMs = Date.parse(row.created_at);
    const canDelete =
      visitorId !== null &&
      row.visitor_id === visitorId &&
      Number.isFinite(createdMs) &&
      nowMs - createdMs <= OWN_DELETE_WINDOW_MS;

    parent.replies.push({
      id: row.id,
      parentId: row.parent_id,
      authorName: row.author_name,
      authorRole: row.author_role ?? null,
      body: row.body,
      upvotes: row.upvotes,
      upvotedByMe: upvotedIds.has(row.id),
      canDelete,
      createdAt: row.created_at,
    });
    totalCount += 1;
  }

  // Default order: newest top-level threads first; replies stay chronological.
  orderedThreads.reverse();

  return { totalCount, threads: orderedThreads };
}

export async function readArticleComments(
  db: D1Database,
  slug: string,
  visitorId: string | null,
  nowMs = Date.now(),
): Promise<CommentListState> {
  if (!visitorId) {
    const [commentsRes] = await db.batch<CommentRow>([db.prepare(SELECT_COMMENTS).bind(slug)]);
    return assembleThreads(commentsRes?.results ?? [], new Set(), null, nowMs);
  }

  const [commentsRes, upvotesRes] = await db.batch<CommentRow | UpvoteRow>([
    db.prepare(SELECT_COMMENTS).bind(slug),
    db.prepare(SELECT_VISITOR_UPVOTES).bind(slug, visitorId),
  ]);

  const upvotedIds = new Set(
    ((upvotesRes?.results ?? []) as UpvoteRow[]).map((row) => row.comment_id),
  );
  return assembleThreads(
    (commentsRes?.results ?? []) as CommentRow[],
    upvotedIds,
    visitorId,
    nowMs,
  );
}

export interface InsertCommentInput {
  id: string;
  slug: string;
  parentId: string | null;
  visitorId: string;
  authorName: string;
  authorRole: string | null;
  body: string;
  status: "published" | "hidden";
  nowMs?: number;
}

export async function createArticleComment(
  db: D1Database,
  input: InsertCommentInput,
): Promise<CommentListState> {
  const nowMs = input.nowMs ?? Date.now();
  const createdAt = new Date(nowMs).toISOString();

  const insertStmt =
    input.parentId === null
      ? db
          .prepare(INSERT_TOP_COMMENT)
          .bind(
            input.id,
            input.slug,
            input.visitorId,
            input.authorName,
            input.authorRole,
            input.body,
            input.status,
            createdAt,
          )
      : db
          .prepare(INSERT_REPLY_COMMENT)
          .bind(
            input.id,
            input.slug,
            input.parentId,
            input.visitorId,
            input.authorName,
            input.authorRole,
            input.body,
            input.status,
            createdAt,
            input.parentId,
            input.slug,
          );

  const [commentsRes, upvotesRes] = (
    await db.batch<CommentRow | UpvoteRow>([
      insertStmt,
      db.prepare(SELECT_COMMENTS).bind(input.slug),
      db.prepare(SELECT_VISITOR_UPVOTES).bind(input.slug, input.visitorId),
    ])
  ).slice(1);

  const upvotedIds = new Set(
    ((upvotesRes?.results ?? []) as UpvoteRow[]).map((row) => row.comment_id),
  );
  return assembleThreads(
    (commentsRes?.results ?? []) as CommentRow[],
    upvotedIds,
    input.visitorId,
    nowMs,
  );
}

export async function setCommentUpvote(
  db: D1Database,
  slug: string,
  commentId: string,
  visitorId: string,
  upvote: boolean,
  nowMs = Date.now(),
): Promise<CommentListState> {
  const createdAt = new Date(nowMs).toISOString();

  const writeStatements = upvote
    ? [
        db.prepare(INCREMENT_COMMENT_UPVOTE).bind(commentId, slug, commentId, visitorId),
        db.prepare(INSERT_COMMENT_UPVOTE).bind(commentId, visitorId, createdAt, commentId, slug),
      ]
    : [
        db.prepare(DECREMENT_COMMENT_UPVOTE).bind(commentId, slug, commentId, visitorId),
        db.prepare(DELETE_COMMENT_UPVOTE).bind(commentId, visitorId),
      ];

  const results = await db.batch<CommentRow | UpvoteRow>([
    ...writeStatements,
    db.prepare(SELECT_COMMENTS).bind(slug),
    db.prepare(SELECT_VISITOR_UPVOTES).bind(slug, visitorId),
  ]);

  const commentsRes = results[results.length - 2];
  const upvotesRes = results[results.length - 1];
  const upvotedIds = new Set(
    ((upvotesRes?.results ?? []) as UpvoteRow[]).map((row) => row.comment_id),
  );
  return assembleThreads(
    (commentsRes?.results ?? []) as CommentRow[],
    upvotedIds,
    visitorId,
    nowMs,
  );
}

export async function hideOwnArticleComment(
  db: D1Database,
  slug: string,
  commentId: string,
  visitorId: string,
  nowMs = Date.now(),
): Promise<CommentListState> {
  const cutoffIso = new Date(nowMs - OWN_DELETE_WINDOW_MS).toISOString();

  const [, commentsRes, upvotesRes] = await db.batch<CommentRow | UpvoteRow>([
    db
      .prepare(HIDE_OWN_COMMENT)
      .bind(slug, commentId, commentId, commentId, slug, visitorId, cutoffIso),
    db.prepare(SELECT_COMMENTS).bind(slug),
    db.prepare(SELECT_VISITOR_UPVOTES).bind(slug, visitorId),
  ]);

  const upvotedIds = new Set(
    ((upvotesRes?.results ?? []) as UpvoteRow[]).map((row) => row.comment_id),
  );
  return assembleThreads(
    (commentsRes?.results ?? []) as CommentRow[],
    upvotedIds,
    visitorId,
    nowMs,
  );
}

export async function hideCommentAsModerator(
  db: D1Database,
  slug: string,
  commentId: string,
  visitorId: string | null,
  nowMs = Date.now(),
): Promise<CommentListState> {
  await db.batch([db.prepare(HIDE_MODERATOR_COMMENT).bind(slug, commentId, commentId)]);
  return readArticleComments(db, slug, visitorId, nowMs);
}
