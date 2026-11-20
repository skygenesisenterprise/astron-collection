import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "../../../packages/discord-framework/src/index.js";
import { infoEmbed } from "../../../packages/discord-framework/src/ui/index.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Show a user's avatar.")
    .setDescriptionLocalizations({ fr: "Afficher l'avatar d'un utilisateur." })
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("User whose avatar to show")
        .setDescriptionLocalizations({ fr: "Utilisateur dont afficher l'avatar" })
        .setRequired(false),
    ),
  category: "information",
  execute: async (interaction) => {
    const user = interaction.options.getUser("user") ?? interaction.user;
    const url = user.displayAvatarURL({ size: 512, extension: "png" });

    await interaction.reply({
      embeds: [infoEmbed(`Avatar — ${user.tag}`, null, { image: url })],
    });
  },
});
