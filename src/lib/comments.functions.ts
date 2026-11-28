import { createServerFn } from "@tanstack/react-start";
import {
  getCookie,
  getRequestIP,
  setCookie,
  setResponseHeader,
} from "@tanstack/react-start/server";
import { z } from "zod";

import { articles } from "@/content/articles";

import {
  commentDb,
  createArticleComment,
  hideCommentAsModerator,
  hideOwnArticleComment,
  readArticleComments,
  setCommentUpvote,
  type CommentThread,
} from "./comments.db";
import {
  COMMENT_HONEYPOT_FIELD,
  commentRateKey,
  issueCommentToken,
  validateAndCleanComment,
  verifyCommentToken,
  verifyModeratorKey,
  withinCommentActionLimit,
  withinCommentPostLimit,
} from "./comments.spam";
import { toBase64Url } from "./hmac";
import {
  VISITOR_COOKIE,
  VISITOR_COOKIE_OPTIONS,
  issueVisitorId,
  reactionSecret,
  readVisitorId,
} from "./reactions.identity";

export type CommentSnapshot =
  | {
      available: true;
      totalCount: number;
      threads: CommentThread[];
      formToken: string;
    }
  | { available: false };

export type PostCommentResult =
  | {
      ok: true;
      snapshot: Extract<CommentSnapshot, { available: true }>;
    }
  | {
      ok: false;
      message: string;
      formToken?: string;
    };

const UNAVAILABLE: CommentSnapshot = { available: false };

let commentableSlugs: Set<string> | undefined;

function isCommentable(slug: string): boolean {
  commentableSlugs ??= new Set(articles.filter((article) => !article.draft).map((a) => a.slug));
  return commentableSlugs.has(slug);
}

const slugSchema = z.string().min(1).max(128);
const idSchema = z.string().regex(/^[A-Za-z0-9_-]{16,32}$/);

function moderatorSecret(): string | null {
  return process.env["COMMENTS_ADMIN_KEY"] || null;
}

function currentVisitorId(secret: string): Promise<string | null> {
  return readVisitorId(secret, getCookie(VISITOR_COOKIE));
}

async function ensureVisitorId(secret: string): Promise<string> {
  const existing = await currentVisitorId(secret);
  if (existing) return existing;
  const issued = await issueVisitorId(secret);
  setCookie(VISITOR_COOKIE, issued, VISITOR_COOKIE_OPTIONS);
  return issued.split(".")[0] as string;
}

function newCommentId(): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(16)));
}

/* ------------------------------------------------------------------ */
/* Read                                                                */
/* ------------------------------------------------------------------ */

export const getArticleComments = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: slugSchema }).parse(data))
  .handler(async ({ data }): Promise<CommentSnapshot> => {
    const db = commentDb();
    const secret = reactionSecret();
    if (!db || !secret) return UNAVAILABLE;
    if (!isCommentable(data.slug)) return UNAVAILABLE;

    setResponseHeader("cache-control", "private, no-store");

    const visitorId = await currentVisitorId(secret);

    try {
      const [state, formToken] = await Promise.all([
        readArticleComments(db, data.slug, visitorId),
        issueCommentToken(secret),
      ]);
      return {
        available: true,
        totalCount: state.totalCount,
        threads: state.threads,
        formToken,
      };
    } catch (error) {
      logCommentFailure("read", data.slug, error);
      return UNAVAILABLE;
    }
  });

/* ------------------------------------------------------------------ */
/* Post comment or reply                                               */
/* ------------------------------------------------------------------ */

const postCommentSchema = z.object({
  slug: slugSchema,
  parentId: idSchema.nullable().optional(),
  authorName: z.string().max(120),
  authorRole: z.string().max(120).optional(),
  body: z.string().max(4_000),
  formToken: z.string().max(256).optional(),
  [COMMENT_HONEYPOT_FIELD]: z.string().max(256).optional(),
});

export const postArticleComment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => postCommentSchema.parse(data))
  .handler(async ({ data }): Promise<PostCommentResult> => {
    const db = commentDb();
    const secret = reactionSecret();
    if (!db || !secret || !isCommentable(data.slug)) {
      return { ok: false, message: "Comments are unavailable right now." };
    }

    const freshToken = await issueCommentToken(secret);

    // Silent honeypot sink: return current list as if nothing went wrong.
    if (data[COMMENT_HONEYPOT_FIELD]) {
      logCommentOutcome("rejected-honeypot", data.slug);
      const state = await readArticleComments(db, data.slug, await currentVisitorId(secret));
      return {
        ok: true,
        snapshot: {
          available: true,
          totalCount: state.totalCount,
          threads: state.threads,
          formToken: freshToken,
        },
      };
    }

    const verdict = data.formToken
      ? await verifyCommentToken(secret, data.formToken)
      : ({ valid: false, reason: "malformed" } as const);

    if (!verdict.valid) {
      if (verdict.reason === "too-fast") {
        return {
          ok: false,
          message: "Please wait a moment and submit your comment again.",
        };
      }
      if (verdict.reason === "expired") {
        return {
          ok: false,
          message: "This comment form expired. Submit once more to publish.",
          formToken: freshToken,
        };
      }
      logCommentOutcome("rejected-token", data.slug);
      return {
        ok: false,
        message: "Could not verify form session. Please submit again.",
        formToken: freshToken,
      };
    }

    const cleaned = validateAndCleanComment({
      authorName: data.authorName,
      authorRole: data.authorRole,
      body: data.body,
    });
    if (!cleaned.ok) {
      return { ok: false, message: cleaned.message };
    }

    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    if (!withinCommentPostLimit(await commentRateKey(ip))) {
      logCommentOutcome("rate-limited", data.slug);
      return {
        ok: false,
        message: "You have posted several comments recently. Please wait a few minutes.",
      };
    }

    const visitorId = await ensureVisitorId(secret);

    try {
      const state = await createArticleComment(db, {
        id: newCommentId(),
        slug: data.slug,
        parentId: data.parentId ?? null,
        visitorId,
        authorName: cleaned.authorName,
        authorRole: cleaned.authorRole,
        body: cleaned.body,
        status: cleaned.autoHidden ? "hidden" : "published",
      });
      logCommentOutcome(cleaned.autoHidden ? "auto-hidden" : "published", data.slug);
      return {
        ok: true,
        snapshot: {
          available: true,
          totalCount: state.totalCount,
          threads: state.threads,
          formToken: freshToken,
        },
      };
    } catch (error) {
      logCommentFailure("post", data.slug, error);
      return { ok: false, message: "Could not save your comment. Please try again." };
    }
  });

/* ------------------------------------------------------------------ */
/* Helpful upvote toggle                                               */
/* ------------------------------------------------------------------ */

const upvoteSchema = z.object({
  slug: slugSchema,
  commentId: idSchema,
  upvote: z.boolean(),
});

export const upvoteArticleComment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => upvoteSchema.parse(data))
  .handler(async ({ data }): Promise<CommentSnapshot> => {
    const db = commentDb();
    const secret = reactionSecret();
    if (!db || !secret || !isCommentable(data.slug)) return UNAVAILABLE;

    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    if (!withinCommentActionLimit(await commentRateKey(ip))) {
      const state = await readArticleComments(db, data.slug, await currentVisitorId(secret));
      return {
        available: true,
        totalCount: state.totalCount,
        threads: state.threads,
        formToken: await issueCommentToken(secret),
      };
    }

    const visitorId = await ensureVisitorId(secret);

    try {
      const [state, formToken] = await Promise.all([
        setCommentUpvote(db, data.slug, data.commentId, visitorId, data.upvote),
        issueCommentToken(secret),
      ]);
      return {
        available: true,
        totalCount: state.totalCount,
        threads: state.threads,
        formToken,
      };
    } catch (error) {
      logCommentFailure("upvote", data.slug, error);
      return UNAVAILABLE;
    }
  });

/* ------------------------------------------------------------------ */
/* Delete own recent comment / moderator hide                          */
/* ------------------------------------------------------------------ */

const deleteSchema = z.object({
  slug: slugSchema,
  commentId: idSchema,
  moderatorKey: z.string().max(256).optional(),
});

export const deleteArticleComment = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => deleteSchema.parse(data))
  .handler(async ({ data }): Promise<CommentSnapshot> => {
    const db = commentDb();
    const secret = reactionSecret();
    if (!db || !secret || !isCommentable(data.slug)) return UNAVAILABLE;

    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    if (!withinCommentActionLimit(await commentRateKey(ip))) {
      const state = await readArticleComments(db, data.slug, await currentVisitorId(secret));
      return {
        available: true,
        totalCount: state.totalCount,
        threads: state.threads,
        formToken: await issueCommentToken(secret),
      };
    }

    const visitorId = await currentVisitorId(secret);
    const isModerator = await verifyModeratorKey(moderatorSecret(), data.moderatorKey);

    try {
      if (isModerator) {
        const [state, formToken] = await Promise.all([
          hideCommentAsModerator(db, data.slug, data.commentId, visitorId),
          issueCommentToken(secret),
        ]);
        logCommentOutcome("moderator-hidden", data.slug);
        return {
          available: true,
          totalCount: state.totalCount,
          threads: state.threads,
          formToken,
        };
      }

      if (!visitorId) {
        const [state, formToken] = await Promise.all([
          readArticleComments(db, data.slug, null),
          issueCommentToken(secret),
        ]);
        return {
          available: true,
          totalCount: state.totalCount,
          threads: state.threads,
          formToken,
        };
      }

      const [state, formToken] = await Promise.all([
        hideOwnArticleComment(db, data.slug, data.commentId, visitorId),
        issueCommentToken(secret),
      ]);
      logCommentOutcome("author-deleted", data.slug);
      return {
        available: true,
        totalCount: state.totalCount,
        threads: state.threads,
        formToken,
      };
    } catch (error) {
      logCommentFailure("delete", data.slug, error);
      return UNAVAILABLE;
    }
  });

/* ------------------------------------------------------------------ */
/* Operational logging (no PII, no cookies, no IPs)                    */
/* ------------------------------------------------------------------ */

function logCommentOutcome(outcome: string, slug: string): void {
  console.log(
    JSON.stringify({
      event: "article_comment",
      outcome,
      slug,
      timestamp: new Date().toISOString(),
    }),
  );
}

function logCommentFailure(
  phase: "read" | "post" | "upvote" | "delete",
  slug: string,
  error: unknown,
): void {
  console.error(
    JSON.stringify({
      event: "article_comment_failed",
      phase,
      slug,
      message: error instanceof Error ? error.message : "unknown error",
      timestamp: new Date().toISOString(),
    }),
  );
}
