import {
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";

import { addReminder } from "../utils/store.js";

function parseDuration(durationStr) {
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

export const data = new SlashCommandBuilder()
  .setName("remind")
  .setDescription("Créer un rappel.")
  .setDMPermission(true)
  .addStringOption((option) =>
    option
      .setName("durée")
      .setDescription("Durée du rappel (ex: 10m, 1h, 1d)")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("rappel")
      .setDescription("Le message de rappel")
      .setRequired(true)
  );

export async function execute(interaction) {
  const durationStr = interaction.options.getString("durée", true);
  const reminderText = interaction.options.getString("rappel", true);

  const durationMs = parseDuration(durationStr);
  if (!durationMs) {
    await interaction.reply({
      content: "Format de durée invalide. Utilisez un format comme `10m`, `1h`, ou `1d`.",
      ephemeral: true,
    });
    return;
  }

  if (durationMs > 24 * 60 * 60 * 1000) {
    await interaction.reply({
      content: "La durée maximale pour un rappel est de 24 heures.",
      ephemeral: true,
    });
    return;
  }

  try {
    addReminder({
      userId: interaction.user.id,
      guildId: interaction.guildId || null,
      channelId: interaction.channelId,
      reminderText: reminderText,
      durationMs: durationMs,
      expiresAt: Date.now() + durationMs,
      createdAt: Date.now(),
    });

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("⏰ Rappel créé")
      .setDescription(`Je vous rappellerai **${reminderText}** dans **${durationStr}**.`)
      .setFooter({ text: `Créé par ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  } catch (error) {
    console.error("Erreur lors de la création du rappel:", error);
    await interaction.reply({
      content: "Une erreur est survenue lors de la création du rappel.",
      ephemeral: true,
    });
  }
}
