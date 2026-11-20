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

function positionOf(member) {
  return Number(member?.roles?.highest?.position ?? member?.position ?? -1);
}

export function isGuildOwner({ userId, ownerId } = {}) {
  return Boolean(userId && ownerId && String(userId) === String(ownerId));
}

/**
 * Business-level moderation hierarchy, separate from Discord permissions.
 *
 * Discord lets a bot with Ban Members ban an administrator; every serious
 * moderation bot still refuses. The check is fail-closed: an unreadable
 * position denies.
 *
 * @param {object} input
 * @param {{ownerId?: string}} [input.guild]
 * @param {{id?: string, roles?: {highest?: {position?: number}}}} [input.moderator]
 * @param {{id?: string, roles?: {highest?: {position?: number}}}} [input.target]
 * @param {{id?: string, roles?: {highest?: {position?: number}}}} [input.bot]
 * @returns {{ok: boolean, code?: string, reason?: string}}
 */
export function checkModerationHierarchy({ guild = {}, moderator, target, bot } = {}) {
  const ownerId = guild.ownerId ?? guild.owner?.id ?? null;
  const moderatorId = moderator?.id ?? moderator?.user?.id ?? null;
  const targetId = target?.id ?? target?.user?.id ?? null;
  const botId = bot?.id ?? guild.members?.me?.id ?? null;

  if (!targetId) {
    return {
      ok: false,
      code: ERROR_CODES.MODERATION_HIERARCHY,
      reason: "Le membre cible est introuvable.",
    };
  }

  if (moderatorId && targetId === moderatorId) {
    return {
      ok: false,
      code: ERROR_CODES.MODERATION_SELF,
      reason: "Vous ne pouvez pas vous sanctionner vous-même.",
    };
  }

  if (botId && targetId === botId) {
    return {
      ok: false,
      code: ERROR_CODES.MODERATION_SELF,
      reason: "Je ne peux pas me sanctionner moi-même.",
    };
  }

  if (ownerId && targetId === ownerId) {
    return {
      ok: false,
      code: ERROR_CODES.MODERATION_OWNER,
      reason: "Le propriétaire du serveur ne peut pas être sanctionné.",
    };
  }

  const targetPosition = positionOf(target);
  const moderatorPosition = positionOf(moderator);
  const botPosition = positionOf(bot ?? guild.members?.me);
  const moderatorIsOwner = Boolean(ownerId && moderatorId === ownerId);

  if (!moderatorIsOwner && moderatorPosition <= targetPosition) {
    return {
      ok: false,
      code: ERROR_CODES.MODERATION_HIERARCHY,
      reason: "Votre rôle n'est pas au-dessus de celui de ce membre.",
    };
  }

  if (botPosition <= targetPosition) {
    return {
      ok: false,
      code: ERROR_CODES.MODERATION_BOT_HIERARCHY,
      reason: "Mon rôle n'est pas au-dessus de celui de ce membre.",
    };
  }

  return { ok: true };
}

/** Permissions each feature needs, for `/security audit` and diagnostics. */
export const FEATURE_PERMISSIONS = Object.freeze({
  general: ["ViewChannel", "SendMessages", "EmbedLinks"],
  moderation: [
    "ViewChannel",
    "SendMessages",
    "EmbedLinks",
    "ModerateMembers",
    "KickMembers",
    "BanMembers",
    "ManageMessages",
  ],
  logging: ["ViewChannel", "SendMessages", "EmbedLinks", "ReadMessageHistory", "ViewAuditLog"],
  community: ["ViewChannel", "SendMessages", "EmbedLinks", "ManageRoles", "AddReactions"],
  automations: ["ViewChannel", "SendMessages", "EmbedLinks", "ManageRoles", "ModerateMembers"],
  player: ["ViewChannel", "Connect", "Speak", "UseVAD"],
});

export const DANGEROUS_PERMISSIONS = Object.freeze([
  { permission: "Administrator", severity: "critical" },
  { permission: "ManageGuild", severity: "high" },
  { permission: "ManageRoles", severity: "high" },
  { permission: "ManageChannels", severity: "medium" },
  { permission: "ManageWebhooks", severity: "medium" },
  { permission: "BanMembers", severity: "medium" },
  { permission: "KickMembers", severity: "medium" },
  { permission: "MentionEveryone", severity: "low" },
]);

/** Report the permissions a bot is missing for the features it runs. */
export function auditBotPermissions({ me, features = Object.keys(FEATURE_PERMISSIONS) } = {}) {
  const missing = {};

  for (const feature of features) {
    const required = FEATURE_PERMISSIONS[feature] ?? [];
    const lacking = required.filter((permission) => !hasPermissions(me?.permissions, [permission]));
    if (lacking.length > 0) missing[feature] = lacking;
  }

  return { ok: Object.keys(missing).length === 0, missing, checked: [...features] };
}

/** Non-authoritative security observations an operator should review. */
export function securityFindings({ guild = {}, me } = {}) {
  const findings = [];
  const permissions = me?.permissions;

  if (hasPermissions(permissions, ["Administrator"])) {
    findings.push({
      code: "BOT_ADMINISTRATOR",
      severity: "critical",
      detail: "The bot has Administrator. Grant only the permissions its features need.",
    });
  }

  for (const entry of DANGEROUS_PERMISSIONS) {
    if (entry.permission === "Administrator") continue;
    if (hasPermissions(permissions, [entry.permission])) {
      findings.push({
        code: `BOT_${entry.permission.toUpperCase()}`,
        severity: entry.severity,
        detail: `The bot holds ${entry.permission}; confirm this is required.`,
      });
    }
  }

  if (guild?.mfaLevel === 0) {
    findings.push({
      code: "GUILD_MFA_DISABLED",
      severity: "medium",
      detail: "Two-factor authentication is not required for moderation actions.",
    });
  }

  if (guild?.verificationLevel === 0) {
    findings.push({
      code: "GUILD_VERIFICATION_NONE",
      severity: "low",
      detail: "The guild has no membership verification level.",
    });
  }

  return findings;
}
