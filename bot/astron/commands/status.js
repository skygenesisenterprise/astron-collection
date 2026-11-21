import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "@astron-collection/discord-framework";
import { statusRefreshRow } from "../components.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Show Astron runtime status and health.")
    .setDescriptionLocalizations({ fr: "Afficher l'état et la santé d'Astron." })
    .setDMPermission(false),
  category: "utility",
  cooldown: { seconds: 5 },
  execute: async (interaction, { services }) => {
    services.metrics.inc("status_command_total");
    await interaction.reply({
      embeds: [services.status.render(interaction.client)],
      components: [statusRefreshRow()],
    });
  },
});
