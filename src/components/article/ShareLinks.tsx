import { Link2, Linkedin } from "lucide-react";
import { useState } from "react";

export function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <span className="eyebrow text-muted-foreground">Share</span>
      <a
        href={`https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-muted-foreground transition-colors hover:text-brand"
      >
        X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className="text-muted-foreground transition-colors hover:text-brand"
      >
        <Linkedin className="h-4 w-4" aria-hidden="true" />
      </a>
      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        }}
        className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-brand"
      >
        <Link2 className="h-4 w-4" aria-hidden="true" />
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
