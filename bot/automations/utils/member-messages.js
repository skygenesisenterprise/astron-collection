import { EmbedBuilder } from "discord.js";
import { env } from "../config/env.js";
import { areMemberEventsEnabled, getGoodbyeSettings, getWelcomeSettings } from "./store.js";

export const DEFAULT_WELCOME_MESSAGE =
  "Bienvenue {member} sur **{server}** ! Tu es notre **{memberCount}e membre**.";
export const DEFAULT_GOODBYE_MESSAGE =
  "**{username}** a quitte **{server}**. Nous lui souhaitons une bonne continuation.";

const DEFAULT_COLOR = 0x5865f2;

export function resolveWelcomeSettings(guildId) {
  const stored = getWelcomeSettings(guildId);

  return {
    enabled: areMemberEventsEnabled(guildId) && stored.enabled !== false,
    channelId: stored.channelId ?? env.welcomeChannelId,
    message: stored.message ?? DEFAULT_WELCOME_MESSAGE,
    dmEnabled: stored.dmEnabled ?? env.welcomeDmEnabled,
    ignoreBots: stored.ignoreBots ?? false,
    format: stored.format === "embed" ? "embed" : "text",
    color: stored.color ?? DEFAULT_COLOR,
    roleIds: Array.isArray(stored.roleIds)
      ? stored.roleIds
      : env.memberRoleId
        ? [env.memberRoleId]
        : [],
  };
}

export function resolveGoodbyeSettings(guildId) {
  const stored = getGoodbyeSettings(guildId);

  return {
    enabled: areMemberEventsEnabled(guildId) && stored.enabled !== false,
    channelId: stored.channelId ?? env.welcomeChannelId,
    message: stored.message ?? DEFAULT_GOODBYE_MESSAGE,
    ignoreBots: stored.ignoreBots ?? true,
    format: stored.format === "embed" ? "embed" : "text",
    color: stored.color ?? DEFAULT_COLOR,
  };
}

export function renderMemberMessage(template, member) {
  const replacements = {
    "{member}": `<@${member.id}>`,
    "{username}": member.user.username,
    "{userTag}": member.user.tag,
    "{server}": member.guild.name,
    "{memberCount}": String(member.guild.memberCount),
  };

  return Object.entries(replacements).reduce(
    (message, [variable, value]) => message.replaceAll(variable, value),
    template
  );
}

export function buildMemberMessagePayload(content, settings, title) {
  if (settings.format !== "embed") {
    return { content };
  }

  return {
    embeds: [
      new EmbedBuilder()
        .setTitle(title)
        .setDescription(content)
        .setColor(settings.color)
        .setTimestamp(),
    ],
  };
}

export function parseHexColor(value) {
  if (!value) {
    return null;
  }

  const normalized = value.trim().replace(/^#/, "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  return Number.parseInt(normalized, 16);
}
