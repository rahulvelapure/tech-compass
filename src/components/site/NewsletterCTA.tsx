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
        // The token is optional here; a failed request surfaces on submit.
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
      className={inline ? "border-y border-border py-8" : "border-t-2 border-foreground"}
    >
      <div className={inline ? "" : "wrap grid gap-x-12 gap-y-6 py-10 lg:grid-cols-12"}>
        <div className={inline ? "" : "lg:col-span-5"}>
          <h2 className="kicker">The newsletter</h2>
          <p className="display-3 mt-3">{site.newsletter.pitch}</p>
          <p
            className={`mt-2 text-[0.9375rem] leading-relaxed text-muted-foreground ${inline ? "max-w-xl" : ""}`}
          >
            {site.newsletter.detail}
          </p>
        </div>

        <div className={inline ? "mt-5" : "lg:col-span-7 lg:border-l lg:border-border lg:pl-10"}>
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
              className="relative flex flex-col gap-3 sm:flex-row"
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
                className="h-11 w-full border border-input bg-background px-3 text-[0.9375rem] placeholder:text-muted-foreground sm:w-72"
              />

              {/*
                Honeypot. Hidden from sight, from the tab order and from the
                accessibility tree, so no real reader can reach it, but it is a
                normal text input in the DOM, which is what form-filling bots
                see. Not display:none, because some bots skip those.
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
                className="h-11 shrink-0 bg-foreground px-6 text-[0.9375rem] font-semibold text-background transition-colors hover:bg-brand hover:text-brand-foreground disabled:opacity-60"
              >
                {status === "loading" ? "Sending…" : "Subscribe"}
              </button>
            </form>
          )}

          <p
            id={`${fieldId}-status`}
            role="status"
            aria-live="polite"
            className={`mt-3 text-[0.9375rem] ${status === "error" ? "text-destructive" : "text-muted-foreground"}`}
          >
            {status === "error" ? message : ""}
          </p>

          {status !== "done" && status !== "unavailable" && (
            <p
              id={`${fieldId}-consent`}
              className={`mt-3 text-[0.8125rem] leading-relaxed text-muted-foreground ${inline ? "max-w-xl" : ""}`}
            >
              We send a confirmation email first — you are only added to the list once you click the
              link in it. Unsubscribe from any email. See the{" "}
              <Link to="/privacy" className="underline hover:text-foreground">
                privacy policy
              </Link>
              . No tracking pixels. No sponsored sends.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
