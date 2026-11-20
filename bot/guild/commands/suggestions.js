import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL, formatList } from "../../../packages/discord-framework/src/index.js";
import { successEmbed } from "../../../packages/discord-framework/src/ui/index.js";
import { requireGuild } from "../lib/guards.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("suggestions")
    .setDescription("Configure and moderate suggestions.")
    .setDescriptionLocalizations({ fr: "Configurer et modérer les suggestions." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("config")
        .setDescription("Choose the suggestion channel")
        .setDescriptionLocalizations({ fr: "Choisir le salon des suggestions" })
        .addBooleanOption((option) =>
          option.setName("enabled").setDescription("Enable suggestions").setRequired(true),
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Suggestion channel")
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("List recent suggestions")
        .setDescriptionLocalizations({ fr: "Lister les suggestions récentes" })
        .addStringOption((option) =>
          option
            .setName("status")
            .setDescription("Filter by status")
            .addChoices(
              { name: "Open", value: "open" },
              { name: "Accepted", value: "accepted" },
              { name: "Rejected", value: "rejected" },
              { name: "Implemented", value: "implemented" },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("status")
        .setDescription("Change a suggestion status")
        .setDescriptionLocalizations({ fr: "Modifier le statut d'une suggestion" })
        .addStringOption((option) =>
          option.setName("id").setDescription("Suggestion id").setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("status")
            .setDescription("New status")
            .setRequired(true)
            .addChoices(
              { name: "Open", value: "open" },
              { name: "Accepted", value: "accepted" },
              { name: "Rejected", value: "rejected" },
              { name: "Implemented", value: "implemented" },
            ),
        ),
    ),
  category: "community",
  permissions: { user: [PermissionFlagsBits.ManageGuild], bot: [PermissionFlagsBits.SendMessages] },
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const guildId = interaction.guildId;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "config") {
      const enabled = interaction.options.getBoolean("enabled", true);
      const channel = interaction.options.getChannel("channel");
      const current = services.settings.get(guildId, "suggestions");
      const next = {
        enabled,
        channelId: channel?.id ?? current.channelId,
      };

      services.settings.set(guildId, "suggestions", next, { actorId: interaction.user.id });
      await interaction.reply({
        embeds: [
          successEmbed("Suggestions updated", null, {
            fields: [
              { name: "State", value: next.enabled ? "Enabled" : "Disabled", inline: true },
              { name: "Channel", value: next.channelId ? `<#${next.channelId}>` : "Not configured", inline: true },
            ],
          }),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "status") {
      const id = interaction.options.getString("id", true);
      const status = interaction.options.getString("status", true);
      services.suggestions.setStatus(guildId, id, status);
      await interaction.reply({ embeds: [successEmbed("Suggestion updated", `Status: ${status}.`)], flags: EPHEMERAL });
      return;
    }

    const status = interaction.options.getString("status");
    const rows = services.suggestions.list(guildId, status, 10);

    await interaction.reply({
      embeds: [
        successEmbed(
          "Suggestions",
          formatList(
            rows.map((row) => `\`${row.id.slice(0, 8)}\` [${row.status}] ${row.content.slice(0, 120)}`),
            { empty: "No suggestion." },
          ),
        ),
      ],
      flags: EPHEMERAL,
    });
  },
});
