import { Link } from "@tanstack/react-router";

import { footerColumns, getCategory } from "@/content/categories";
import { articlesForCategory } from "@/lib/content";
import { site } from "@/lib/site";

const footLink =
  "inline-flex min-h-6 min-w-6 items-center text-[0.875rem] text-ink-soft transition-colors hover:text-foreground";

export function Footer() {
  const year = new Date().getFullYear();

  /*
   * Only link to categories that currently carry published work. Empty sections
   * are marked noindex and are excluded from the sitemap for the same reason.
   */
  const populatedColumns = footerColumns
    .map((col) => ({
      heading: col.heading,
      items: col.slugs
        .map((slug) => getCategory(slug))
        .filter(
          (category): category is NonNullable<typeof category> =>
            category !== undefined && articlesForCategory(category).length > 0,
        ),
    }))
    .filter((col) => col.items.length > 0);

  return (
    <footer className="mt-20 border-t border-hairline bg-background">
      <div className="wrap py-12 lg:py-16">
        <div className="grid gap-x-10 gap-y-10 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Link
              to="/"
              className="t-masthead inline-flex min-h-7 items-center text-foreground transition-opacity hover:opacity-80"
            >
              {site.name}
            </Link>
            <p className="mt-3 max-w-xs text-[0.875rem] leading-relaxed text-muted-foreground">
              {site.description}
            </p>
          </div>

          <div className="grid gap-x-8 gap-y-8 sm:grid-cols-3 lg:col-span-6">
            {populatedColumns.map((col) => (
              <nav key={col.heading} aria-label={col.heading}>
                <h2 className="kicker mb-3">{col.heading}</h2>
                <ul className="space-y-1.5">
                  {col.items.map((category) => (
                    <li key={category.slug}>
                      <Link
                        to="/$category"
                        params={{ category: category.slug }}
                        className={footLink}
                      >
                        {category.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <nav aria-label="Publication" className="lg:col-span-2">
            <h2 className="kicker mb-3">Publication</h2>
            <ul className="space-y-1.5">
              <li>
                <Link to="/about" className={footLink}>
                  About &amp; methodology
                </Link>
              </li>
              <li>
                <Link to="/resources" className={footLink}>
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/newsletter" className={footLink}>
                  Newsletter
                </Link>
              </li>
              <li>
                <Link to="/search" className={footLink}>
                  Search archive
                </Link>
              </li>
              <li>
                <a href="/rss.xml" className={footLink}>
                  RSS feed
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-hairline pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.8125rem] text-muted-foreground">
            &copy; {year} {site.name} &middot; {site.domain}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.8125rem] text-muted-foreground">
            <li>
              <Link
                to="/privacy"
                className="inline-flex min-h-6 items-center transition-colors hover:text-foreground"
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="inline-flex min-h-6 items-center transition-colors hover:text-foreground"
              >
                Terms
              </Link>
            </li>
            <li>
              <Link
                to="/disclaimer"
                className="inline-flex min-h-6 items-center transition-colors hover:text-foreground"
              >
                Disclaimer
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
