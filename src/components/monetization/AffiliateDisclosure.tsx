import { flags } from "@/lib/site";

/**
 * Rendered only when affiliate links are enabled via feature flag.
 */
export function AffiliateDisclosure({ className = "" }: { className?: string }) {
  if (!flags.affiliateEnabled) return null;

  return (
    <p
      className={`rounded-r-md border-l-2 border-border bg-surface-2/40 px-4 py-3 text-[0.8125rem] leading-relaxed text-muted-foreground ${className}`}
    >
      Some links on this page are affiliate links. If you buy through them the publication may earn
      a commission. This does not affect which products are recommended or how they are assessed.
    </p>
  );
}
