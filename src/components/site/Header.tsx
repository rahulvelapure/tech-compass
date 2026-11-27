import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";

import { primaryNav } from "@/content/categories";
import { site } from "@/lib/site";
import { CommandPalette } from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";

const navLink =
  "relative inline-flex min-w-6 items-center justify-center whitespace-nowrap py-3 text-[0.875rem] font-medium text-ink-soft transition-colors hover:text-foreground";
const navLinkActive =
  "relative inline-flex min-w-6 items-center justify-center whitespace-nowrap py-3 text-[0.875rem] font-semibold text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-[2px] after:bg-brand";

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link
      to="/"
      onClick={onClick}
      aria-label={`${site.name} homepage`}
      className="t-masthead inline-flex min-h-7 items-center text-foreground transition-opacity hover:opacity-80"
    >
      {site.name}
    </Link>
  );
}

function useCommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => !value);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return { open, setOpen };
}

export function Header() {
  const [menu, setMenu] = useState(false);
  const { open, setOpen } = useCommandPalette();

  useEffect(() => {
    if (!menu) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenu(false);
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  return (
    <>
      <header className="bg-background">
        {/* Top masthead bar */}
        <div className="border-b border-hairline">
          <div className="wrap flex h-14 items-center justify-between gap-4 lg:h-16">
            <div className="flex min-w-0 items-center gap-4">
              <Wordmark onClick={() => setMenu(false)} />
              <span aria-hidden="true" className="hidden h-4 w-px bg-hairline md:inline-block" />
              <p className="hidden truncate text-[0.8125rem] text-muted-foreground md:block">
                {site.metaTagline}
              </p>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <nav aria-label="Secondary" className="mr-2 hidden items-center gap-5 lg:flex">
                <Link
                  to="/about"
                  className="inline-flex min-h-7 items-center text-[0.8125rem] font-medium text-ink-soft transition-colors hover:text-foreground"
                  activeProps={{
                    className:
                      "inline-flex min-h-7 items-center text-[0.8125rem] font-semibold text-foreground",
                  }}
                >
                  About
                </Link>
                <Link
                  to="/newsletter"
                  className="inline-flex min-h-7 items-center text-[0.8125rem] font-medium text-ink-soft transition-colors hover:text-foreground"
                  activeProps={{
                    className:
                      "inline-flex min-h-7 items-center text-[0.8125rem] font-semibold text-foreground",
                  }}
                >
                  Newsletter
                </Link>
              </nav>

              <button
                type="button"
                onClick={() => {
                  setMenu(false);
                  setOpen(true);
                }}
                aria-label="Search articles"
                className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center gap-2 rounded-md text-ink-soft transition-colors hover:bg-surface-2 hover:text-foreground sm:min-h-9 sm:min-w-0 sm:border sm:border-hairline sm:bg-surface-2/60 sm:px-3 sm:hover:border-border sm:hover:bg-surface-2"
              >
                <Search className="size-4 shrink-0" aria-hidden="true" />
                <span className="hidden text-[0.8125rem] font-medium sm:inline">Search</span>
                <kbd className="hidden rounded border border-hairline bg-background px-1.5 py-0.5 font-mono text-[0.6875rem] text-muted-foreground xl:inline">
                  Ctrl K
                </kbd>
              </button>

              <ThemeToggle />

              <button
                type="button"
                aria-expanded={menu}
                aria-controls="mobile-nav"
                aria-label={menu ? "Close navigation menu" : "Open navigation menu"}
                onClick={() => setMenu((value) => !value)}
                className="inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md text-ink-soft transition-colors hover:bg-surface-2 hover:text-foreground lg:hidden"
              >
                {menu ? (
                  <X className="size-5" aria-hidden="true" />
                ) : (
                  <Menu className="size-5" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile navigation sheet */}
        {menu && (
          <div
            id="mobile-nav"
            className="fixed inset-x-0 bottom-0 top-14 z-40 overflow-y-auto border-t border-hairline bg-background lg:hidden"
          >
            <div className="wrap py-5">
              <button
                type="button"
                onClick={() => {
                  setMenu(false);
                  setOpen(true);
                }}
                className="flex h-11 w-full cursor-pointer items-center gap-2.5 rounded-md border border-border bg-surface px-3.5 text-left text-[0.9375rem] text-muted-foreground transition-colors hover:border-foreground/30"
              >
                <Search className="size-4 shrink-0" aria-hidden="true" />
                <span>Search articles, topics, or errors…</span>
              </button>

              <nav aria-label="Mobile sections" className="mt-5">
                <p className="kicker mb-2">Sections</p>
                <ul className="divide-y divide-hairline border-y border-hairline">
                  <li>
                    <Link
                      to="/"
                      onClick={() => setMenu(false)}
                      activeOptions={{ exact: true }}
                      className="flex min-h-12 items-center justify-between text-[1.0625rem] font-medium text-ink-soft transition-colors hover:text-foreground"
                      activeProps={{
                        className:
                          "flex min-h-12 items-center justify-between text-[1.0625rem] font-semibold text-link",
                      }}
                    >
                      <span>Latest</span>
                    </Link>
                  </li>
                  {primaryNav.map((item) => (
                    <li key={item.slug}>
                      <Link
                        to="/$category"
                        params={{ category: item.slug }}
                        onClick={() => setMenu(false)}
                        className="flex min-h-12 items-center justify-between text-[1.0625rem] font-medium text-ink-soft transition-colors hover:text-foreground"
                        activeProps={{
                          className:
                            "flex min-h-12 items-center justify-between text-[1.0625rem] font-semibold text-link",
                        }}
                      >
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav aria-label="Mobile publication" className="mt-6">
                <p className="kicker mb-2">Publication</p>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <li>
                    <Link
                      to="/about"
                      onClick={() => setMenu(false)}
                      className="inline-flex min-h-11 items-center text-[0.9375rem] text-ink-soft hover:text-foreground"
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/resources"
                      onClick={() => setMenu(false)}
                      className="inline-flex min-h-11 items-center text-[0.9375rem] text-ink-soft hover:text-foreground"
                    >
                      Resources
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/newsletter"
                      onClick={() => setMenu(false)}
                      className="inline-flex min-h-11 items-center text-[0.9375rem] text-ink-soft hover:text-foreground"
                    >
                      Newsletter
                    </Link>
                  </li>
                  <li>
                    <a
                      href="/rss.xml"
                      className="inline-flex min-h-11 items-center text-[0.9375rem] text-ink-soft hover:text-foreground"
                    >
                      RSS Feed
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Desktop sticky section rail */}
      <nav
        aria-label="Primary"
        className="sticky top-0 z-30 hidden border-b border-hairline bg-background/95 backdrop-blur-[2px] lg:block"
      >
        <div className="wrap">
          <ul className="flex items-center gap-7">
            <li>
              <Link
                to="/"
                className={navLink}
                activeProps={{ className: navLinkActive }}
                activeOptions={{ exact: true }}
              >
                Latest
              </Link>
            </li>
            {primaryNav.map((item) => (
              <li key={item.slug}>
                <Link
                  to="/$category"
                  params={{ category: item.slug }}
                  className={navLink}
                  activeProps={{ className: navLinkActive }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </>
  );
}
