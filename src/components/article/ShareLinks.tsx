import { Linkedin } from "lucide-react";

/**
 * Share controls.
 *
 * Outbound share links only. There is deliberately no copy-to-clipboard
 * control here: site policy is that the application never writes to the
 * clipboard, so the reader's own selection and copy remain the only path.
 * The canonical URL is in the address bar and in the page's link rel, which
 * is where a reader — or a browser's own share affordance — will look for it.
 */
export function ShareLinks({ url, title }: { url: string; title: string }) {
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
    </div>
  );
}
