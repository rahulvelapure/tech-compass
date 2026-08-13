import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";

import { primaryNav, footerColumns } from "@/content/categories";
import { getCategory } from "@/lib/content";
import { site } from "@/lib/site";
import { ThemeToggle } from "./ThemeToggle";

function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`font-serif text-lg font-bold tracking-tight text-foreground ${className}`}
    >
      {site.name}
      <span className="text-accent">.</span>
    </Link>
  );
}

function SearchField({ autoFocus = false }: { autoFocus?: boolean }) {
  const navigate = useNavigate();
  const [value, setValue] = useState("");

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        navigate({ to: "/search", search: { q: value.trim() } });
      }}
      className="relative"
    >
      <label htmlFor={autoFocus ? "search-mobile" : "search-desktop"} className="sr-only">
        Search articles
      </label>
      <Search
        className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        id={autoFocus ? "search-mobile" : "search-desktop"}
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search articles"
        className="h-9 w-full rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none sm:w-56"
      />
    </form>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-8">
          <Wordmark />
          <nav aria-label="Primary" className="hidden min-w-0 lg:block">
            <ul className="flex items-center gap-5">
              {primaryNav.map((item) => (
                <li key={item.slug}>
                  <Link
                    to="/$category"
                    params={{ category: item.slug }}
                    className="text-sm font-medium text-foreground/80 transition-colors hover:text-accent"
                    activeProps={{ className: "text-accent" }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <SearchField />
          </div>
          <ThemeToggle />
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground lg:hidden"
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

      {open && (
        <div
          id="mobile-nav"
          className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-border bg-background lg:hidden"
        >
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
            <div className="mb-6 md:hidden">
              <SearchField autoFocus />
            </div>
            <nav aria-label="All sections" className="space-y-7">
              {footerColumns.map((column) => (
                <div key={column.heading}>
                  <h2 className="eyebrow mb-3 text-muted-foreground">{column.heading}</h2>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                    {column.slugs.map((slug) => {
                      const category = getCategory(slug);
                      if (!category) return null;
                      return (
                        <li key={slug}>
                          <Link
                            to="/$category"
                            params={{ category: slug }}
                            onClick={() => setOpen(false)}
                            className="block py-1 text-sm text-foreground/85 hover:text-accent"
                          >
                            {category.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <div className="flex gap-5 border-t border-border pt-5 text-sm text-muted-foreground">
                <Link to="/about" onClick={() => setOpen(false)}>
                  About
                </Link>
                <Link to="/resources" onClick={() => setOpen(false)}>
                  Resources
                </Link>
                <Link to="/newsletter" onClick={() => setOpen(false)}>
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
