import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

import {
  defineCommand,
  EPHEMERAL,
} from "@astron-collection/discord-framework";
import { infoEmbed, successEmbed } from "@astron-collection/discord-framework/ui";

const OPTION_KEYS = {
  locale: "locale",
  timezone: "timezone",
  staffRole: "staffRoleId",
  announcementsChannel: "announcementsChannelId",
  ephemeral: "ephemeralReplies",
};

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("View or change this server's Astron configuration.")
    .setDescriptionLocalizations({ fr: "Voir ou modifier la configuration d'Astron pour ce serveur." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("Show the current configuration")
        .setDescriptionLocalizations({ fr: "Afficher la configuration actuelle" }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Change one or more settings")
        .setDescriptionLocalizations({ fr: "Modifier un ou plusieurs paramètres" })
        .addStringOption((option) =>
          option
            .setName("locale")
            .setDescription("Interface language")
            .setDescriptionLocalizations({ fr: "Langue de l'interface" })
            .addChoices({ name: "Français", value: "fr" }, { name: "English", value: "en" }),
        )
        .addStringOption((option) =>
          option
            .setName("timezone")
            .setDescription("IANA timezone used in formatted dates")
            .setDescriptionLocalizations({ fr: "Fuseau horaire IANA utilisé dans les dates" })
            .setMaxLength(64),
        )
        .addRoleOption((option) =>
          option
            .setName("staff-role")
            .setDescription("Role considered staff by Astron")
            .setDescriptionLocalizations({ fr: "Rôle considéré comme staff par Astron" }),
        )
        .addChannelOption((option) =>
          option
            .setName("announcements-channel")
            .setDescription("Channel used for Astron announcements")
            .setDescriptionLocalizations({ fr: "Salon utilisé pour les annonces d'Astron" })
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
        )
        .addBooleanOption((option) =>
          option
            .setName("ephemeral")
            .setDescription("Answer configuration commands privately")
            .setDescriptionLocalizations({ fr: "Répondre aux commandes de configuration en privé" }),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("reset")
        .setDescription("Reset this server's configuration to defaults")
        .setDescriptionLocalizations({ fr: "Réinitialiser la configuration du serveur" }),
    ),
  category: "configuration",
  permissions: {
    user: [PermissionFlagsBits.ManageGuild],
    bot: [],
  },
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: "Commande réservée aux serveurs.", flags: EPHEMERAL });
      return;
    }

    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    if (subcommand === "view") {
      const values = services.settings.getAll(guildId);
      await interaction.reply({
        embeds: [
          infoEmbed("Configuration", interaction.guild.name, {
            fields: Object.entries(values).map(([key, value]) => ({
              name: key,
              value: value === null ? "—" : String(value),
              inline: true,
            })),
          }),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "reset") {
      services.settings.reset(guildId);
      await interaction.reply({
        embeds: [successEmbed("Configuration reset", "All Astron settings are back to their defaults.")],
        flags: EPHEMERAL,
      });
      return;
    }

    const patch = {};
    if (interaction.options.getString("locale")) patch.locale = interaction.options.getString("locale");
    if (interaction.options.getString("timezone")) patch.timezone = interaction.options.getString("timezone");
    if (interaction.options.getRole("staff-role")) patch.staffRoleId = interaction.options.getRole("staff-role").id;
    if (interaction.options.getChannel("announcements-channel")) {
      patch.announcementsChannelId = interaction.options.getChannel("announcements-channel").id;
    }
    if (interaction.options.getBoolean("ephemeral") !== null) {
      patch.ephemeralReplies = interaction.options.getBoolean("ephemeral");
    }

    if (Object.keys(patch).length === 0) {
      await interaction.reply({ content: "Aucun paramètre fourni.", flags: EPHEMERAL });
      return;
    }

    const updated = services.settings.update(guildId, patch, { actorId: interaction.user.id });

    await interaction.reply({
      embeds: [
        successEmbed("Configuration updated", null, {
          fields: Object.entries(patch).map(([key, value]) => ({
            name: key,
            value: String(updated[OPTION_KEYS[key] ?? key] ?? value),
            inline: true,
          })),
        }),
      ],
      flags: EPHEMERAL,
    });
  },
});
