import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

import { addAudit, addWarning, getWarnings } from "../utils/store.js";

export const data = new SlashCommandBuilder()
  .setName("warn")
  .setDescription("Avertir un membre.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
  .setDMPermission(false)
  .addUserOption((option) =>
    option
      .setName("membre")
      .setDescription("Le membre à avertir")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("raison")
      .setDescription("La raison de l'avertissement")
      .setRequired(true)
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
  const reason = interaction.options.getString("raison", true);

  if (member.id === interaction.user.id) {
    await interaction.reply({
      content: "Vous ne pouvez pas vous avertir vous-même.",
      ephemeral: true,
    });
    return;
  }

  if (member.id === interaction.client.user.id) {
    await interaction.reply({
      content: "Je ne peux pas m'avertir moi-même.",
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

  try {
    addWarning({
      guildId: interaction.guildId,
      userId: member.id,
      userTag: member.tag,
      reason: reason,
      moderator: interaction.user.tag,
      timestamp: new Date().toISOString(),
    });

    addAudit({
      guildId: interaction.guildId,
      action: "warn",
      actor: interaction.user.tag,
      target: member.tag,
      reason: reason,
    });

    const warnings = getWarnings(interaction.guildId, member.id);

    const embed = new EmbedBuilder()
      .setColor(0xffff00)
      .setTitle("⚠️ Membre averti")
      .setDescription(`${member.tag} a reçu un avertissement.`)
      .addFields(
        { name: "Raison", value: reason, inline: false },
        { name: "Modérateur", value: interaction.user.tag, inline: true },
        { name: "Total avertissements", value: String(warnings.length), inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });

    // Envoyer un message privé au membre averti
    try {
      await member.send({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffff00)
            .setTitle("⚠️ Avertissement reçu")
            .setDescription(`Vous avez reçu un avertissement sur **${interaction.guild.name}**.`)
            .addFields(
              { name: "Raison", value: reason, inline: false },
              { name: "Modérateur", value: interaction.user.tag, inline: true },
              { name: "Total avertissements", value: String(warnings.length), inline: true }
            )
            .setTimestamp(),
        ],
      });
    } catch (dmError) {
      console.warn(`Impossible d'envoyer un DM à ${member.tag}:`, dmError.message);
    }
  } catch (error) {
    console.error("Erreur lors de l'avertissement:", error);
    await interaction.reply({
      content: "Une erreur est survenue lors de l'avertissement.",
      ephemeral: true,
    });
  }
}
