import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "../../../packages/discord-framework/src/index.js";
import { successEmbed } from "../../../packages/discord-framework/src/ui/index.js";
import { caseEmbed, reasonOf, requireGuild } from "../lib/responses.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a member from the server.")
    .setDescriptionLocalizations({ fr: "Expulser un membre du serveur." })
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
      option.setName("member").setDescription("Member to kick").setRequired(true),
    )
    .addStringOption((option) =>
      option.setName("reason").setDescription("Reason").setMaxLength(1000).setRequired(false),
    ),
  category: "moderation",
  permissions: {
    user: [PermissionFlagsBits.KickMembers],
    bot: [PermissionFlagsBits.KickMembers],
  },
  availability: { guildOnly: true },
  cooldown: { seconds: 3 },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const user = interaction.options.getUser("member", true);
    const record = await services.moderation.kick(interaction, {
      user,
      reason: reasonOf(interaction),
    });

    await interaction.reply({
      embeds: [successEmbed("Member kicked", null, { fields: caseEmbed(record).data.fields })],
      flags: EPHEMERAL,
    });
  },
});
