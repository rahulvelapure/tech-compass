import { createServerFn } from "@tanstack/react-start";
import {
  getCookie,
  getRequestIP,
  setCookie,
  setResponseHeader,
} from "@tanstack/react-start/server";
import { z } from "zod";

import { articles } from "@/content/articles";

import { applyReaction, reactionDb, readReactionState, type Reaction } from "./reactions.db";
import {
  VISITOR_COOKIE,
  VISITOR_COOKIE_OPTIONS,
  issueVisitorId,
  reactionRateKey,
  reactionSecret,
  readVisitorId,
  withinReactionLimit,
} from "./reactions.identity";
import { seededLikeCount } from "./reactions.seed";

/**
 * Article reactions.
 *
 * ---------------------------------------------------------------------------
 * THE DISLIKE COUNT DOES NOT LEAVE THIS FILE'S SERVER BOUNDARY.
 *
 * `ReactionSnapshot` is the only shape either handler returns, and it has no
 * field for it. Dislikes are counted in D1 for editorial analytics and read
 * out of band; they are never sent to the browser, so there is nothing in the
 * HTML, the SSR payload, the router's JSON, the client bundle, page metadata
 * or structured data to hide with CSS or to read out of devtools.
 *
 * If you are adding a field here, that is the rule to keep.
 * ---------------------------------------------------------------------------
 *
 * The like total is published as a single number. The seeded editorial
 * baseline and the genuine count are added on the server and never sent
 * separately, so the split is not observable either.
 */

/** The complete public shape. One number, and the caller's own choice. */
export type ReactionSnapshot =
  | { available: true; likeTotal: number; mine: Reaction | null }
  /**
   * No database is bound, so reactions cannot be recorded. The component
   * renders nothing at all rather than showing a control that silently fails
   * — the same choice the newsletter form makes when its provider is
   * unconfigured.
   */
  | { available: false };

const UNAVAILABLE: ReactionSnapshot = { available: false };

/**
 * Slugs that may be reacted to.
 *
 * Without this check the slug is caller-supplied text that becomes a primary
 * key, and anyone could fill the table with rows for articles that do not
 * exist.
 *
 * Drafts are excluded. They are unlisted and noindex, and the reaction control
 * is not rendered on them, so a reaction arriving for one did not come from the
 * page.
 *
 * Built lazily inside a function rather than as a module-level constant on
 * purpose. This module is imported by a client component in order to call the
 * server functions, and the compiler strips the handler bodies from the browser
 * build. A top-level `new Set(articles...)` would be evaluated outside those
 * bodies and would anchor this module's own reference to the corpus. Kept
 * inside the handlers, none of it survives into the client bundle — verified
 * by building and confirming that no marker from this feature (the SQL, the
 * seed derivation, the binding name, the cookie name) appears under
 * .output/public.
 */
let reactableSlugs: Set<string> | undefined;

function isReactable(slug: string): boolean {
  reactableSlugs ??= new Set(articles.filter((article) => !article.draft).map((a) => a.slug));
  return reactableSlugs.has(slug);
}

/** Shape only. Membership is checked in the handler, for the reason above. */
const slugSchema = z.string().min(1).max(128);

/* ------------------------------------------------------------------ */
/* Read                                                                */
/* ------------------------------------------------------------------ */

/**
 * Current like total and the caller's own reaction.
 *
 * Fetched by the component after mount rather than resolved in the route
 * loader. Two reasons, and the first is the important one:
 *
 *  - Route loader data is serialised into the SSR payload. Per-visitor state
 *    has no business being there, and keeping reactions out of it means the
 *    article HTML stays identical for every reader and fully cacheable.
 *  - It would otherwise make every article response vary by cookie.
 *
 * No cookie is set here. A reader who never reacts is never given an
 * identifier, so simply reading an article leaves nothing behind.
 */
export const getArticleReactions = createServerFn({ method: "GET" })
  .inputValidator((data: unknown) => z.object({ slug: slugSchema }).parse(data))
  .handler(async ({ data }): Promise<ReactionSnapshot> => {
    const db = reactionDb();
    const secret = reactionSecret();
    if (!db || !secret) return UNAVAILABLE;
    if (!isReactable(data.slug)) return UNAVAILABLE;

    // Varies by cookie and changes constantly. Explicit, so nothing between
    // here and the reader is tempted to cache one visitor's answer for all.
    setResponseHeader("cache-control", "private, no-store");

    const visitorId = await currentVisitorId(secret);

    try {
      const state = await readReactionState(db, data.slug, visitorId);
      return {
        available: true,
        likeTotal: seededLikeCount(data.slug) + state.genuineLikes,
        mine: state.mine,
      };
    } catch (error) {
      logFailure("read", data.slug, error);
      return UNAVAILABLE;
    }
  });

/* ------------------------------------------------------------------ */
/* Write                                                               */
/* ------------------------------------------------------------------ */

const reactSchema = z.object({
  slug: slugSchema,
  /**
   * The reaction the reader now holds. `null` withdraws it, which is what the
   * UI sends when someone clicks the button they had already chosen.
   *
   * Sending a reaction the reader already holds is harmless: the storage layer
   * removes the old contribution and adds the new one in one transaction, so
   * it nets to no change rather than counting twice.
   */
  reaction: z.enum(["like", "dislike"]).nullable(),
});

export const reactToArticle = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => reactSchema.parse(data))
  .handler(async ({ data }): Promise<ReactionSnapshot> => {
    const db = reactionDb();
    const secret = reactionSecret();
    if (!db || !secret) return UNAVAILABLE;
    if (!isReactable(data.slug)) return UNAVAILABLE;

    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    if (!withinReactionLimit(await reactionRateKey(ip))) {
      logOutcome("rate-limited", data.slug, data.reaction);
      // Report the state we have rather than an error: a reader who has hit
      // the limit is far more likely to be enthusiastic than malicious, and a
      // reaction is not worth an error message.
      return readOnlySnapshot(db, secret, data.slug);
    }

    // The identifier is minted at the moment someone actually reacts — the
    // first point at which there is anything to remember about them.
    let visitorId = await currentVisitorId(secret);
    if (!visitorId) {
      const issued = await issueVisitorId(secret);
      setCookie(VISITOR_COOKIE, issued, VISITOR_COOKIE_OPTIONS);
      // The cookie carries "<id>.<signature>"; only the id half is stored.
      visitorId = issued.split(".")[0] as string;
    }

    try {
      const state = await applyReaction(db, data.slug, visitorId, data.reaction);
      logOutcome("recorded", data.slug, data.reaction);
      return {
        available: true,
        likeTotal: seededLikeCount(data.slug) + state.genuineLikes,
        mine: state.mine,
      };
    } catch (error) {
      logFailure("write", data.slug, error);
      return UNAVAILABLE;
    }
  });

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** A cookie we did not sign is ignored, not trusted and not stored. */
function currentVisitorId(secret: string): Promise<string | null> {
  return readVisitorId(secret, getCookie(VISITOR_COOKIE));
}

async function readOnlySnapshot(
  db: NonNullable<ReturnType<typeof reactionDb>>,
  secret: string,
  slug: string,
): Promise<ReactionSnapshot> {
  try {
    const state = await readReactionState(db, slug, await currentVisitorId(secret));
    return {
      available: true,
      likeTotal: seededLikeCount(slug) + state.genuineLikes,
      mine: state.mine,
    };
  } catch (error) {
    logFailure("read", slug, error);
    return UNAVAILABLE;
  }
}

/**
 * Operational logging only.
 *
 * The slug is public and the reaction is the event itself; neither identifies
 * a reader. The visitor id, the cookie and the IP are never passed in here —
 * the whole point of the identifier is that it is not worth logging.
 */
function logOutcome(outcome: string, slug: string, reaction: Reaction | null): void {
  console.log(
    JSON.stringify({
      event: "article_reaction",
      outcome,
      slug,
      reaction: reaction ?? "withdrawn",
      timestamp: new Date().toISOString(),
    }),
  );
}

function logFailure(phase: "read" | "write", slug: string, error: unknown): void {
  console.error(
    JSON.stringify({
      event: "article_reaction_failed",
      phase,
      slug,
      message: error instanceof Error ? error.message : "unknown error",
      timestamp: new Date().toISOString(),
    }),
  );
}
