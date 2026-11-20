import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
} from "discord.js";

import {
  updateFarewellSettings,
  setMemberEventsEnabled,
  addAudit,
} from "../utils/store.js";

const DEFAULT_FAREWELL_MESSAGE = `
Au revoir {user} !

Nous espérons vous revoir bientôt sur **{server}**.
`;

export const data = new SlashCommandBuilder()
  .setName("farewell")
  .setDescription("Configurer le système d'au revoir.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("setup")
      .setDescription("Configurer le message d'au revoir")
      .addChannelOption((option) =>
        option
          .setName("salon")
          .setDescription("Le salon où envoyer le message d'au revoir")
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      )
      .addStringOption((option) =>
        option
          .setName("message")
          .setDescription("Le message d'au revoir (optionnel)")
          .setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("disable")
      .setDescription("Désactiver le système d'au revoir")
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("preview")
      .setDescription("Prévisualiser le message d'au revoir")
  );

export async function execute(interaction) {
  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Cette commande doit être utilisée dans un serveur.",
      ephemeral: true,
    });
    return;
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "setup") {
    const channel = interaction.options.getChannel("salon", true);
    const customMessage = interaction.options.getString("message");

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.SendMessages)) {
      await interaction.reply({
        content: "Je n'ai pas la permission d'envoyer des messages dans ce salon.",
        ephemeral: true,
      });
      return;
    }

    const message = customMessage || DEFAULT_FAREWELL_MESSAGE;

    updateFarewellSettings(interaction.guildId, {
      enabled: true,
      channelId: channel.id,
      message: message,
    });

    setMemberEventsEnabled(interaction.guildId, true);

    addAudit({
      guildId: interaction.guildId,
      action: "farewell_setup",
      actor: interaction.user.tag,
      target: channel.name,
    });

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("✅ Système d'au revoir configuré")
      .setDescription(`Le message d'au revoir sera envoyé dans ${channel}.`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  else if (subcommand === "disable") {
    updateFarewellSettings(interaction.guildId, {
      enabled: false,
      channelId: null,
      message: null,
    });

    addAudit({
      guildId: interaction.guildId,
      action: "farewell_disable",
      actor: interaction.user.tag,
    });

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("❌ Système d'au revoir désactivé")
      .setDescription("Les messages d'au revoir ne seront plus envoyés.")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  else if (subcommand === "preview") {
    await interaction.deferReply({ ephemeral: true });

    const settings = getFarewellSettings(interaction.guildId);
    if (!settings || !settings.enabled) {
      await interaction.editReply({
        content: "Le système d'au revoir n'est pas configuré. Utilisez `/farewell setup` pour le configurer.",
      });
      return;
    }

    const channel = interaction.guild.channels.cache.get(settings.channelId);
    const previewMessage = settings.message
      .replace(/{user}/g, interaction.user.toString())
      .replace(/{server}/g, interaction.guild.name);

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("👀 Prévisualisation du message d'au revoir")
      .setDescription(
        `**Salon:** ${channel || "Introuvable"}\n\n` +
        `**Message:**\n${previewMessage}`
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}

function getFarewellSettings(guildId) {
  // Placeholder - à implémenter dans store.js
  return {};
}
