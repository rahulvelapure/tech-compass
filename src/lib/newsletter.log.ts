import type { ProviderStatusCategory } from "./newsletter.retry";

/**
 * Structured, PII-free logging for newsletter subscribe attempts.
 *
 * Never pass an email address, IP, token, or API key into these functions —
 * only operational metadata: what happened, how many tries it took, and what
 * category of response the provider gave. That is enough to tell "Brevo is
 * down", "someone is hammering the form", and "the template id is wrong"
 * apart from the console alone, without the log line itself becoming a
 * record of who tried to subscribe.
 *
 * Plain `console.log`/`console.error` rather than a logging library: Workers
 * Logs (enabled in wrangler.jsonc) captures both, and JSON lines keep the
 * output greppable/queryable without adding a dependency.
 */

export type SubscribeOutcome =
  | "confirmation-sent"
  | "already-confirmed"
  | "rejected-bot-honeypot"
  | "rejected-bot-token"
  | "rejected-too-fast"
  | "rejected-token-expired"
  | "rejected-rate-limited"
  | "rejected-invalid-email"
  | "rejected-disposable-domain"
  | "rejected-provider-permanent"
  | "failed-provider-transient"
  | "unconfigured";

const FAILURE_OUTCOMES: ReadonlySet<SubscribeOutcome> = new Set([
  "rejected-provider-permanent",
  "failed-provider-transient",
  "unconfigured",
]);

type AttemptFields = {
  attempt: number;
  maxAttempts: number;
  providerStatus?: number;
  providerStatusCategory?: ProviderStatusCategory;
  errorType?: string;
};

type OutcomeFields = {
  attempt?: number;
  maxAttempts?: number;
  providerStatus?: number;
  providerStatusCategory?: ProviderStatusCategory;
  errorType?: string;
  /** Which required variable was missing. Not a secret — just its name. */
  missingConfig?: string;
};

/** One line per attempt made against the provider, including retries. */
export function logProviderAttempt(fields: AttemptFields): void {
  emit("newsletter_subscribe_provider_attempt", fields, false);
}

/** One line per subscribe request, once the final outcome is known. */
export function logSubscribeOutcome(outcome: SubscribeOutcome, fields: OutcomeFields = {}): void {
  emit("newsletter_subscribe", { outcome, ...fields }, FAILURE_OUTCOMES.has(outcome));
}

function emit(event: string, fields: Record<string, unknown>, isFailure: boolean): void {
  const record: Record<string, unknown> = { event, timestamp: new Date().toISOString() };
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) record[key] = value;
  }
  const line = JSON.stringify(record);
  if (isFailure) console.error(line);
  else console.log(line);
}
