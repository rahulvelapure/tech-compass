import { flags } from "@/lib/site";

type Placement =
  "header" | "in-article" | "sidebar" | "after-article" | "in-feed" | "before-related";

/**
 * Monetization positions.
 *
 * When `flags.adsEnabled` is false these render nothing at all — no wrapper,
 * no reserved height, no placeholder. The layout is complete without them.
 */
function AdSlot({ placement, label }: { placement: Placement; label?: string }) {
  if (!flags.adsEnabled) return null;

  return (
    <aside
      data-ad-placement={placement}
      aria-label={label ?? "Advertisement"}
      className="my-8 flex min-h-24 items-center justify-center border border-border bg-surface"
    >
      {/* Ad markup is injected here once a provider is configured. */}
      <span className="eyebrow text-muted-foreground">Advertisement</span>
    </aside>
  );
}

export function HeaderAdSlot() {
  return <AdSlot placement="header" />;
}

export function ArticleAdSlot() {
  return <AdSlot placement="in-article" />;
}

export function SidebarAdSlot() {
  return <AdSlot placement="sidebar" />;
}

export function AfterArticleAdSlot() {
  return <AdSlot placement="after-article" />;
}

export function InFeedAdSlot() {
  return <AdSlot placement="in-feed" />;
}

export function BeforeRelatedAdSlot() {
  return <AdSlot placement="before-related" />;
}
