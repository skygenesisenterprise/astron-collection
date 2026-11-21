import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL, formatDuration } from "@astron-collection/discord-framework";
import { successEmbed } from "@astron-collection/discord-framework/ui";
import { caseEmbed, reasonOf, requireGuild } from "../lib/responses.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Temporarily mute a member, or remove an active timeout.")
    .setDescriptionLocalizations({ fr: "Exclure temporairement un membre, ou retirer une exclusion." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Apply a timeout")
        .setDescriptionLocalizations({ fr: "Appliquer une exclusion temporaire" })
        .addUserOption((option) =>
          option.setName("member").setDescription("Member to time out").setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("duration")
            .setDescription("Duration")
            .setRequired(true)
            .addChoices(
              { name: "1 minute", value: "60" },
              { name: "5 minutes", value: "300" },
              { name: "10 minutes", value: "600" },
              { name: "1 hour", value: "3600" },
              { name: "1 day", value: "86400" },
              { name: "1 week", value: "604800" },
            ),
        )
        .addStringOption((option) =>
          option.setName("reason").setDescription("Reason").setMaxLength(1000).setRequired(false),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("remove")
        .setDescription("Remove an active timeout")
        .setDescriptionLocalizations({ fr: "Retirer une exclusion active" })
        .addUserOption((option) =>
          option.setName("member").setDescription("Member to release").setRequired(true),
        )
        .addStringOption((option) =>
          option.setName("reason").setDescription("Reason").setMaxLength(1000).setRequired(false),
        ),
    ),
  category: "moderation",
  permissions: {
    user: [PermissionFlagsBits.ModerateMembers],
    bot: [PermissionFlagsBits.ModerateMembers],
  },
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const user = interaction.options.getUser("member", true);

    if (interaction.options.getSubcommand() === "remove") {
      const record = await services.moderation.untimeout(interaction, {
        user,
        reason: reasonOf(interaction, "Exclusion temporaire retirée"),
      });
      await interaction.reply({
        embeds: [successEmbed("Timeout removed", null, { fields: caseEmbed(record).data.fields })],
        flags: EPHEMERAL,
      });
      return;
    }

    const seconds = Number(interaction.options.getString("duration", true));
    const record = await services.moderation.timeout(interaction, {
      user,
      durationSeconds: seconds,
      reason: reasonOf(interaction),
    });

    await interaction.reply({
      embeds: [
        successEmbed("Member timed out", `Duration: ${formatDuration(seconds * 1000)}`, {
          fields: caseEmbed(record).data.fields,
        }),
      ],
      flags: EPHEMERAL,
    });
  },
});
