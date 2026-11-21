import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "@astron-collection/discord-framework";
import { successEmbed } from "@astron-collection/discord-framework/ui";
import { requireGuild } from "../lib/responses.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete recent messages, optionally filtered by author or content.")
    .setDescriptionLocalizations({ fr: "Supprimer des messages récents, filtrés par auteur ou contenu." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .setDMPermission(false)
    .addIntegerOption((option) =>
      option
        .setName("count")
        .setDescription("Number of messages to delete (1-100)")
        .setDescriptionLocalizations({ fr: "Nombre de messages à supprimer (1-100)" })
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100),
    )
    .addUserOption((option) =>
      option.setName("user").setDescription("Only this author").setRequired(false),
    )
    .addStringOption((option) =>
      option.setName("contains").setDescription("Only messages containing this text").setMaxLength(100),
    ),
  category: "moderation",
  permissions: {
    user: [PermissionFlagsBits.ManageMessages],
    bot: [PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory],
  },
  availability: { guildOnly: true },
  cooldown: { seconds: 5 },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const result = await services.moderation.purge(interaction, {
      count: interaction.options.getInteger("count", true),
      user: interaction.options.getUser("user"),
      contains: interaction.options.getString("contains"),
    });

    await interaction.reply({
      embeds: [
        successEmbed("Messages deleted", `${result.deleted} message(s) removed.`, {
          fields: [{ name: "Case", value: `#${result.record.case_number}`, inline: true }],
        }),
      ],
      flags: EPHEMERAL,
    });
  },
});
