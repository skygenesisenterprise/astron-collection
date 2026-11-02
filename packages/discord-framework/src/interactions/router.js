/**
 * Interaction router.
 *
 * One entry point for every supported interaction type, but no monolith: the
 * router only resolves, authorizes and dispatches. The behaviour lives in the
 * bot's command and component handlers.
 *
 * Any failure — thrown handler, unknown command, malformed or expired custom id,
 * unreachable Discord — is contained here and never reaches the process.
 */

import { createCooldownStore } from "../cooldown.js";
import {
  ERROR_CODES,
  AstronError,
  InteractionExpiredError,
  normalizeError,
  userMessageFor,
} from "../errors.js";
import { checkAvailability, checkCommandPermissions } from "../permissions.js";
import { CUSTOM_ID_VERSION, parseCustomId } from "./custom-id.js";

/** `MessageFlags.Ephemeral` without importing discord.js. */
export const EPHEMERAL = 64;

export function describeInteraction(interaction) {
  if (interaction?.isChatInputCommand?.()) return `/${interaction.commandName}`;
  if (interaction?.isUserContextMenuCommand?.() || interaction?.isMessageContextMenuCommand?.()) {
    return `menu:${interaction.commandName}`;
  }
  if (interaction?.customId) return `component:${interaction.customId}`;
  return `interaction:${interaction?.type ?? "unknown"}`;
}

async function defaultRespond(interaction, payload) {
  if (interaction.deferred || interaction.replied) {
    return interaction.followUp(payload);
  }
  return interaction.reply(payload);
}

function isComponentKind(interaction) {
  if (interaction?.isButton?.()) return "button";
  if (interaction?.isAnySelectMenu?.() || interaction?.isStringSelectMenu?.()) return "select";
  if (interaction?.isModalSubmit?.()) return "modal";
  return null;
}

/**
 * @param {object} options
 * @param {string} options.bot
 * @param {object} options.commands Command registry (per bot).
 * @param {object} [options.components] Component registry (per bot).
 * @param {object} options.logger
 * @param {(input: {command: object, interaction: any}) => unknown} [options.policy] Bot business policy.
 * @param {object} [options.cooldowns] Injectable cooldown store.
 * @param {object} [options.services] Bot services handed to handlers.
 */
export function createInteractionRouter({
  bot,
  commands,
  components,
  logger,
  policy,
  cooldowns = createCooldownStore(),
  services = {},
  respond = defaultRespond,
} = {}) {
  if (!bot) throw new Error("createInteractionRouter requires the bot name.");
  if (!commands) throw new Error("createInteractionRouter requires a command registry.");

  async function respondEmpty(interaction) {
    try {
      await interaction.respond?.([]);
    } catch (error) {
      logger?.debug("could not answer autocomplete", { err: error });
    }
  }

  async function reply(interaction, content) {
    try {
      await respond(interaction, { content, flags: EPHEMERAL });
      return true;
    } catch (error) {
      logger?.debug("could not answer interaction", { interaction: describeInteraction(interaction), err: error });
      return false;
    }
  }

  async function handleCommand(interaction) {
    const type = interaction.isUserContextMenuCommand?.()
      ? 2
      : interaction.isMessageContextMenuCommand?.()
        ? 3
        : 1;
    const command = commands.get(interaction.commandName, type);

    if (!command) {
      logger?.warn("unknown command", { command: interaction.commandName, type });
      await reply(interaction, "Commande inconnue.");
      return { status: "unknown", reason: ERROR_CODES.INTERACTION_UNKNOWN };
    }

    const availability = checkAvailability({ command, interaction });
    if (!availability.ok) {
      logger?.warn("command refused: availability", {
        command: command.name,
        code: availability.code,
      });
      await reply(interaction, availability.reason);
      return { status: "denied", reason: availability.code };
    }

    const authorization = await checkCommandPermissions({ command, interaction, policy });
    if (!authorization.ok) {
      logger?.warn("command refused: permissions", {
        command: command.name,
        code: authorization.code,
        err: authorization.error,
      });
      await reply(interaction, authorization.reason);
      return { status: "denied", reason: authorization.code };
    }

    const cooldown = cooldowns.check(command, interaction);
    if (cooldown.limited) {
      const seconds = Math.ceil(cooldown.retryAfterMs / 1000);
      logger?.debug("command refused: cooldown", { command: command.name, seconds });
      await reply(interaction, `Veuillez patienter encore ${seconds}s avant de réutiliser cette commande.`);
      return { status: "cooldown", reason: ERROR_CODES.COOLDOWN };
    }

    await command.execute(interaction, { bot, logger, command, services });
    return { status: "executed", command: command.name };
  }

  async function handleAutocomplete(interaction) {
    const command = commands.get(interaction.commandName, 1);
    if (!command) {
      logger?.warn("autocomplete for unknown command", { command: interaction.commandName });
      await respondEmpty(interaction);
      return { status: "unknown" };
    }

    if (typeof command.autocomplete !== "function") {
      logger?.debug("autocomplete without handler", { command: command.name });
      await respondEmpty(interaction);
      return { status: "no-handler", command: command.name };
    }

    await command.autocomplete(interaction, { bot, logger, command, services });
    return { status: "dispatched", command: command.name };
  }

  async function handleComponent(interaction, kind) {
    const parsed = parseCustomId(interaction.customId);

    if (!parsed) {
      logger?.warn("malformed custom id", { kind, customId: interaction.customId });
      throw new InteractionExpiredError("Cette interaction n'est plus valide. Relancez la commande.");
    }

    if (parsed.version !== CUSTOM_ID_VERSION) {
      logger?.warn("outdated custom id", { kind, customId: interaction.customId, version: parsed.version });
      throw new InteractionExpiredError(
        "Cette interaction provient d'une ancienne version du bot. Relancez la commande.",
      );
    }

    const resolved = components?.resolve(kind, interaction.customId);
    if (!resolved) {
      logger?.warn("no handler for component", { kind, namespace: parsed.namespace });
      throw new InteractionExpiredError("Cette interaction n'est plus disponible. Relancez la commande.");
    }

    await resolved.handler(interaction, {
      bot,
      logger,
      kind,
      id: parsed,
      services,
    });
    return { status: "dispatched", kind, namespace: parsed.namespace };
  }

  async function handleError(error, interaction) {
    const normalized = normalizeError(error);

    if (normalized.expected) {
      logger?.warn("interaction refused", {
        interaction: describeInteraction(interaction),
        code: normalized.code,
        reason: normalized.message,
      });
    } else {
      logger?.error("interaction failed", {
        interaction: describeInteraction(interaction),
        err: error,
      });
    }

    await reply(interaction, userMessageFor(error));
    return { status: "error", reason: normalized.code };
  }

  async function handle(interaction) {
    try {
      if (interaction?.isChatInputCommand?.()) return await handleCommand(interaction);
      if (interaction?.isUserContextMenuCommand?.() || interaction?.isMessageContextMenuCommand?.()) {
        return await handleCommand(interaction);
      }
      if (interaction?.isAutocomplete?.()) return await handleAutocomplete(interaction);

      const kind = isComponentKind(interaction);
      if (kind) return await handleComponent(interaction, kind);

      logger?.warn("unsupported interaction", { interaction: describeInteraction(interaction) });
      return { status: "unsupported" };
    } catch (error) {
      return handleError(error, interaction);
    }
  }

  return { bot, handle, cooldowns, reply };
}

export { AstronError };
