import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, CornerDownLeft, Search } from "lucide-react";

import type { Article } from "@/content/types";

/**
 * Global keyboard search (Ctrl/⌘ + K).
 *
 * The article index is imported lazily on first open so the 144-article corpus
 * stays out of initial page bundles. `/search` remains the canonical, shareable,
 * no-JS search route.
 */

interface Hit {
  title: string;
  path: string;
  category: string;
  minutes: number;
}

interface SearchModule {
  search: (query: string) => { article: Article }[];
  recent: Hit[];
}

let cachedModule: SearchModule | null = null;

async function loadSearchModule(): Promise<SearchModule> {
  if (cachedModule) return cachedModule;
  const mod = await import("@/lib/content");
  cachedModule = {
    search: mod.searchArticles,
    recent: mod.latestArticles(4).map((article) => ({
      title: article.title,
      path: `/${article.category}/${article.slug}`,
      category: mod.getCategory(article.category)?.label ?? article.category,
      minutes: article.readingMinutes,
    })),
  };
  return cachedModule;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [recent, setRecent] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    void loadSearchModule().then((mod) => {
      if (!cancelled) {
        setRecent(mod.recent);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => window.clearTimeout(id);
    }
    setQuery("");
    setHits([]);
    setActive(0);
    return undefined;
  }, [open]);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setHits([]);
      setActive(0);
      return undefined;
    }
    let cancelled = false;
    const id = window.setTimeout(() => {
      void loadSearchModule().then((mod) => {
        if (cancelled) return;
        setHits(
          mod
            .search(term)
            .slice(0, 7)
            .map(({ article }) => ({
              title: article.title,
              path: `/${article.category}/${article.slug}`,
              category: article.subcategory ?? article.category,
              minutes: article.readingMinutes,
            })),
        );
        setActive(0);
      });
    }, 100);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [query]);

  const go = useCallback(
    (to: string) => {
      onClose();
      void navigate({ to });
    },
    [navigate, onClose],
  );

  const submit = useCallback(() => {
    const term = query.trim();
    onClose();
    void navigate({ to: "/search", search: term ? { q: term } : {} });
  }, [navigate, onClose, query]);

  const hasQuery = query.trim().length >= 2;
  const visibleItems = hasQuery ? hits : recent;

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (visibleItems.length === 0 ? 0 : (i + 1) % visibleItems.length));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) =>
        visibleItems.length === 0 ? 0 : (i - 1 + visibleItems.length) % visibleItems.length,
      );
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const item = visibleItems[active];
      if (item && (hasQuery || query.trim().length === 0)) {
        go(item.path);
      } else {
        submit();
      }
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[10vh] sm:pt-[13vh]"
      role="presentation"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-black/35 dark:bg-black/60" aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search articles"
        className="animate-fade relative w-full max-w-xl overflow-hidden rounded-lg border border-border bg-surface"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-hairline px-4">
          <Search className="size-4 shrink-0 text-ink-faint" aria-hidden="true" />
          <label htmlFor="palette-input" className="sr-only">
            Search articles
          </label>
          <input
            id="palette-input"
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search articles, standards, or error codes…"
            autoComplete="off"
            spellCheck={false}
            className="h-12 flex-1 bg-transparent text-[0.9375rem] text-foreground placeholder:text-ink-faint focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-7 min-w-9 cursor-pointer items-center justify-center rounded border border-hairline px-2 font-mono text-[0.6875rem] text-ink-faint transition-colors hover:text-foreground"
          >
            Esc
          </button>
        </div>

        <div className="max-h-[min(24rem,58vh)] overflow-y-auto p-2">
          {!hasQuery ? (
            loading && recent.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-ink-faint">Loading archive…</p>
            ) : (
              <div>
                <p className="kicker px-3 pb-1.5 pt-2">Recent analysis</p>
                <ul role="listbox" aria-label="Recent articles">
                  {recent.map((item, i) => (
                    <li key={item.path}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={i === active}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(item.path)}
                        className={`flex min-h-11 w-full cursor-pointer flex-col rounded-md px-3 py-2.5 text-left transition-colors ${
                          i === active ? "bg-surface-2 text-foreground" : "text-foreground"
                        }`}
                      >
                        <span className="line-clamp-2 text-[0.9375rem] font-medium leading-snug">
                          {item.title}
                        </span>
                        <span className="t-caption mt-1 tabular-nums">
                          {item.category} &middot; {item.minutes} min read
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          ) : hits.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <p className="text-[0.9375rem] font-medium text-foreground">
                No articles match &ldquo;{query.trim()}&rdquo;
              </p>
              <p className="mt-1 text-[0.8125rem] text-ink-faint">
                Try a broader product name, protocol, or standard.
              </p>
            </div>
          ) : (
            <ul role="listbox" aria-label="Search results">
              {hits.map((hit, i) => (
                <li key={hit.path}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(hit.path)}
                    className={`flex min-h-11 w-full cursor-pointer flex-col rounded-md px-3 py-2.5 text-left transition-colors ${
                      i === active ? "bg-surface-2 text-foreground" : "text-foreground"
                    }`}
                  >
                    <span className="line-clamp-2 text-[0.9375rem] font-medium leading-snug">
                      {hit.title}
                    </span>
                    <span className="t-caption mt-1 tabular-nums">
                      {hit.category} &middot; {hit.minutes} min read
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-hairline bg-surface-2/50 px-4 py-2.5">
          <button
            type="button"
            onClick={submit}
            className="inline-flex cursor-pointer items-center gap-1.5 text-[0.8125rem] font-medium text-link transition-colors hover:underline"
          >
            {query.trim().length > 0 ? (
              <>
                <CornerDownLeft className="size-3.5" aria-hidden="true" />
                <span>All results for &ldquo;{query.trim()}&rdquo;</span>
              </>
            ) : (
              <>
                <span>Open full search page</span>
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </>
            )}
          </button>
          <span className="hidden gap-3 font-mono text-[0.6875rem] text-ink-faint sm:flex">
            <span>↑↓ select</span>
            <span>↵ open</span>
          </span>
        </div>
      </div>
    </div>
  );
}
