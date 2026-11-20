import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL, EVENT_TYPES } from "../../../packages/discord-framework/src/index.js";
import { formatList, successEmbed } from "../../../packages/discord-framework/src/ui/index.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("action")
    .setDescription("Manage workflow actions.")
    .setDescriptionLocalizations({ fr: "Gérer les actions des workflows." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add an action")
        .setDescriptionLocalizations({ fr: "Ajouter une action" })
        .addStringOption((option) =>
          option.setName("workflow").setDescription("Workflow id").setRequired(true).setAutocomplete(true),
        )
        .addStringOption((option) =>
          option
            .setName("type")
            .setDescription("Action type")
            .setRequired(true)
            .addChoices(
              { name: "Send a message", value: "send_message" },
              { name: "Direct message", value: "dm" },
              { name: "Add a role", value: "add_role" },
              { name: "Remove a role", value: "remove_role" },
              { name: "Emit a contract event", value: "emit_event" },
            ),
        )
        .addStringOption((option) =>
          option.setName("message").setDescription("Message ({user} {server} {channel})").setMaxLength(2000),
        )
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Destination; defaults to the trigger channel")
            .addChannelTypes(ChannelType.GuildText),
        )
        .addRoleOption((option) => option.setName("role").setDescription("Role for role actions"))
        .addStringOption((option) =>
          option
            .setName("event-type")
            .setDescription("Contract event to emit")
            .addChoices(...EVENT_TYPES.map((type) => ({ name: type, value: type }))),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove an action")
        .setDescriptionLocalizations({ fr: "Retirer une action" })
        .addStringOption((option) =>
          option.setName("workflow").setDescription("Workflow id").setRequired(true).setAutocomplete(true),
        )
        .addStringOption((option) => option.setName("action").setDescription("Action id").setRequired(true)),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("List actions")
        .setDescriptionLocalizations({ fr: "Lister les actions" })
        .addStringOption((option) =>
          option.setName("workflow").setDescription("Workflow id").setRequired(true).setAutocomplete(true),
        ),
    ),
  category: "automation",
  permissions: { user: [PermissionFlagsBits.ManageGuild], bot: [PermissionFlagsBits.ManageRoles] },
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
      const action = services.workflows.addAction(guildId, workflowId, type, {
        message: interaction.options.getString("message") ?? undefined,
        channelId: interaction.options.getChannel("channel")?.id ?? null,
        roleId: interaction.options.getRole("role")?.id ?? null,
        eventType: interaction.options.getString("event-type") ?? undefined,
      });

      if (type === "add_role" || type === "remove_role") {
        const role = interaction.options.getRole("role");
        if (role && role.position >= interaction.guild.members.me.roles.highest.position) {
          services.workflows.removeAction(guildId, workflowId, action.id);
          await interaction.reply({ content: "Ce rôle est au-dessus de mon rôle le plus haut.", flags: EPHEMERAL });
          return;
        }
      }

      await interaction.reply({
        embeds: [
          successEmbed("Action added", `Type: ${action.type}`, {
            fields: [{ name: "Action id", value: action.id, inline: false }],
          }),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "remove") {
      const actionId = interaction.options.getString("action", true);
      const removed = services.workflows.removeAction(guildId, workflowId, actionId);
      await interaction.reply({
        content: removed ? "Action supprimée." : "Action introuvable.",
        flags: EPHEMERAL,
      });
      return;
    }

    const workflow = services.workflows.get(guildId, workflowId);
    await interaction.reply({
      embeds: [
        successEmbed(
          "Actions",
          formatList(
            workflow.actions.map(
              (action) => `**${action.position}.** \`${action.id}\` ${action.type} ${JSON.stringify(action.config)}`,
            ),
            { empty: "No action." },
          ),
        ),
      ],
      flags: EPHEMERAL,
    });
  },
});
