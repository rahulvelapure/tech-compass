/**
 * Retry policy for the outbound call to the mailing-list provider.
 *
 * Only transient failures — a network error, a provider rate limit (429), or a
 * provider-side outage (5xx) — are worth retrying. Anything the provider
 * rejected outright (a bad request, bad credentials, an unknown route) will
 * fail identically on a second try, so retrying it just delays the response
 * and burns the provider's request budget for nothing.
 *
 * Pure and I/O-free except for the injected `send`/`sleep`, so the policy and
 * the backoff schedule are testable without a real network or real timers.
 */

export type ProviderStatusCategory = "success" | "client-error" | "server-error" | "network-error";

export type ProviderOutcome =
  | { kind: "success" }
  | { kind: "duplicate" }
  /** The request itself was invalid, unauthorized, or the route/config is wrong. Do not retry. */
  | { kind: "permanent"; status: number; reason: "invalid-parameter" | "other" }
  /** Network failure, provider rate limit, or provider outage. Safe to retry. */
  | { kind: "transient"; status?: number; networkError: boolean; errorType?: string };

/** `error.name` only — never the message, which can echo request details. */
export function sanitizeErrorType(error: unknown): string {
  if (error instanceof Error) return error.name || "Error";
  return typeof error;
}

export function categorizeProviderOutcome(outcome: ProviderOutcome): ProviderStatusCategory {
  switch (outcome.kind) {
    case "success":
    case "duplicate":
      return "success";
    case "permanent":
      return "client-error";
    case "transient":
      if (outcome.networkError) return "network-error";
      return outcome.status !== undefined && outcome.status >= 500
        ? "server-error"
        : "client-error";
  }
}

/**
 * Classifies a completed HTTP response (or a network failure) from the
 * Brevo double opt-in endpoint.
 *
 * `bodyText` is only inspected on a 400 — Brevo distinguishes "already
 * confirmed" (`duplicate_parameter`) and "bad address" (`invalid_parameter`)
 * in the response body rather than the status code.
 */
export function classifyProviderResponse(params: {
  networkError: boolean;
  status?: number;
  bodyText?: string;
}): ProviderOutcome {
  if (params.networkError || params.status === undefined) {
    return { kind: "transient", networkError: true };
  }

  const { status, bodyText = "" } = params;

  if (status >= 200 && status < 300) return { kind: "success" };
  if (status === 400 && bodyText.includes("duplicate_parameter")) return { kind: "duplicate" };
  if (status === 400 && bodyText.includes("invalid_parameter")) {
    return { kind: "permanent", status, reason: "invalid-parameter" };
  }
  if (status === 429 || status >= 500) {
    return { kind: "transient", status, networkError: false };
  }
  // Any other 4xx: bad credentials, unknown route, misconfiguration, or an
  // unrecognised 400. Retrying changes nothing.
  return { kind: "permanent", status, reason: "other" };
}

export interface RetryConfig {
  /** Total attempts, including the first — not the number of retries. */
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

/** 3 attempts, ~0-4.8s of added latency worst case. Bounded, so one failing
 * submission can never turn into an unbounded burst against the provider. */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelayMs: 300,
  maxDelayMs: 4_000,
};

/** Full jitter: uniform in [0, cap]. Avoids synchronised retry storms across concurrent requests. */
export function backoffDelayMs(
  attempt: number,
  config: RetryConfig,
  random: () => number = Math.random,
): number {
  const exponential = config.baseDelayMs * 2 ** (attempt - 1);
  const cap = Math.min(exponential, config.maxDelayMs);
  return Math.floor(random() * cap);
}

export interface SendWithRetryResult {
  outcome: ProviderOutcome;
  /** How many attempts were actually made (1 if the first attempt was decisive). */
  attempts: number;
}

/**
 * Runs `send` up to `config.maxAttempts` times, retrying only while the
 * outcome classifies as transient, with exponential backoff between tries.
 */
export async function sendWithRetry(
  send: () => Promise<{ status: number; bodyText: string }>,
  opts: {
    config?: RetryConfig;
    sleep?: (ms: number) => Promise<void>;
    random?: () => number;
    onAttempt?: (attempt: number, outcome: ProviderOutcome) => void;
  } = {},
): Promise<SendWithRetryResult> {
  const config = opts.config ?? DEFAULT_RETRY_CONFIG;
  const sleep =
    opts.sleep ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const random = opts.random ?? Math.random;

  let attempt = 0;
  let outcome: ProviderOutcome;

  for (;;) {
    attempt += 1;
    try {
      const { status, bodyText } = await send();
      outcome = classifyProviderResponse({ networkError: false, status, bodyText });
    } catch (error) {
      outcome = { kind: "transient", networkError: true, errorType: sanitizeErrorType(error) };
    }

    opts.onAttempt?.(attempt, outcome);

    if (outcome.kind !== "transient" || attempt >= config.maxAttempts) break;
    await sleep(backoffDelayMs(attempt, config, random));
  }

  return { outcome, attempts: attempt };
}
