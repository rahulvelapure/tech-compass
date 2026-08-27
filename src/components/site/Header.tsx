import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";

import { primaryNav, footerColumns } from "@/content/categories";
import { getCategory } from "@/lib/content";
import { site } from "@/lib/site";
import { CommandPalette } from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Wordmark.
 *
 * The mark is a solid brand rule set above the name, not a coloured full stop.
 * A rule is a publication device — it repeats in section kickers and in the
 * footer, so the identity is one idea used three times rather than three
 * unrelated decorations.
 */
function Wordmark() {
  return (
    <Link to="/" className="group inline-flex shrink-0 flex-col gap-1">
      <span className="h-[3px] w-6 bg-brand transition-[width] duration-200 group-hover:w-9" />
      <span className="font-display text-[1.15rem] font-medium leading-none tracking-[-0.03em] text-foreground">
        {site.name}
      </span>
    </Link>
  );
}

/**
 * Owns the ⌘K binding.
 *
 * Lives here rather than beside the palette so that module exports components
 * only — a file that mixes a hook with a component defeats fast refresh.
 */
function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { open, setOpen };
}

/**
 * The nav floats rather than spanning the viewport.
 *
 * Inset and rounded, it reads as a control resting on the page instead of a
 * band cutting across it — which keeps the masthead from competing with the
 * lead headline directly beneath it. `scroll-padding-top` in the base layer
 * accounts for the height so heading anchors do not land underneath it.
 */
export function Header() {
  const [menu, setMenu] = useState(false);
  const { open, setOpen } = useCommandPalette();

  return (
    <>
      <header className="sticky top-0 z-40 px-3 pt-3">
        <nav
          className="glass glass-sheen wrap flex items-center gap-4 rounded-xl py-2.5"
          aria-label="Primary"
        >
          <Wordmark />

          <ul className="hidden flex-1 items-center gap-0.5 lg:flex">
            {primaryNav.map((item) => (
              <li key={item.slug}>
                <Link
                  to="/$category"
                  params={{ category: item.slug }}
                  className="rounded-md px-2.5 py-1.5 text-sm text-ink-soft transition-colors hover:bg-accent hover:text-foreground"
                  activeProps={{ className: "bg-accent text-foreground" }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm text-ink-faint transition-colors hover:text-foreground"
            >
              <Search className="size-4" aria-hidden="true" />
              <span className="sr-only">Search articles</span>
              <kbd className="hidden font-mono text-[0.7rem] sm:inline" aria-hidden="true">
                ⌘K
              </kbd>
            </button>

            <ThemeToggle />

            <button
              type="button"
              aria-expanded={menu}
              aria-controls="mobile-nav"
              onClick={() => setMenu((v) => !v)}
              className="rounded-md p-2 text-ink-faint transition-colors hover:bg-accent hover:text-foreground lg:hidden"
            >
              <span className="sr-only">{menu ? "Close menu" : "Open menu"}</span>
              {menu ? (
                <X className="size-4" aria-hidden="true" />
              ) : (
                <Menu className="size-4" aria-hidden="true" />
              )}
            </button>
          </div>
        </nav>

        {menu && (
          <div
            id="mobile-nav"
            className="glass wrap mt-2 max-h-[calc(100dvh-8rem)] overflow-y-auto rounded-xl p-4 lg:hidden"
          >
            <nav aria-label="All sections" className="space-y-6">
              {footerColumns.map((column) => (
                <div key={column.heading}>
                  <h2 className="kicker mb-3">{column.heading}</h2>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                    {column.slugs.map((slug) => {
                      const category = getCategory(slug);
                      if (!category) return null;
                      return (
                        <li key={slug} className="border-b hairline">
                          <Link
                            to="/$category"
                            params={{ category: slug }}
                            onClick={() => setMenu(false)}
                            className="block py-2 text-[15px] text-ink-soft hover:text-brand"
                          >
                            {category.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <div className="flex gap-6 border-t hairline pt-4 text-sm text-ink-faint">
                <Link to="/about" onClick={() => setMenu(false)} className="hover:text-brand">
                  About
                </Link>
                <Link to="/resources" onClick={() => setMenu(false)} className="hover:text-brand">
                  Resources
                </Link>
                <Link to="/newsletter" onClick={() => setMenu(false)} className="hover:text-brand">
                  Newsletter
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </>
  );
}
