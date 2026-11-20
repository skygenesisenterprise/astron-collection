import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "../../../packages/discord-framework/src/index.js";
import { formatList, successEmbed } from "../../../packages/discord-framework/src/ui/index.js";

function workflowOption(option, required = true) {
  return option
    .setName("workflow")
    .setDescription("Workflow id")
    .setRequired(required)
    .setAutocomplete(true);
}

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("workflow")
    .setDescription("Create and manage automations.")
    .setDescriptionLocalizations({ fr: "Créer et gérer les automatisations." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a workflow")
        .setDescriptionLocalizations({ fr: "Créer un workflow" })
        .addStringOption((option) =>
          option.setName("name").setDescription("Name").setRequired(true).setMaxLength(100),
        )
        .addStringOption((option) =>
          option.setName("description").setDescription("Description").setMaxLength(500),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("List workflows")
        .setDescriptionLocalizations({ fr: "Lister les workflows" }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("show")
        .setDescription("Show a workflow")
        .setDescriptionLocalizations({ fr: "Afficher un workflow" })
        .addStringOption((option) => workflowOption(option)),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("enable")
        .setDescription("Enable a workflow")
        .setDescriptionLocalizations({ fr: "Activer un workflow" })
        .addStringOption((option) => workflowOption(option)),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("disable")
        .setDescription("Disable a workflow")
        .setDescriptionLocalizations({ fr: "Désactiver un workflow" })
        .addStringOption((option) => workflowOption(option)),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete a workflow")
        .setDescriptionLocalizations({ fr: "Supprimer un workflow" })
        .addStringOption((option) => workflowOption(option)),
    ),
  category: "automation",
  permissions: { user: [PermissionFlagsBits.ManageGuild], bot: [] },
  availability: { guildOnly: true },
  autocomplete: async (interaction, { services }) => {
    const focused = interaction.options.getFocused(true);
    if (!interaction.guildId) {
      await interaction.respond([]);
      return;
    }
    const rows = services.workflows
      .list(interaction.guildId)
      .filter((workflow) => workflow.name.toLowerCase().includes(String(focused.value).toLowerCase()))
      .slice(0, 25);
    await interaction.respond(rows.map((workflow) => ({ name: workflow.name, value: workflow.id })));
  },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    const guildId = interaction.guildId;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "create") {
      const workflow = services.workflows.create({
        guildId,
        name: interaction.options.getString("name", true),
        description: interaction.options.getString("description") ?? "",
        createdBy: interaction.user.id,
      });
      await interaction.reply({
        embeds: [
          successEmbed("Workflow created", workflow.name, {
            fields: [{ name: "Id", value: workflow.id, inline: false }],
          }),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "list") {
      const rows = services.workflows.list(guildId);
      await interaction.reply({
        embeds: [
          successEmbed(
            "Workflows",
            formatList(
              rows.map(
                (workflow) =>
                  `\`${workflow.id.slice(0, 8)}\` ${workflow.enabled ? "🟢" : "⚪"} **${workflow.name}** — ${workflow.triggers} trigger(s), ${workflow.actions} action(s)`,
              ),
              { empty: "No workflow." },
            ),
          ),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    const workflowId = interaction.options.getString("workflow", true);

    if (subcommand === "show") {
      const workflow = services.workflows.get(guildId, workflowId);
      await interaction.reply({
        embeds: [
          successEmbed(workflow.name, workflow.description || "No description.", {
            fields: [
              { name: "State", value: workflow.enabled ? "Enabled" : "Disabled", inline: true },
              { name: "Id", value: workflow.id, inline: false },
              {
                name: "Triggers",
                value: formatList(
                  workflow.triggers.map((trigger) => `\`${trigger.id.slice(0, 8)}\` ${trigger.type} ${JSON.stringify(trigger.config)}`),
                  { empty: "None" },
                ),
                inline: false,
              },
              {
                name: "Actions",
                value: formatList(
                  workflow.actions.map((action) => `\`${action.id.slice(0, 8)}\` ${action.type} ${JSON.stringify(action.config)}`),
                  { empty: "None" },
                ),
                inline: false,
              },
            ],
          }),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "delete") {
      services.workflows.remove(guildId, workflowId);
      await interaction.reply({ embeds: [successEmbed("Workflow deleted", null)], flags: EPHEMERAL });
      return;
    }

    const workflow = services.workflows.setEnabled(guildId, workflowId, subcommand === "enable");
    await interaction.reply({
      embeds: [successEmbed(`Workflow ${workflow.enabled ? "enabled" : "disabled"}`, workflow.name)],
      flags: EPHEMERAL,
    });
  },
});
