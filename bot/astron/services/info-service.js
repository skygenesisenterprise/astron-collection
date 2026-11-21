/**
 * Information shaping for Astron.
 *
 * These functions return plain data, not Discord payloads, so they are testable
 * without the Discord client and reusable from slash commands and context menus.
 */

import { formatNumber, timestamp } from "@astron-collection/discord-framework/ui";

export function createInfoService({ bot, config }) {
  function guildInfo(guild) {
    const channels = guild.channels?.cache;
    const roles = guild.roles?.cache;
    const emojis = guild.emojis?.cache;

    return {
      name: guild.name,
      id: guild.id,
      owner: guild.ownerId ? `<@${guild.ownerId}>` : "—",
      createdAt: guild.createdAt,
      members: guild.memberCount ?? 0,
      channels: channels?.size ?? 0,
      textual: channels?.filter((channel) => channel.type === 0).size ?? 0,
      voice: channels?.filter((channel) => channel.type === 2).size ?? 0,
      roles: roles?.size ?? 0,
      emojis: emojis?.size ?? 0,
      boosts: guild.premiumSubscriptionCount ?? 0,
      tier: guild.premiumTier ?? 0,
      verification: guild.verificationLevel ?? 0,
      locale: guild.preferredLocale ?? "—",
    };
  }

  function userInfo(user, member = null) {
    return {
      tag: user.tag ?? user.username,
      id: user.id,
      bot: Boolean(user.bot),
      createdAt: user.createdAt,
      joinedAt: member?.joinedAt ?? null,
      nickname: member?.nickname ?? null,
      roles: member
        ? [...member.roles.cache.values()]
            .filter((role) => role.id !== (member.guild?.id ?? role.id))
            .sort((a, b) => b.position - a.position)
            .map((role) => role.name)
        : [],
      highestRole: member?.roles?.highest?.name ?? null,
      premiumSince: member?.premiumSince ?? null,
      avatar: user.displayAvatarURL?.({ size: 256, extension: "png" }) ?? null,
    };
  }

  function roleInfo(role) {
    return {
      name: role.name,
      id: role.id,
      color: role.hexColor,
      position: role.position,
      members: role.members?.size ?? 0,
      mentionable: Boolean(role.mentionable),
      managed: Boolean(role.managed),
      createdAt: role.createdAt,
      permissions: role.permissions?.toArray?.() ?? [],
    };
  }

  function channelInfo(channel) {
    return {
      name: channel.name,
      id: channel.id,
      type: channel.type,
      topic: channel.topic ?? null,
      nsfw: Boolean(channel.nsfw),
      createdAt: channel.createdAt,
      parent: channel.parent?.name ?? null,
      position: channel.position ?? null,
    };
  }

  function stats() {
    return {
      repository: config.docsUrl,
      support: config.supportUrl,
      version: config.version,
      environment: config.environment,
      bot,
    };
  }

  return { guildInfo, userInfo, roleInfo, channelInfo, stats, formatNumber, timestamp };
}
