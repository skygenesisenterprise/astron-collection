import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL, formatList } from "@astron-collection/discord-framework";
import { successEmbed, warningEmbed } from "@astron-collection/discord-framework/ui";
import { caseEmbed, caseSummary, reasonOf, requireGuild } from "../lib/responses.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Warn a member, list or clear their warnings.")
    .setDescriptionLocalizations({ fr: "Avertir un membre, lister ou effacer ses avertissements." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Warn a member")
        .setDescriptionLocalizations({ fr: "Avertir un membre" })
        .addUserOption((option) =>
          option.setName("member").setDescription("Member to warn").setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName("reason")
            .setDescription("Reason for the warning")
            .setRequired(true)
            .setMaxLength(1000),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("List active warnings of a member")
        .setDescriptionLocalizations({ fr: "Lister les avertissements actifs d'un membre" })
        .addUserOption((option) =>
          option.setName("member").setDescription("Member to inspect").setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("clear")
        .setDescription("Clear every active warning of a member")
        .setDescriptionLocalizations({ fr: "Effacer tous les avertissements actifs d'un membre" })
        .addUserOption((option) =>
          option.setName("member").setDescription("Member to clear").setRequired(true),
        ),
    ),
  category: "moderation",
  permissions: { user: [PermissionFlagsBits.ModerateMembers], bot: [PermissionFlagsBits.ModerateMembers] },
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const subcommand = interaction.options.getSubcommand();
    const user = interaction.options.getUser("member", true);

    if (subcommand === "add") {
      const record = await services.moderation.warn(interaction, { user, reason: reasonOf(interaction) });
      await interaction.reply({
        embeds: [warningEmbed("Member warned", null, { fields: caseEmbed(record).data.fields })],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "clear") {
      const cleared = services.moderation.closeWarnings(interaction, user);
      await interaction.reply({
        embeds: [successEmbed("Warnings cleared", `${cleared} warning(s) closed for ${user.tag}.`)],
        flags: EPHEMERAL,
      });
      return;
    }

    const warnings = services.moderation.warnings(interaction.guildId, user.id);
    await interaction.reply({
      embeds: [
        warningEmbed(
          `Warnings — ${user.tag}`,
          warnings.length ? formatList(warnings.map(caseSummary), { limit: 15 }) : "No active warning.",
        ),
      ],
      flags: EPHEMERAL,
    });
  },
});
