import { useEffect, useRef, useState } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";

import {
  getArticleReactions,
  reactToArticle,
  type ReactionSnapshot,
} from "@/lib/reactions.functions";
import type { Reaction } from "@/lib/reactions.db";
import { cn } from "@/lib/utils";

/**
 * Article reactions: like with a count, dislike without one.
 *
 * ---------------------------------------------------------------------------
 * The dislike count is not hidden here — it never arrives.
 *
 * `ReactionSnapshot` carries the like total and the reader's own choice, and
 * nothing else. There is no dislike number in this component's props, state or
 * markup to conceal with CSS, and none in the payload behind it. Do not add a
 * "hidden" one.
 * ---------------------------------------------------------------------------
 *
 * Lucide icons rather than 👍/👎 emoji: emoji render as full-colour glyphs that
 * differ on every platform, which would be the only colour on an otherwise
 * monochrome editorial page and the only element that ignores the theme. These
 * inherit `currentColor`, so they sit in the type and work in both themes.
 *
 * State is fetched after mount rather than through the route loader, so the
 * article's HTML stays identical for every reader and per-visitor state never
 * enters the SSR payload.
 */
export function ArticleReactions({ slug }: { slug: string }) {
  const fetchReactions = useServerFn(getArticleReactions);
  const react = useServerFn(reactToArticle);

  /** null while the first read is in flight. */
  const [snapshot, setSnapshot] = useState<ReactionSnapshot | null>(null);
  const pending = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchReactions({ data: { slug } })
      .then((result) => {
        if (!cancelled) setSnapshot(result);
      })
      .catch(() => {
        // A reaction control is not worth an error message. Withdraw quietly.
        if (!cancelled) setSnapshot({ available: false });
      });
    return () => {
      cancelled = true;
    };
  }, [fetchReactions, slug]);

  async function choose(reaction: Reaction) {
    if (pending.current || !snapshot?.available) return;
    pending.current = true;

    // Clicking the reaction you already hold withdraws it.
    const next = snapshot.mine === reaction ? null : reaction;

    // Optimistic: the button responds to the click, not to the round trip.
    // Only the like total moves, because it is the only number on screen.
    const delta = (next === "like" ? 1 : 0) - (snapshot.mine === "like" ? 1 : 0);
    setSnapshot({ ...snapshot, likeTotal: snapshot.likeTotal + delta, mine: next });

    try {
      const confirmed = await react({ data: { slug, reaction: next } });
      // The server's answer wins — it has the real count, including reactions
      // left by other readers since this page loaded.
      if (confirmed.available) setSnapshot(confirmed);
    } catch {
      // Put the optimistic change back.
      setSnapshot(snapshot);
    } finally {
      pending.current = false;
    }
  }

  // Reserve the row's height from the first paint so the article does not
  // shift when the count arrives.
  if (!snapshot) return <div className="h-8" aria-hidden="true" />;

  // No database bound, so a reaction could not be recorded. Show nothing
  // rather than a control that quietly does nothing — the same choice the
  // newsletter form makes when its provider is unconfigured.
  if (!snapshot.available) return null;

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => void choose("like")}
        aria-pressed={snapshot.mine === "like"}
        aria-label={
          snapshot.mine === "like"
            ? "You found this useful. Select again to undo."
            : "Mark this article as useful"
        }
        className={cn(
          // min-h-11 gives a 44px touch target on phones, which the compact
          // desktop density would otherwise miss; sm: returns it to the
          // editorial line height alongside the share links.
          "flex min-h-11 cursor-pointer items-center gap-2 px-2 py-1 text-sm transition-colors sm:min-h-0",
          snapshot.mine === "like" ? "text-brand" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <ThumbsUp
          className="h-4 w-4"
          aria-hidden="true"
          {...(snapshot.mine === "like" ? { fill: "currentColor" } : {})}
        />
        {/* tabular-nums keeps the row from twitching as the digits change. */}
        <span className="tabular-nums">{formatCount(snapshot.likeTotal)}</span>
      </button>

      {/*
        Separator, not a control. aria-hidden so it is not announced between
        the two buttons.

        Deliberately not `select-none`: site policy is that nothing in the
        reading area interferes with the reader's own selection, and suppressing
        it here to avoid picking up one stray character would be the only place
        in article-facing code that did.
      */}
      <span aria-hidden="true" className="text-xs text-muted-foreground/60">
        ·
      </span>

      <button
        type="button"
        onClick={() => void choose("dislike")}
        aria-pressed={snapshot.mine === "dislike"}
        aria-label={
          snapshot.mine === "dislike"
            ? "You found this not useful. Select again to undo."
            : "Mark this article as not useful"
        }
        className={cn(
          "flex min-h-11 cursor-pointer items-center px-3 py-1 text-sm transition-colors sm:min-h-0",
          snapshot.mine === "dislike"
            ? "text-brand"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <ThumbsDown
          className="h-4 w-4"
          aria-hidden="true"
          {...(snapshot.mine === "dislike" ? { fill: "currentColor" } : {})}
        />
      </button>
    </div>
  );
}

/**
 * Pinned to en-US so the grouping separator is the comma the rest of the
 * publication uses, rather than whatever the reader's browser prefers.
 */
const counts = new Intl.NumberFormat("en-US");

function formatCount(value: number): string {
  return counts.format(value);
}
