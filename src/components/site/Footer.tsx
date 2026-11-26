import { Link } from "@tanstack/react-router";

import { primaryNav } from "@/content/categories";
import { site } from "@/lib/site";

const footLink = "text-[0.9375rem] text-ink-soft transition-colors hover:text-foreground";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t-[3px] border-foreground">
      <div className="wrap py-10">
        <div className="grid gap-x-12 gap-y-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link to="/" className="t-masthead inline-block text-foreground">
              {site.name}
            </Link>
            <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-muted-foreground">
              {site.description}
            </p>
          </div>

          <nav aria-label="Topics" className="lg:col-span-4">
            <h2 className="eyebrow mb-3 text-muted-foreground">Topics</h2>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {primaryNav.map((item) => (
                <li key={item.slug}>
                  <Link to="/$category" params={{ category: item.slug }} className={footLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Publication" className="lg:col-span-3">
            <h2 className="eyebrow mb-3 text-muted-foreground">Publication</h2>
            <ul className="space-y-1.5">
              <li>
                <Link to="/about" className={footLink}>
                  About
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
                <a href="/rss.xml" className={footLink}>
                  RSS
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.8125rem] text-muted-foreground">
            &copy; {year} {site.name}. {site.domain}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[0.8125rem] text-muted-foreground">
            <li>
              <Link to="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-foreground">
                Terms
              </Link>
            </li>
            <li>
              <Link to="/disclaimer" className="hover:text-foreground">
                Disclaimer
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
