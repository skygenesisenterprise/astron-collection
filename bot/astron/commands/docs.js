import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "../../../packages/discord-framework/src/index.js";
import { infoEmbed } from "../../../packages/discord-framework/src/ui/index.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("docs")
    .setDescription("Get the documentation and source-code links.")
    .setDescriptionLocalizations({ fr: "Obtenir les liens de documentation et du code source." })
    .setDMPermission(true),
  category: "support",
  execute: async (interaction, { services }) => {
    await interaction.reply({
      embeds: [
        infoEmbed("Documentation", "Astron Collection is open source.", {
          fields: [
            { name: "Bots documentation", value: services.config.docsUrl, inline: false },
            { name: "Repository", value: "https://github.com/skygenesisenterprise/astron-collection", inline: false },
            { name: "Command catalogue", value: "Run `/help` to list this bot's commands.", inline: false },
          ],
        }),
      ],
    });
  },
});
