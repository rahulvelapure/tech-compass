import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

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
/* Token issuance                                                      */
/* ------------------------------------------------------------------ */

/**
 * Minted when a visitor first engages with the form rather than on page load,
 * so the common case — a reader who never subscribes — costs no extra request
 * and the token's clock starts at genuine intent.
 */
export const issueNewsletterToken = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ token: string | null }> => {
    const secret = formSecret();
    if (!secret) return { token: null };
    return { token: await issueFormToken(secret) };
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
    if (data[HONEYPOT_FIELD]) return SILENT_SUCCESS;

    const secret = formSecret();
    const brevoKey = process.env["BREVO_API_KEY"];
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const templateId = Number(process.env["BREVO_DOI_TEMPLATE_ID"] ?? "");
    const listId = Number(process.env["BREVO_LIST_ID"] ?? "");

    if (!secret || !brevoKey || !lovableKey) {
      return unconfigured("credentials");
    }
    // Confirmed opt-in cannot be faked: without a template and a list there is
    // no confirmation email to send, and adding the contact directly would be
    // exactly the single opt-in behaviour we are avoiding.
    if (!Number.isInteger(templateId) || templateId <= 0) {
      return unconfigured("BREVO_DOI_TEMPLATE_ID");
    }
    if (!Number.isInteger(listId) || listId <= 0) {
      return unconfigured("BREVO_LIST_ID");
    }

    const verdict = data.token
      ? await verifyFormToken(secret, data.token)
      : ({ valid: false, reason: "malformed" } as const);

    if (!verdict.valid) {
      if (verdict.reason === "too-fast") {
        return { ok: false, message: "That was too quick — please try once more." };
      }
      if (verdict.reason === "expired") {
        return { ok: false, message: "This form expired. Reload the page and try again." };
      }
      // Malformed or badly signed: automated, near certainly.
      return SILENT_SUCCESS;
    }

    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    if (!withinRateLimit(await ipKey(ip, secret))) {
      return { ok: false, message: "Too many attempts. Try again in a few minutes." };
    }

    const email = normaliseEmail(data.email);
    if (!hasDeliverableShape(email)) {
      return { ok: false, message: "Enter a valid email address." };
    }
    if (isDisposableDomain(emailDomain(email))) {
      return {
        ok: false,
        message: "Please use a permanent email address — disposable ones are not accepted.",
      };
    }

    let response: Response;
    try {
      response = await fetch(`${BREVO_GATEWAY}/v3/contacts/doubleOptinConfirmation`, {
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
    } catch (error) {
      console.error("Newsletter confirmation request failed", error);
      return { ok: false, message: "Could not reach the mailing list. Try again shortly." };
    }

    if (response.ok) return { ok: true, state: "confirmation-sent" };

    const text = await response.text();

    // Brevo reports an address that has already completed confirmation as a
    // duplicate. Re-sending would be noise, so treat it as done.
    if (response.status === 400 && text.includes("duplicate_parameter")) {
      return { ok: true, state: "already-confirmed" };
    }

    if (response.status === 400 && text.includes("invalid_parameter")) {
      return { ok: false, message: "That email address was rejected. Check it and try again." };
    }

    // Never log the address: it is personal data and the status tells us enough.
    console.error(`Brevo double opt-in failed [${response.status}]`);
    return {
      ok: false,
      message: "Subscription failed. Please try again, or try a different address.",
    };
  });

function unconfigured(missing: string): SubscribeResult {
  console.error(`Newsletter is not configured: missing ${missing}`);
  return {
    ok: false,
    message: "The mailing list is not configured yet. Please try again later.",
  };
}
