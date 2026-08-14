import { describe, expect, it, vi } from "vitest";

import {
  DEFAULT_RETRY_CONFIG,
  backoffDelayMs,
  categorizeProviderOutcome,
  classifyProviderResponse,
  sanitizeErrorType,
  sendWithRetry,
} from "@/lib/newsletter.retry";

describe("classifyProviderResponse", () => {
  it("classifies 2xx as success", () => {
    expect(classifyProviderResponse({ networkError: false, status: 200, bodyText: "" })).toEqual({
      kind: "success",
    });
    expect(classifyProviderResponse({ networkError: false, status: 204, bodyText: "" })).toEqual({
      kind: "success",
    });
  });

  it("classifies a duplicate_parameter 400 as duplicate", () => {
    expect(
      classifyProviderResponse({
        networkError: false,
        status: 400,
        bodyText: '{"code":"duplicate_parameter"}',
      }),
    ).toEqual({ kind: "duplicate" });
  });

  it("classifies an invalid_parameter 400 as permanent", () => {
    expect(
      classifyProviderResponse({
        networkError: false,
        status: 400,
        bodyText: '{"code":"invalid_parameter"}',
      }),
    ).toEqual({ kind: "permanent", status: 400, reason: "invalid-parameter" });
  });

  it("classifies an unrecognised 400 body as permanent/other", () => {
    expect(
      classifyProviderResponse({ networkError: false, status: 400, bodyText: '{"code":"weird"}' }),
    ).toEqual({ kind: "permanent", status: 400, reason: "other" });
  });

  it.each([401, 403, 404, 422])("classifies status %i as permanent", (status) => {
    expect(classifyProviderResponse({ networkError: false, status, bodyText: "" })).toEqual({
      kind: "permanent",
      status,
      reason: "other",
    });
  });

  it.each([429, 500, 502, 503])("classifies status %i as transient", (status) => {
    expect(classifyProviderResponse({ networkError: false, status, bodyText: "" })).toEqual({
      kind: "transient",
      status,
      networkError: false,
    });
  });

  it("classifies a network failure as transient", () => {
    expect(classifyProviderResponse({ networkError: true })).toEqual({
      kind: "transient",
      networkError: true,
    });
  });

  it("treats a missing status as transient", () => {
    expect(classifyProviderResponse({ networkError: false })).toEqual({
      kind: "transient",
      networkError: true,
    });
  });
});

describe("categorizeProviderOutcome", () => {
  it("maps success and duplicate to success", () => {
    expect(categorizeProviderOutcome({ kind: "success" })).toBe("success");
    expect(categorizeProviderOutcome({ kind: "duplicate" })).toBe("success");
  });

  it("maps permanent to client-error", () => {
    expect(categorizeProviderOutcome({ kind: "permanent", status: 401, reason: "other" })).toBe(
      "client-error",
    );
  });

  it("maps a network failure to network-error", () => {
    expect(categorizeProviderOutcome({ kind: "transient", networkError: true })).toBe(
      "network-error",
    );
  });

  it("maps a 5xx transient to server-error and a 4xx transient to client-error", () => {
    expect(categorizeProviderOutcome({ kind: "transient", status: 503, networkError: false })).toBe(
      "server-error",
    );
    expect(categorizeProviderOutcome({ kind: "transient", status: 429, networkError: false })).toBe(
      "client-error",
    );
  });
});

describe("sanitizeErrorType", () => {
  it("returns the error name for an Error instance", () => {
    expect(sanitizeErrorType(new TypeError("network is down"))).toBe("TypeError");
  });

  it("never leaks the error message", () => {
    const message = "secret-looking detail that must not appear";
    const result = sanitizeErrorType(new Error(message));
    expect(result).not.toContain(message);
  });

  it("falls back to typeof for non-Error values", () => {
    expect(sanitizeErrorType("boom")).toBe("string");
    expect(sanitizeErrorType(undefined)).toBe("undefined");
  });
});

describe("backoffDelayMs", () => {
  it("grows exponentially with the attempt number, capped at maxDelayMs", () => {
    const config = { maxAttempts: 5, baseDelayMs: 100, maxDelayMs: 1_000 };
    // random() = 1 (exclusive in reality, but this pins the upper bound) makes the cap explicit.
    const alwaysMax = () => 0.999999;
    expect(backoffDelayMs(1, config, alwaysMax)).toBeLessThan(100);
    expect(backoffDelayMs(1, config, alwaysMax)).toBeGreaterThanOrEqual(99);
    expect(backoffDelayMs(2, config, alwaysMax)).toBeGreaterThanOrEqual(199);
    expect(backoffDelayMs(5, config, alwaysMax)).toBeLessThanOrEqual(1_000);
  });

  it("never exceeds maxDelayMs even for large attempt numbers", () => {
    const config = { maxAttempts: 10, baseDelayMs: 300, maxDelayMs: 4_000 };
    expect(backoffDelayMs(9, config, () => 0.999999)).toBeLessThanOrEqual(4_000);
  });

  it("is zero when random() returns 0", () => {
    const config = { maxAttempts: 5, baseDelayMs: 100, maxDelayMs: 1_000 };
    expect(backoffDelayMs(3, config, () => 0)).toBe(0);
  });
});

describe("sendWithRetry", () => {
  const noSleep = vi.fn(async () => {});
  const config = { ...DEFAULT_RETRY_CONFIG, maxAttempts: 3 };

  it("does not retry a permanent failure", async () => {
    const send = vi.fn(async () => ({ status: 400, bodyText: '{"code":"invalid_parameter"}' }));
    const result = await sendWithRetry(send, { config, sleep: noSleep });

    expect(send).toHaveBeenCalledTimes(1);
    expect(result.attempts).toBe(1);
    expect(result.outcome).toEqual({ kind: "permanent", status: 400, reason: "invalid-parameter" });
  });

  it("does not retry a successful call", async () => {
    const send = vi.fn(async () => ({ status: 200, bodyText: "" }));
    const result = await sendWithRetry(send, { config, sleep: noSleep });

    expect(send).toHaveBeenCalledTimes(1);
    expect(result.attempts).toBe(1);
  });

  it("retries a transient failure up to maxAttempts, then reports transient", async () => {
    const send = vi.fn(async () => ({ status: 503, bodyText: "" }));
    const result = await sendWithRetry(send, { config, sleep: noSleep });

    expect(send).toHaveBeenCalledTimes(3);
    expect(result.attempts).toBe(3);
    expect(result.outcome.kind).toBe("transient");
    // Backoff is invoked between attempts only: maxAttempts - 1 times.
    expect(noSleep).toHaveBeenCalledTimes(2);
  });

  it("stops retrying as soon as a transient failure recovers", async () => {
    let call = 0;
    const send = vi.fn(async () => {
      call += 1;
      if (call < 2) return { status: 500, bodyText: "" };
      return { status: 200, bodyText: "" };
    });
    const result = await sendWithRetry(send, { config, sleep: noSleep });

    expect(send).toHaveBeenCalledTimes(2);
    expect(result.attempts).toBe(2);
    expect(result.outcome).toEqual({ kind: "success" });
  });

  it("retries a thrown network error and classifies it as transient", async () => {
    const send = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce({ status: 200, bodyText: "" });

    const result = await sendWithRetry(send, { config, sleep: noSleep });

    expect(send).toHaveBeenCalledTimes(2);
    expect(result.outcome).toEqual({ kind: "success" });
  });

  it("never sleeps between attempts for more than maxDelayMs worth of jitter", async () => {
    const send = vi.fn(async () => ({ status: 500, bodyText: "" }));
    const sleep = vi.fn(async (_ms: number) => {});
    await sendWithRetry(send, {
      config: { maxAttempts: 3, baseDelayMs: 300, maxDelayMs: 4_000 },
      sleep,
      random: () => 0.9,
    });

    for (const call of sleep.mock.calls) {
      expect(call[0]).toBeLessThanOrEqual(4_000);
      expect(call[0]).toBeGreaterThanOrEqual(0);
    }
  });

  it("reports every attempt via onAttempt with an increasing attempt number", async () => {
    const send = vi.fn(async () => ({ status: 500, bodyText: "" }));
    const onAttempt = vi.fn();
    await sendWithRetry(send, { config, sleep: noSleep, onAttempt });

    expect(onAttempt).toHaveBeenCalledTimes(3);
    expect(onAttempt.mock.calls.map((call) => call[0])).toEqual([1, 2, 3]);
  });
});
