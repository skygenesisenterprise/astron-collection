import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ChannelType,
} from "discord.js";

import {
  getGuildSettings,
  updateGuildSettings,
  addAudit,
} from "../utils/store.js";

export const data = new SlashCommandBuilder()
  .setName("config")
  .setDescription("Configurer les paramètres du bot pour ce serveur.")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
  .setDMPermission(false)
  .addSubcommandGroup((group) =>
    group
      .setName("channels")
      .setDescription("Configurer les salons")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("set")
          .setDescription("Définir un salon pour une fonctionnalité")
          .addStringOption((option) =>
            option
              .setName("type")
              .setDescription("Type de salon")
              .setRequired(true)
              .addChoices(
                { name: "Logs", value: "logs" },
                { name: "Bienvenue", value: "welcome" },
                { name: "Au revoir", value: "farewell" },
                { name: "Niveaux", value: "levels" },
                { name: "Modération", value: "moderation" }
              )
          )
          .addChannelOption((option) =>
            option
              .setName("salon")
              .setDescription("Le salon à configurer")
              .setRequired(true)
              .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("remove")
          .setDescription("Retirer un salon configuré")
          .addStringOption((option) =>
            option
              .setName("type")
              .setDescription("Type de salon")
              .setRequired(true)
              .addChoices(
                { name: "Logs", value: "logs" },
                { name: "Bienvenue", value: "welcome" },
                { name: "Au revoir", value: "farewell" },
                { name: "Niveaux", value: "levels" },
                { name: "Modération", value: "moderation" }
              )
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("list")
          .setDescription("Lister les salons configurés")
      )
  )
  .addSubcommandGroup((group) =>
    group
      .setName("roles")
      .setDescription("Configurer les rôles")
      .addSubcommand((subcommand) =>
        subcommand
          .setName("set")
          .setDescription("Définir un rôle pour une fonctionnalité")
          .addStringOption((option) =>
            option
              .setName("type")
              .setDescription("Type de rôle")
              .setRequired(true)
              .addChoices(
                { name: "Modérateur", value: "moderator" },
                { name: "Membre", value: "member" },
                { name: "Vérifié", value: "verified" },
                { name: "Mute", value: "muted" }
              )
          )
          .addRoleOption((option) =>
            option
              .setName("rôle")
              .setDescription("Le rôle à configurer")
              .setRequired(true)
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("remove")
          .setDescription("Retirer un rôle configuré")
          .addStringOption((option) =>
            option
              .setName("type")
              .setDescription("Type de rôle")
              .setRequired(true)
              .addChoices(
                { name: "Modérateur", value: "moderator" },
                { name: "Membre", value: "member" },
                { name: "Vérifié", value: "verified" },
                { name: "Mute", value: "muted" }
              )
          )
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName("list")
          .setDescription("Lister les rôles configurés")
      )
  );

export async function execute(interaction) {
  if (!interaction.inCachedGuild()) {
    await interaction.reply({
      content: "Cette commande doit être utilisée dans un serveur.",
      ephemeral: true,
    });
    return;
  }

  const subcommandGroup = interaction.options.getSubcommandGroup();
  const subcommand = interaction.options.getSubcommand();

  const settings = getGuildSettings(interaction.guildId) || {
    channels: {},
    roles: {},
  };

  // Gestion des salons
  if (subcommandGroup === "channels") {
    if (subcommand === "set") {
      const type = interaction.options.getString("type", true);
      const channel = interaction.options.getChannel("salon", true);

      settings.channels = settings.channels || {};
      settings.channels[type] = channel.id;
      updateGuildSettings(interaction.guildId, settings);

      addAudit({
        guildId: interaction.guildId,
        action: "config_channel_set",
        actor: interaction.user.tag,
        target: channel.name,
        reason: `Type: ${type}`,
      });

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("✅ Salon configuré")
        .setDescription(`Le salon **${channel.name}** a été configuré pour **${type}**.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }

    else if (subcommand === "remove") {
      const type = interaction.options.getString("type", true);

      if (!settings.channels || !settings.channels[type]) {
        await interaction.reply({
          content: `Aucun salon configuré pour **${type}**.`,
          ephemeral: true,
        });
        return;
      }

      delete settings.channels[type];
      updateGuildSettings(interaction.guildId, settings);

      addAudit({
        guildId: interaction.guildId,
        action: "config_channel_remove",
        actor: interaction.user.tag,
        reason: `Type: ${type}`,
      });

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("❌ Salon retiré")
        .setDescription(`Le salon configuré pour **${type}** a été retiré.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }

    else if (subcommand === "list") {
      if (!settings.channels || Object.keys(settings.channels).length === 0) {
        await interaction.reply({
          content: "Aucun salon configuré.",
          ephemeral: true,
        });
        return;
      }

      const channelList = Object.entries(settings.channels)
        .map(([type, channelId]) => {
          const channel = interaction.guild.channels.cache.get(channelId);
          return `**${type}**: ${channel || "Introuvable"}`;
        })
        .join("\n");

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("📋 Salons configurés")
        .setDescription(channelList)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  }

  // Gestion des rôles
  else if (subcommandGroup === "roles") {
    if (subcommand === "set") {
      const type = interaction.options.getString("type", true);
      const role = interaction.options.getRole("rôle", true);

      if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
        await interaction.reply({
          content: "Je n'ai pas la permission de gérer les rôles.",
          ephemeral: true,
        });
        return;
      }

      settings.roles = settings.roles || {};
      settings.roles[type] = role.id;
      updateGuildSettings(interaction.guildId, settings);

      addAudit({
        guildId: interaction.guildId,
        action: "config_role_set",
        actor: interaction.user.tag,
        target: role.name,
        reason: `Type: ${type}`,
      });

      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setTitle("✅ Rôle configuré")
        .setDescription(`Le rôle **${role.name}** a été configuré pour **${type}**.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }

    else if (subcommand === "remove") {
      const type = interaction.options.getString("type", true);

      if (!settings.roles || !settings.roles[type]) {
        await interaction.reply({
          content: `Aucun rôle configuré pour **${type}**.`,
          ephemeral: true,
        });
        return;
      }

      delete settings.roles[type];
      updateGuildSettings(interaction.guildId, settings);

      addAudit({
        guildId: interaction.guildId,
        action: "config_role_remove",
        actor: interaction.user.tag,
        reason: `Type: ${type}`,
      });

      const embed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("❌ Rôle retiré")
        .setDescription(`Le rôle configuré pour **${type}** a été retiré.`)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }

    else if (subcommand === "list") {
      if (!settings.roles || Object.keys(settings.roles).length === 0) {
        await interaction.reply({
          content: "Aucun rôle configuré.",
          ephemeral: true,
        });
        return;
      }

      const roleList = Object.entries(settings.roles)
        .map(([type, roleId]) => {
          const role = interaction.guild.roles.cache.get(roleId);
          return `**${type}**: ${role || "Introuvable"}`;
        })
        .join("\n");

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("👥 Rôles configurés")
        .setDescription(roleList)
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    }
  }
}
