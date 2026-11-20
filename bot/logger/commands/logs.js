import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

import {
  defineCommand,
  EPHEMERAL,
  formatList,
} from "../../../packages/discord-framework/src/index.js";
import { infoEmbed, successEmbed } from "../../../packages/discord-framework/src/ui/index.js";
import { CATEGORIES } from "../config/bot.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("logs")
    .setDescription("Configure Discord audit logging.")
    .setDescriptionLocalizations({ fr: "Configurer la journalisation d'audit Discord." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("setup")
        .setDescription("Send audit events to a channel")
        .setDescriptionLocalizations({ fr: "Envoyer les événements d'audit dans un salon" })
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Destination channel")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("disable")
        .setDescription("Stop mirroring events to a channel (records are kept)")
        .setDescriptionLocalizations({ fr: "Arrêter le miroir dans un salon (les entrées sont conservées)" }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("status")
        .setDescription("Show logging configuration and volume")
        .setDescriptionLocalizations({ fr: "Afficher la configuration et le volume" }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("events")
        .setDescription("Enable or disable a category")
        .setDescriptionLocalizations({ fr: "Activer ou désactiver une catégorie" })
        .addStringOption((option) =>
          option
            .setName("category")
            .setDescription("Category")
            .setRequired(true)
            .addChoices(...CATEGORIES.map((category) => ({ name: category, value: category }))),
        )
        .addBooleanOption((option) =>
          option.setName("enabled").setDescription("Enabled").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("ignore")
        .setDescription("Exclude a channel or a user from logging")
        .setDescriptionLocalizations({ fr: "Exclure un salon ou un utilisateur de la journalisation" })
        .addChannelOption((option) => option.setName("channel").setDescription("Channel to ignore"))
        .addUserOption((option) => option.setName("user").setDescription("User to ignore")),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("unignore")
        .setDescription("Include a channel or a user again")
        .setDescriptionLocalizations({ fr: "Réintégrer un salon ou un utilisateur" })
        .addChannelOption((option) => option.setName("channel").setDescription("Channel to include"))
        .addUserOption((option) => option.setName("user").setDescription("User to include")),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("retention")
        .setDescription("Set how long audit records are kept")
        .setDescriptionLocalizations({ fr: "Définir la durée de conservation des enregistrements" })
        .addIntegerOption((option) =>
          option
            .setName("days")
            .setDescription("Retention in days (1-3650)")
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(3650),
        ),
    ),
  category: "configuration",
  permissions: { user: [PermissionFlagsBits.ManageGuild], bot: [PermissionFlagsBits.ManageGuild] },
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: "Commande réservée aux serveurs.", flags: EPHEMERAL });
      return;
    }

    const guildId = interaction.guildId;
    const subcommand = interaction.options.getSubcommand();
    const settings = services.settings;

    if (subcommand === "setup") {
      const channel = interaction.options.getChannel("channel", true);
      settings.set(guildId, "logChannelId", channel.id, { actorId: interaction.user.id });
      await interaction.reply({
        embeds: [successEmbed("Logging enabled", `Audit events will be mirrored to ${channel}.`)],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "disable") {
      settings.set(guildId, "logChannelId", null, { actorId: interaction.user.id });
      await interaction.reply({
        embeds: [successEmbed("Logging disabled", "Records are still stored and searchable with `/audit`.")],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "events") {
      const category = interaction.options.getString("category", true);
      const enabled = interaction.options.getBoolean("enabled", true);
      const current = settings.get(guildId, "categories");
      settings.set(guildId, "categories", { ...current, [category]: enabled }, { actorId: interaction.user.id });
      await interaction.reply({
        embeds: [successEmbed("Category updated", `**${category}** is now ${enabled ? "enabled" : "disabled"}.`)],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "ignore" || subcommand === "unignore") {
      const channel = interaction.options.getChannel("channel");
      const user = interaction.options.getUser("user");
      if (!channel && !user) {
        await interaction.reply({ content: "Fournissez un salon ou un utilisateur.", flags: EPHEMERAL });
        return;
      }

      const add = subcommand === "ignore";
      if (channel) {
        const current = settings.get(guildId, "ignoreChannels");
        settings.set(
          guildId,
          "ignoreChannels",
          add ? [...new Set([...current, channel.id])] : current.filter((id) => id !== channel.id),
          { actorId: interaction.user.id },
        );
      }
      if (user) {
        const current = settings.get(guildId, "ignoreUsers");
        settings.set(
          guildId,
          "ignoreUsers",
          add ? [...new Set([...current, user.id])] : current.filter((id) => id !== user.id),
          { actorId: interaction.user.id },
        );
      }

      await interaction.reply({
        embeds: [successEmbed(add ? "Ignored" : "Included", `${channel ?? user} will ${add ? "not " : ""}be logged.`)],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "retention") {
      const days = interaction.options.getInteger("days", true);
      settings.set(guildId, "retentionDays", days, { actorId: interaction.user.id });
      await interaction.reply({
        embeds: [successEmbed("Retention updated", `Records older than ${days} days will be purged.`)],
        flags: EPHEMERAL,
      });
      return;
    }

    const config = settings.getAll(guildId);
    const stats = services.logging.stats(guildId);
    const enabledCategories = CATEGORIES.filter((category) => config.categories[category] !== false);

    await interaction.reply({
      embeds: [
        infoEmbed("Logging status", null, {
          fields: [
            { name: "Destination", value: config.logChannelId ? `<#${config.logChannelId}>` : "Not configured", inline: true },
            { name: "Retention", value: `${config.retentionDays} days`, inline: true },
            { name: "Entries", value: String(stats.total), inline: true },
            { name: "Categories", value: enabledCategories.join(", ") || "None", inline: false },
            {
              name: "Volume by category",
              value: formatList(
                Object.entries(stats.byCategory).map(([category, count]) => `${category}: ${count}`),
                { empty: "No entry yet." },
              ),
              inline: false,
            },
            { name: "Oldest record", value: stats.oldest ?? "—", inline: true },
            { name: "Newest record", value: stats.newest ?? "—", inline: true },
          ],
        }),
      ],
      flags: EPHEMERAL,
    });
  },
});
