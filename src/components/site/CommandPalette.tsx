import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CornerDownLeft, FileText, Search } from "lucide-react";

import type { Article } from "@/content/types";

/**
 * ⌘K search.
 *
 * Two properties matter more than the interaction itself.
 *
 * The article index is loaded lazily. `searchArticles` reaches the whole
 * corpus, and the corpus is by far the largest chunk the site ships — pulling
 * it into the header would put it on every page load to serve a panel most
 * readers never open. The import happens on first open instead, so the cost
 * lands on the reader who asked for it.
 *
 * And the panel is a shortcut, not a replacement. `/search` remains a real,
 * linkable, no-JS page; this is the same query with the round trip removed.
 */

interface Hit {
  title: string;
  path: string;
  category: string;
  minutes: number;
}

type SearchFn = (query: string) => { article: Article }[];

let searchFn: SearchFn | null = null;

async function loadSearch(): Promise<SearchFn> {
  if (searchFn) return searchFn;
  const mod = await import("@/lib/content");
  searchFn = mod.searchArticles;
  return searchFn;
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  /* Warm the index as soon as the panel opens, before anything is typed. */
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    void loadSearch().then(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      // The dialog mounts before the browser can move focus into it.
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
      void loadSearch().then((run) => {
        if (cancelled) return;
        setHits(
          run(term)
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
    }, 120);
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
    if (!term) return;
    onClose();
    void navigate({ to: "/search", search: { q: term } });
  }, [navigate, onClose, query]);

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => (hits.length === 0 ? 0 : (i + 1) % (hits.length + 1)));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => (hits.length === 0 ? 0 : (i - 1 + hits.length + 1) % (hits.length + 1)));
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const hit = hits[active];
      if (hit) go(hit.path);
      else submit();
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]"
      role="presentation"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-foreground/25 backdrop-blur-[2px]" aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search articles"
        className="glass-strong animate-fade relative w-full max-w-xl overflow-hidden rounded-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b hairline px-4">
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
            placeholder="Search articles…"
            autoComplete="off"
            spellCheck={false}
            className="h-12 flex-1 bg-transparent text-[0.95rem] text-foreground placeholder:text-ink-faint focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[0.65rem] text-ink-faint sm:inline">
            Esc
          </kbd>
        </div>

        <div className="max-h-[min(24rem,55vh)] overflow-y-auto p-1.5">
          {query.trim().length < 2 ? (
            <p className="px-3 py-6 text-center text-sm text-ink-faint">
              {loading ? "Loading the index…" : "Type at least two characters."}
            </p>
          ) : hits.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-ink-faint">
              No articles match “{query.trim()}”.
            </p>
          ) : (
            <ul role="listbox" aria-label="Results">
              {hits.map((hit, i) => (
                <li key={hit.path}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(hit.path)}
                    className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      i === active ? "bg-accent text-accent-foreground" : "text-foreground"
                    }`}
                  >
                    <FileText
                      className="mt-0.5 size-4 shrink-0 text-ink-faint"
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{hit.title}</span>
                      <span className="t-caption mt-0.5 block">
                        {hit.category} · {hit.minutes} min
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t hairline px-4 py-2.5">
          <button
            type="button"
            onClick={submit}
            disabled={query.trim().length === 0}
            className="flex items-center gap-2 text-xs text-ink-faint transition-colors hover:text-foreground disabled:opacity-50"
          >
            <CornerDownLeft className="size-3.5" aria-hidden="true" />
            See all results
          </button>
          <span className="hidden gap-3 font-mono text-[0.65rem] text-ink-faint sm:flex">
            <span>↑↓ navigate</span>
            <span>↵ open</span>
          </span>
        </div>
      </div>
    </div>
  );
}
