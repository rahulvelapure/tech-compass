import { flags } from "@/lib/site";

/**
 * Shown only when affiliate links are actually in use on the page.
 */
export function AffiliateDisclosure({ className = "" }: { className?: string }) {
  if (!flags.affiliateEnabled) return null;

  return (
    <p className={`border-l-2 border-border pl-4 text-sm text-muted-foreground ${className}`}>
      Some links on this page are affiliate links. If you buy through them the publication may earn
      a commission. This does not affect which products are recommended or how they are assessed.
    </p>
  );
}
