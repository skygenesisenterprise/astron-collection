import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "@astron-collection/discord-framework";
import { infoEmbed } from "@astron-collection/discord-framework/ui";
import { requireGuild } from "../lib/responses.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("modstats")
    .setDescription("Show moderation activity for a moderator or the server.")
    .setDescriptionLocalizations({ fr: "Afficher l'activité de modération d'un modérateur ou du serveur." })
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .setDMPermission(false)
    .addUserOption((option) =>
      option.setName("moderator").setDescription("Filter by moderator").setRequired(false),
    )
    .addIntegerOption((option) =>
      option
        .setName("days")
        .setDescription("Window in days")
        .addChoices(
          { name: "Last 7 days", value: 7 },
          { name: "Last 30 days", value: 30 },
          { name: "Last 90 days", value: 90 },
        ),
    ),
  category: "moderation",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const moderator = interaction.options.getUser("moderator");
    const days = interaction.options.getInteger("days") ?? 30;
    const since = new Date(Date.now() - days * 86_400_000).toISOString();

    const stats = services.cases.stats(interaction.guildId, {
      moderatorId: moderator?.id ?? null,
      since,
    });

    const actions = Object.entries(stats.byAction)
      .sort((left, right) => right[1] - left[1])
      .map(([action, count]) => `**${action}** — ${count}`)
      .join("\n");

    await interaction.reply({
      embeds: [
        infoEmbed(
          "Moderation statistics",
          moderator ? `Activity of ${moderator.tag} over ${days} days.` : `Server activity over ${days} days.`,
          {
            fields: [
              { name: "Cases", value: String(stats.total), inline: true },
              { name: "Window", value: `${days} days`, inline: true },
              { name: "By action", value: actions || "No case in this window.", inline: false },
            ],
          },
        ),
      ],
      flags: EPHEMERAL,
    });
  },
});
