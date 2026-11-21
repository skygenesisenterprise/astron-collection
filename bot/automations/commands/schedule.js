import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "@astron-collection/discord-framework";
import { formatList, successEmbed } from "@astron-collection/discord-framework/ui";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("schedule")
    .setDescription("Inspect cron schedules. Add them with /trigger add.")
    .setDescriptionLocalizations({ fr: "Inspecter les planifications cron. Ajoutez-les avec /trigger add." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("List scheduled workflows")
        .setDescriptionLocalizations({ fr: "Lister les workflows planifiés" }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("clear")
        .setDescription("Remove every schedule trigger of a workflow")
        .setDescriptionLocalizations({ fr: "Retirer toutes les planifications d'un workflow" })
        .addStringOption((option) =>
          option.setName("workflow").setDescription("Workflow id").setRequired(true).setAutocomplete(true),
        ),
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
    const guildId = interaction.guildId;

    if (interaction.options.getSubcommand() === "list") {
      const scheduled = services.workflows
        .list(guildId)
        .map((workflow) => ({ workflow, triggers: services.workflows.get(guildId, workflow.id).triggers }))
        .filter((entry) => entry.triggers.some((trigger) => trigger.type === "schedule"));

      await interaction.reply({
        embeds: [
          successEmbed(
            "Schedules",
            formatList(
              scheduled.map(
                (entry) =>
                  `**${entry.workflow.name}** — ${entry.triggers
                    .filter((trigger) => trigger.type === "schedule")
                    .map((trigger) => `\`${trigger.config.cron}\``)
                    .join(", ")}`,
              ),
              { empty: "No schedule." },
            ),
            { footer: "Cron is evaluated in UTC; add one with /trigger add type:schedule" },
          ),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    const workflowId = interaction.options.getString("workflow", true);
    const workflow = services.workflows.get(guildId, workflowId);
    let removed = 0;
    for (const trigger of workflow.triggers.filter((entry) => entry.type === "schedule")) {
      if (services.workflows.removeTrigger(guildId, workflowId, trigger.id)) removed += 1;
    }

    await interaction.reply({
      embeds: [successEmbed("Schedules cleared", `${removed} schedule(s) removed from ${workflow.name}.`)],
      flags: EPHEMERAL,
    });
  },
});
