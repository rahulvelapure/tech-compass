import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, Search, X } from "lucide-react";

import { primaryNav, footerColumns } from "@/content/categories";
import { getCategory } from "@/lib/content";
import { site } from "@/lib/site";
import { CommandPalette } from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";

function Wordmark() {
  return (
    <Link
      to="/"
      aria-label={`${site.name} homepage`}
      className="group inline-flex shrink-0 items-baseline gap-2"
    >
      <span className="font-display text-[1.8rem] font-semibold leading-none tracking-[-0.045em] text-foreground sm:text-[2.15rem]">
        Substrate
      </span>
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

  return (
    <>
      <header className="sticky top-0 z-40 border-t-4 border-brand bg-background/95 backdrop-blur-xl">
        <div className="border-b border-border">
          <div className="wrap flex items-center gap-5 py-4 sm:py-5">
            <div className="min-w-0">
              <Wordmark />
              <p className="mt-1 hidden text-[0.67rem] font-semibold uppercase tracking-[0.13em] text-muted-foreground sm:block">
                Practical technology analysis for people who run IT
              </p>
            </div>

            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground"
              >
                <Search className="size-4" aria-hidden="true" />
                <span className="hidden sm:inline">Search</span>
                <span className="sr-only sm:hidden">Search articles</span>
                <kbd className="hidden font-mono text-[0.65rem] text-muted-foreground lg:inline">
                  Ctrl K
                </kbd>
              </button>

              <ThemeToggle />

              <button
                type="button"
                aria-expanded={menu}
                aria-controls="mobile-nav"
                onClick={() => setMenu((value) => !value)}
                className="rounded-md border border-border bg-surface p-2 text-muted-foreground transition-colors hover:border-brand/40 hover:text-foreground lg:hidden"
              >
                <span className="sr-only">{menu ? "Close menu" : "Open menu"}</span>
                {menu ? (
                  <X className="size-4" aria-hidden="true" />
                ) : (
                  <Menu className="size-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        <nav
          aria-label="Primary"
          className="hidden border-b border-border bg-surface lg:block"
        >
          <div className="wrap">
            <ul className="flex items-center gap-7 overflow-x-auto">
              <li>
                <Link
                  to="/"
                  className="block border-b-2 border-transparent py-3 text-[0.7rem] font-bold uppercase tracking-[0.09em] text-muted-foreground transition-colors hover:text-brand"
                  activeProps={{
                    className:
                      "block border-b-2 border-brand py-3 text-[0.7rem] font-bold uppercase tracking-[0.09em] text-brand",
                  }}
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
                    className="block whitespace-nowrap border-b-2 border-transparent py-3 text-[0.7rem] font-bold uppercase tracking-[0.09em] text-muted-foreground transition-colors hover:text-brand"
                    activeProps={{
                      className:
                        "block whitespace-nowrap border-b-2 border-brand py-3 text-[0.7rem] font-bold uppercase tracking-[0.09em] text-brand",
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {menu && (
          <div
            id="mobile-nav"
            className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-border bg-background lg:hidden"
          >
            <nav aria-label="All sections" className="wrap py-6">
              <Link
                to="/"
                onClick={() => setMenu(false)}
                className="mb-6 block border-b border-border pb-3 text-sm font-semibold text-brand"
              >
                Latest articles
              </Link>

              <div className="space-y-7">
                {footerColumns.map((column) => (
                  <section key={column.heading}>
                    <h2 className="eyebrow mb-3 text-muted-foreground">
                      {column.heading}
                    </h2>

                    <ul className="grid grid-cols-2 gap-x-5">
                      {column.slugs.map((slug) => {
                        const category = getCategory(slug);
                        if (!category) return null;

                        return (
                          <li key={slug} className="border-b border-border">
                            <Link
                              to="/$category"
                              params={{ category: slug }}
                              onClick={() => setMenu(false)}
                              className="block py-2.5 text-sm text-foreground/80 hover:text-brand"
                            >
                              {category.label}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-5 text-sm text-muted-foreground">
                <Link to="/about" onClick={() => setMenu(false)} className="hover:text-brand">
                  About
                </Link>
                <Link
                  to="/resources"
                  onClick={() => setMenu(false)}
                  className="hover:text-brand"
                >
                  Resources
                </Link>
                <Link
                  to="/newsletter"
                  onClick={() => setMenu(false)}
                  className="hover:text-brand"
                >
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
