import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
} from "discord.js";

import {
  updateWelcomeSettings,
  setMemberEventsEnabled,
  addAudit,
} from "../utils/store.js";

const DEFAULT_WELCOME_MESSAGE = `
Bienvenue {user} sur **{server}** !

Nous sommes ravis de vous compter parmi nous.
N'hésitez pas à lire les règles et à vous présenter !
`;

export const data = new SlashCommandBuilder()
  .setName("welcome")
  .setDescription("Configurer le système de bienvenue.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false)
  .addSubcommand((subcommand) =>
    subcommand
      .setName("setup")
      .setDescription("Configurer le message de bienvenue")
      .addChannelOption((option) =>
        option
          .setName("salon")
          .setDescription("Le salon où envoyer le message de bienvenue")
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
      )
      .addRoleOption((option) =>
        option
          .setName("rôle")
          .setDescription("Le rôle à attribuer automatiquement (optionnel)")
          .setRequired(false)
      )
      .addStringOption((option) =>
        option
          .setName("message")
          .setDescription("Le message de bienvenue (optionnel)")
          .setRequired(false)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("disable")
      .setDescription("Désactiver le système de bienvenue")
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("preview")
      .setDescription("Prévisualiser le message de bienvenue")
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
    const role = interaction.options.getRole("rôle");
    const customMessage = interaction.options.getString("message");

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles) && role) {
      await interaction.reply({
        content: "Je n'ai pas la permission de gérer les rôles.",
        ephemeral: true,
      });
      return;
    }

    if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.SendMessages)) {
      await interaction.reply({
        content: "Je n'ai pas la permission d'envoyer des messages dans ce salon.",
        ephemeral: true,
      });
      return;
    }

    const message = customMessage || DEFAULT_WELCOME_MESSAGE;

    updateWelcomeSettings(interaction.guildId, {
      enabled: true,
      channelId: channel.id,
      roleIds: role ? [role.id] : [],
      message: message,
    });

    setMemberEventsEnabled(interaction.guildId, true);

    addAudit({
      guildId: interaction.guildId,
      action: "welcome_setup",
      actor: interaction.user.tag,
      target: channel.name,
      reason: role ? `Rôle: ${role.name}` : "Aucun rôle",
    });

    const embed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle("✅ Système de bienvenue configuré")
      .setDescription(
        `Le message de bienvenue sera envoyé dans ${channel}.` +
        (role ? `\nLe rôle **${role.name}** sera attribué automatiquement.` : "")
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  else if (subcommand === "disable") {
    updateWelcomeSettings(interaction.guildId, {
      enabled: false,
      channelId: null,
      roleIds: [],
      message: null,
    });

    addAudit({
      guildId: interaction.guildId,
      action: "welcome_disable",
      actor: interaction.user.tag,
    });

    const embed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle("❌ Système de bienvenue désactivé")
      .setDescription("Les messages de bienvenue ne seront plus envoyés.")
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  else if (subcommand === "preview") {
    await interaction.deferReply({ ephemeral: true });

    const settings = getWelcomeSettings(interaction.guildId);
    if (!settings || !settings.enabled) {
      await interaction.editReply({
        content: "Le système de bienvenue n'est pas configuré. Utilisez `/welcome setup` pour le configurer.",
      });
      return;
    }

    const channel = interaction.guild.channels.cache.get(settings.channelId);
    const roles = settings.roleIds
      ? settings.roleIds.map((id) => interaction.guild.roles.cache.get(id)).filter(Boolean)
      : [];

    const previewMessage = settings.message
      .replace(/{user}/g, interaction.user.toString())
      .replace(/{server}/g, interaction.guild.name)
      .replace(/{membercount}/g, String(interaction.guild.memberCount));

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setTitle("👀 Prévisualisation du message de bienvenue")
      .setDescription(
        `**Salon:** ${channel || "Introuvable"}\n` +
        `**Rôles attribués:** ${roles.length > 0 ? roles.map(r => r.toString()).join(", ") : "Aucun"}\n\n` +
        `**Message:**\n${previewMessage}`
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  }
}

function getWelcomeSettings(guildId) {
  // Placeholder - à implémenter dans store.js
  return {};
}
