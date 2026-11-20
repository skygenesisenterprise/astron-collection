import { AttachmentBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import {
  defineCommand,
  EPHEMERAL,
} from "../../../packages/discord-framework/src/index.js";
import { infoEmbed } from "../../../packages/discord-framework/src/ui/index.js";
import { CATEGORIES } from "../config/bot.js";

function entryLine(entry) {
  const when = `<t:${Math.floor(Date.parse(entry.received_at) / 1000)}:R>`;
  return `**#${entry.id}** [${entry.category}] ${entry.event_type} — ${entry.summary.slice(0, 160)} — ${when}`;
}

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("audit")
    .setDescription("Search, inspect and export audit records.")
    .setDescriptionLocalizations({ fr: "Rechercher, consulter et exporter les enregistrements d'audit." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("search")
        .setDescription("Search audit records")
        .setDescriptionLocalizations({ fr: "Rechercher dans les enregistrements" })
        .addStringOption((option) =>
          option.setName("query").setDescription("Full-text query").setMaxLength(100),
        )
        .addStringOption((option) =>
          option
            .setName("category")
            .setDescription("Category")
            .addChoices(...CATEGORIES.map((category) => ({ name: category, value: category }))),
        )
        .addUserOption((option) => option.setName("actor").setDescription("Filter by actor"))
        .addUserOption((option) => option.setName("target").setDescription("Filter by target"))
        .addIntegerOption((option) =>
          option.setName("page").setDescription("Page").setMinValue(1).setMaxValue(100),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("view")
        .setDescription("View one record")
        .setDescriptionLocalizations({ fr: "Consulter un enregistrement" })
        .addIntegerOption((option) =>
          option.setName("id").setDescription("Record id").setRequired(true).setMinValue(1),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("export")
        .setDescription("Export matching records as JSON")
        .setDescriptionLocalizations({ fr: "Exporter les enregistrements correspondants en JSON" })
        .addStringOption((option) =>
          option
            .setName("category")
            .setDescription("Category")
            .addChoices(...CATEGORIES.map((category) => ({ name: category, value: category }))),
        )
        .addStringOption((option) =>
          option.setName("query").setDescription("Full-text query").setMaxLength(100),
        ),
    ),
  category: "audit",
  permissions: { user: [PermissionFlagsBits.ManageGuild], bot: [] },
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) {
      await interaction.reply({ content: "Commande réservée aux serveurs.", flags: EPHEMERAL });
      return;
    }

    const subcommand = interaction.options.getSubcommand();
    const guildId = interaction.guildId;

    if (subcommand === "view") {
      const id = interaction.options.getInteger("id", true);
      const entry = services.logging.get(guildId, id);
      if (!entry) {
        await interaction.reply({ content: `L'enregistrement #${id} est introuvable.`, flags: EPHEMERAL });
        return;
      }

      await interaction.reply({
        embeds: [
          infoEmbed(`Audit #${entry.id}`, entry.summary, {
            fields: [
              { name: "Category", value: entry.category, inline: true },
              { name: "Event", value: entry.event_type, inline: true },
              { name: "Source", value: entry.source_bot, inline: true },
              { name: "Actor", value: entry.actor_id ? `<@${entry.actor_id}>` : "—", inline: true },
              { name: "Target", value: entry.target_id ? `<@${entry.target_id}>` : "—", inline: true },
              { name: "Channel", value: entry.channel_id ? `<#${entry.channel_id}>` : "—", inline: true },
              { name: "Occurred", value: entry.occurred_at, inline: false },
              { name: "Payload", value: `\`\`\`json\n${JSON.stringify(entry.payload ?? {}, null, 2).slice(0, 1000)}\n\`\`\``, inline: false },
            ],
          }),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    const filters = {
      category: interaction.options.getString("category") ?? undefined,
      query: interaction.options.getString("query") ?? undefined,
      actorId: interaction.options.getUser("actor")?.id ?? undefined,
      targetId: interaction.options.getUser("target")?.id ?? undefined,
      page: interaction.options.getInteger("page") ?? 1,
    };

    if (subcommand === "export") {
      const exported = services.logging.exportJson(guildId, filters);
      const file = new AttachmentBuilder(Buffer.from(exported.json, "utf8"), {
        name: `audit-${guildId}-${Date.now()}.json`,
      });

      await interaction.reply({
        embeds: [
          infoEmbed("Audit export", `${exported.rows.length} record(s) exported.`, {
            fields: [
              { name: "Truncated", value: exported.truncated ? "Yes (narrow the filters)" : "No", inline: true },
            ],
          }),
        ],
        files: [file],
        flags: EPHEMERAL,
      });
      return;
    }

    const result = services.logging.search(guildId, filters);

    await interaction.reply({
      embeds: [
        infoEmbed("Audit search", result.rows.length ? result.rows.map(entryLine).join("\n") : "No record matches.", {
          fields: [
            { name: "Matches", value: String(result.total), inline: true },
            { name: "Page", value: `${result.page}/${result.pages}`, inline: true },
          ],
          footer: result.total > result.pageSize ? "Narrow the filters or use /audit export for the full set." : undefined,
        }),
      ],
      flags: EPHEMERAL,
    });
  },
});
