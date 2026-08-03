import { ChannelType, PermissionFlagsBits } from "discord.js";
import { env } from "../config/env.js";
import { addAudit, tickets } from "./store.js";

function normalizeChannelName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function buildTicketChannelName(username) {
  const suffix = Date.now().toString().slice(-6);
  return normalizeChannelName(`ticket-${username}-${suffix}`) || `ticket-support-${suffix}`;
}

export function isSupportTicket(channelId) {
  return tickets.has(channelId);
}

export function getSupportTicket(channelId) {
  return tickets.get(channelId);
}

export function closeSupportTicket(channelId) {
  tickets.delete(channelId);
}

export function closeSupportTicketIfExists(channelId) {
  if (!tickets.has(channelId)) {
    return false;
  }

  tickets.delete(channelId);
  return true;
}

export function claimSupportTicket(channelId, userId, userTag) {
  const ticket = tickets.get(channelId);
  if (!ticket) {
    return null;
  }

  ticket.claimedBy = userId;
  ticket.claimedByTag = userTag;
  ticket.claimedAt = new Date();
  return ticket;
}

export function isSupportStaff(interaction) {
  return interaction.memberPermissions?.has(PermissionFlagsBits.ManageChannels)
    || interaction.memberPermissions?.has(PermissionFlagsBits.ModerateMembers);
}

export async function createSupportTicket(interaction, details = {}) {
  const parent = resolveSupportCategory(interaction.guild);
  const languageLabel = details.language ? String(details.language).toUpperCase() : null;
  const topicLabel = details.topic ?? null;
  const channel = await interaction.guild.channels.create({
    name: buildTicketChannelName(interaction.user.username),
    type: ChannelType.GuildText,
    parent: parent?.id,
    topic: buildTicketTopic(interaction.user.tag, languageLabel, topicLabel),
    permissionOverwrites: [
      {
        id: interaction.guild.roles.everyone.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks,
        ],
      },
    ],
  });

  tickets.set(channel.id, {
    guildId: interaction.guildId,
    owner: interaction.user.id,
    language: details.language ?? null,
    topic: details.topic ?? null,
    createdAt: new Date(),
  });

  addAudit({
    guildId: interaction.guildId,
    action: "ticket_create",
    actor: interaction.user.tag,
    target: channel.name,
  });

  return channel;
}

function buildTicketTopic(userTag, language, topic) {
  const segments = [`Support ticket for ${userTag}`];

  if (language) {
    segments.push(`language=${language}`);
  }

  if (topic) {
    segments.push(`topic=${topic}`);
  }

  return segments.join(" | ");
}

function resolveSupportCategory(guild) {
  if (!env.supportCategoryId) {
    throw new Error("DISCORD_SUPPORT_CATEGORY_ID n'est pas configuré.");
  }

  const channel = guild.channels.cache.get(env.supportCategoryId);

  if (!channel || channel.type !== ChannelType.GuildCategory) {
    throw new Error("DISCORD_SUPPORT_CATEGORY_ID ne correspond pas à une catégorie valide.");
  }

  return channel;
}
