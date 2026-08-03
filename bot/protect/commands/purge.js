import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

import { addAudit } from "../utils/store.js";

export const data = new SlashCommandBuilder()
  .setName("purge")
  .setDescription("Supprimer plusieurs messages en une fois.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
  .setDMPermission(false)
  .addIntegerOption((option) =>
    option
      .setName("nombre")
      .setDescription("Nombre de messages à supprimer (1-100)")
      .setRequired(true)
      .setMinValue(1)
      .setMaxValue(100)
  )
  .addUserOption((option) =>
    option
      .setName("utilisateur")
      .setDescription("Filtrer par utilisateur (optionnel)")
      .setRequired(false)
  )
  .addBooleanOption((option) =>
    option
      .setName("bots")
      .setDescription("Supprimer uniquement les messages des bots")
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

  if (!interaction.channel.isTextBased()) {
    await interaction.reply({
      content: "Cette commande ne fonctionne que dans un salon textuel.",
      ephemeral: true,
    });
    return;
  }

  const count = interaction.options.getInteger("nombre", true);
  const user = interaction.options.getUser("utilisateur");
  const botsOnly = interaction.options.getBoolean("bots");

  if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageMessages)) {
    await interaction.reply({
      content: "Je n'ai pas la permission de supprimer des messages.",
      ephemeral: true,
    });
    return;
  }

  try {
    await interaction.deferReply({ ephemeral: true });

    const messages = await interaction.channel.messages.fetch({
      limit: count,
    });

    const messagesToDelete = messages.filter((msg) => {
      if (user && msg.author.id !== user.id) return false;
      if (botsOnly && !msg.author.bot) return false;
      if (msg.id === interaction.id) return false; // Ne pas supprimer la commande elle-même
      return true;
    });

    if (messagesToDelete.size === 0) {
      await interaction.editReply({
        content: "Aucun message ne correspond aux critères de suppression.",
      });
      return;
    }

    await interaction.channel.bulkDelete(messagesToDelete, true);

    addAudit({
      guildId: interaction.guildId,
      action: "purge",
      actor: interaction.user.tag,
      target: interaction.channel.name,
      reason: `Suppression de ${messagesToDelete.size} messages`,
    });

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("🧹 Messages supprimés")
      .setDescription(`**${messagesToDelete.size}** messages ont été supprimés dans ${interaction.channel}.`)
      .addFields(
        { name: "Critères", value: user ? `Utilisateur: ${user.tag}` : "Tous les utilisateurs", inline: true },
        { name: "Bots uniquement", value: botsOnly ? "Oui" : "Non", inline: true }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("Erreur lors de la purge:", error);
    await interaction.editReply({
      content: "Une erreur est survenue lors de la suppression des messages.",
    });
  }
}
