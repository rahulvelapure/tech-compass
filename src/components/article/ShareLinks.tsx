import { Linkedin } from "lucide-react";

const shareLink =
  "inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] text-ink-soft transition-colors hover:text-foreground sm:min-h-0";

export function ShareLinks({ url, title }: { url: string; title: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="eyebrow text-muted-foreground">Share</span>
      <a
        href={`https://x.com/intent/post?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className={shareLink}
      >
        X
      </a>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on LinkedIn"
        className={shareLink}
      >
        <Linkedin className="h-4 w-4" aria-hidden="true" />
        <span>LinkedIn</span>
      </a>
    </div>
  );
}
