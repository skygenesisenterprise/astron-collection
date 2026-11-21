/**
 * Community engagement.
 *
 * Welcome/farewell templates, autoroles, birthdays, reminders and reaction-role
 * panels. Discord payloads are plain objects; the service never imports the
 * client, and every send is best-effort so a missing channel cannot break the
 * gateway handler.
 */

import { randomUUID } from "node:crypto";

import {
  EVENT_TYPES,
  NotFoundError,
  UserInputError,
  nowIso,
} from "@astron-collection/discord-framework";

const MAX_TEMPLATE = 1500;

export function renderTemplate(template, member) {
  return String(template)
    .replaceAll("{user}", `<@${member.id}>`)
    .replaceAll("{tag}", member.user?.tag ?? member.user?.username ?? "unknown")
    .replaceAll("{server}", member.guild?.name ?? "the server")
    .replaceAll("{count}", String(member.guild?.memberCount ?? 0))
    .slice(0, MAX_TEMPLATE);
}

export function nextBirthday(month, day, from = new Date()) {
  const year = from.getUTCFullYear();
  let date = new Date(Date.UTC(year, month - 1, day));
  const today = Date.UTC(year, from.getUTCMonth(), from.getUTCDate());
  if (date.getTime() < today) date = new Date(Date.UTC(year + 1, month - 1, day));
  return date;
}

export function createCommunityService({ repo, settings, outbox, logger, metrics, clock = () => new Date() }) {
  let client = null;

  function attachClient(discordClient) {
    client = discordClient;
  }

  function channelFor(guild, channelId) {
    if (!channelId) return null;
    return guild.channels?.cache?.get(channelId) ?? null;
  }

  async function send(channel, payload) {
    if (!channel?.send) return false;
    try {
      await channel.send(payload);
      return true;
    } catch (error) {
      logger.debug("community message failed", { channelId: channel.id, err: error });
      return false;
    }
  }

  async function onMemberJoin(member) {
    const guildId = member.guild.id;
    const config = settings.getAll(guildId);

    if (config.welcome.enabled) {
      const channel = channelFor(member.guild, config.welcome.channelId);
      await send(channel, {
        content: renderTemplate(config.welcome.message, member),
        allowedMentions: { users: [member.id], roles: [] },
      });
      metrics.inc("welcome_sent_total");
    }

    if (config.autorole.enabled && config.autorole.roleIds.length > 0) {
      const valid = config.autorole.roleIds.filter((roleId) => member.guild.roles.cache.has(roleId));
      if (valid.length > 0) {
        await member.roles.add(valid, "Autorole").catch((error) => {
          logger.warn("autorole failed", { guildId, userId: member.id, err: error });
        });
      }
    }

    outbox.enqueue(EVENT_TYPES.MEMBER_JOINED, {
      guildId,
      data: {
        userId: member.id,
        memberCount: member.guild.memberCount ?? 0,
        accountCreatedAt: member.user.createdAt.toISOString(),
      },
    });

    return { welcomed: config.welcome.enabled, autoroles: config.autorole.enabled };
  }

  async function onMemberLeave(member) {
    const guildId = member.guild.id;
    const config = settings.getAll(guildId);

    if (config.farewell.enabled) {
      const channel = channelFor(member.guild, config.farewell.channelId);
      await send(channel, {
        content: renderTemplate(config.farewell.message, member),
        allowedMentions: { parse: [] },
      });
      metrics.inc("farewell_sent_total");
    }

    outbox.enqueue(EVENT_TYPES.MEMBER_LEFT, {
      guildId,
      data: {
        userId: member.id,
        memberCount: member.guild.memberCount ?? 0,
        joinedAt: member.joinedAt?.toISOString?.() ?? null,
      },
    });
  }

  function setBirthday({ guildId, userId, month, day, year = null }) {
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new UserInputError("Invalid month.", { userMessage: "Le mois doit être compris entre 1 et 12." });
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      throw new UserInputError("Invalid day.", { userMessage: "Le jour doit être compris entre 1 et 31." });
    }
    repo.birthdaySet({ guildId, userId, month, day, year });
    return repo.birthdayList(guildId).find((entry) => entry.user_id === userId);
  }

  function removeBirthday(guildId, userId) {
    return repo.birthdayRemove(guildId, userId) > 0;
  }

  function birthdays(guildId) {
    return repo.birthdayList(guildId).map((entry) => ({
      ...entry,
      next: nextBirthday(entry.month, entry.day, clock()),
    }));
  }

  function upcomingBirthdays(guildId, limit = 5) {
    return birthdays(guildId)
      .sort((left, right) => left.next - right.next)
      .slice(0, limit);
  }

  async function announceBirthdays() {
    const today = clock();
    const month = today.getUTCMonth() + 1;
    const day = today.getUTCDate();
    const dayKey = today.toISOString().slice(0, 10);
    let announced = 0;

    for (const guildId of settings.list()) {
      const config = settings.getAll(guildId);
      if (!config.birthdayChannelId) continue;

      const entries = repo.birthdaysOn(guildId, month, day);
      if (entries.length === 0) continue;
      if (!repo.claimBirthdayAnnouncement(guildId, dayKey)) continue;

      const guild = client?.guilds?.cache?.get(guildId);
      const channel = guild ? channelFor(guild, config.birthdayChannelId) : null;
      if (!channel) continue;

      const mentions = entries.map((entry) => `<@${entry.user_id}>`).join(", ");
      await send(channel, {
        content: `🎂 Joyeux anniversaire ${mentions} !`,
        allowedMentions: { users: entries.map((entry) => entry.user_id) },
      });
      announced += entries.length;
    }

    return announced;
  }

  function addReminder({ guildId, userId, channelId, message, dueAt }) {
    const due = new Date(dueAt);
    if (Number.isNaN(due.getTime()) || due.getTime() <= clock().getTime()) {
      throw new UserInputError("Reminder must be in the future.", {
        userMessage: "La date du rappel doit être dans le futur.",
      });
    }
    const id = randomUUID();
    repo.reminderAdd({
      id,
      guildId,
      userId,
      channelId,
      message: String(message).slice(0, 1000),
      dueAt: due.toISOString(),
    });
    return repo.reminderList(guildId, userId).find((entry) => entry.id === id);
  }

  function listReminders(guildId, userId) {
    return repo.reminderList(guildId, userId);
  }

  function removeReminder(id, guildId, userId) {
    return repo.reminderRemove(id, guildId, userId) > 0;
  }

  async function deliverDueReminders() {
    const due = repo.remindersDue(nowIso(clock()));
    let delivered = 0;

    for (const reminder of due) {
      const guild = client?.guilds?.cache?.get(reminder.guild_id);
      const channel = guild ? channelFor(guild, reminder.channel_id) : null;
      if (channel) {
        await send(channel, {
          content: `⏰ <@${reminder.user_id}> — ${reminder.message}`,
          allowedMentions: { users: [reminder.user_id] },
        });
      }
      repo.reminderDelivered(reminder.id);
      delivered += 1;
    }

    return delivered;
  }

  async function createPanel({ guild, channel, title, options }) {
    if (!Array.isArray(options) || options.length === 0) {
      throw new UserInputError("Panel needs at least one option.", {
        userMessage: "Un panneau doit contenir au moins une option.",
      });
    }
    const id = randomUUID();
    repo.panelCreate({ id, guildId: guild.id, channelId: channel.id, messageId: null, title, options });
    return repo.panelGet(guild.id, id);
  }

  function panel(guildId, id) {
    return repo.panelGet(guildId, id);
  }

  function panels(guildId) {
    return repo.panelList(guildId);
  }

  function addPanelOption(guildId, id, option) {
    const existing = repo.panelGet(guildId, id);
    if (!existing) throw new NotFoundError("Panel not found.", { userMessage: "Panneau introuvable." });
    if (existing.options.length >= 25) {
      throw new UserInputError("Too many options.", { userMessage: "Un panneau est limité à 25 options." });
    }
    if (existing.options.some((entry) => entry.roleId === option.roleId)) {
      throw new UserInputError("Duplicate role.", { userMessage: "Ce rôle est déjà présent dans le panneau." });
    }
    const options = [...existing.options, option];
    repo.panelUpdate(id, guildId, options);
    return repo.panelGet(guildId, id);
  }

  function removePanelOption(guildId, id, roleId) {
    const existing = repo.panelGet(guildId, id);
    if (!existing) throw new NotFoundError("Panel not found.", { userMessage: "Panneau introuvable." });
    const options = existing.options.filter((entry) => entry.roleId !== roleId);
    repo.panelUpdate(id, guildId, options);
    return repo.panelGet(guildId, id);
  }

  function deletePanel(guildId, id) {
    return repo.panelDelete(id, guildId) > 0;
  }

  function setPanelMessage(guildId, id, messageId) {
    repo.panelSetMessage(id, guildId, messageId);
  }

  async function togglePanelRole({ guildId, member, panelId, roleId }) {
    const existing = repo.panelGet(guildId, panelId);
    if (!existing) throw new NotFoundError("Panel not found.", { userMessage: "Panneau introuvable." });

    const option = existing.options.find((entry) => entry.roleId === roleId);
    if (!option) throw new NotFoundError("Option not found.", { userMessage: "Option introuvable." });

    const role = guildId ? member.guild.roles.cache.get(roleId) : null;
    if (!role) throw new NotFoundError("Role not found.", { userMessage: "Rôle introuvable." });
    if (role.position >= member.guild.members.me.roles.highest.position) {
      throw new UserInputError("Role is above the bot.", {
        userMessage: "Ce rôle est au-dessus de mon rôle le plus haut.",
      });
    }

    const has = member.roles.cache.has(roleId);
    if (has) await member.roles.remove(roleId, `Reaction role: ${existing.title}`);
    else await member.roles.add(roleId, `Reaction role: ${existing.title}`);

    metrics.inc("reaction_role_toggles_total");
    return { added: !has, label: option.label, title: existing.title };
  }

  return {
    attachClient,
    renderTemplate,
    onMemberJoin,
    onMemberLeave,
    setBirthday,
    removeBirthday,
    birthdays,
    upcomingBirthdays,
    announceBirthdays,
    addReminder,
    listReminders,
    removeReminder,
    deliverDueReminders,
    createPanel,
    panel,
    panels,
    addPanelOption,
    removePanelOption,
    deletePanel,
    setPanelMessage,
    togglePanelRole,
  };
}
