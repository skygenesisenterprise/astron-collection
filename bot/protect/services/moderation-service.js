/**
 * Moderation actions.
 *
 * Every member-targeted action checks role hierarchy before touching Discord and
 * records a case afterwards. Discord permissions are necessary but not
 * sufficient: a moderator cannot punish an equal or higher role, the guild owner,
 * themselves or the bot.
 */

import {
  AstronError,
  PermissionError,
  UserInputError,
  checkModerationHierarchy,
} from "../../../packages/discord-framework/src/index.js";

const MAX_TIMEOUT_SECONDS = 28 * 24 * 60 * 60;

export function createModerationService({ cases, quarantine, settings, logger, metrics }) {
  async function memberOf(interaction, userId) {
    return interaction.guild.members.fetch(userId).catch(() => null);
  }

  function assertHierarchy(interaction, member) {
    const result = checkModerationHierarchy({
      guild: interaction.guild,
      moderator: interaction.member,
      target: member,
      bot: interaction.guild.members.me,
    });
    if (!result.ok) {
      throw new AstronError(result.reason, {
        code: result.code,
        expected: true,
        userMessage: result.reason,
      });
    }
  }

  function assertBotPermission(interaction, permission) {
    if (!interaction.guild.members.me?.permissions.has(permission)) {
      throw new PermissionError(`Missing bot permission ${permission}`, {
        userMessage: `Je n'ai pas la permission requise (${permission}).`,
      });
    }
  }

  function actor(interaction) {
    return {
      moderatorId: interaction.user.id,
      moderatorTag: interaction.user.tag,
    };
  }

  async function notify(user, { title, description, fields = [] }) {
    try {
      await user.send({
        embeds: [{ color: 0xe74c3c, title, description, fields, timestamp: new Date().toISOString() }],
      });
    } catch {
      // Closed DMs are normal; the case is the source of truth.
    }
  }

  function effectiveReason(value) {
    const reason = typeof value === "string" ? value.trim() : "";
    return reason || "Aucune raison fournie";
  }

  async function warn(interaction, { user, reason }) {
    assertBotPermission(interaction, "ModerateMembers");
    const member = await memberOf(interaction, user.id);
    if (member) assertHierarchy(interaction, member);

    const record = cases.create({
      guildId: interaction.guildId,
      action: "warn",
      targetId: user.id,
      targetTag: user.tag,
      ...actor(interaction),
      reason: effectiveReason(reason),
    });

    if (settings.get(interaction.guildId, "dmOnPunishment")) {
      await notify(user, {
        title: `Avertissement — ${interaction.guild.name}`,
        description: effectiveReason(reason),
        fields: [{ name: "Case", value: `#${record.case_number}`, inline: true }],
      });
    }

    metrics.inc("moderation_actions_total", { action: "warn" });
    return record;
  }

  async function kick(interaction, { user, reason }) {
    assertBotPermission(interaction, "KickMembers");
    const member = await memberOf(interaction, user.id);
    if (!member) {
      throw new UserInputError("Target is not a member.", {
        userMessage: "Ce membre n'est pas dans le serveur.",
      });
    }
    assertHierarchy(interaction, member);

    const finalReason = effectiveReason(reason);
    await member.kick(finalReason);

    const record = cases.create({
      guildId: interaction.guildId,
      action: "kick",
      targetId: user.id,
      targetTag: user.tag,
      ...actor(interaction),
      reason: finalReason,
    });

    if (settings.get(interaction.guildId, "dmOnPunishment")) {
      await notify(user, {
        title: `Expulsion — ${interaction.guild.name}`,
        description: finalReason,
        fields: [{ name: "Case", value: `#${record.case_number}`, inline: true }],
      });
    }

    metrics.inc("moderation_actions_total", { action: "kick" });
    return record;
  }

  async function ban(interaction, { user, reason, deleteDays = 0 }) {
    assertBotPermission(interaction, "BanMembers");
    const member = await memberOf(interaction, user.id);
    if (member) assertHierarchy(interaction, member);

    const finalReason = effectiveReason(reason);
    await interaction.guild.members.ban(user.id, {
      reason: finalReason,
      deleteMessageSeconds: Math.max(0, Math.min(Number(deleteDays) || 0, 7)) * 86_400,
    });

    const record = cases.create({
      guildId: interaction.guildId,
      action: "ban",
      targetId: user.id,
      targetTag: user.tag,
      ...actor(interaction),
      reason: finalReason,
    });

    if (settings.get(interaction.guildId, "dmOnPunishment")) {
      await notify(user, {
        title: `Bannissement — ${interaction.guild.name}`,
        description: finalReason,
        fields: [{ name: "Case", value: `#${record.case_number}`, inline: true }],
      });
    }

    metrics.inc("moderation_actions_total", { action: "ban" });
    return record;
  }

  async function unban(interaction, { userId, reason }) {
    assertBotPermission(interaction, "BanMembers");
    if (!/^\d{17,20}$/.test(userId)) {
      throw new UserInputError("Invalid user id.", { userMessage: "Identifiant utilisateur invalide." });
    }

    const finalReason = effectiveReason(reason);
    await interaction.guild.bans.remove(userId, finalReason).catch((error) => {
      throw new UserInputError(error.message, {
        userMessage: "Cet utilisateur n'est pas banni (ou introuvable).",
      });
    });

    const record = cases.create({
      guildId: interaction.guildId,
      action: "unban",
      targetId: userId,
      targetTag: null,
      ...actor(interaction),
      reason: finalReason,
    });

    metrics.inc("moderation_actions_total", { action: "unban" });
    return record;
  }

  async function timeout(interaction, { user, durationSeconds, reason }) {
    assertBotPermission(interaction, "ModerateMembers");
    const member = await memberOf(interaction, user.id);
    if (!member) {
      throw new UserInputError("Target is not a member.", {
        userMessage: "Ce membre n'est pas dans le serveur.",
      });
    }
    assertHierarchy(interaction, member);

    const seconds = Math.max(60, Math.min(Number(durationSeconds) || 600, MAX_TIMEOUT_SECONDS));
    const finalReason = effectiveReason(reason);
    await member.timeout(seconds * 1000, finalReason);

    const record = cases.create({
      guildId: interaction.guildId,
      action: "timeout",
      targetId: user.id,
      targetTag: user.tag,
      ...actor(interaction),
      reason: finalReason,
      durationSeconds: seconds,
    });

    if (settings.get(interaction.guildId, "dmOnPunishment")) {
      await notify(user, {
        title: `Exclusion temporaire — ${interaction.guild.name}`,
        description: finalReason,
        fields: [
          { name: "Duration", value: `${seconds}s`, inline: true },
          { name: "Case", value: `#${record.case_number}`, inline: true },
        ],
      });
    }

    metrics.inc("moderation_actions_total", { action: "timeout" });
    return record;
  }

  async function untimeout(interaction, { user, reason }) {
    assertBotPermission(interaction, "ModerateMembers");
    const member = await memberOf(interaction, user.id);
    if (!member) {
      throw new UserInputError("Target is not a member.", {
        userMessage: "Ce membre n'est pas dans le serveur.",
      });
    }
    assertHierarchy(interaction, member);

    await member.timeout(null, effectiveReason(reason));
    const record = cases.create({
      guildId: interaction.guildId,
      action: "untimeout",
      targetId: user.id,
      targetTag: user.tag,
      ...actor(interaction),
      reason: effectiveReason(reason),
    });

    metrics.inc("moderation_actions_total", { action: "untimeout" });
    return record;
  }

  async function quarantineMember(interaction, { user, reason }) {
    assertBotPermission(interaction, "ManageRoles");
    const member = await memberOf(interaction, user.id);
    if (!member) {
      throw new UserInputError("Target is not a member.", {
        userMessage: "Ce membre n'est pas dans le serveur.",
      });
    }
    assertHierarchy(interaction, member);

    const count = await quarantine.apply({
      guild: interaction.guild,
      member,
      reason: effectiveReason(reason),
      actorId: interaction.user.id,
    });

    const record = cases.create({
      guildId: interaction.guildId,
      action: "quarantine",
      targetId: user.id,
      targetTag: user.tag,
      ...actor(interaction),
      reason: effectiveReason(reason),
    });

    metrics.inc("moderation_actions_total", { action: "quarantine" });
    return { record, removedRoles: count };
  }

  async function releaseMember(interaction, { user, reason }) {
    assertBotPermission(interaction, "ManageRoles");
    const member = await memberOf(interaction, user.id);
    if (!member) {
      throw new UserInputError("Target is not a member.", {
        userMessage: "Ce membre n'est pas dans le serveur.",
      });
    }

    const restored = await quarantine.release({
      guild: interaction.guild,
      member,
      reason: effectiveReason(reason),
      actorId: interaction.user.id,
    });

    const record = cases.create({
      guildId: interaction.guildId,
      action: "release",
      targetId: user.id,
      targetTag: user.tag,
      ...actor(interaction),
      reason: effectiveReason(reason),
    });

    metrics.inc("moderation_actions_total", { action: "release" });
    return { record, restoredRoles: restored };
  }

  async function purge(interaction, { count, user = null, contains = null }) {
    assertBotPermission(interaction, "ManageMessages");

    const fetched = await interaction.channel.messages.fetch({ limit: Math.min(count + 20, 100) });
    const now = Date.now();
    const matches = fetched.filter((message) => {
      if (now - message.createdTimestamp > 13 * 86_400_000) return false;
      if (user && message.author.id !== user.id) return false;
      if (contains && !message.content.toLowerCase().includes(contains.toLowerCase())) return false;
      return true;
    });

    const selected = [...matches.values()].slice(0, count);
    const deleted = await interaction.channel.bulkDelete(selected, true);

    const record = cases.create({
      guildId: interaction.guildId,
      action: "purge",
      targetId: interaction.channelId,
      targetTag: interaction.channel?.name ?? null,
      ...actor(interaction),
      reason: effectiveReason(
        `Purge de ${deleted.size} message(s)${user ? ` de ${user.tag}` : ""}${contains ? ` contenant "${contains}"` : ""}`,
      ),
    });

    metrics.inc("moderation_actions_total", { action: "purge" });
    return { record, deleted: deleted.size };
  }

  async function slowmode(interaction, { seconds, channel = null }) {
    assertBotPermission(interaction, "ManageChannels");
    const target = channel ?? interaction.channel;
    await target.setRateLimitPerUser(Math.max(0, Math.min(Number(seconds) || 0, 21_600)), `Slowmode by ${interaction.user.tag}`);

    const record = cases.create({
      guildId: interaction.guildId,
      action: "slowmode",
      targetId: target.id,
      targetTag: target.name ?? null,
      ...actor(interaction),
      reason: effectiveReason(`Mode lent réglé à ${seconds}s`),
    });

    metrics.inc("moderation_actions_total", { action: "slowmode" });
    return { record, seconds };
  }

  async function setLocked(interaction, { locked, channel = null, reason }) {
    assertBotPermission(interaction, "ManageChannels");
    const target = channel ?? interaction.channel;

    await target.permissionOverwrites.edit(
      interaction.guild.roles.everyone,
      { SendMessages: !locked },
      { reason: effectiveReason(reason) },
    );

    const action = locked ? "lock" : "unlock";
    const record = cases.create({
      guildId: interaction.guildId,
      action,
      targetId: target.id,
      targetTag: target.name ?? null,
      ...actor(interaction),
      reason: effectiveReason(reason),
    });

    metrics.inc("moderation_actions_total", { action });
    return record;
  }

  return {
    warn,
    kick,
    ban,
    unban,
    timeout,
    untimeout,
    quarantine: quarantineMember,
    release: releaseMember,
    purge,
    slowmode,
    setLocked,
    warnings: (guildId, userId) => cases.warnings(guildId, userId),
    closeWarnings: (interaction, user) => {
      const open = cases.warnings(interaction.guildId, user.id);
      for (const warning of open) {
        cases.update({
          guildId: interaction.guildId,
          caseNumber: warning.case_number,
          status: "closed",
          note: `Warning cleared by ${interaction.user.tag}`,
          updatedBy: interaction.user.id,
        });
      }
      return open.length;
    },
  };
}
