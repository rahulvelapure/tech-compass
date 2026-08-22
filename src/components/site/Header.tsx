import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";

import { primaryNav, footerColumns } from "@/content/categories";
import { getCategory } from "@/lib/content";
import { site } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Wordmark.
 *
 * The mark is a solid brand rule set above the name, not a coloured full stop.
 * A rule is a publication device — it repeats in section kickers and in the
 * footer, so the identity is one idea used three times rather than three
 * unrelated decorations.
 */
function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`group inline-flex flex-col gap-1.5 ${className}`}>
      <span className="h-[3px] w-7 bg-brand transition-[width] duration-200 group-hover:w-10" />
      <span className="font-serif text-[1.35rem] font-semibold leading-none tracking-[-0.03em] text-foreground">
        {site.name}
      </span>
    </Link>
  );
}

function SearchField({ autoFocus = false }: { autoFocus?: boolean }) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const id = autoFocus ? "search-mobile" : "search-desktop";

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const q = value.trim();
        if (q) navigate({ to: "/search", search: { q } });
      }}
      className="relative"
    >
      <label htmlFor={id} className="sr-only">
        Search articles
      </label>
      <Search
        className="pointer-events-none absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search"
        className="h-8 w-full border-0 border-b border-border bg-transparent pl-6 pr-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-0 sm:w-44"
      />
    </form>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-foreground/15 bg-background">
      {/* Masthead row */}
      <div className="mx-auto flex max-w-[78rem] items-end justify-between gap-6 px-4 pb-3 pt-5 sm:px-6 lg:px-8">
        <Wordmark />

        <div className="flex items-center gap-4">
          <p className="hidden text-xs leading-tight text-muted-foreground xl:block">
            {site.tagline}
          </p>
          <div className="hidden md:block">
            <SearchField />
          </div>
          <ThemeToggle />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="-mr-1 flex h-9 w-9 items-center justify-center text-foreground transition-colors hover:text-brand lg:hidden"
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            {open ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Section rail — the navigation reads as a contents strip, not a nav bar */}
      <nav aria-label="Primary" className="hidden border-t border-border lg:block">
        <div className="mx-auto max-w-[78rem] px-4 sm:px-6 lg:px-8">
          <ul className="-mx-3 flex items-center">
            {primaryNav.map((item) => (
              <li key={item.slug}>
                <Link
                  to="/$category"
                  params={{ category: item.slug }}
                  className="eyebrow relative block px-3 py-2.5 text-muted-foreground transition-colors hover:text-foreground"
                  activeProps={{
                    className:
                      "text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-[2px] after:bg-brand",
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-nav"
          className="max-h-[calc(100dvh-5.5rem)] overflow-y-auto border-t border-border bg-background lg:hidden"
        >
          <div className="mx-auto max-w-[78rem] px-4 py-6 sm:px-6">
            <div className="mb-7 md:hidden">
              <SearchField autoFocus />
            </div>
            <nav aria-label="All sections" className="space-y-8">
              {footerColumns.map((column) => (
                <div key={column.heading}>
                  <h2 className="kicker mb-3.5">{column.heading}</h2>
                  <ul className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                    {column.slugs.map((slug) => {
                      const category = getCategory(slug);
                      if (!category) return null;
                      return (
                        <li key={slug} className="border-b border-border/60">
                          <Link
                            to="/$category"
                            params={{ category: slug }}
                            onClick={() => setOpen(false)}
                            className="block py-2 text-[15px] text-foreground/85 hover:text-brand"
                          >
                            {category.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <div className="flex gap-6 border-t border-border pt-5 text-sm text-muted-foreground">
                <Link to="/about" onClick={() => setOpen(false)} className="hover:text-brand">
                  About
                </Link>
                <Link to="/resources" onClick={() => setOpen(false)} className="hover:text-brand">
                  Resources
                </Link>
                <Link to="/newsletter" onClick={() => setOpen(false)} className="hover:text-brand">
                  Newsletter
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
