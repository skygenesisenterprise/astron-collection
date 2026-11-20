/**
 * HMAC-signed webhook transport for event contracts.
 *
 * Transport choices are boring on purpose: an HTTP POST with a timestamped
 * HMAC-SHA256 signature. It needs no broker, works between two containers and
 * between two hosts, and a receiver can verify a body without sharing a
 * database. Consumers deduplicate by envelope id.
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export const SIGNATURE_HEADER = "x-astron-signature";
export const TIMESTAMP_HEADER = "x-astron-timestamp";
export const EVENT_HEADER = "x-astron-event";
export const SOURCE_HEADER = "x-astron-source";
export const VERSION_HEADER = "x-astron-contract-version";

export const DEFAULT_TOLERANCE_MS = 5 * 60 * 1000;
const MIN_SECRET_LENGTH = 16;

/** `sha256=<hex>` over `<timestamp>.<body>`. */
export function signPayload({ secret, timestamp, body }) {
  if (typeof secret !== "string" || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`Webhook secret must contain at least ${MIN_SECRET_LENGTH} characters.`);
  }
  const digest = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  return `sha256=${digest}`;
}

/**
 * Verify a received signature. Never throws on untrusted input.
 * @returns {{ok: boolean, reason?: string}}
 */
export function verifySignature({
  secret,
  timestamp,
  body,
  signature,
  toleranceMs = DEFAULT_TOLERANCE_MS,
  clock = () => Date.now(),
} = {}) {
  if (typeof signature !== "string" || !signature.startsWith("sha256=")) {
    return { ok: false, reason: "missing-signature" };
  }
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds)) return { ok: false, reason: "invalid-timestamp" };
  if (Math.abs(clock() - seconds * 1000) > toleranceMs) {
    return { ok: false, reason: "expired-timestamp" };
  }

  let expected;
  try {
    expected = signPayload({ secret, timestamp: seconds, body: String(body ?? "") });
  } catch (error) {
    return { ok: false, reason: error.message };
  }

  const received = Buffer.from(signature);
  const wanted = Buffer.from(expected);
  if (received.length !== wanted.length) return { ok: false, reason: "signature-mismatch" };
  return timingSafeEqual(received, wanted)
    ? { ok: true }
    : { ok: false, reason: "signature-mismatch" };
}

const sleepDefault = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {object} options
 * @param {string} options.url Receiver endpoint.
 * @param {string} options.secret Shared HMAC secret.
 * @param {number} [options.retries] Attempts after the first one.
 * @param {number} [options.timeoutMs]
 * @param {typeof fetch} [options.fetchImpl]
 * @param {(ms: number) => Promise<void>} [options.sleep]
 */
export function createWebhookSink({
  url,
  secret,
  retries = 3,
  timeoutMs = 5_000,
  fetchImpl = globalThis.fetch,
  sleep = sleepDefault,
  clock = () => Date.now(),
  logger,
} = {}) {
  if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
    throw new Error("Webhook sink requires an http(s) URL.");
  }
  if (typeof secret !== "string" || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`Webhook sink requires a secret of at least ${MIN_SECRET_LENGTH} characters.`);
  }
  if (typeof fetchImpl !== "function") {
    throw new Error("Webhook sink requires a fetch implementation.");
  }

  async function deliver(envelope) {
    const body = JSON.stringify(envelope);
    const attempts = Math.max(0, retries) + 1;
    let lastError = null;

    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      const timestamp = Math.floor(clock() / 1000);
      try {
        const response = await fetchImpl(url, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            [EVENT_HEADER]: envelope.type,
            [VERSION_HEADER]: String(envelope.version),
            [SOURCE_HEADER]: envelope.source,
            [TIMESTAMP_HEADER]: String(timestamp),
            [SIGNATURE_HEADER]: signPayload({ secret, timestamp, body }),
          },
          body,
          signal: AbortSignal.timeout(timeoutMs),
        });

        if (response.ok) return { attempts: attempt };
        lastError = new Error(`Event receiver answered ${response.status}.`);
      } catch (error) {
        lastError = error;
      }

      logger?.debug?.("event webhook attempt failed", {
        type: envelope.type,
        eventId: envelope.id,
        attempt,
        err: lastError,
      });

      if (attempt < attempts) await sleep(Math.min(250 * 2 ** (attempt - 1), 5_000));
    }

    throw lastError ?? new Error("Event delivery failed.");
  }

  return { name: "webhook", url, deliver };
}
