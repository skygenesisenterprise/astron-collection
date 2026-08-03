import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

import { addAudit } from "../utils/store.js";

export const data = new SlashCommandBuilder()
  .setName("unmute")
  .setDescription("Retirer le mute d'un membre.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false)
  .addUserOption((option) =>
    option
      .setName("membre")
      .setDescription("Le membre à unmuter")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("raison")
      .setDescription("La raison du unmute")
      .setRequired(false)
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

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
    await interaction.reply({
      content: "Je n'ai pas la permission de gérer les timeouts.",
      ephemeral: true,
    });
    return;
  }

  if (member.id === interaction.client.user.id) {
    await interaction.reply({
      content: "Je ne peux pas me unmuter moi-même.",
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

  if (!guildMember.isCommunicationDisabled()) {
    await interaction.reply({
      content: "Ce membre n'est pas muté.",
      ephemeral: true,
    });
    return;
  }

  try {
    await guildMember.timeout(null, `[${interaction.user.tag}] ${reason}`);

    addAudit({
      guildId: interaction.guildId,
      action: "unmute",
      actor: interaction.user.tag,
      target: member.tag,
      reason: reason,
    });

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("🔊 Membre unmute")
      .setDescription(`${member.tag} peut à nouveau envoyer des messages.`)
      .addFields(
        { name: "Raison", value: reason, inline: true },
        { name: "Modérateur", value: interaction.user.tag, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error("Erreur lors de l'unmute:", error);
    await interaction.reply({
      content: "Une erreur est survenue lors de l'unmute.",
      ephemeral: true,
    });
  }
}
