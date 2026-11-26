import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import { primaryNav } from "@/content/categories";
import { site } from "@/lib/site";
import { CommandPalette } from "./CommandPalette";
import { ThemeToggle } from "./ThemeToggle";

const navLink =
  "block whitespace-nowrap border-b-2 border-transparent py-3 text-[0.9375rem] font-medium text-ink-soft transition-colors hover:text-foreground";
const navLinkActive =
  "block whitespace-nowrap border-b-2 border-brand py-3 text-[0.9375rem] font-medium text-foreground";
const textControl =
  "inline-flex min-h-11 items-center gap-2 px-2 text-[0.9375rem] font-medium text-ink-soft transition-colors hover:text-foreground sm:min-h-0 sm:py-2";

function Wordmark() {
  return (
    <Link
      to="/"
      aria-label={`${site.name} homepage`}
      className="t-masthead inline-block text-foreground"
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
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  return (
    <>
      <header className="border-t-[3px] border-foreground">
        <div className="border-b border-border lg:border-b-0">
          <div className="wrap flex items-end justify-between gap-4 py-4 sm:py-5">
            <div className="min-w-0">
              <Wordmark />
              <p className="eyebrow mt-1.5 hidden text-muted-foreground sm:block">{site.tagline}</p>
            </div>

            <div className="flex items-center gap-1 sm:gap-3">
              <button type="button" onClick={() => setOpen(true)} className={textControl}>
                <span>Search</span>
                <kbd className="hidden font-mono text-[0.75rem] text-muted-foreground lg:inline">
                  Ctrl K
                </kbd>
              </button>

              <ThemeToggle />

              <button
                type="button"
                aria-expanded={menu}
                aria-controls="mobile-nav"
                onClick={() => setMenu((value) => !value)}
                className={`${textControl} lg:hidden`}
              >
                {menu ? "Close" : "Menu"}
              </button>
            </div>
          </div>
        </div>

        <nav aria-label="Primary" className="hidden border-y border-border lg:block">
          <div className="wrap">
            <ul className="flex items-center gap-8 overflow-x-auto">
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

        {menu && (
          <div
            id="mobile-nav"
            className="max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-border bg-background lg:hidden"
          >
            <nav aria-label="Sections" className="wrap py-2">
              <ul>
                <li className="border-b border-border">
                  <Link
                    to="/"
                    onClick={() => setMenu(false)}
                    className="flex min-h-11 items-center font-display text-lg text-foreground"
                  >
                    Latest
                  </Link>
                </li>
                {primaryNav.map((item) => (
                  <li key={item.slug} className="border-b border-border">
                    <Link
                      to="/$category"
                      params={{ category: item.slug }}
                      onClick={() => setMenu(false)}
                      className="flex min-h-11 items-center font-display text-lg text-foreground"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="flex flex-wrap gap-x-6 py-3 text-[0.9375rem] text-ink-soft">
                <li>
                  <Link
                    to="/about"
                    onClick={() => setMenu(false)}
                    className="inline-flex min-h-11 items-center hover:text-foreground"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/resources"
                    onClick={() => setMenu(false)}
                    className="inline-flex min-h-11 items-center hover:text-foreground"
                  >
                    Resources
                  </Link>
                </li>
                <li>
                  <Link
                    to="/newsletter"
                    onClick={() => setMenu(false)}
                    className="inline-flex min-h-11 items-center hover:text-foreground"
                  >
                    Newsletter
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      <CommandPalette open={open} onClose={() => setOpen(false)} />
    </>
  );
}
