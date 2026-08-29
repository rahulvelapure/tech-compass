import { Link } from "@tanstack/react-router";

export interface Crumb {
  name: string;
  /** Category slug, or undefined for the current page. */
  categorySlug?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <li>
          <Link to="/" className="hover:text-brand">
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={item.name} className="flex items-center gap-2">
            <span aria-hidden="true" className="text-border">
              /
            </span>
            {item.categorySlug ? (
              <Link
                to="/$category"
                params={{ category: item.categorySlug }}
                className="hover:text-brand"
              >
                {item.name}
              </Link>
            ) : (
              <span
                className="text-foreground"
                aria-current={i === items.length - 1 ? "page" : undefined}
              >
                {item.name}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
