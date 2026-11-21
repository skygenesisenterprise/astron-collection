import { randomUUID } from "node:crypto";

import { SlashCommandBuilder } from "discord.js";

import { defineCommand, EPHEMERAL } from "@astron-collection/discord-framework";
import {
  formatDuration,
  formatList,
  successEmbed,
} from "@astron-collection/discord-framework/ui";

export default defineCommand({
  data: new SlashCommandBuilder()
    .setName("playlist")
    .setDescription("Save, inspect and play server playlists.")
    .setDescriptionLocalizations({ fr: "Enregistrer, consulter et lire les playlists du serveur." })
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("create")
        .setDescription("Create a playlist")
        .setDescriptionLocalizations({ fr: "Créer une playlist" })
        .addStringOption((option) =>
          option.setName("name").setDescription("Playlist name").setRequired(true).setMaxLength(80),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("add")
        .setDescription("Add a track to a playlist")
        .setDescriptionLocalizations({ fr: "Ajouter un morceau à une playlist" })
        .addStringOption((option) =>
          option.setName("name").setDescription("Playlist").setRequired(true).setAutocomplete(true),
        )
        .addStringOption((option) =>
          option.setName("query").setDescription("URL or search terms").setRequired(true).setMaxLength(500),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("list")
        .setDescription("List playlists")
        .setDescriptionLocalizations({ fr: "Lister les playlists" }),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("show")
        .setDescription("Show a playlist")
        .setDescriptionLocalizations({ fr: "Afficher une playlist" })
        .addStringOption((option) =>
          option.setName("name").setDescription("Playlist").setRequired(true).setAutocomplete(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("play")
        .setDescription("Queue a playlist")
        .setDescriptionLocalizations({ fr: "Mettre une playlist dans la file" })
        .addStringOption((option) =>
          option.setName("name").setDescription("Playlist").setRequired(true).setAutocomplete(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete a playlist")
        .setDescriptionLocalizations({ fr: "Supprimer une playlist" })
        .addStringOption((option) =>
          option.setName("name").setDescription("Playlist").setRequired(true).setAutocomplete(true),
        ),
    ),
  category: "music",
  availability: { guildOnly: true },
  autocomplete: async (interaction, { services }) => {
    if (!interaction.guildId) {
      await interaction.respond([]);
      return;
    }
    const focused = String(interaction.options.getFocused(true).value).toLowerCase();
    await interaction.respond(
      services.music
        .playlistList(interaction.guildId)
        .filter((playlist) => playlist.name.toLowerCase().includes(focused))
        .slice(0, 25)
        .map((playlist) => ({ name: playlist.name, value: playlist.name })),
    );
  },
  execute: async (interaction, { services }) => {
    if (!interaction.inCachedGuild()) return;
    const guildId = interaction.guildId;
    const subcommand = interaction.options.getSubcommand();
    const name = interaction.options.getString("name");

    const find = () => services.music.playlistList(guildId).find((playlist) => playlist.name === name);

    if (subcommand === "create") {
      if (find()) {
        await interaction.reply({ content: "Une playlist porte déjà ce nom.", flags: EPHEMERAL });
        return;
      }
      const playlist = services.music.playlistCreate({
        id: randomUUID(),
        guildId,
        name,
        createdBy: interaction.user.id,
      });
      await interaction.reply({ embeds: [successEmbed("Playlist created", playlist.name)], flags: EPHEMERAL });
      return;
    }

    if (subcommand === "add") {
      const playlist = find();
      if (!playlist) {
        await interaction.reply({ content: "Playlist introuvable.", flags: EPHEMERAL });
        return;
      }

      await interaction.deferReply({ flags: EPHEMERAL });
      const track = await services.sources.resolve(interaction.options.getString("query", true), {
        requestedBy: interaction.user.id,
      });
      services.music.trackAdd({
        id: randomUUID(),
        playlistId: playlist.id,
        guildId,
        url: track.url,
        title: track.title,
        durationSeconds: track.durationSeconds,
        addedBy: interaction.user.id,
      });
      await interaction.editReply({ embeds: [successEmbed("Track added", `**${track.title}** → ${playlist.name}`)] });
      return;
    }

    if (subcommand === "list") {
      const playlists = services.music.playlistList(guildId);
      await interaction.reply({
        embeds: [
          successEmbed(
            "Playlists",
            formatList(playlists.map((playlist) => `**${playlist.name}** — by <@${playlist.created_by}>`), {
              empty: "No playlist.",
            }),
          ),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    const playlist = find();
    if (!playlist) {
      await interaction.reply({ content: "Playlist introuvable.", flags: EPHEMERAL });
      return;
    }
    const tracks = services.music.tracks(playlist.id, guildId);

    if (subcommand === "show") {
      await interaction.reply({
        embeds: [
          successEmbed(
            playlist.name,
            formatList(
              tracks.map(
                (track, index) =>
                  `**${index + 1}.** ${track.title}${track.duration_seconds ? ` [${formatDuration(track.duration_seconds)}]` : ""}`,
              ),
              { empty: "This playlist is empty." },
            ),
            { footer: `${tracks.length} track(s)` },
          ),
        ],
        flags: EPHEMERAL,
      });
      return;
    }

    if (subcommand === "delete") {
      services.music.playlistDelete(guildId, playlist.id);
      await interaction.reply({ embeds: [successEmbed("Playlist deleted", playlist.name)], flags: EPHEMERAL });
      return;
    }

    const channel = interaction.member.voice?.channel;
    if (!channel) {
      await interaction.reply({ content: "Rejoignez d'abord un salon vocal.", flags: EPHEMERAL });
      return;
    }
    if (tracks.length === 0) {
      await interaction.reply({ content: "Cette playlist est vide.", flags: EPHEMERAL });
      return;
    }

    await interaction.deferReply({ flags: EPHEMERAL });
    const result = await services.player.playTracks({
      guild: interaction.guild,
      member: interaction.member,
      voiceChannel: channel,
      textChannel: interaction.channel,
      tracks: tracks.map((track) => ({
        title: track.title,
        url: track.url,
        durationSeconds: track.duration_seconds,
        source: "playlist",
      })),
    });

    await interaction.editReply({
      embeds: [successEmbed("Playlist queued", `${result.added} track(s) from **${playlist.name}**.`)],
    });
  },
});
