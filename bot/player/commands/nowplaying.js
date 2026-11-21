import { SlashCommandBuilder } from "discord.js";

import { defineCommand } from "@astron-collection/discord-framework";
import { nowPlayingEmbed } from "../lib/views.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Show the current track.")
    .setDescriptionLocalizations({ fr: "Afficher le morceau en cours." })
    .setDMPermission(false),
  category: "music",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    const state = services.player.nowPlaying(interaction.guildId);
    const snapshot = services.player.playbackQueue(interaction.guildId);
    await interaction.reply({
      embeds: [nowPlayingEmbed({ ...state, upcoming: snapshot.size, volume: snapshot.volume }, { thumbnail: state.current?.thumbnail })],
    });
  },
});
