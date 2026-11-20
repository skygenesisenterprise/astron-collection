import { SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "../../../packages/discord-framework/src/index.js";
import { formatList, successEmbed, timestamp } from "../../../packages/discord-framework/src/ui/index.js";
import { requireGuild } from "../lib/guards.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("reminder")
    .setDescription("Schedule a reminder in this channel.")
    .setDescriptionLocalizations({ fr: "Programmer un rappel dans ce salon." })
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Create a reminder")
        .setDescriptionLocalizations({ fr: "Créer un rappel" })
        .addStringOption((option) =>
          option
            .setName("message")
            .setDescription("What to remember")
            .setRequired(true)
            .setMaxLength(1000),
        )
        .addIntegerOption((option) =>
          option
            .setName("minutes")
            .setDescription("Delay in minutes")
            .setRequired(true)
            .addChoices(
              { name: "5 minutes", value: 5 },
              { name: "15 minutes", value: 15 },
              { name: "1 hour", value: 60 },
              { name: "6 hours", value: 360 },
              { name: "1 day", value: 1440 },
              { name: "1 week", value: 10080 },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("List your reminders")
        .setDescriptionLocalizations({ fr: "Lister vos rappels" }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Cancel a reminder")
        .setDescriptionLocalizations({ fr: "Annuler un rappel" })
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("Reminder id")
            .setRequired(true)
            .setAutocomplete(true),
        ),
    ),
  category: "community",
  availability: { guildOnly: true },
  autocomplete: async (interaction, { services }) => {
    if (!interaction.guildId) {
      await interaction.respond([]);
      return;
    }
    const reminders = services.community.listReminders(interaction.guildId, interaction.user.id);
    await interaction.respond(
      reminders.slice(0, 25).map((reminder) => ({
        name: `${reminder.message.slice(0, 80)} — ${reminder.due_at.slice(0, 16)}`,
        value: reminder.id,
      })),
    );
  },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const guildId = interaction.guildId;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add") {
      const minutes = interaction.options.getInteger("minutes", true);
      const reminder = services.community.addReminder({
        guildId,
        userId: interaction.user.id,
        channelId: interaction.channelId,
        message: interaction.options.getString("message", true),
        dueAt: new Date(Date.now() + minutes * 60_000).toISOString(),
      });

      await interaction.reply({
        embeds: [
          successEmbed("Reminder scheduled", interaction.options.getString("message", true), {
            fields: [
              { name: "When", value: timestamp(reminder.due_at, "R"), inline: true },
              { name: "Id", value: reminder.id.slice(0, 8), inline: true },
            ],
          }),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "remove") {
      const id = interaction.options.getString("id", true);
      const removed = services.community.removeReminder(id, guildId, interaction.user.id);
      await interaction.reply({
        content: removed ? "Rappel annulé." : "Rappel introuvable ou déjà délivré.",
        flags: EPHEMERAL,
      });
      return;
    }

    const reminders = services.community.listReminders(guildId, interaction.user.id);
    await interaction.reply({
      embeds: [
        successEmbed(
          "Your reminders",
          formatList(
            reminders.map((reminder) => `\`${reminder.id.slice(0, 8)}\` ${timestamp(reminder.due_at, "R")} — ${reminder.message}`),
            { empty: "No reminder." },
          ),
        ),
      ],
      flags: EPHEMERAL,
    });
  },
});
