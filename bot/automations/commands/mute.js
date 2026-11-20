import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

import { addAudit, getGuildSettings, updateGuildSettings } from "../utils/store.js";

export const data = new SlashCommandBuilder()
  .setName("mute")
  .setDescription("Muter un membre (empêcher d'envoyer des messages).")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false)
  .addUserOption((option) =>
    option
      .setName("membre")
      .setDescription("Le membre à muter")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("raison")
      .setDescription("La raison du mute")
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("durée")
      .setDescription("Durée du mute (ex: 10m, 1h, 1d)")
      .setRequired(false)
  );

function parseDuration(durationStr) {
  if (!durationStr) return null;
  
  const match = durationStr.match(/^(\d+)([smhd])$/);
  if (!match) return null;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  
  return value * multipliers[unit];
}

export async function execute(interaction) {
  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Cette commande doit être utilisée dans un serveur.",
      ephemeral: true,
    });
    return;
  }

  const member = interaction.options.getUser("membre", true);
  const reason = interaction.options.getString("raison") || "Aucune raison fournie";
  const durationStr = interaction.options.getString("durée");
  const durationMs = parseDuration(durationStr);

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    await interaction.reply({
      content: "Je n'ai pas la permission de muter des membres.",
      ephemeral: true,
    });
    return;
  }

  if (member.id === interaction.user.id) {
    await interaction.reply({
      content: "Vous ne pouvez pas vous muter vous-même.",
      ephemeral: true,
    });
    return;
  }

  if (member.id === interaction.guild.ownerId) {
    await interaction.reply({
      content: "Je ne peux pas muter le propriétaire du serveur.",
      ephemeral: true,
    });
    return;
  }

  if (member.id === interaction.client.user.id) {
    await interaction.reply({
      content: "Je ne peux pas me muter moi-même.",
      ephemeral: true,
    });
    return;
  }

  const guildMember = await interaction.guild.members.fetch(member.id).catch(() => null);
  if (!guildMember) {
    await interaction.reply({
      content: "Ce membre n'est pas dans le serveur.",
      ephemeral: true,
    });
    return;
  }

  if (!guildMember.moderatable) {
    await interaction.reply({
      content: "Je ne peux pas muter ce membre (rôle trop élevé ou permissions insuffisantes).",
      ephemeral: true,
    });
    return;
  }

  try {
    if (durationMs) {
      await guildMember.timeout(durationMs, `[${interaction.user.tag}] ${reason}`);
    } else {
      await guildMember.timeout(60 * 60 * 1000, `[${interaction.user.tag}] ${reason}`); // 1h par défaut
    }

    addAudit({
      guildId: interaction.guildId,
      action: "mute",
      actor: interaction.user.tag,
      target: member.tag,
      reason: reason,
      duration: durationMs || 3600000,
    });

    const embed = new EmbedBuilder()
      .setColor(0x808080)
      .setTitle("🔇 Membre muté")
      .setDescription(`${member.tag} a été muté${durationMs ? ` pour ${durationStr}` : ""}.`)
      .addFields(
        { name: "Raison", value: reason, inline: true },
        { name: "Modérateur", value: interaction.user.tag, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error("Erreur lors du mute:", error);
    await interaction.reply({
      content: "Une erreur est survenue lors du mute.",
      ephemeral: true,
    });
  }
}
