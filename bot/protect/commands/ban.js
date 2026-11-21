import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "@astron-collection/discord-framework";
import { successEmbed } from "@astron-collection/discord-framework/ui";
import { caseEmbed, reasonOf, requireGuild } from "../lib/responses.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user from the server.")
    .setDescriptionLocalizations({ fr: "Bannir un utilisateur du serveur." })
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
      option.setName("user").setDescription("User to ban").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason").setMaxLength(1000).setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName("delete-days")
        .setDescription("Delete this many days of messages (0-7)")
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false),
    ),
  category: "moderation",
  permissions: {
    user: [PermissionFlagsBits.BanMembers],
    bot: [PermissionFlagsBits.BanMembers],
  },
  availability: { guildOnly: true },
  cooldown: { seconds: 3 },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const user = interaction.options.getUser("user", true);
    const record = await services.moderation.ban(interaction, {
      user,
      reason: reasonOf(interaction),
      deleteDays: interaction.options.getInteger("delete-days") ?? 0,
    });

    await interaction.reply({
      embeds: [successEmbed("User banned", null, { fields: caseEmbed(record).data.fields })],
      flags: EPHEMERAL,
    });
  },
});
