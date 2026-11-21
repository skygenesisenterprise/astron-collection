import { SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "@astron-collection/discord-framework";
import { formatList, successEmbed, timestamp } from "@astron-collection/discord-framework/ui";
import { requireGuild } from "../lib/guards.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("birthday")
    .setDescription("Save and share birthdays.")
    .setDescriptionLocalizations({ fr: "Enregistrer et partager les anniversaires." })
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("set")
        .setDescription("Set your birthday")
        .setDescriptionLocalizations({ fr: "Définir votre anniversaire" })
        .addIntegerOption((option) =>
          option.setName("month").setDescription("Month (1-12)").setRequired(true).setMinValue(1).setMaxValue(12),
        )
        .addIntegerOption((option) =>
          option.setName("day").setDescription("Day (1-31)").setRequired(true).setMinValue(1).setMaxValue(31),
        )
        .addIntegerOption((option) =>
          option.setName("year").setDescription("Year (optional)").setMinValue(1900).setMaxValue(2100),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove your birthday")
        .setDescriptionLocalizations({ fr: "Supprimer votre anniversaire" }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("List saved birthdays")
        .setDescriptionLocalizations({ fr: "Lister les anniversaires enregistrés" }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("upcoming")
        .setDescription("Show the next birthdays")
        .setDescriptionLocalizations({ fr: "Afficher les prochains anniversaires" }),
    ),
  category: "community",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const guildId = interaction.guildId;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "set") {
      const entry = services.community.setBirthday({
        guildId,
        userId: interaction.user.id,
        month: interaction.options.getInteger("month", true),
        day: interaction.options.getInteger("day", true),
        year: interaction.options.getInteger("year"),
      });
      await interaction.reply({
        embeds: [successEmbed("Birthday saved", `Saved for ${entry.day}/${entry.month}.`)],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "remove") {
      const removed = services.community.removeBirthday(guildId, interaction.user.id);
      await interaction.reply({
        content: removed ? "Anniversaire supprimé." : "Aucun anniversaire enregistré.",
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "list") {
      const rows = services.community.birthdays(guildId);
      await interaction.reply({
        embeds: [
          successEmbed(
            "Birthdays",
            formatList(rows.map((row) => `<@${row.user_id}> — ${row.day}/${row.month}`), {
              empty: "No birthday saved.",
            }),
          ),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    const upcoming = services.community.upcomingBirthdays(guildId, 5);
    await interaction.reply({
      embeds: [
        successEmbed(
          "Upcoming birthdays",
          formatList(
            upcoming.map((row) => `<@${row.user_id}> — ${timestamp(row.next, "D")} (${row.day}/${row.month})`),
            { empty: "No upcoming birthday." },
          ),
        ),
      ],
      flags: EPHEMERAL,
    });
  },
});
