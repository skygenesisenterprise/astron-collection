import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "@astron-collection/discord-framework";
import { formatList, infoEmbed } from "@astron-collection/discord-framework/ui";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Dry-run a workflow and show what would happen.")
    .setDescriptionLocalizations({ fr: "Tester un workflow sans effet de bord." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addStringOption((option) =>
      option.setName("workflow").setDescription("Workflow id").setRequired(true).setAutocomplete(true),
    )
    .addStringOption((option) =>
      option.setName("content").setDescription("Sample message content").setMaxLength(500),
    )
    .addChannelOption((option) =>
      option.setName("channel").setDescription("Sample channel"),
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
    const workflowId = interaction.options.getString("workflow", true);
    const channel = interaction.options.getChannel("channel") ?? interaction.channel;

    const result = await services.workflows.test(interaction.guildId, workflowId, {
      guildId: interaction.guildId,
      userId: interaction.user.id,
      userName: interaction.user.username,
      channelId: channel?.id,
      content: interaction.options.getString("content") ?? "",
      member: interaction.member,
    });

    await interaction.reply({
      embeds: [
        infoEmbed(
          `Dry run — ${result.workflow.name}`,
          result.ok ? "Conditions match; no action was executed." : `Conditions do not match (${result.reason}).`,
          {
            fields: [
              {
                name: "Actions",
                value: formatList(
                  result.actions.map(
                    (action) => `${action.wouldRun ? "▶" : "⏸"} **${action.type}** ${JSON.stringify(action.config)}`,
                  ),
                  { empty: "No action configured." },
                ),
                inline: false,
              },
            ],
            footer: "Test mode never sends messages or edits roles.",
          },
        ),
      ],
      flags: EPHEMERAL,
    });
  },
});
