import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "../../../packages/discord-framework/src/index.js";
import { successEmbed } from "../../../packages/discord-framework/src/ui/index.js";
import { reasonOf, requireGuild } from "../lib/responses.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("quarantine")
    .setDescription("Isolate a member, or restore their previous roles.")
    .setDescriptionLocalizations({ fr: "Isoler un membre, ou restaurer ses rôles précédents." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Remove the member's roles and apply the quarantine role")
        .setDescriptionLocalizations({ fr: "Retirer les rôles du membre et appliquer la quarantaine" })
        .addUserOption((option) =>
          option.setName("member").setDescription("Member to quarantine").setRequired(true),
        )
        .addStringOption((option) =>
          option.setName("reason").setDescription("Reason").setMaxLength(1000),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Restore the roles saved when the member was quarantined")
        .setDescriptionLocalizations({ fr: "Restaurer les rôles enregistrés lors de la quarantaine" })
        .addUserOption((option) =>
          option.setName("member").setDescription("Member to release").setRequired(true),
        )
        .addStringOption((option) =>
          option.setName("reason").setDescription("Reason").setMaxLength(1000),
        ),
    ),
  category: "moderation",
  permissions: {
    user: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ManageRoles],
    bot: [PermissionFlagsBits.ModerateMembers, PermissionFlagsBits.ManageRoles],
  },
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const user = interaction.options.getUser("member", true);

    if (interaction.options.getSubcommand() === "remove") {
      const { record, restoredRoles } = await services.moderation.release(interaction, {
        user,
        reason: reasonOf(interaction, "Fin de quarantaine"),
      });

      await interaction.reply({
        embeds: [
          successEmbed("Member released", `${restoredRoles} role(s) restored.`, {
            fields: [{ name: "Case", value: `#${record.case_number}`, inline: true }],
          }),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    const { record, removedRoles } = await services.moderation.quarantine(interaction, {
      user,
      reason: reasonOf(interaction),
    });

    await interaction.reply({
      embeds: [
        successEmbed("Member quarantined", `${removedRoles} role(s) suspended and saved.`, {
          fields: [{ name: "Case", value: `#${record.case_number}`, inline: true }],
        }),
      ],
      flags: EPHEMERAL,
    });
  },
});
