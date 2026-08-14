import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

import { logProviderAttempt, logSubscribeOutcome } from "./newsletter.log";
import { DEFAULT_RETRY_CONFIG, categorizeProviderOutcome, sendWithRetry } from "./newsletter.retry";
import { site } from "./site";
import {
  HONEYPOT_FIELD,
  emailDomain,
  hasDeliverableShape,
  ipKey,
  isDisposableDomain,
  issueFormToken,
  normaliseEmail,
  verifyFormToken,
  withinRateLimit,
} from "./newsletter.spam";

/**
 * Newsletter subscription.
 *
 * Confirmed opt-in only: the form never adds anyone to the list. It asks Brevo
 * to send a confirmation email, and the subscriber is added when they click
 * the link in it. That is what keeps the list deliverable (no typo-ed or
 * malicious addresses accumulating hard bounces) and what gives us a
 * timestamped consent record for GDPR and the DPDP Act.
 *
 * No subscriber data is stored in this application.
 */

const BREVO_GATEWAY = "https://connector-gateway.lovable.dev/brevo";

/**
 * Secret used to sign form tokens and to derive rate-limit keys.
 *
 * A dedicated secret is preferred, but falling back to the Brevo key means the
 * protection is never silently off just because one variable was missed. If
 * neither exists the newsletter is unconfigured anyway.
 */
function formSecret(): string | null {
  return process.env["NEWSLETTER_FORM_SECRET"] || process.env["BREVO_API_KEY"] || null;
}

function confirmationRedirectUrl(): string {
  const base = process.env["PUBLIC_SITE_URL"] || site.url;
  return `${base.replace(/\/$/, "")}/newsletter/confirmed`;
}

/* ------------------------------------------------------------------ */
/* Configuration                                                       */
/* ------------------------------------------------------------------ */

interface NewsletterConfig {
  secret: string;
  brevoKey: string;
  lovableKey: string;
  templateId: number;
  listId: number;
}

/**
 * The single definition of "configured".
 *
 * Both the token endpoint and the subscribe handler read this, so the form can
 * never offer to take an address the handler is going to reject. Splitting the
 * checks across the two was the original defect: the form had no idea the
 * backend was unusable until a reader had already typed their address in.
 *
 * Returns the missing variable's name rather than a bare boolean so the server
 * log stays diagnosable. That name is never sent to the browser.
 */
function newsletterConfig():
  { ok: true; config: NewsletterConfig } | { ok: false; missing: string } {
  const secret = formSecret();
  const brevoKey = process.env["BREVO_API_KEY"];
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const templateId = Number(process.env["BREVO_DOI_TEMPLATE_ID"] ?? "");
  const listId = Number(process.env["BREVO_LIST_ID"] ?? "");

  if (!secret || !brevoKey || !lovableKey) return { ok: false, missing: "credentials" };
  // Confirmed opt-in cannot be faked: without a template and a list there is no
  // confirmation email to send, and adding the contact directly would be
  // exactly the single opt-in behaviour we are avoiding.
  if (!Number.isInteger(templateId) || templateId <= 0) {
    return { ok: false, missing: "BREVO_DOI_TEMPLATE_ID" };
  }
  if (!Number.isInteger(listId) || listId <= 0) {
    return { ok: false, missing: "BREVO_LIST_ID" };
  }

  return { ok: true, config: { secret, brevoKey, lovableKey, templateId, listId } };
}

/* ------------------------------------------------------------------ */
/* Token issuance                                                      */
/* ------------------------------------------------------------------ */

/**
 * Minted when a visitor first engages with the form rather than on page load,
 * so the common case — a reader who never subscribes — costs no extra request
 * and the token's clock starts at genuine intent.
 *
 * Also reports whether subscribing is possible at all, which is what lets the
 * form withdraw itself on first interaction instead of accepting an address it
 * cannot do anything with. `configured` is a plain boolean: which variable is
 * missing is a deployment detail and stays in the server log.
 */
export const issueNewsletterToken = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ token: string | null; configured: boolean }> => {
    const result = newsletterConfig();
    if (!result.ok) {
      logSubscribeOutcome("unconfigured", { missingConfig: result.missing });
      return { token: null, configured: false };
    }
    return { token: await issueFormToken(result.config.secret), configured: true };
  },
);

/* ------------------------------------------------------------------ */
/* Subscription                                                        */
/* ------------------------------------------------------------------ */

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(5, { message: "Enter a valid email address." })
    .max(254, { message: "That email address is too long." })
    .email({ message: "Enter a valid email address." }),
  source: z.string().trim().max(64).optional(),
  /** Signed form token. Absent only when the form could not obtain one. */
  token: z.string().max(256).optional(),
  /** Honeypot. Anything here means the submission is automated. */
  [HONEYPOT_FIELD]: z.string().max(256).optional(),
});

export type SubscribeResult =
  | {
      ok: true;
      /**
       * `confirmation-sent` — an email is on its way and nothing is on the
       * list yet. `already-confirmed` — the address had already completed
       * confirmation, so no second email was sent.
       */
      state: "confirmation-sent" | "already-confirmed";
    }
  | { ok: false; message: string };

/** Bots get the same response a real subscriber does, so failure teaches nothing. */
const SILENT_SUCCESS: SubscribeResult = { ok: true, state: "confirmation-sent" };

export const subscribeToNewsletter = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }): Promise<SubscribeResult> => {
    if (data[HONEYPOT_FIELD]) {
      logSubscribeOutcome("rejected-bot-honeypot");
      return SILENT_SUCCESS;
    }

    const configResult = newsletterConfig();
    if (!configResult.ok) return unconfigured(configResult.missing);
    const { secret, brevoKey, lovableKey, templateId, listId } = configResult.config;

    const verdict = data.token
      ? await verifyFormToken(secret, data.token)
      : ({ valid: false, reason: "malformed" } as const);

    if (!verdict.valid) {
      if (verdict.reason === "too-fast") {
        logSubscribeOutcome("rejected-too-fast");
        return { ok: false, message: "That was too quick — please try once more." };
      }
      if (verdict.reason === "expired") {
        logSubscribeOutcome("rejected-token-expired");
        return { ok: false, message: "This form expired. Reload the page and try again." };
      }
      // Malformed or badly signed: automated, near certainly.
      logSubscribeOutcome("rejected-bot-token");
      return SILENT_SUCCESS;
    }

    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    if (!withinRateLimit(await ipKey(ip, secret))) {
      logSubscribeOutcome("rejected-rate-limited");
      return { ok: false, message: "Too many attempts. Try again in a few minutes." };
    }

    const email = normaliseEmail(data.email);
    if (!hasDeliverableShape(email)) {
      logSubscribeOutcome("rejected-invalid-email");
      return { ok: false, message: "Enter a valid email address." };
    }
    if (isDisposableDomain(emailDomain(email))) {
      logSubscribeOutcome("rejected-disposable-domain");
      return {
        ok: false,
        message: "Please use a permanent email address — disposable ones are not accepted.",
      };
    }

    // Transient provider/network failures (429, 5xx, fetch errors) are
    // retried with bounded exponential backoff. Anything the provider
    // rejected outright — bad address, bad credentials, wrong ids — is not:
    // a second try would fail identically and only delays the response.
    const { outcome, attempts } = await sendWithRetry(
      async () => {
        const response = await fetch(`${BREVO_GATEWAY}/v3/contacts/doubleOptinConfirmation`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lovableKey}`,
            "X-Connection-Api-Key": brevoKey,
          },
          body: JSON.stringify({
            email,
            includeListIds: [listId],
            templateId,
            redirectionUrl: confirmationRedirectUrl(),
            attributes: { SOURCE: data.source ?? "website", OPT_IN: "double" },
          }),
        });
        // Never read/log the body on success: Brevo echoes the request back.
        const bodyText = response.ok ? "" : await response.text();
        return { status: response.status, bodyText };
      },
      {
        onAttempt: (attempt, attemptOutcome) => {
          logProviderAttempt({
            attempt,
            maxAttempts: DEFAULT_RETRY_CONFIG.maxAttempts,
            providerStatusCategory: categorizeProviderOutcome(attemptOutcome),
            ...("status" in attemptOutcome && attemptOutcome.status !== undefined
              ? { providerStatus: attemptOutcome.status }
              : {}),
            ...(attemptOutcome.kind === "transient" && attemptOutcome.errorType !== undefined
              ? { errorType: attemptOutcome.errorType }
              : {}),
          });
        },
      },
    );

    switch (outcome.kind) {
      case "success":
        logSubscribeOutcome("confirmation-sent", { attempt: attempts });
        return { ok: true, state: "confirmation-sent" };

      case "duplicate":
        // Brevo reports an address that has already completed confirmation as
        // a duplicate. Re-sending would be noise, so treat it as done.
        logSubscribeOutcome("already-confirmed", { attempt: attempts });
        return { ok: true, state: "already-confirmed" };

      case "permanent":
        logSubscribeOutcome("rejected-provider-permanent", {
          attempt: attempts,
          providerStatus: outcome.status,
          providerStatusCategory: "client-error",
        });
        return outcome.reason === "invalid-parameter"
          ? { ok: false, message: "That email address was rejected. Check it and try again." }
          : {
              ok: false,
              message: "Subscription failed. Please try again, or try a different address.",
            };

      case "transient":
        logSubscribeOutcome("failed-provider-transient", {
          attempt: attempts,
          maxAttempts: DEFAULT_RETRY_CONFIG.maxAttempts,
          providerStatusCategory: categorizeProviderOutcome(outcome),
          ...(outcome.status !== undefined ? { providerStatus: outcome.status } : {}),
          ...(outcome.errorType !== undefined ? { errorType: outcome.errorType } : {}),
        });
        return { ok: false, message: "Could not reach the mailing list. Try again shortly." };
    }
  });

/**
 * A reader does not need to know the site is missing an environment variable —
 * that is our problem, and naming it publicly is unnecessary disclosure about
 * the deployment. The specific missing variable goes to the server log, which
 * is where someone can act on it.
 */
function unconfigured(missing: string): SubscribeResult {
  logSubscribeOutcome("unconfigured", { missingConfig: missing });
  return {
    ok: false,
    message: "Subscriptions are unavailable at the moment. Please try again later.",
  };
}
