import { SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "@astron-collection/discord-framework";
import { successEmbed } from "@astron-collection/discord-framework/ui";
import { trackLabel } from "../lib/views.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play a track or add it to the queue.")
    .setDescriptionLocalizations({ fr: "Lire un morceau ou l'ajouter à la file." })
    .setDMPermission(false)
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("URL or search terms")
        .setDescriptionLocalizations({ fr: "Lien ou termes de recherche" })
        .setRequired(true)
        .setMaxLength(500),
    ),
  category: "music",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    const channel = interaction.member.voice?.channel;
    if (!channel) {
      await interaction.reply({ content: "Rejoignez d'abord un salon vocal.", flags: EPHEMERAL });
      return;
    }

    await interaction.deferReply();
    const result = await services.player.play({
      guild: interaction.guild,
      member: interaction.member,
      voiceChannel: channel,
      textChannel: interaction.channel,
      query: interaction.options.getString("query", true),
    });

    const isCurrent = result.current?.url === result.track.url;
    await interaction.editReply({
      embeds: [
        successEmbed(
          isCurrent ? "▶ Now playing" : "Added to the queue",
          trackLabel(result.track),
          {
            fields: isCurrent
              ? [{ name: "Volume", value: `${services.player.playbackQueue(interaction.guildId).volume}%`, inline: true }]
              : [{ name: "Position", value: String(result.position), inline: true }],
          },
        ),
      ],
    });
  },
});
