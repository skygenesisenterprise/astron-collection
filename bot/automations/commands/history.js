import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "@astron-collection/discord-framework";
import { formatList, infoEmbed, timestamp } from "@astron-collection/discord-framework/ui";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("history")
    .setDescription("Show recent workflow executions.")
    .setDescriptionLocalizations({ fr: "Afficher les dernières exécutions de workflows." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addStringOption((option) =>
      option.setName("workflow").setDescription("Filter by workflow").setAutocomplete(true),
    )
    .addIntegerOption((option) =>
      option.setName("limit").setDescription("Number of runs (1-25)").setMinValue(1).setMaxValue(25),
    ),
  category: "automation",
  permissions: { user: [PermissionFlagsBits.ManageGuild], bot: [] },
  availability: { guildOnly: true },
  autocomplete: async (interaction, { services }) => {
    if (!interaction.guildId) {
      await interaction.respond([]);
      return;
    }
    await interaction.respond(
      services.workflows.list(interaction.guildId).slice(0, 25).map((workflow) => ({
        name: workflow.name,
        value: workflow.id,
      })),
    );
  },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    const workflowId = interaction.options.getString("workflow");
    const limit = interaction.options.getInteger("limit") ?? 10;
    const runs = services.workflows.history(interaction.guildId, workflowId, limit);
    const stats = services.runs.stats(interaction.guildId);

    await interaction.reply({
      embeds: [
        infoEmbed(
          "Workflow history",
          formatList(
            runs.map(
              (run) =>
                `${run.status === "success" ? "✅" : run.status === "failed" ? "❌" : "⏸"} ${timestamp(run.started_at, "R")} — **${run.trigger_type}** — ${run.status}${run.error ? ` (${run.error.slice(0, 80)})` : ""}`,
            ),
            { empty: "No execution yet." },
          ),
          {
            fields: [
              { name: "Total", value: String(stats.total), inline: true },
              { name: "Success", value: String(stats.success), inline: true },
              { name: "Failed", value: String(stats.failed), inline: true },
            ],
          },
        ),
      ],
      flags: EPHEMERAL,
    });
  },
});
