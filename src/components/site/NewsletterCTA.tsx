import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { site } from "@/lib/site";
import { HONEYPOT_FIELD } from "@/lib/newsletter.spam";
import { issueNewsletterToken, subscribeToNewsletter } from "@/lib/newsletter.functions";

/**
 * Newsletter capture with confirmed opt-in.
 *
 * Subscribing is deliberately two steps: this form only asks the provider to
 * send a confirmation email, and the address joins the list when the reader
 * clicks the link in it. The copy says so, because a form that claims "you are
 * subscribed" while an unopened confirmation sits in an inbox is the main way
 * double opt-in lists quietly lose people.
 *
 * A signed token is fetched on first interaction rather than on page load, so
 * readers who never engage cost nothing.
 */
export function NewsletterCTA({ variant = "panel" }: { variant?: "panel" | "inline" }) {
  const subscribe = useServerFn(subscribeToNewsletter);
  const getToken = useServerFn(issueNewsletterToken);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error" | "unavailable">(
    "idle",
  );
  const [message, setMessage] = useState("");

  /** Kept in a ref: the token is never rendered and must not trigger a redraw. */
  const token = useRef<string | null>(null);
  const tokenRequest = useRef<Promise<void> | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  const inline = variant === "inline";
  const fieldId = `newsletter-${variant}`;

  /** Idempotent: several focus/change events must not mint several tokens. */
  function primeToken() {
    if (token.current || tokenRequest.current) return;
    tokenRequest.current = getToken()
      .then((result) => {
        token.current = result.token;
        // The provider is not configured, so no confirmation email can be sent.
        // Withdraw the form on first interaction rather than collect an address
        // and fail after the reader has typed it — and say nothing about why,
        // since the cause is a deployment detail.
        if (!result.configured) setStatus("unavailable");
      })
      .catch(() => {
        // Leave the token null; the server decides how to treat its absence.
      });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");

    // A submission can land before the token request settles — wait for it.
    if (tokenRequest.current) await tokenRequest.current;

    try {
      const result = await subscribe({
        data: {
          email,
          source: variant,
          token: token.current ?? undefined,
          [HONEYPOT_FIELD]: honeypot.current?.value ?? "",
        },
      });

      if (result.ok) {
        setStatus("done");
        setMessage(
          result.state === "already-confirmed"
            ? "You are already on the list — nothing further to do."
            : "Almost there. Check your inbox and click the confirmation link to finish subscribing.",
        );
        setEmail("");
      } else {
        setStatus("error");
        setMessage(result.message);
        // The old token is spent or rejected; the next attempt needs a new one.
        token.current = null;
        tokenRequest.current = null;
      }
    } catch {
      setStatus("error");
      setMessage("Enter a valid email address and try again.");
    }
  }

  return (
    <section
      aria-label="Newsletter"
      className={inline ? "border-y border-border py-8" : "border-t-2 border-foreground bg-surface"}
    >
      <div
        className={
          inline
            ? ""
            : "mx-auto grid max-w-[78rem] gap-x-12 gap-y-6 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:px-8"
        }
      >
        <div className={inline ? "" : "lg:col-span-5"}>
          <h2 className="kicker">The newsletter</h2>
          <p className="display-2 mt-3">{site.newsletter.pitch}</p>
          <p
            className={`mt-3 text-sm leading-relaxed text-muted-foreground ${inline ? "max-w-xl" : ""}`}
          >
            {site.newsletter.detail}
          </p>
        </div>
        <div className={inline ? "" : "lg:col-span-7 lg:border-l lg:border-border lg:pl-12"}>
          {status === "done" || status === "unavailable" ? (
            <p className="mt-6 text-sm font-medium text-foreground" role="status">
              {status === "done"
                ? message
                : "Subscriptions are unavailable at the moment. Please check back soon."}
            </p>
          ) : (
            <form
              onSubmit={onSubmit}
              onFocusCapture={primeToken}
              className="mt-6 flex flex-col gap-3 sm:flex-row"
            >
              <label htmlFor={fieldId} className="sr-only">
                Email address
              </label>
              <input
                id={fieldId}
                type="email"
                name="email"
                autoComplete="email"
                required
                maxLength={254}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                aria-describedby={`${fieldId}-status ${fieldId}-consent`}
                className="h-11 w-full border border-border bg-background px-4 text-sm placeholder:text-muted-foreground focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:w-72"
              />

              {/*
              Honeypot. Hidden from sight, from the tab order and from the
              accessibility tree, so no real reader can reach it — but it is a
              normal text input in the DOM, which is what form-filling bots see.
              Not `display:none`: some bots skip those.
            */}
              <div
                aria-hidden="true"
                className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"
              >
                <label htmlFor={`${fieldId}-${HONEYPOT_FIELD}`}>
                  Company (leave this field empty)
                </label>
                <input
                  ref={honeypot}
                  id={`${fieldId}-${HONEYPOT_FIELD}`}
                  type="text"
                  name={HONEYPOT_FIELD}
                  tabIndex={-1}
                  autoComplete="off"
                  defaultValue=""
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="h-11 shrink-0 bg-brand px-7 text-sm font-semibold tracking-wide text-brand-foreground transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-60"
              >
                {status === "loading" ? "Sending…" : "Subscribe"}
              </button>
            </form>
          )}

          <p
            id={`${fieldId}-status`}
            role="status"
            aria-live="polite"
            className={`mt-3 text-sm ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}
          >
            {status === "error" ? message : ""}
          </p>

          {status !== "done" && status !== "unavailable" && (
            <p
              id={`${fieldId}-consent`}
              className={`mt-4 text-xs leading-relaxed text-muted-foreground ${inline ? "max-w-xl" : ""}`}
            >
              We send a confirmation email first — you are only added to the list once you click the
              link in it. Unsubscribe from any email. See the{" "}
              <Link to="/privacy" className="underline hover:text-brand">
                privacy policy
              </Link>
              .
            </p>
          )}

          <p className="eyebrow mt-4 text-muted-foreground">
            No tracking pixels. No sponsored sends.
          </p>
        </div>
      </div>
    </section>
  );
}
