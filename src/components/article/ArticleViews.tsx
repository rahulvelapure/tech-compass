import { useEffect } from "react";
import { Eye } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { recordArticleView, type ViewSnapshot } from "@/lib/views.functions";

interface VisitSession {
  promise: Promise<ViewSnapshot>;
  refs: number;
}

const activeSessions = new Map<string, VisitSession>();

/**
 * Displays the article's live visit count (`2,000–8,000` baseline + real-time
 * `+1` D1 visits).
 *
 * Multiple instances on the same article page (header bar and footer share bar)
 * deduplicate through `activeSessions` + TanStack Query so each visit records
 * one `+1` increment while keeping both displays synchronised.
 */
export function ArticleViews({ slug }: { slug: string }) {
  const record = useServerFn(recordArticleView);
  const queryClient = useQueryClient();
  const queryKey = ["article-views", slug] as const;

  const { data: snapshot } = useQuery<ViewSnapshot>({
    queryKey,
    enabled: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    let session = activeSessions.get(slug);
    if (!session) {
      const promise = (record({ data: { slug } }) as Promise<ViewSnapshot>)
        .catch((): ViewSnapshot => ({ available: false }))
        .then((result) => {
          queryClient.setQueryData<ViewSnapshot>(["article-views", slug], result);
          void queryClient.invalidateQueries({ queryKey: ["most-visited"] });
          return result;
        });
      session = { promise, refs: 0 };
      activeSessions.set(slug, session);
    }

    session.refs += 1;
    void session.promise.then((result) => {
      queryClient.setQueryData<ViewSnapshot>(["article-views", slug], result);
    });

    return () => {
      const current = activeSessions.get(slug);
      if (!current) return;
      current.refs -= 1;
      queueMicrotask(() => {
        const latest = activeSessions.get(slug);
        if (latest && latest.refs <= 0) {
          activeSessions.delete(slug);
        }
      });
    };
  }, [queryClient, record, slug]);

  // Reserve exact footprint before client fetch resolves so nothing shifts.
  if (!snapshot) return <div className="h-8 w-20" aria-hidden="true" />;

  if (!snapshot.available) return null;

  const formatted = formatCount(snapshot.viewTotal);

  return (
    <span
      aria-label={`${formatted} article views`}
      title={`${formatted} views`}
      className="inline-flex h-8 items-center gap-1.5 px-1.5 text-[0.8125rem] tabular-nums text-muted-foreground"
    >
      <Eye className="size-3.5 shrink-0" aria-hidden="true" />
      <span>{formatted}</span>
    </span>
  );
}

const counts = new Intl.NumberFormat("en-US");

function formatCount(value: number): string {
  return counts.format(value);
}
