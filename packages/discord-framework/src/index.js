/**
 * @astron-collection/discord-framework
 *
 * The single shared technical foundation of the six Astron Collection Discord
 * bots. Nothing in this package knows about a specific bot: catalogues,
 * services, repositories and business rules stay in `bot/<name>/`.
 *
 * `./ui` is intentionally not re-exported here: it imports discord.js, and the
 * framework core must stay importable by tests and tooling without the Discord
 * library installed.
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

export {
  assertAuthorized,
  auditBotPermissions,
  checkAvailability,
  checkCommandPermissions,
  checkModerationHierarchy,
  isGuildOwner,
  securityFindings,
} from "./permissions.js";
export { createCooldownStore } from "./cooldown.js";

export {
  createBotRuntime,
  createDiscordClient,
  isRetryableNetworkError,
  keepAlive,
} from "./lifecycle.js";
export { startBot } from "./bootstrap.js";

export {
  DEPLOYMENT_SCOPES,
  applicationCommandsRoute,
  applicationGuildCommandsRoute,
  computeManifestHash,
  createRestClient,
  deployCommands,
  validateCatalogue,
} from "./deploy/commands.js";
export { runCommandDeployment } from "./deploy/cli.js";

export {
  BUILTIN_CATALOGS,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  createBotTranslator,
  createTranslator,
  descriptionLocalizations,
  interpolate,
  mergeCatalogs,
  normalizeLocale,
  resolveLocale,
} from "./localization/index.js";

export { createHealthServer, createMetrics } from "./observability/index.js";
export { createGuildMemberPresence } from "./presence.js";

export {
  DAY_MS,
  HOUR_MS,
  MINUTE_MS,
  MIGRATIONS_TABLE,
  boolToInt,
  createDatabase,
  createMemoryDatabase,
  daysFromNow,
  fromJson,
  intToBool,
  listMigrations,
  nowIso,
  paginate,
  runMigrations,
  toJson,
} from "./storage/index.js";

export {
  DEFAULT_HEALTH_PORT,
  assertConfigured,
  botCredentialVariables,
  createSettingsStore,
  defineConfigSchema,
  ensureSettingsSchema,
  loadConfig,
  runtimeVariables,
  toEnvPrefix as configEnvPrefix,
} from "./settings/index.js";

export {
  CONTRACT_VERSION,
  EVENT_CONTRACTS,
  EVENT_TYPES,
  SIGNATURE_HEADER,
  TIMESTAMP_HEADER,
  createCollectingSink,
  createEvent,
  createEventBus,
  createOutbox,
  createWebhookSink,
  ensureOutboxSchema,
  listContracts,
  signPayload,
  sortByOccurrence,
  validateEvent,
  validatePayload,
  verifySignature,
} from "./contracts/index.js";

export {
  COLORS,
  chunk,
  formatDuration,
  formatList,
  formatNumber,
  percent,
  progressBar,
  timestamp,
  truncate,
} from "./ui/format.js";

export {
  VOICE_PRESENCE_STATUS,
  createVoiceAdapter,
  createVoicePresenceManager,
  createVoiceSessionCoordinator,
} from "./voice/index.js";
