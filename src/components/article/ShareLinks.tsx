import { Linkedin } from "lucide-react";

const shareLink =
  "inline-flex min-h-9 min-w-7 items-center justify-center gap-1.5 rounded-md px-2 text-[0.8125rem] font-medium text-ink-soft transition-colors hover:bg-surface-2 hover:text-foreground sm:min-h-8";

export function ShareLinks({ url, title }: { url: string; title: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="mr-1 text-[0.8125rem] text-muted-foreground">Share</span>
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
        <Linkedin className="size-3.5" aria-hidden="true" />
        <span>LinkedIn</span>
      </a>
    </div>
  );
}
