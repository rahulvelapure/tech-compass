import { Link } from "@tanstack/react-router";

export interface Crumb {
  name: string;
  categorySlug?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-muted-foreground">
        <li>
          <Link
            to="/"
            className="inline-flex min-h-6 items-center transition-colors hover:text-foreground hover:underline"
          >
            Home
          </Link>
        </li>
        {items.map((item, i) => (
          <li key={item.name} className="flex min-w-0 items-center gap-2">
            <span aria-hidden="true" className="text-ink-faint/60">
              /
            </span>
            {item.categorySlug ? (
              <Link
                to="/$category"
                params={{ category: item.categorySlug }}
                className="inline-flex min-h-6 items-center transition-colors hover:text-foreground hover:underline"
              >
                {item.name}
              </Link>
            ) : (
              <span
                className="truncate text-ink-soft"
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
