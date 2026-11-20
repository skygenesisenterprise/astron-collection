import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL, formatList } from "../../../packages/discord-framework/src/index.js";
import { infoEmbed, successEmbed } from "../../../packages/discord-framework/src/ui/index.js";
import { caseEmbed, caseSummary, requireGuild } from "../lib/responses.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("case")
    .setDescription("Inspect and manage moderation cases.")
    .setDescriptionLocalizations({ fr: "Consulter et gérer les dossiers de modération." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("List recent cases")
        .setDescriptionLocalizations({ fr: "Lister les dossiers récents" })
        .addUserOption((option) =>
          option.setName("member").setDescription("Filter by member").setRequired(false),
        )
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription("Filter by action")
            .addChoices(
              { name: "Warn", value: "warn" },
              { name: "Kick", value: "kick" },
              { name: "Ban", value: "ban" },
              { name: "Timeout", value: "timeout" },
              { name: "Quarantine", value: "quarantine" },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("View one case")
        .setDescriptionLocalizations({ fr: "Consulter un dossier" })
        .addIntegerOption((option) =>
          option.setName("number").setDescription("Case number").setRequired(true).setMinValue(1),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("note")
        .setDescription("Add a note to a case")
        .setDescriptionLocalizations({ fr: "Ajouter une note à un dossier" })
        .addIntegerOption((option) =>
          option.setName("number").setDescription("Case number").setRequired(true).setMinValue(1),
        )
        .addStringOption((option) =>
          option.setName("note").setDescription("Note").setRequired(true).setMaxLength(1000),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("close")
        .setDescription("Close a case")
        .setDescriptionLocalizations({ fr: "Clôturer un dossier" })
        .addIntegerOption((option) =>
          option.setName("number").setDescription("Case number").setRequired(true).setMinValue(1),
        ),
    ),
  category: "moderation",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "list") {
      const member = interaction.options.getUser("member");
      const action = interaction.options.getString("action");
      const rows = services.cases.list(interaction.guildId, {
        limit: 15,
        action,
        targetId: member?.id ?? null,
      });

      await interaction.reply({
        embeds: [
          infoEmbed(
            "Moderation cases",
            rows.length ? formatList(rows.map(caseSummary), { limit: 15 }) : "No case found.",
            { footer: `${services.cases.count(interaction.guildId)} case(s) recorded` },
          ),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    const number = interaction.options.getInteger("number", true);
    const existing = services.cases.find(interaction.guildId, number);

    if (!existing) {
      await interaction.reply({ content: `Le dossier #${number} est introuvable.`, flags: EPHEMERAL });
      return;
    }

    if (subcommand === "view") {
      await interaction.reply({ embeds: [caseEmbed(existing)], flags: EPHEMERAL });
      return;
    }

    if (subcommand === "note") {
      const updated = services.cases.update({
        guildId: interaction.guildId,
        caseNumber: number,
        note: interaction.options.getString("note", true),
        updatedBy: interaction.user.id,
      });
      await interaction.reply({ embeds: [caseEmbed(updated)], flags: EPHEMERAL });
      return;
    }

    const updated = services.cases.update({
      guildId: interaction.guildId,
      caseNumber: number,
      status: "closed",
      updatedBy: interaction.user.id,
    });

    await interaction.reply({
      embeds: [successEmbed("Case closed", `Case #${number} is now closed.`, { fields: caseEmbed(updated).data.fields })],
      flags: EPHEMERAL,
    });
  },
});
