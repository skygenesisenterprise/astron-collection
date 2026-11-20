import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "../../../packages/discord-framework/src/index.js";
import { formatList, successEmbed } from "../../../packages/discord-framework/src/ui/index.js";
import { requireGuild } from "../lib/guards.js";
import { panelComponents, panelEmbed, updatePanelMessage } from "../lib/panel-views.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("reactionrole")
    .setDescription("Build self-service role panels.")
    .setDescriptionLocalizations({ fr: "Créer des panneaux de rôles en libre-service." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a panel in a channel")
        .setDescriptionLocalizations({ fr: "Créer un panneau dans un salon" })
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Panel channel")
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildText),
        )
        .addStringOption((option) =>
          option.setName("title").setDescription("Panel title").setRequired(true).setMaxLength(200),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a role to a panel")
        .setDescriptionLocalizations({ fr: "Ajouter un rôle à un panneau" })
        .addStringOption((option) =>
          option.setName("panel").setDescription("Panel id").setRequired(true),
        )
        .addRoleOption((option) =>
          option.setName("role").setDescription("Role to grant").setRequired(true),
        )
        .addStringOption((option) =>
          option.setName("label").setDescription("Menu label").setRequired(true).setMaxLength(80),
        )
        .addStringOption((option) =>
          option.setName("emoji").setDescription("Optional emoji").setMaxLength(32),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove a role from a panel")
        .setDescriptionLocalizations({ fr: "Retirer un rôle d'un panneau" })
        .addStringOption((option) =>
          option.setName("panel").setDescription("Panel id").setRequired(true),
        )
        .addRoleOption((option) =>
          option.setName("role").setDescription("Role to remove").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("List panels")
        .setDescriptionLocalizations({ fr: "Lister les panneaux" }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete a panel")
        .setDescriptionLocalizations({ fr: "Supprimer un panneau" })
        .addStringOption((option) =>
          option.setName("panel").setDescription("Panel id").setRequired(true),
        ),
    ),
  category: "community",
  permissions: { user: [PermissionFlagsBits.ManageRoles], bot: [PermissionFlagsBits.ManageRoles] },
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const guildId = interaction.guildId;
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "create") {
      const channel = interaction.options.getChannel("channel", true);
      const title = interaction.options.getString("title", true);
      const panel = await services.community.createPanel({ guild: interaction.guild, channel, title, options: [] });
      const message = await channel.send({ embeds: [panelEmbed(panel)], components: panelComponents(panel) });
      services.community.setPanelMessage(guildId, panel.id, message.id);

      await interaction.reply({
        embeds: [successEmbed("Panel created", `Use \`/reactionrole add panel:${panel.id}\` to add roles.`, {
          fields: [{ name: "Panel id", value: panel.id, inline: false }],
        })],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "add") {
      const panelId = interaction.options.getString("panel", true);
      const role = interaction.options.getRole("role", true);
      if (role.position >= interaction.guild.members.me.roles.highest.position) {
        await interaction.reply({ content: "Ce rôle est au-dessus de mon rôle le plus haut.", flags: EPHEMERAL });
        return;
      }

      const panel = services.community.addPanelOption(guildId, panelId, {
        roleId: role.id,
        label: interaction.options.getString("label", true),
        emoji: interaction.options.getString("emoji") ?? null,
      });
      await updatePanelMessage(interaction.client, panel).catch(() => {});

      await interaction.reply({ embeds: [successEmbed("Option added", `${role} is now selectable.`)], flags: EPHEMERAL });
      return;
    }

    if (subcommand === "remove") {
      const panelId = interaction.options.getString("panel", true);
      const role = interaction.options.getRole("role", true);
      const panel = services.community.removePanelOption(guildId, panelId, role.id);
      await updatePanelMessage(interaction.client, panel).catch(() => {});
      await interaction.reply({ embeds: [successEmbed("Option removed", `${role} is no longer selectable.`)], flags: EPHEMERAL });
      return;
    }

    if (subcommand === "delete") {
      const panelId = interaction.options.getString("panel", true);
      const deleted = services.community.deletePanel(guildId, panelId);
      await interaction.reply({
        content: deleted ? "Panneau supprimé (le message reste visible)." : "Panneau introuvable.",
        flags: EPHEMERAL,
      });
      return;
    }

    const panels = services.community.panels(guildId);
    await interaction.reply({
      embeds: [
        successEmbed(
          "Reaction-role panels",
          formatList(
            panels.map((panel) => `\`${panel.id}\` — ${panel.title} (${panel.options.length} option(s))`),
            { empty: "No panel." },
          ),
        ),
      ],
      flags: EPHEMERAL,
    });
  },
});
