import { SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "@astron-collection/discord-framework";
import { formatNumber, infoEmbed, progressBar } from "@astron-collection/discord-framework/ui";
import { requireGuild } from "../lib/guards.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Show your level, XP and rank.")
    .setDescriptionLocalizations({ fr: "Afficher votre niveau, votre XP et votre classement." })
    .setDMPermission(false)
    .addUserOption((option) =>
      option.setName("member").setDescription("Member to inspect; defaults to you"),
    ),
  category: "community",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    requireGuild(interaction);
    const user = interaction.options.getUser("member") ?? interaction.user;
    const profile = services.leveling.profile(interaction.guildId, user.id);
    const enabled = services.leveling.configFor(interaction.guildId).enabled;

    if (!enabled) {
      await interaction.reply({
        embeds: [infoEmbed("Levels are disabled", "An administrator can enable them with `/levels enable`.")],
        flags: EPHEMERAL,
      });
      return;
    }

    await interaction.reply({
      embeds: [
        infoEmbed(`${user.tag}`, null, {
          fields: [
            { name: "Level", value: String(profile.level), inline: true },
            { name: "Rank", value: profile.rank ? `#${profile.rank}` : "Unranked", inline: true },
            { name: "Messages", value: formatNumber(profile.messages), inline: true },
            {
              name: "Progress",
              value: `${progressBar(profile.currentLevelXp, profile.nextLevelXp)} ${profile.currentLevelXp}/${profile.nextLevelXp} XP\nTotal: ${formatNumber(profile.totalXp)} XP`,
              inline: false,
            },
          ],
        }),
      ],
    });
  },
});
