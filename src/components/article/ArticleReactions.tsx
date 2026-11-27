import { useRef } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
 * Shared via TanStack Query (`["article-reactions", slug]`) so multiple
 * placements on the same article page (header metadata bar and post-article
 * share bar) issue a single network read on mount and stay instantaneously
 * synchronised when the reader reacts at either position.
 *
 * State is fetched client-side after mount so article SSR HTML stays identical
 * for every visitor and cacheable at the edge.
 */
export function ArticleReactions({ slug }: { slug: string }) {
  const fetchReactions = useServerFn(getArticleReactions);
  const react = useServerFn(reactToArticle);
  const queryClient = useQueryClient();
  const pending = useRef(false);

  const queryKey = ["article-reactions", slug] as const;

  const { data: snapshot } = useQuery<ReactionSnapshot>({
    queryKey,
    queryFn: async (): Promise<ReactionSnapshot> => {
      try {
        return (await fetchReactions({ data: { slug } })) as ReactionSnapshot;
      } catch {
        return { available: false };
      }
    },
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  async function choose(reaction: Reaction) {
    if (pending.current || !snapshot?.available) return;
    pending.current = true;

    const previous: ReactionSnapshot = snapshot;
    const next = snapshot.mine === reaction ? null : reaction;
    const delta = (next === "like" ? 1 : 0) - (snapshot.mine === "like" ? 1 : 0);

    const optimistic: ReactionSnapshot = {
      available: true,
      likeTotal: snapshot.likeTotal + delta,
      mine: next,
    };
    queryClient.setQueryData<ReactionSnapshot>(queryKey, optimistic);

    try {
      const confirmed = (await react({ data: { slug, reaction: next } })) as ReactionSnapshot;
      if (confirmed.available) {
        queryClient.setQueryData<ReactionSnapshot>(queryKey, confirmed);
      }
    } catch {
      queryClient.setQueryData<ReactionSnapshot>(queryKey, previous);
    } finally {
      pending.current = false;
    }
  }

  // Reserve exact row height before client fetch resolves to prevent layout shift.
  if (!snapshot) return <div className="h-8 w-24" aria-hidden="true" />;

  if (!snapshot.available) return null;

  return (
    <div
      role="group"
      aria-label="Article feedback"
      className="inline-flex items-center rounded-md border border-hairline bg-surface-2/45 px-1"
    >
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
          "inline-flex min-h-9 cursor-pointer items-center gap-1.5 px-2.5 py-1 text-[0.8125rem] font-medium transition-colors sm:min-h-8",
          snapshot.mine === "like" ? "text-brand" : "text-ink-soft hover:text-foreground",
        )}
      >
        <ThumbsUp
          className="size-3.5 shrink-0"
          aria-hidden="true"
          {...(snapshot.mine === "like" ? { fill: "currentColor" } : {})}
        />
        <span className="tabular-nums">{formatCount(snapshot.likeTotal)}</span>
      </button>

      <span aria-hidden="true" className="h-3.5 w-px bg-hairline" />

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
          "inline-flex min-h-9 min-w-8 cursor-pointer items-center justify-center px-2 py-1 text-[0.8125rem] transition-colors sm:min-h-8",
          snapshot.mine === "dislike"
            ? "text-brand"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <ThumbsDown
          className="size-3.5 shrink-0"
          aria-hidden="true"
          {...(snapshot.mine === "dislike" ? { fill: "currentColor" } : {})}
        />
      </button>
    </div>
  );
}

const counts = new Intl.NumberFormat("en-US");

function formatCount(value: number): string {
  return counts.format(value);
}
