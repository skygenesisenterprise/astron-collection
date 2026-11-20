import { SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "../../../packages/discord-framework/src/index.js";
import { formatList, infoEmbed } from "../../../packages/discord-framework/src/ui/index.js";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("sources")
    .setDescription("Explain supported audio sources.")
    .setDescriptionLocalizations({ fr: "Expliquer les sources audio prises en charge." })
    .setDMPermission(false),
  category: "music",
  availability: { guildOnly: true },
  execute: async (interaction, { services }) => {
    await interaction.reply({
      embeds: [
        infoEmbed(
          "Audio sources",
          formatList([
            "**YouTube** — links and `ytsearch` queries via yt-dlp.",
            "**SoundCloud** — public track links.",
            "**Direct audio** — mp3, m4a, ogg, opus, wav, flac and webm URLs.",
            "**Search** — plain text is resolved with `ytsearch1`.",
            "Spotify and Apple Music are not streamed directly; use a public audio URL.",
          ]),
          {
            footer: `Resolver: ${services.config.ytdlpPath}`,
          },
        ),
      ],
      flags: EPHEMERAL,
    });
  },
});
