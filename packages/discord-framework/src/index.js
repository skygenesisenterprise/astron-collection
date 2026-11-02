/**
 * @astron-collection/discord-framework
 *
 * Technical foundation shared by the Astron Collection Discord bots. Nothing in
 * this package knows about a specific bot: catalogues, services and business
 * rules stay in `bot/<name>/`.
 */

export {
  LOG_LEVELS,
  createLogger,
  isLogLevel,
  redact,
  scrubString,
  serializeError,
} from "./logger.js";

export {
  ERROR_CODES,
  GENERIC_USER_MESSAGE,
  AstronError,
  ConfigurationError,
  InteractionExpiredError,
  NotFoundError,
  PermissionError,
  UserInputError,
  isAstronError,
  isExpected,
  normalizeError,
  userMessageFor,
} from "./errors.js";

export {
  COMMAND_SCOPES,
  DEFAULT_COMMAND_SCOPE,
  OFFICIAL_PRESENCE_CHANNEL_ID,
  assertDiscordEnv,
  credentialEnvKeys,
  parseBoolean,
  parseBotConfig,
  resolveVoicePresenceConfig,
  toEnvPrefix,
} from "./config/env.js";
export { OFFICIAL_GUILD_ID, isSnowflake } from "./config/official.js";

export {
  COMMAND_TYPES,
  COMMAND_TYPE_NAMES,
  adaptLegacyCommand,
  createCommandDefinition,
  defineCommand,
  deriveAvailability,
  derivePermissions,
  validateCommand,
} from "./commands/contract.js";
export { createCommandRegistry } from "./commands/registry.js";
export { discoverModuleFiles, loadCommands, loadEvents } from "./commands/loader.js";

export {
  CUSTOM_ID_PREFIX,
  CUSTOM_ID_VERSION,
  CustomIdError,
  assertCustomId,
  encodeCustomId,
  isCustomIdFor,
  parseCustomId,
} from "./interactions/custom-id.js";
export { COMPONENT_KINDS, createComponentRegistry } from "./interactions/components.js";
export { EPHEMERAL, createInteractionRouter, describeInteraction } from "./interactions/router.js";

export { checkAvailability, checkCommandPermissions, assertAuthorized } from "./permissions.js";
export { createCooldownStore } from "./cooldown.js";

export {
  createBotRuntime,
  createDiscordClient,
  isRetryableNetworkError,
  keepAlive,
} from "./lifecycle.js";

export {
  DEPLOYMENT_SCOPES,
  applicationCommandsRoute,
  applicationGuildCommandsRoute,
  computeManifestHash,
  createRestClient,
  deployCommands,
  validateCatalogue,
} from "./deploy/commands.js";

export {
  VOICE_PRESENCE_STATUS,
  createVoiceAdapter,
  createVoicePresenceManager,
  createVoiceSessionCoordinator,
} from "./voice/index.js";
