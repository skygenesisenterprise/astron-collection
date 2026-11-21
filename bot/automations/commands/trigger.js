import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "@astron-collection/discord-framework";
import { formatList, successEmbed } from "@astron-collection/discord-framework/ui";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("trigger")
    .setDescription("Manage workflow triggers.")
    .setDescriptionLocalizations({ fr: "Gérer les déclencheurs des workflows." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a trigger")
        .setDescriptionLocalizations({ fr: "Ajouter un déclencheur" })
        .addStringOption((option) =>
          option.setName("workflow").setDescription("Workflow id").setRequired(true).setAutocomplete(true),
        )
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Trigger type")
            .setRequired(true)
            .addChoices(
              { name: "Message", value: "message" },
              { name: "Member joins", value: "member_join" },
              { name: "Schedule (cron)", value: "schedule" },
              { name: "Contract event", value: "event" },
            ),
        )
        .addStringOption((option) =>
          option.setName("contains").setDescription("Message must contain this text").setMaxLength(200),
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Restrict to a channel")
            .addChannelTypes(ChannelType.GuildText),
        )
        .addStringOption((option) =>
          option.setName("cron").setDescription("Cron: minute hour day month weekday (UTC)").setMaxLength(100),
        )
        .addStringOption((option) =>
          option.setName("event-type").setDescription("Contract event, e.g. moderation.case.created"),
        )
        .addRoleOption((option) =>
          option.setName("role").setDescription("Only members with this role"),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a trigger")
        .setDescriptionLocalizations({ fr: "Retirer un déclencheur" })
        .addStringOption((option) =>
          option.setName("workflow").setDescription("Workflow id").setRequired(true).setAutocomplete(true),
        )
        .addStringOption((option) =>
          option.setName("trigger").setDescription("Trigger id").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("List triggers")
        .setDescriptionLocalizations({ fr: "Lister les déclencheurs" })
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
    const workflowId = interaction.options.getString("workflow", true);
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add") {
      const type = interaction.options.getString("type", true);
      const config = {
        contains: interaction.options.getString("contains"),
        channelId: interaction.options.getChannel("channel")?.id ?? null,
        cron: interaction.options.getString("cron") ?? undefined,
        eventType: interaction.options.getString("event-type") ?? undefined,
        conditions: { roleId: interaction.options.getRole("role")?.id ?? null },
      };

      const trigger = services.workflows.addTrigger(guildId, workflowId, type, config);
      await interaction.reply({
        embeds: [
          successEmbed("Trigger added", `Type: ${trigger.type}`, {
            fields: [{ name: "Trigger id", value: trigger.id, inline: false }],
          }),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "remove") {
      const triggerId = interaction.options.getString("trigger", true);
      const removed = services.workflows.removeTrigger(guildId, workflowId, triggerId);
      await interaction.reply({
        content: removed ? "Déclencheur supprimé." : "Déclencheur introuvable.",
        flags: EPHEMERAL,
      });
      return;
    }

    const workflow = services.workflows.get(guildId, workflowId);
    await interaction.reply({
      embeds: [
        successEmbed(
          "Triggers",
          formatList(
            workflow.triggers.map((trigger) => `\`${trigger.id}\` **${trigger.type}** ${JSON.stringify(trigger.config)}`),
            { empty: "No trigger." },
          ),
        ),
      ],
      flags: EPHEMERAL,
    });
  },
});
