import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
} from "discord.js";

import {
  getGuildSettings,
  updateGuildSettings,
  addAudit,
} from "../utils/store.js";

export const data = new SlashCommandBuilder()
  .setName("prefix")
  .setDescription("Changer le préfixe du bot pour ce serveur.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false)
  .addStringOption((option) =>
    option
      .setName("préfixe")
      .setDescription("Le nouveau préfixe (ex: !, ., ?)")
      .setRequired(true)
      .setMaxLength(5)
  );

export async function execute(interaction) {
  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Cette commande doit être utilisée dans un serveur.",
      ephemeral: true,
    });
    return;
  }

  const newPrefix = interaction.options.getString("préfixe", true);

  // Vérifier que le préfixe n'est pas vide et ne contient pas d'espaces
  if (newPrefix.trim() === "" || newPrefix.includes(" ")) {
    await interaction.reply({
      content: "Le préfixe ne peut pas être vide ou contenir des espaces.",
      ephemeral: true,
    });
    return;
  }

  const settings = getGuildSettings(interaction.guildId) || {};
  const oldPrefix = settings.prefix || "!";

  settings.prefix = newPrefix;
  updateGuildSettings(interaction.guildId, settings);

  addAudit({
    guildId: interaction.guildId,
    action: "prefix_change",
    actor: interaction.user.tag,
    reason: `Ancien: ${oldPrefix}, Nouveau: ${newPrefix}`,
  });

  const embed = new EmbedBuilder()
    .setColor(0x00ff00)
    .setTitle("✅ Préfixe modifié")
    .setDescription(`Le préfixe du bot a été changé de **${oldPrefix}** à **${newPrefix}**.`)
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });
}
