import { ChannelType, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "../../../packages/discord-framework/src/index.js";
import { successEmbed } from "../../../packages/discord-framework/src/ui/index.js";
import { reasonOf, requireGuild } from "../lib/responses.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Lock or unlock a channel for everyone.")
    .setDescriptionLocalizations({ fr: "Verrouiller ou déverrouiller un salon pour tout le monde." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("lock")
        .setDescription("Prevent members from sending messages")
        .setDescriptionLocalizations({ fr: "Empêcher les membres d'envoyer des messages" })
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to lock")
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
        )
        .addStringOption((option) =>
          option.setName("reason").setDescription("Reason").setMaxLength(1000),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("unlock")
        .setDescription("Allow members to send messages again")
        .setDescriptionLocalizations({ fr: "Autoriser à nouveau les membres à écrire" })
        .addChannelOption((option) =>
          option
            .setName("channel")
            .setDescription("Channel to unlock")
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement),
        )
        .addStringOption((option) =>
          option.setName("reason").setDescription("Reason").setMaxLength(1000),
        ),
    ),
  category: "moderation",
  permissions: {
    user: [PermissionFlagsBits.ManageChannels],
    bot: [PermissionFlagsBits.ManageChannels],
  },
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const locked = interaction.options.getSubcommand() === "lock";

    const record = await services.moderation.setLocked(interaction, {
      locked,
      channel: interaction.options.getChannel("channel"),
      reason: reasonOf(interaction, locked ? "Salon verrouillé" : "Salon déverrouillé"),
    });

    await interaction.reply({
      embeds: [
        successEmbed(locked ? "Channel locked" : "Channel unlocked", null, {
          fields: [
            { name: "Case", value: `#${record.case_number}`, inline: true },
            { name: "Channel", value: `<#${record.target_id}>`, inline: true },
          ],
        }),
      ],
      flags: EPHEMERAL,
    });
  },
});
