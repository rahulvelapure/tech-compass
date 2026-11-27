import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";

import { site } from "@/lib/site";
import { HONEYPOT_FIELD } from "@/lib/newsletter.spam";
import { issueNewsletterToken, subscribeToNewsletter } from "@/lib/newsletter.functions";

export function NewsletterCTA({ variant = "panel" }: { variant?: "panel" | "inline" }) {
  const subscribe = useServerFn(subscribeToNewsletter);
  const getToken = useServerFn(issueNewsletterToken);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error" | "unavailable">(
    "idle",
  );
  const [message, setMessage] = useState("");

  const token = useRef<string | null>(null);
  const tokenRequest = useRef<Promise<void> | null>(null);
  const honeypot = useRef<HTMLInputElement>(null);

  const inline = variant === "inline";
  const fieldId = `newsletter-${variant}`;

  function primeToken() {
    if (token.current || tokenRequest.current) return;
    tokenRequest.current = getToken()
      .then((result) => {
        token.current = result.token;
        if (!result.configured) setStatus("unavailable");
      })
      .catch(() => {
        // Optional pre-flight; submit handles any failure gracefully.
      });
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;
    setStatus("loading");
    setMessage("");

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
      className={
        inline
          ? "rounded-lg border border-hairline bg-surface-2/45 p-6 sm:p-8"
          : "border-t border-hairline bg-surface-2/35"
      }
    >
      <div className={inline ? "" : "wrap grid gap-x-12 gap-y-6 py-12 lg:grid-cols-12 lg:py-14"}>
        <div className={inline ? "" : "lg:col-span-5"}>
          <h2 className="kicker">Newsletter</h2>
          <p className="display-2 mt-2">{site.newsletter.pitch}</p>
          <p
            className={`mt-2.5 text-[0.9375rem] leading-relaxed text-ink-soft ${inline ? "max-w-xl" : ""}`}
          >
            {site.newsletter.detail}
          </p>
        </div>

        <div
          className={
            inline
              ? "mt-6"
              : "lg:col-span-7 lg:flex lg:flex-col lg:justify-center lg:border-l lg:border-hairline lg:pl-10"
          }
        >
          {status === "done" || status === "unavailable" ? (
            <p className="text-[0.9375rem] font-medium text-foreground" role="status">
              {status === "done"
                ? message
                : "Subscriptions are unavailable at the moment. Please check back soon."}
            </p>
          ) : (
            <form
              onSubmit={onSubmit}
              onFocusCapture={primeToken}
              className="relative flex flex-col gap-2.5 sm:flex-row sm:max-w-md"
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
                className="h-11 w-full rounded-md border border-input bg-surface px-3.5 text-[0.9375rem] text-foreground placeholder:text-ink-faint focus:border-brand focus:outline-none sm:flex-1"
              />

              {/* Honeypot field: hidden from sight, keyboard, and assistive tech */}
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
                className="h-11 shrink-0 cursor-pointer rounded-md bg-foreground px-5 text-[0.875rem] font-semibold text-background transition-colors hover:bg-brand hover:text-brand-foreground disabled:opacity-60"
              >
                {status === "loading" ? "Sending…" : "Subscribe"}
              </button>
            </form>
          )}

          <p
            id={`${fieldId}-status`}
            role="status"
            aria-live="polite"
            className={status === "error" ? "mt-2.5 text-[0.875rem] text-destructive" : "sr-only"}
          >
            {status === "error" ? message : ""}
          </p>

          {status !== "done" && status !== "unavailable" && (
            <p
              id={`${fieldId}-consent`}
              className={`mt-3 text-[0.8125rem] leading-relaxed text-muted-foreground ${inline ? "max-w-xl" : "max-w-lg"}`}
            >
              Confirmed opt-in: we send one verification email before adding your address.
              Unsubscribe in one click from any issue. Read the{" "}
              <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground">
                privacy policy
              </Link>
              . No tracking pixels or sponsored sends.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
