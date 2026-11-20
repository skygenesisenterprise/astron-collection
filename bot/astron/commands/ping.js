import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "../../../packages/discord-framework/src/index.js";
import { successEmbed } from "../../../packages/discord-framework/src/ui/index.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the gateway and round-trip latency.")
    .setDescriptionLocalizations({ fr: "Vérifier la latence de la passerelle et de l'aller-retour." }),
  category: "utility",
  cooldown: { seconds: 5 },
  execute: async (interaction) => {
    const started = Date.now();
    await interaction.reply({ content: "Pinging…" });
    const roundTrip = Date.now() - started;
    const gateway = Math.round(interaction.client.ws.ping);

    await interaction.editReply({
      content: "",
      embeds: [
        successEmbed("Pong", null, {
          fields: [
            { name: "Gateway", value: `${gateway} ms`, inline: true },
            { name: "Round trip", value: `${roundTrip} ms`, inline: true },
            { name: "WebSocket", value: interaction.client.ws.status === 0 ? "Connected" : "Reconnecting", inline: true },
          ],
        }),
      ],
    });
  },
});
