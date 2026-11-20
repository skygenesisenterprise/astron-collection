import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "../../../packages/discord-framework/src/index.js";
import { successEmbed } from "../../../packages/discord-framework/src/ui/index.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("unban")
    .setDescription("Remove a ban using the user id.")
    .setDescriptionLocalizations({ fr: "Lever un bannissement à partir de l'identifiant utilisateur." })
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("user-id")
        .setDescription("Banned user id")
        .setDescriptionLocalizations({ fr: "Identifiant de l'utilisateur banni" })
        .setRequired(true)
        .setMinLength(17)
        .setMaxLength(20),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason").setMaxLength(1000).setRequired(false),
    ),
  category: "moderation",
  permissions: {
    user: [PermissionFlagsBits.BanMembers],
    bot: [PermissionFlagsBits.BanMembers],
  },
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    const record = await services.moderation.unban(interaction, {
      userId: interaction.options.getString("user-id", true),
      reason: interaction.options.getString("reason"),
    });

    await interaction.reply({
      embeds: [
        successEmbed("Ban removed", `Case #${record.case_number} records the unban.`, {
          fields: [{ name: "User id", value: record.target_id, inline: true }],
        }),
      ],
      flags: EPHEMERAL,
    });
  },
});
