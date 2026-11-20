import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "../../../packages/discord-framework/src/index.js";
import { infoEmbed } from "../../../packages/discord-framework/src/ui/index.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("support")
    .setDescription("Find help and report an issue.")
    .setDescriptionLocalizations({ fr: "Trouver de l'aide et signaler un problème." })
    .setDMPermission(true),
  category: "support",
  execute: async (interaction, { services }) => {
    await interaction.reply({
      embeds: [
        infoEmbed("Support", "Before opening an issue, check `/help` and the documentation.", {
          fields: [
            { name: "Issue tracker", value: services.config.supportUrl, inline: false },
            { name: "Documentation", value: services.config.docsUrl, inline: false },
            {
              name: "Diagnostics",
              value: "Include the output of `/status` and the bot logs (JSON, secrets redacted).",
              inline: false,
            },
          ],
        }),
      ],
    });
  },
});
