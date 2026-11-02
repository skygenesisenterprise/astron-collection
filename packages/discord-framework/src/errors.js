/**
 * Error contract shared by the framework and the bots.
 *
 * `expected` separates a refusal the bot caused on purpose (missing permission,
 * unknown interaction, cooldown) from a genuine failure. Expected refusals are
 * logged at `warn`, unexpected ones at `error` with a stack, and only expected
 * refusals can show their own message to a user.
 */

export const ERROR_CODES = Object.freeze({
  COMMAND_DUPLICATE: "COMMAND_DUPLICATE",
  COMMAND_FOREIGN_BOT: "COMMAND_FOREIGN_BOT",
  COMMAND_INVALID: "COMMAND_INVALID",
  CONFIGURATION_INVALID: "CONFIGURATION_INVALID",
  INTERACTION_EXPIRED: "INTERACTION_EXPIRED",
  INTERACTION_UNKNOWN: "INTERACTION_UNKNOWN",
  GUILD_ONLY: "GUILD_ONLY",
  DIRECT_MESSAGE_ONLY: "DIRECT_MESSAGE_ONLY",
  MISSING_PERMISSION: "MISSING_PERMISSION",
  MISSING_BOT_PERMISSION: "MISSING_BOT_PERMISSION",
  BUSINESS_POLICY_DENIED: "BUSINESS_POLICY_DENIED",
  COOLDOWN: "COOLDOWN",
  DEPLOY_APPLICATION_MISMATCH: "DEPLOY_APPLICATION_MISMATCH",
  DEPLOY_SCOPE_INVALID: "DEPLOY_SCOPE_INVALID",
  VOICE_DISABLED: "VOICE_DISABLED",
  VOICE_NOT_CONFIGURED: "VOICE_NOT_CONFIGURED",
  VOICE_WRONG_GUILD: "VOICE_WRONG_GUILD",
  VOICE_CHANNEL_INVALID: "VOICE_CHANNEL_INVALID",
  VOICE_MISSING_PERMISSION: "VOICE_MISSING_PERMISSION",
  VOICE_UNAVAILABLE: "VOICE_UNAVAILABLE",
});

/** Generic message shown when the error is not meant to be read by a user. */
export const GENERIC_USER_MESSAGE = "Une erreur est survenue pendant l'exécution de la commande.";

export class AstronError extends Error {
  /**
   * @param {string} message Internal, technical message (logged).
   * @param {object} [options]
   * @param {string} [options.code] Stable machine-readable code.
   * @param {string} [options.userMessage] Message safe to show to a Discord user.
   * @param {boolean} [options.expected] Whether the failure is an intended refusal.
   * @param {unknown} [options.cause] Underlying error.
   * @param {object} [options.meta] Extra structured log context (never secrets).
   */
  constructor(message, { code, userMessage, expected = false, cause, meta } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = new.target.name;
    this.code = code;
    this.userMessage = userMessage;
    this.expected = expected;
    this.meta = meta;
  }
}

export class ConfigurationError extends AstronError {
  constructor(message, options = {}) {
    super(message, { code: ERROR_CODES.CONFIGURATION_INVALID, expected: true, ...options });
  }
}

export class UserInputError extends AstronError {
  constructor(message, options = {}) {
    super(message, { code: ERROR_CODES.COMMAND_INVALID, expected: true, ...options });
  }
}

export class PermissionError extends AstronError {
  constructor(message, options = {}) {
    super(message, { code: ERROR_CODES.MISSING_PERMISSION, expected: true, ...options });
  }
}

export class NotFoundError extends AstronError {
  constructor(message, options = {}) {
    super(message, { code: ERROR_CODES.INTERACTION_UNKNOWN, expected: true, ...options });
  }
}

export class InteractionExpiredError extends AstronError {
  constructor(message = "Cette interaction a expiré et ne peut plus être utilisée.", options = {}) {
    super(message, {
      code: ERROR_CODES.INTERACTION_EXPIRED,
      expected: true,
      userMessage: message,
      ...options,
    });
  }
}

export function isAstronError(error) {
  return error instanceof AstronError;
}

/** Turn any thrown value into a stable, loggable shape. */
export function normalizeError(error) {
  if (error instanceof AstronError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      expected: error.expected,
      userMessage: error.userMessage,
      meta: error.meta,
      cause: error.cause,
      stack: error.stack,
    };
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      expected: false,
      userMessage: undefined,
      stack: error.stack,
      cause: error.cause,
    };
  }

  return {
    name: "NonError",
    message: String(error),
    expected: false,
  };
}

/** Only an expected refusal may show its own text to the user. */
export function userMessageFor(error, fallback = GENERIC_USER_MESSAGE) {
  const normalized = normalizeError(error);
  return normalized.expected && normalized.userMessage ? normalized.userMessage : fallback;
}

export function isExpected(error) {
  return normalizeError(error).expected === true;
}
