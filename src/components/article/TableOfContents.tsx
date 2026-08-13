import { useEffect, useState } from "react";

import type { TocItem } from "@/lib/content";

export function TableOfContents({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-96px 0px -70% 0px", threshold: 0 },
    );

    headings.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="Table of contents">
      <h2 className="eyebrow mb-4 border-b border-border pb-2 text-muted-foreground">Contents</h2>
      <ol className="space-y-2.5 text-sm">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "true" : undefined}
              className={
                active === item.id
                  ? "font-medium text-accent"
                  : "text-muted-foreground hover:text-foreground"
              }
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
