import { Link } from "@tanstack/react-router";

import { footerColumns } from "@/content/categories";
import { getCategory } from "@/lib/content";
import { site } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 lg:col-span-2">
            <Link to="/" className="font-serif text-lg font-bold tracking-tight">
              {site.name}
              <span className="text-accent">.</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              {site.description}
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <li>
                <Link to="/about" className="hover:text-accent">
                  About
                </Link>
              </li>
              <li>
                <Link to="/resources" className="hover:text-accent">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/newsletter" className="hover:text-accent">
                  Newsletter
                </Link>
              </li>
              <li>
                <a href="/rss.xml" className="hover:text-accent">
                  RSS
                </a>
              </li>
            </ul>
          </div>

          {footerColumns.map((column) => (
            <nav key={column.heading} aria-label={column.heading}>
              <h2 className="eyebrow mb-4 text-muted-foreground">{column.heading}</h2>
              <ul className="space-y-2.5">
                {column.slugs.map((slug) => {
                  const category = getCategory(slug);
                  if (!category) return null;
                  return (
                    <li key={slug}>
                      <Link
                        to="/$category"
                        params={{ category: slug }}
                        className="text-sm text-muted-foreground hover:text-accent"
                      >
                        {category.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} {site.name}. {site.domain}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <li>
              <Link to="/privacy" className="hover:text-accent">
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-accent">
                Terms
              </Link>
            </li>
            <li>
              <Link to="/disclaimer" className="hover:text-accent">
                Disclaimer
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
