/**
 * Versioned interaction identifiers.
 *
 * Format: `astron:v1:<namespace>:<action>[:<value>]`
 *
 * - strictly validated, so a malformed or truncated id never reaches a handler;
 * - segmented, so an expired interaction from a previous version is recognised
 *   as such instead of being dispatched by accident;
 * - deliberately data-only: no secrets, no user content, no token. Only the
 *   identifiers needed to find the handler are allowed.
 */

import { InteractionExpiredError } from "../errors.js";

export const CUSTOM_ID_VERSION = "v1";
export const CUSTOM_ID_PREFIX = "astron";
export const MAX_CUSTOM_ID_LENGTH = 100; // Discord's hard limit.

const SEGMENT = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const RESERVED_SEGMENTS = new Set(["astron"]);

export class CustomIdError extends Error {
  constructor(message) {
    super(message);
    this.name = "CustomIdError";
  }
}

function assertSegment(name, value) {
  if (typeof value !== "string" || !SEGMENT.test(value)) {
    throw new CustomIdError(
      `Invalid custom id segment '${name}': expected lowercase letters, digits, '-' or '_'.`,
    );
  }
  if (RESERVED_SEGMENTS.has(value)) {
    throw new CustomIdError(`Reserved custom id segment '${name}': '${value}'.`);
  }
}

/**
 * @param {object} parts
 * @param {string} parts.namespace Feature namespace (`poll`, `ticket`, …).
 * @param {string} parts.action Action within that namespace.
 * @param {string} [parts.value] Optional opaque identifier (a poll id, a page number…).
 * @param {string} [parts.version] Version override, for tests and forward compatibility.
 */
export function encodeCustomId({ namespace, action, value, version = CUSTOM_ID_VERSION } = {}) {
  assertSegment("namespace", namespace);
  assertSegment("action", action);
  assertSegment("version", version);

  const parts = [CUSTOM_ID_PREFIX, version, namespace, action];
  if (value !== undefined && value !== null && value !== "") {
    assertSegment("value", String(value));
    parts.push(String(value));
  }

  const customId = parts.join(":");
  if (customId.length > MAX_CUSTOM_ID_LENGTH) {
    throw new CustomIdError(`Custom id exceeds ${MAX_CUSTOM_ID_LENGTH} characters.`);
  }
  return customId;
}

/**
 * @returns {{version: string, namespace: string, action: string, value: string|null}|null}
 *   `null` when the id is not an Astron id or is malformed.
 */
export function parseCustomId(customId) {
  if (typeof customId !== "string" || customId.length === 0) return null;
  if (customId.length > MAX_CUSTOM_ID_LENGTH) return null;

  const parts = customId.split(":");
  if (parts.length < 4 || parts.length > 5) return null;
  if (parts[0] !== CUSTOM_ID_PREFIX) return null;

  const [, version, namespace, action, value] = parts;
  if (!SEGMENT.test(version) || !SEGMENT.test(namespace) || !SEGMENT.test(action)) return null;
  if (value !== undefined && !SEGMENT.test(value)) return null;

  return { version, namespace, action, value: value ?? null };
}

export function isCustomIdFor(customId, { namespace, action } = {}) {
  const parsed = parseCustomId(customId);
  if (!parsed) return false;
  if (namespace && parsed.namespace !== namespace) return false;
  if (action && parsed.action !== action) return false;
  return true;
}

/** Throws an expected, user-facing error for an unusable id. */
export function assertCustomId(customId, expected = {}) {
  const parsed = parseCustomId(customId);
  if (!parsed) {
    throw new InteractionExpiredError();
  }
  if (parsed.version !== CUSTOM_ID_VERSION) {
    throw new InteractionExpiredError(
      "Cette interaction provient d'une ancienne version du bot. Relancez la commande.",
      { meta: { customId, version: parsed.version } },
    );
  }
  if (expected.namespace && parsed.namespace !== expected.namespace) {
    throw new InteractionExpiredError();
  }
  return parsed;
}
