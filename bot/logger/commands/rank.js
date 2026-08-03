import {
  SlashCommandBuilder,
  EmbedBuilder,
  AttachmentBuilder,
} from "discord.js";

import {
  getUserXP,
  getGuildXPSettings,
  getLeaderboard,
} from "../utils/store.js";

// Fonction pour générer une image de rank (placeholder pour une future implémentation avec Canvas)
async function generateRankCard(user, level, xp, nextLevelXP, rank) {
  // Pour l'instant, on retourne null car on n'a pas de bibliothèque de dessin
  // Plus tard, on pourrait utiliser canvas ou une API externe
  return null;
}

export const data = new SlashCommandBuilder()
  .setName("rank")
  .setDescription("Afficher votre niveau ou celui d'un autre membre.")
  .setDMPermission(false)
  .addUserOption((option) =>
    option
      .setName("membre")
      .setDescription("Le membre dont vous voulez voir le niveau (par défaut: vous)")
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

  const user = interaction.options.getUser("membre") || interaction.user;
  const member = await interaction.guild.members.fetch(user.id).catch(() => null);

  if (!member) {
    await interaction.reply({
      content: "Ce membre n'est pas dans le serveur.",
      ephemeral: true,
    });
    return;
  }

  const settings = getGuildXPSettings(interaction.guildId);
  if (!settings || !settings.enabled) {
    await interaction.reply({
      content: "Le système de niveaux n'est pas activé sur ce serveur.",
      ephemeral: true,
    });
    return;
  }

  const userData = getUserXP(interaction.guildId, user.id) || {
    xp: 0,
    level: 1,
    lastMessageTimestamp: 0,
  };

  const leaderboard = getLeaderboard(interaction.guildId);
  const rank = leaderboard.findIndex((entry) => entry.userId === user.id) + 1;

  // Calculer l'XP nécessaire pour le prochain niveau (formule: level * 100)
  const nextLevelXP = userData.level * 100;
  const xpForCurrentLevel = (userData.level - 1) * 100;
  const xpInCurrentLevel = userData.xp - xpForCurrentLevel;
  const xpNeededForNextLevel = nextLevelXP - userData.xp;
  const progress = Math.min((xpInCurrentLevel / 100) * 100, 100);

  // Générer la barre de progression
  const progressBarLength = 20;
  const filledBar = Math.round(progress / 100 * progressBarLength);
  const emptyBar = progressBarLength - filledBar;
  const progressBar = "█".repeat(filledBar) + "░".repeat(emptyBar);

  const embed = new EmbedBuilder()
    .setColor(member.displayColor || 0x5865f2)
    .setTitle(`🏆 Niveau de ${user.tag}`)
    .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 128 }))
    .addFields(
      { name: "Niveau", value: String(userData.level), inline: true },
      { name: "Rang", value: `#${rank || "?"}`, inline: true },
      { name: "XP", value: String(userData.xp), inline: true },
      { name: "Progression", value: `${progressBar} **${Math.round(progress)}%**`, inline: false },
      { name: "XP pour le prochain niveau", value: String(xpNeededForNextLevel), inline: true }
    )
    .setFooter({ text: `Demandé par ${interaction.user.tag}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
