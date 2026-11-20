/**
 * Versioned event contracts between bots.
 *
 * Bots are independent processes with separate databases. What crosses a bot
 * boundary is an explicit, versioned envelope: a producer emits it, a consumer
 * validates it and stores its own projection. No bot ever reads another bot's
 * database, and a contract change is a version change, never a silent mutation.
 */

import { randomUUID } from "node:crypto";

import { ERROR_CODES, AstronError } from "../errors.js";

export const CONTRACT_VERSION = 1;

const SNOWFLAKE = /^\d{17,20}$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const SOURCE = /^[a-z][a-z0-9-]{1,31}$/;

export const EVENT_TYPES = Object.freeze({
  MODERATION_CASE_CREATED: "moderation.case.created",
  MODERATION_CASE_UPDATED: "moderation.case.updated",
  SECURITY_ALERT: "security.alert",
  MEMBER_JOINED: "member.joined",
  MEMBER_LEFT: "member.left",
  LEVEL_UP: "level.up",
  SUGGESTION_CREATED: "suggestion.created",
  WORKFLOW_EXECUTED: "workflow.executed",
  TRACK_STARTED: "track.started",
});

const snowflake = { type: "string", pattern: SNOWFLAKE };
const nullableString = { type: "string", nullable: true, maxLength: 2000 };
const isoDate = { type: "string", pattern: ISO_DATE };

/**
 * @type {Record<string, {description: string, publisher: string, consumers: string[], schema: object}>}
 */
export const EVENT_CONTRACTS = Object.freeze({
  [EVENT_TYPES.MODERATION_CASE_CREATED]: {
    description: "A moderation case was opened (warn, kick, ban, timeout, quarantine…).",
    publisher: "protect",
    consumers: ["logger"],
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["caseId", "caseNumber", "action", "targetId", "moderatorId", "reason", "createdAt"],
      properties: {
        caseId: { type: "string", minLength: 1, maxLength: 64 },
        caseNumber: { type: "integer", min: 1 },
        action: {
          type: "string",
          enum: [
            "warn",
            "kick",
            "ban",
            "unban",
            "timeout",
            "untimeout",
            "quarantine",
            "release",
            "note",
            "purge",
            "slowmode",
            "lock",
            "unlock",
          ],
        },
        targetId: snowflake,
        targetTag: nullableString,
        moderatorId: snowflake,
        moderatorTag: nullableString,
        reason: { type: "string", minLength: 1, maxLength: 2000 },
        durationSeconds: { type: "integer", min: 0, nullable: true },
        createdAt: isoDate,
      },
    },
  },
  [EVENT_TYPES.MODERATION_CASE_UPDATED]: {
    description: "A moderation case changed status or received a note.",
    publisher: "protect",
    consumers: ["logger"],
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["caseId", "caseNumber", "status", "updatedBy", "updatedAt"],
      properties: {
        caseId: { type: "string", minLength: 1, maxLength: 64 },
        caseNumber: { type: "integer", min: 1 },
        status: { type: "string", enum: ["open", "closed", "updated"] },
        note: nullableString,
        updatedBy: snowflake,
        updatedAt: isoDate,
      },
    },
  },
  [EVENT_TYPES.SECURITY_ALERT]: {
    description: "Protection detected suspicious activity and reports what it did.",
    publisher: "protect",
    consumers: ["logger"],
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["kind", "severity", "detail", "actionTaken"],
      properties: {
        kind: {
          type: "string",
          enum: ["spam", "raid", "phishing", "suspicious", "automod", "mention_spam"],
        },
        severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
        userId: { ...snowflake, nullable: true },
        channelId: { ...snowflake, nullable: true },
        detail: { type: "string", minLength: 1, maxLength: 1000 },
        actionTaken: { type: "string", minLength: 1, maxLength: 200 },
      },
    },
  },
  [EVENT_TYPES.MEMBER_JOINED]: {
    description: "A member joined a guild (emitted by Guild after welcome handling).",
    publisher: "guild",
    consumers: ["logger", "automations"],
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["userId", "memberCount", "accountCreatedAt"],
      properties: {
        userId: snowflake,
        memberCount: { type: "integer", min: 0 },
        accountCreatedAt: isoDate,
        invitedBy: { ...snowflake, nullable: true },
      },
    },
  },
  [EVENT_TYPES.MEMBER_LEFT]: {
    description: "A member left a guild.",
    publisher: "guild",
    consumers: ["logger", "automations"],
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["userId", "memberCount"],
      properties: {
        userId: snowflake,
        memberCount: { type: "integer", min: 0 },
        joinedAt: { ...isoDate, nullable: true },
      },
    },
  },
  [EVENT_TYPES.LEVEL_UP]: {
    description: "A member reached a new XP level in Guild.",
    publisher: "guild",
    consumers: ["logger", "automations"],
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["userId", "level", "totalXp"],
      properties: {
        userId: snowflake,
        level: { type: "integer", min: 0 },
        totalXp: { type: "integer", min: 0 },
      },
    },
  },
  [EVENT_TYPES.SUGGESTION_CREATED]: {
    description: "A member submitted a suggestion.",
    publisher: "guild",
    consumers: ["logger", "automations"],
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["suggestionId", "authorId", "content"],
      properties: {
        suggestionId: { type: "string", minLength: 1, maxLength: 64 },
        authorId: snowflake,
        content: { type: "string", minLength: 1, maxLength: 2000 },
      },
    },
  },
  [EVENT_TYPES.WORKFLOW_EXECUTED]: {
    description: "An automation workflow finished (success or failure).",
    publisher: "automations",
    consumers: ["logger"],
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["workflowId", "runId", "status", "durationMs", "actionCount"],
      properties: {
        workflowId: { type: "string", minLength: 1, maxLength: 64 },
        runId: { type: "string", minLength: 1, maxLength: 64 },
        status: { type: "string", enum: ["success", "failure", "skipped"] },
        durationMs: { type: "integer", min: 0 },
        actionCount: { type: "integer", min: 0 },
        error: nullableString,
      },
    },
  },
  [EVENT_TYPES.TRACK_STARTED]: {
    description: "The player started a track.",
    publisher: "player",
    consumers: ["logger"],
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["title", "url", "requestedBy", "source"],
      properties: {
        title: { type: "string", minLength: 1, maxLength: 300 },
        url: { type: "string", minLength: 1, maxLength: 2000 },
        requestedBy: snowflake,
        source: { type: "string", minLength: 1, maxLength: 100 },
        durationSeconds: { type: "integer", min: 0, nullable: true },
      },
    },
  },
});

/** Contract identifiers and versions, for documentation and consumers. */
export function listContracts() {
  return Object.entries(EVENT_CONTRACTS).map(([type, contract]) => ({
    type,
    version: CONTRACT_VERSION,
    description: contract.description,
    publisher: contract.publisher,
    consumers: [...contract.consumers],
  }));
}

/**
 * Validate a payload against a declarative contract schema.
 * Returns every problem at once so a producer fails with one actionable log.
 */
export function validatePayload(data, schema, path = "data") {
  const errors = [];

  function walk(value, node, at) {
    if (value === null || value === undefined) {
      if (node.nullable) return;
      errors.push(`${at} is required.`);
      return;
    }

    if (node.type === "object") {
      if (typeof value !== "object" || Array.isArray(value)) {
        errors.push(`${at} must be an object.`);
        return;
      }
      for (const key of node.required ?? []) {
        if (value[key] === undefined) errors.push(`${at}.${key} is required.`);
      }
      if (node.additionalProperties === false) {
        for (const key of Object.keys(value)) {
          if (!Object.hasOwn(node.properties ?? {}, key)) {
            errors.push(`${at}.${key} is not part of the contract.`);
          }
        }
      }
      for (const [key, child] of Object.entries(node.properties ?? {})) {
        if (value[key] !== undefined) walk(value[key], child, `${at}.${key}`);
      }
      return;
    }

    if (node.type === "array") {
      if (!Array.isArray(value)) {
        errors.push(`${at} must be an array.`);
        return;
      }
      if (node.maxItems !== undefined && value.length > node.maxItems) {
        errors.push(`${at} has too many items (max ${node.maxItems}).`);
      }
      value.forEach((item, index) => walk(item, node.items ?? { type: "string" }, `${at}[${index}]`));
      return;
    }

    if (node.type === "integer" && !Number.isInteger(value)) {
      errors.push(`${at} must be an integer.`);
      return;
    }
    if (node.type === "number" && (typeof value !== "number" || !Number.isFinite(value))) {
      errors.push(`${at} must be a number.`);
      return;
    }
    if (node.type === "boolean" && typeof value !== "boolean") {
      errors.push(`${at} must be a boolean.`);
      return;
    }
    if (node.type === "string") {
      if (typeof value !== "string") {
        errors.push(`${at} must be a string.`);
        return;
      }
      if (node.minLength !== undefined && value.trim().length < node.minLength) {
        errors.push(`${at} must contain at least ${node.minLength} character(s).`);
      }
      if (node.maxLength !== undefined && value.length > node.maxLength) {
        errors.push(`${at} exceeds ${node.maxLength} characters.`);
      }
      if (node.pattern && !node.pattern.test(value)) {
        errors.push(`${at} has an invalid format.`);
      }
    }

    if (node.enum && !node.enum.includes(value)) {
      errors.push(`${at} must be one of: ${node.enum.join(", ")}.`);
    }
    if (typeof value === "number") {
      if (node.min !== undefined && value < node.min) errors.push(`${at} must be >= ${node.min}.`);
      if (node.max !== undefined && value > node.max) errors.push(`${at} must be <= ${node.max}.`);
    }
  }

  walk(data, schema, path);
  return errors;
}

/**
 * Build and validate an event envelope.
 * @param {object} input
 * @param {string} input.type Contract type (`moderation.case.created`).
 * @param {string} input.source Emitting bot (`protect`).
 * @param {string} input.guildId Guild scope; every contract is guild-scoped.
 * @param {object} input.data Contract payload.
 */
export function createEvent({
  type,
  source,
  guildId,
  data,
  subject = null,
  id = randomUUID(),
  occurredAt = new Date().toISOString(),
  version = CONTRACT_VERSION,
} = {}) {
  const contract = EVENT_CONTRACTS[type];

  if (!contract) {
    throw new AstronError(`Unknown event contract '${type}'.`, {
      code: ERROR_CODES.EVENT_UNKNOWN_CONTRACT,
      expected: true,
      meta: { type },
    });
  }
  if (version !== CONTRACT_VERSION) {
    throw new AstronError(`Contract '${type}' has no version ${version}.`, {
      code: ERROR_CODES.EVENT_UNKNOWN_CONTRACT,
      expected: true,
      meta: { type, version },
    });
  }
  if (!SOURCE.test(String(source ?? ""))) {
    throw new AstronError("Event source must be a lowercase bot name.", {
      code: ERROR_CODES.EVENT_PAYLOAD_INVALID,
      expected: true,
      meta: { source },
    });
  }
  if (!SNOWFLAKE.test(String(guildId ?? ""))) {
    throw new AstronError("Event guildId must be a Discord guild id.", {
      code: ERROR_CODES.EVENT_PAYLOAD_INVALID,
      expected: true,
      meta: { guildId },
    });
  }

  const payloadErrors = validatePayload(data, contract.schema);
  if (payloadErrors.length > 0) {
    throw new AstronError(`Invalid payload for '${type}': ${payloadErrors.join("; ")}`, {
      code: ERROR_CODES.EVENT_PAYLOAD_INVALID,
      expected: true,
      meta: { type, errors: payloadErrors },
    });
  }

  if (typeof id !== "string" || id.trim() === "") {
    throw new AstronError("Event id must be a non-empty string.", {
      code: ERROR_CODES.EVENT_PAYLOAD_INVALID,
      expected: true,
    });
  }
  if (!ISO_DATE.test(occurredAt)) {
    throw new AstronError("Event occurredAt must be an ISO-8601 timestamp.", {
      code: ERROR_CODES.EVENT_PAYLOAD_INVALID,
      expected: true,
    });
  }

  return Object.freeze({
    id,
    type,
    version,
    source,
    guildId,
    occurredAt,
    subject: subject ? Object.freeze({ type: String(subject.type), id: String(subject.id) }) : null,
    data: Object.freeze(structuredClone(data)),
  });
}

/** Validate a received envelope before a consumer stores or projects it. */
export function validateEvent(envelope) {
  const errors = [];

  if (!envelope || typeof envelope !== "object") {
    return { ok: false, errors: ["Envelope is not an object."] };
  }

  const contract = EVENT_CONTRACTS[envelope.type];
  if (!contract) errors.push(`Unknown contract '${envelope.type}'.`);
  if (envelope.version !== CONTRACT_VERSION) {
    errors.push(`Unsupported contract version '${envelope.version}'.`);
  }
  if (typeof envelope.id !== "string" || envelope.id === "") errors.push("Missing event id.");
  if (!SOURCE.test(String(envelope.source ?? ""))) errors.push("Invalid event source.");
  if (!SNOWFLAKE.test(String(envelope.guildId ?? ""))) errors.push("Invalid guild id.");
  if (!ISO_DATE.test(String(envelope.occurredAt ?? ""))) errors.push("Invalid occurredAt.");

  if (contract) errors.push(...validatePayload(envelope.data, contract.schema, "event.data"));

  return { ok: errors.length === 0, errors, type: envelope.type, version: envelope.version };
}
