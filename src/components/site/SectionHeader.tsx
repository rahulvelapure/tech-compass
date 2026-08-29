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
    <div className="mb-8 flex items-end justify-between gap-6 border-b hairline pb-3">
      <div>
        <h2 className="t-section">{title}</h2>
        {children && <p className="t-caption mt-2 max-w-2xl leading-relaxed">{children}</p>}
      </div>
      {href && (
        <Link
          to="/$category"
          params={{ category: href }}
          className="eyebrow shrink-0 text-ink-faint transition-colors hover:text-brand"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}
