import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

import { addAudit } from "../utils/store.js";

export const data = new SlashCommandBuilder()
  .setName("ban")
  .setDescription("Bannir un membre du serveur.")
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
  .setDMPermission(false)
  .addUserOption((option) =>
    option
      .setName("membre")
      .setDescription("Le membre à bannir")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("raison")
      .setDescription("La raison du ban")
      .setRequired(false)
  )
  .addIntegerOption((option) =>
    option
      .setName("jours")
      .setDescription("Nombre de jours à supprimer les messages (0-7)")
      .setRequired(false)
      .setMinValue(0)
      .setMaxValue(7)
  );

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
  const days = interaction.options.getInteger("jours") || 0;

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
    await interaction.reply({
      content: "Je n'ai pas la permission de bannir des membres.",
      ephemeral: true,
    });
    return;
  }

  if (member.id === interaction.user.id) {
    await interaction.reply({
      content: "Vous ne pouvez pas vous bannir vous-même.",
      ephemeral: true,
    });
    return;
  }

  if (member.id === interaction.guild.ownerId) {
    await interaction.reply({
      content: "Je ne peux pas bannir le propriétaire du serveur.",
      ephemeral: true,
    });
    return;
  }

  if (member.id === interaction.client.user.id) {
    await interaction.reply({
      content: "Je ne peux pas me bannir moi-même.",
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

  if (!guildMember.bannable) {
    await interaction.reply({
      content: "Je ne peux pas bannir ce membre (rôle trop élevé ou permissions insuffisantes).",
      ephemeral: true,
    });
    return;
  }

  try {
    await guildMember.ban({
      reason: `[${interaction.user.tag}] ${reason}`,
      deleteMessageSeconds: days * 86400,
    });

    addAudit({
      guildId: interaction.guildId,
      action: "ban",
      actor: interaction.user.tag,
      target: member.tag,
      reason: reason,
    });

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("⚖️ Membre banni")
      .setDescription(`${member.tag} a été banni du serveur.`)
      .addFields(
        { name: "Raison", value: reason, inline: true },
        { name: "Modérateur", value: interaction.user.tag, inline: true },
        { name: "Messages supprimés", value: `${days} jour(s)`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error("Erreur lors du ban:", error);
    await interaction.reply({
      content: "Une erreur est survenue lors du ban.",
      ephemeral: true,
    });
  }
}
