import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "../../../packages/discord-framework/src/index.js";
import { formatList, successEmbed } from "../../../packages/discord-framework/src/ui/index.js";
import { requireGuild } from "../lib/guards.js";

const MAX_ROLES = 10;

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("autorole")
    .setDescription("Give roles automatically to every new member.")
    .setDescriptionLocalizations({ fr: "Attribuer automatiquement des rôles aux nouveaux membres." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add an autorole")
        .setDescriptionLocalizations({ fr: "Ajouter un rôle automatique" })
        .addRoleOption((option) =>
          option.setName("role").setDescription("Role to grant").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove an autorole")
        .setDescriptionLocalizations({ fr: "Retirer un rôle automatique" })
        .addRoleOption((option) =>
          option.setName("role").setDescription("Role to remove").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("List autoroles")
        .setDescriptionLocalizations({ fr: "Lister les rôles automatiques" }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("disable")
        .setDescription("Stop granting autoroles")
        .setDescriptionLocalizations({ fr: "Arrêter l'attribution automatique" }),
    ),
  category: "community",
  permissions: { user: [PermissionFlagsBits.ManageRoles], bot: [PermissionFlagsBits.ManageRoles] },
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const guildId = interaction.guildId;
    const current = services.settings.get(guildId, "autorole");
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "add") {
      const role = interaction.options.getRole("role", true);
      if (current.roleIds.includes(role.id)) {
        await interaction.reply({ content: "Ce rôle est déjà un autorole.", flags: EPHEMERAL });
        return;
      }
      if (current.roleIds.length >= MAX_ROLES) {
        await interaction.reply({ content: `Maximum ${MAX_ROLES} autoroles.`, flags: EPHEMERAL });
        return;
      }
      if (role.position >= interaction.guild.members.me.roles.highest.position) {
        await interaction.reply({ content: "Ce rôle est au-dessus de mon rôle le plus haut.", flags: EPHEMERAL });
        return;
      }

      const next = { enabled: true, roleIds: [...current.roleIds, role.id] };
      services.settings.set(guildId, "autorole", next, { actorId: interaction.user.id });
      await interaction.reply({
        embeds: [successEmbed("Autorole added", `${role} will be granted to new members.`)],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "remove") {
      const role = interaction.options.getRole("role", true);
      const roleIds = current.roleIds.filter((id) => id !== role.id);
      services.settings.set(guildId, "autorole", { ...current, roleIds }, { actorId: interaction.user.id });
      await interaction.reply({
        embeds: [successEmbed("Autorole removed", `${role} is no longer granted automatically.`)],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "disable") {
      services.settings.set(guildId, "autorole", { ...current, enabled: false }, { actorId: interaction.user.id });
      await interaction.reply({ embeds: [successEmbed("Autorole disabled", "Saved roles are kept.")], flags: EPHEMERAL });
      return;
    }

    await interaction.reply({
      embeds: [
        successEmbed("Autoroles", formatList(current.roleIds.map((id) => `<@&${id}>`), { empty: "No autorole." }), {
          fields: [{ name: "State", value: current.enabled ? "Enabled" : "Disabled", inline: true }],
        }),
      ],
      flags: EPHEMERAL,
    });
  },
});
