import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function SectionHeader({
  title,
  href,
  linkLabel = "All articles",
  children,
}: {
  title: string;
  /** Category slug to link to. */
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 border-b border-border pb-4">
      <div>
        <h2 className="font-serif text-2xl font-bold tracking-tight">{title}</h2>
        {children && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{children}</p>
        )}
      </div>
      {href && (
        <Link
          to="/$category"
          params={{ category: href }}
          className="shrink-0 text-sm font-medium text-brand hover:underline"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
