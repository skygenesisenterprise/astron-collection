/**
 * Discord gateway event → audit entry.
 *
 * Pure functions over discord.js shapes: no database, no client, no side effect.
 * A missing field degrades to `null`; a projection never throws because an
 * audit bot must not lose the rest of its log for one malformed event.
 */

const MAX_SUMMARY = 500;
const MAX_PAYLOAD_TEXT = 1500;

function text(value, max = MAX_PAYLOAD_TEXT) {
  if (typeof value !== "string") return null;
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

function userName(user) {
  return user?.tag ?? user?.username ?? user?.id ?? "unknown";
}

function base(kind, payload = {}) {
  return { category: kind, payload };
}

const PROJECTORS = {
  messageDelete(message) {
    return {
      ...base("messages", {
        messageId: message.id,
        authorId: message.author?.id ?? null,
        authorTag: userName(message.author),
        content: text(message.content),
        attachments: message.attachments?.size ?? 0,
      }),
      eventType: "message.delete",
      actorId: message.author?.id ?? null,
      targetId: null,
      channelId: message.channelId ?? null,
      summary: `Message from ${userName(message.author)} deleted in #${message.channel?.name ?? "unknown"}`,
      occurredAt: new Date().toISOString(),
    };
  },

  messageDeleteBulk(messages, channel) {
    const list = messages?.values ? [...messages.values()] : [];
    return {
      ...base("messages", {
        messageIds: list.slice(0, 100).map((message) => message.id),
        count: list.length,
      }),
      eventType: "message.bulk_delete",
      actorId: null,
      targetId: null,
      channelId: channel?.id ?? null,
      summary: `${list.length} messages bulk-deleted in #${channel?.name ?? "unknown"}`,
      occurredAt: new Date().toISOString(),
    };
  },

  messageUpdate(oldMessage, newMessage) {
    if (oldMessage.content === newMessage.content) return null;
    return {
      ...base("messages", {
        messageId: newMessage.id,
        before: text(oldMessage.content),
        after: text(newMessage.content),
      }),
      eventType: "message.update",
      actorId: newMessage.author?.id ?? null,
      targetId: null,
      channelId: newMessage.channelId ?? null,
      summary: `Message from ${userName(newMessage.author)} edited in #${newMessage.channel?.name ?? "unknown"}`,
      occurredAt: new Date().toISOString(),
    };
  },

  guildMemberAdd(member) {
    return {
      ...base("members", {
        userId: member.id,
        userTag: userName(member.user),
        accountCreatedAt: member.user?.createdAt?.toISOString?.() ?? null,
        memberCount: member.guild?.memberCount ?? null,
      }),
      eventType: "member.join",
      actorId: member.id,
      targetId: member.id,
      channelId: null,
      summary: `${userName(member.user)} joined the server`,
      occurredAt: new Date().toISOString(),
    };
  },

  guildMemberRemove(member) {
    return {
      ...base("members", {
        userId: member.id,
        userTag: userName(member.user),
        joinedAt: member.joinedAt?.toISOString?.() ?? null,
      }),
      eventType: "member.leave",
      actorId: member.id,
      targetId: member.id,
      channelId: null,
      summary: `${userName(member.user)} left the server`,
      occurredAt: new Date().toISOString(),
    };
  },

  guildMemberUpdate(oldMember, newMember) {
    const added = newMember.roles.cache.filter((role) => !oldMember.roles.cache.has(role.id));
    const removed = oldMember.roles.cache.filter((role) => !newMember.roles.cache.has(role.id));
    if (added.size === 0 && removed.size === 0 && oldMember.nickname === newMember.nickname) return null;

    return {
      ...base("members", {
        userId: newMember.id,
        nicknameBefore: oldMember.nickname ?? null,
        nicknameAfter: newMember.nickname ?? null,
        rolesAdded: [...added.values()].map((role) => role.name),
        rolesRemoved: [...removed.values()].map((role) => role.name),
      }),
      eventType: "member.update",
      actorId: null,
      targetId: newMember.id,
      channelId: null,
      summary: `Member ${userName(newMember.user)} updated`,
      occurredAt: new Date().toISOString(),
    };
  },

  guildBanAdd(ban) {
    return {
      ...base("moderation", {
        userId: ban.user?.id ?? null,
        userTag: userName(ban.user),
        reason: text(ban.reason),
      }),
      eventType: "member.ban",
      actorId: null,
      targetId: ban.user?.id ?? null,
      channelId: null,
      summary: `${userName(ban.user)} was banned`,
      occurredAt: new Date().toISOString(),
    };
  },

  guildBanRemove(ban) {
    return {
      ...base("moderation", { userId: ban.user?.id ?? null, userTag: userName(ban.user) }),
      eventType: "member.unban",
      actorId: null,
      targetId: ban.user?.id ?? null,
      channelId: null,
      summary: `${userName(ban.user)} was unbanned`,
      occurredAt: new Date().toISOString(),
    };
  },

  channelCreate(channel) {
    return {
      ...base("channels", { channelId: channel.id, name: channel.name, type: channel.type }),
      eventType: "channel.create",
      actorId: null,
      targetId: null,
      channelId: channel.id,
      summary: `Channel #${channel.name ?? channel.id} created`,
      occurredAt: new Date().toISOString(),
    };
  },

  channelDelete(channel) {
    return {
      ...base("channels", { channelId: channel.id, name: channel.name, type: channel.type }),
      eventType: "channel.delete",
      actorId: null,
      targetId: null,
      channelId: channel.id,
      summary: `Channel #${channel.name ?? channel.id} deleted`,
      occurredAt: new Date().toISOString(),
    };
  },

  channelUpdate(oldChannel, newChannel) {
    if (oldChannel.name === newChannel.name) return null;
    return {
      ...base("channels", {
        channelId: newChannel.id,
        nameBefore: oldChannel.name,
        nameAfter: newChannel.name,
      }),
      eventType: "channel.update",
      actorId: null,
      targetId: null,
      channelId: newChannel.id,
      summary: `Channel #${oldChannel.name} renamed to #${newChannel.name}`,
      occurredAt: new Date().toISOString(),
    };
  },

  roleCreate(role) {
    return {
      ...base("roles", { roleId: role.id, name: role.name, color: role.hexColor ?? null }),
      eventType: "role.create",
      actorId: null,
      targetId: null,
      channelId: null,
      summary: `Role ${role.name} created`,
      occurredAt: new Date().toISOString(),
    };
  },

  roleDelete(role) {
    return {
      ...base("roles", { roleId: role.id, name: role.name }),
      eventType: "role.delete",
      actorId: null,
      targetId: null,
      channelId: null,
      summary: `Role ${role.name} deleted`,
      occurredAt: new Date().toISOString(),
    };
  },

  roleUpdate(oldRole, newRole) {
    if (oldRole.name === newRole.name && oldRole.hexColor === newRole.hexColor) return null;
    return {
      ...base("roles", {
        roleId: newRole.id,
        nameBefore: oldRole.name,
        nameAfter: newRole.name,
        colorBefore: oldRole.hexColor ?? null,
        colorAfter: newRole.hexColor ?? null,
      }),
      eventType: "role.update",
      actorId: null,
      targetId: null,
      channelId: null,
      summary: `Role ${newRole.name} updated`,
      occurredAt: new Date().toISOString(),
    };
  },
};

export const PROJECTED_EVENTS = Object.freeze(Object.keys(PROJECTORS));

export function projectDiscordEvent(eventName, args = []) {
  const projector = PROJECTORS[eventName];
  if (!projector) return null;
  try {
    const entry = projector(...args);
    if (!entry) return null;
    return {
      ...entry,
      guildId: args[0]?.guild?.id ?? args[0]?.guildId ?? args[1]?.guild?.id ?? null,
      summary: text(entry.summary, MAX_SUMMARY),
    };
  } catch {
    return null;
  }
}
