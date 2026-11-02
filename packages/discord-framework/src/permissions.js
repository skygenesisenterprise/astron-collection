/**
 * Authorization checks.
 *
 * Four layers are kept distinct on purpose:
 *
 *   1. Discord permissions of the user  (native Discord)
 *   2. Discord permissions of the bot   (native Discord)
 *   3. Astron business rules            (per-guild roles, settings, offers)
 *   4. Registration-time declarations   (the command definition)
 *
 * Layer 4 only controls Discord's own visibility; it never replaces layers 1–3,
 * which are evaluated on every execution. Anything that fails or throws is a
 * denial: the check is fail-closed.
 */

import { ERROR_CODES, PermissionError } from "./errors.js";

function normalizeRequired(required) {
  return required.map((permission) =>
    typeof permission === "string" && /^\d+$/.test(permission) ? BigInt(permission) : permission,
  );
}

function hasPermissions(holder, required) {
  if (!required || required.length === 0) return true;
  if (!holder || typeof holder.has !== "function") return false;
  try {
    return holder.has(normalizeRequired(required));
  } catch {
    // An unusable holder or permission name is a denial, never an approval.
    return false;
  }
}

/**
 * @param {object} input
 * @param {object} input.command Normalized command.
 * @param {any} input.interaction Discord interaction.
 * @param {(input: {command: object, interaction: any}) => Promise<boolean|{ok: boolean, reason?: string}>|boolean|{ok: boolean, reason?: string}} [input.policy]
 *   Bot-owned business policy. Must return `true`/`{ok:true}` to allow; anything
 *   else, including a throw, denies.
 */
export async function checkCommandPermissions({ command, interaction, policy } = {}) {
  const userPermissions = interaction?.memberPermissions ?? interaction?.member?.permissions;
  const botPermissions = interaction?.guild?.members?.me?.permissions;

  if (!hasPermissions(userPermissions, command?.permissions?.user)) {
    return {
      ok: false,
      code: ERROR_CODES.MISSING_PERMISSION,
      reason: "L'utilisateur ne dispose pas des permissions Discord requises.",
    };
  }

  if (command?.permissions?.bot?.length) {
    if (!botPermissions) {
      return {
        ok: false,
        code: ERROR_CODES.MISSING_BOT_PERMISSION,
        reason: "Impossible de vérifier les permissions du bot.",
      };
    }
    if (!hasPermissions(botPermissions, command.permissions.bot)) {
      return {
        ok: false,
        code: ERROR_CODES.MISSING_BOT_PERMISSION,
        reason: "Je n'ai pas les permissions nécessaires pour exécuter cette commande.",
      };
    }
  }

  const businessPolicy = command?.permissions?.policy ?? policy;

  if (typeof businessPolicy === "function") {
    try {
      const result = await businessPolicy({ command, interaction });
      if (result === true) return { ok: true };
      if (result && typeof result === "object" && result.ok === true) return { ok: true };
      return {
        ok: false,
        code: ERROR_CODES.BUSINESS_POLICY_DENIED,
        reason: (result && typeof result === "object" && result.reason) || "Action non autorisée.",
      };
    } catch (error) {
      // Fail-closed: an authorization error is never an approval.
      return {
        ok: false,
        code: ERROR_CODES.BUSINESS_POLICY_DENIED,
        reason: "Action non autorisée.",
        error,
      };
    }
  }

  return { ok: true };
}

/** Availability check: guild-only / DM-only commands. */
export function checkAvailability({ command, interaction } = {}) {
  const inGuild = typeof interaction?.inGuild === "function" ? interaction.inGuild() : Boolean(interaction?.guildId);

  if (command?.availability?.guildOnly && !inGuild) {
    return {
      ok: false,
      code: ERROR_CODES.GUILD_ONLY,
      reason: "Cette commande doit être utilisée dans un serveur.",
    };
  }

  if (command?.availability?.dmOnly && inGuild) {
    return {
      ok: false,
      code: ERROR_CODES.DIRECT_MESSAGE_ONLY,
      reason: "Cette commande doit être utilisée en message privé.",
    };
  }

  return { ok: true };
}

/** Throw the normalized refusal, for callers that prefer exceptions. */
export function assertAuthorized(result, fallbackMessage = "Action non autorisée.") {
  if (!result?.ok) {
    throw new PermissionError(result?.reason ?? fallbackMessage, {
      code: result?.code ?? ERROR_CODES.MISSING_PERMISSION,
      userMessage: result?.reason ?? fallbackMessage,
      meta: { code: result?.code },
    });
  }
}
