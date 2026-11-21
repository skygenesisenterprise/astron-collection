import { SlashCommandBuilder } from "discord.js";

import {
  defineCommand,
  formatDuration,
} from "@astron-collection/discord-framework";
import { infoEmbed } from "@astron-collection/discord-framework/ui";
import { LINKS } from "../config/bot.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("about")
    .setDescription("About Astron and the Astron Collection.")
    .setDescriptionLocalizations({ fr: "À propos d'Astron et de la collection Astron." })
    .setDMPermission(false),
  category: "support",
  execute: async (interaction, { services }) => {
    const stats = services.info.stats();

    await interaction.reply({
      embeds: [
        infoEmbed("Astron", "The generalist bot and entry point of the Astron Collection.", {
          fields: [
            { name: "Version", value: stats.version, inline: true },
            { name: "Environment", value: stats.environment, inline: true },
            { name: "Uptime", value: formatDuration(interaction.client.uptime ?? 0), inline: true },
            { name: "Guilds", value: String(interaction.client.guilds.cache.size), inline: true },
            { name: "Commands", value: String(services.help.count()), inline: true },
            { name: "Runtime", value: process.version, inline: true },
            { name: "Documentation", value: stats.repository, inline: false },
            { name: "Support", value: stats.support ?? LINKS.issues, inline: false },
          ],
          footer: "Astron Collection — six independent bots, one foundation.",
        }),
      ],
    });
  },
});
