import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function SectionHeader({
  title,
  href,
  linkLabel = "All articles",
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6 border-b border-hairline pb-3">
      <div>
        <h2 className="kicker">{title}</h2>
        {children && <p className="t-caption mt-2 max-w-2xl leading-relaxed">{children}</p>}
      </div>
      {href && (
        <Link
          to="/$category"
          params={{ category: href }}
          className="shrink-0 text-[0.9375rem] font-medium text-link hover:underline"
        >
          {linkLabel} &rarr;
        </Link>
      )}
    </div>
  );
}
