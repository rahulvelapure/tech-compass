import { useEffect, useRef } from "react";

import { flags } from "@/lib/site";

type Placement =
  "header" | "in-article" | "sidebar" | "after-article" | "in-feed" | "before-related";

const ADSENSE_CLIENT = "ca-pub-3680769252416096";

const AD_SLOTS: Partial<Record<Placement, string>> = {
  "in-article": "1654553828",
  "after-article": "7537435890",
  "in-feed": "5019083762",
};

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

function AdSlot({ placement, label }: { placement: Placement; label?: string }) {
  const initialized = useRef(false);
  const slot = AD_SLOTS[placement];

  useEffect(() => {
    if (!flags.adsEnabled || !slot || initialized.current) {
      return;
    }

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      initialized.current = true;
    } catch (error) {
      console.warn(`AdSense failed to initialize ${placement} slot`, error);
    }
  }, [placement, slot]);

  if (!flags.adsEnabled || !slot) {
    return null;
  }

  return (
    <aside
      data-ad-placement={placement}
      aria-label={label ?? "Advertisement"}
      className="my-10 w-full overflow-hidden border-y border-hairline bg-surface-2/35 px-3 py-4"
    >
      <p className="ad-label mb-2.5 text-center">Advertisement</p>
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
        }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
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
