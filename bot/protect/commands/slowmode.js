import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "../../../packages/discord-framework/src/index.js";
import { successEmbed } from "../../../packages/discord-framework/src/ui/index.js";
import { requireGuild } from "../lib/responses.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Set the slowmode of a channel.")
    .setDescriptionLocalizations({ fr: "Définir le mode lent d'un salon." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false)
    .addIntegerOption((option) =>
      option
        .setName("seconds")
        .setDescription("Seconds between messages (0 disables)")
        .setDescriptionLocalizations({ fr: "Secondes entre les messages (0 désactive)" })
        .setRequired(true)
        .setMinValue(0)
        .setMaxValue(21600),
    )
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("Target channel; defaults to the current one")
        .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
    ),
  category: "moderation",
  permissions: {
    user: [PermissionFlagsBits.ManageChannels],
    bot: [PermissionFlagsBits.ManageChannels],
  },
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const seconds = interaction.options.getInteger("seconds", true);
    const channel = interaction.options.getChannel("channel");

    const result = await services.moderation.slowmode(interaction, { seconds, channel });

    await interaction.reply({
      embeds: [
        successEmbed("Slowmode updated", `${result.seconds}s in ${channel ? channel.name : interaction.channel.name}.`, {
          fields: [{ name: "Case", value: `#${result.record.case_number}`, inline: true }],
        }),
      ],
      flags: EPHEMERAL,
    });
  },
});
