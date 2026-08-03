import {
  SlashCommandBuilder,
  EmbedBuilder,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("serverinfo")
  .setDescription("Afficher les informations du serveur.")
  .setDMPermission(false);

export async function execute(interaction) {
  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Cette commande doit être utilisée dans un serveur.",
      ephemeral: true,
    });
    return;
  }

  const guild = interaction.guild;
  const owner = await guild.fetchOwner().catch(() => null);
  const channels = guild.channels.cache;
  const roles = guild.roles.cache;
  const emojis = guild.emojis.cache;
  const stickers = guild.stickers.cache;

  const textChannels = channels.filter((c) => c.type === 0).size;
  const voiceChannels = channels.filter((c) => c.type === 2).size;
  const categoryChannels = channels.filter((c) => c.type === 4).size;
  const totalChannels = channels.size;

  const onlineMembers = guild.members.cache.filter((m) => m.presence?.status !== "offline").size;
  const totalMembers = guild.memberCount;
  const bots = guild.members.cache.filter((m) => m.user.bot).size;
  const humans = totalMembers - bots;

  const createdAt = guild.createdAt.toLocaleDateString("fr-FR");
  const verificationLevel = {
    0: "Aucun",
    1: "Faible",
    2: "Moyen",
    3: "Élevé",
    4: "Très élevé",
  }[guild.verificationLevel] || "Inconnu";

  const embed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle("🏢 Informations du serveur")
    .setThumbnail(guild.iconURL({ dynamic: true, size: 128 }) || null)
    .addFields(
      { name: "Nom", value: guild.name, inline: true },
      { name: "ID", value: guild.id, inline: true },
      { name: "Propriétaire", value: owner ? owner.user.tag : "Inconnu", inline: true },
      { name: "Créé le", value: createdAt, inline: true },
      { name: "Niveau de vérification", value: verificationLevel, inline: true },
      { name: "Boosts", value: String(guild.premiumSubscriptionCount || 0), inline: true },
      { name: "\u200B", value: "\u200B", inline: false },
      { name: "Membres", value: `**${totalMembers}** (${humans} humains, ${bots} bots)`, inline: true },
      { name: "En ligne", value: String(onlineMembers), inline: true },
      { name: "Rôles", value: String(roles.size), inline: true },
      { name: "\u200B", value: "\u200B", inline: false },
      { name: "Salons textuels", value: String(textChannels), inline: true },
      { name: "Salons vocaux", value: String(voiceChannels), inline: true },
      { name: "Catégories", value: String(categoryChannels), inline: true },
      { name: "Total salons", value: String(totalChannels), inline: true },
      { name: "Émojis", value: String(emojis.size), inline: true },
      { name: "Autocollants", value: String(stickers.size), inline: true }
    )
    .setFooter({ text: `Demandé par ${interaction.user.tag}` })
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
