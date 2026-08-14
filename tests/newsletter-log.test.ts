import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { logProviderAttempt, logSubscribeOutcome } from "@/lib/newsletter.log";

// scan-secrets-allow — fixture values used only to assert they never reach a log line.
const FIXTURE_EMAIL = "reader@example.com";
const FIXTURE_IP = "203.0.113.7";
const FIXTURE_SECRET = "super-secret-api-key-value";

describe("newsletter logging", () => {
  let logSpy: ReturnType<typeof vi.spyOn>;
  let errorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    errorSpy.mockRestore();
  });

  function allLoggedText(): string {
    const lines = [...logSpy.mock.calls, ...errorSpy.mock.calls].map((call) => String(call[0]));
    return lines.join("\n");
  }

  it("routes successful outcomes to console.log and failures to console.error", () => {
    logSubscribeOutcome("confirmation-sent", { attempt: 1 });
    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).not.toHaveBeenCalled();

    logSubscribeOutcome("failed-provider-transient", { attempt: 3, maxAttempts: 3 });
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it("emits a single JSON line with only safe operational fields", () => {
    logSubscribeOutcome("rejected-provider-permanent", {
      attempt: 1,
      providerStatus: 401,
      providerStatusCategory: "client-error",
    });

    const line = logSpy.mock.calls[0]?.[0] ?? errorSpy.mock.calls[0]?.[0];
    const parsed = JSON.parse(String(line));

    expect(parsed).toMatchObject({
      event: "newsletter_subscribe",
      outcome: "rejected-provider-permanent",
      attempt: 1,
      providerStatus: 401,
      providerStatusCategory: "client-error",
    });
    expect(typeof parsed.timestamp).toBe("string");
    expect(Object.keys(parsed).sort()).toEqual(
      [
        "attempt",
        "event",
        "outcome",
        "providerStatus",
        "providerStatusCategory",
        "timestamp",
      ].sort(),
    );
  });

  it("omits undefined fields rather than writing them as null", () => {
    logProviderAttempt({ attempt: 1, maxAttempts: 3, providerStatusCategory: "success" });
    const parsed = JSON.parse(String(logSpy.mock.calls[0]?.[0]));
    expect(parsed).not.toHaveProperty("providerStatus");
    expect(parsed).not.toHaveProperty("errorType");
  });

  it.each([
    ["confirmation-sent", { attempt: 1 }],
    ["rejected-rate-limited", {}],
    ["rejected-invalid-email", {}],
    ["unconfigured", { missingConfig: "BREVO_LIST_ID" }],
    ["failed-provider-transient", { attempt: 3, maxAttempts: 3, providerStatus: 503 }],
  ] as const)("never logs the email, IP, or secret for outcome %s", (outcome, fields) => {
    logSubscribeOutcome(outcome, fields);
    const text = allLoggedText();
    expect(text).not.toContain(FIXTURE_EMAIL);
    expect(text).not.toContain(FIXTURE_IP);
    expect(text).not.toContain(FIXTURE_SECRET);
  });

  it("provider attempt logs never contain the email, IP, or secret", () => {
    logProviderAttempt({
      attempt: 2,
      maxAttempts: 3,
      providerStatus: 500,
      providerStatusCategory: "server-error",
      errorType: "TypeError",
    });
    const text = allLoggedText();
    expect(text).not.toContain(FIXTURE_EMAIL);
    expect(text).not.toContain(FIXTURE_IP);
    expect(text).not.toContain(FIXTURE_SECRET);
  });
});
