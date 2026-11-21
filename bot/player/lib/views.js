/** Player embeds shared by commands. */

import { formatDuration, formatList, infoEmbed } from "@astron-collection/discord-framework/ui";
import { LOOP_MODES } from "../config/bot.js";

export function trackLabel(track) {
  const duration = track.durationSeconds ? ` [${formatDuration(track.durationSeconds)}]` : "";
  return `**${track.title}**${duration}`;
}

export function nowPlayingEmbed(state, { thumbnail = null } = {}) {
  if (!state.current) {
    return infoEmbed("Nothing playing", "Use `/play` to start a track.");
  }

  const loopLabel = LOOP_MODES.includes(state.loop) ? state.loop : "off";
  return infoEmbed(
    state.paused ? "⏸ Paused" : "▶ Now playing",
    trackLabel(state.current),
    {
      fields: [
        { name: "Requested by", value: `<@${state.current.requestedBy}>`, inline: true },
        { name: "Volume", value: `${state.volume}%`, inline: true },
        { name: "Loop", value: loopLabel, inline: true },
        { name: "Up next", value: String(state.upcoming), inline: true },
      ],
      thumbnail,
      footer: state.current.source ? `Source: ${state.current.source}` : undefined,
    },
  );
}

export function queueEmbed(snapshot, limit = 10) {
  const lines = snapshot.tracks
    .slice(0, limit)
    .map((track, index) => `**${index + 1}.** ${trackLabel(track)}`);
  return infoEmbed("Queue", formatList(lines, { empty: "The queue is empty." }), {
    fields: [
      { name: "Tracks", value: String(snapshot.size), inline: true },
      { name: "Loop", value: snapshot.loop, inline: true },
      { name: "Volume", value: `${snapshot.volume}%`, inline: true },
    ],
    footer: snapshot.size > limit ? `Showing ${limit} of ${snapshot.size}` : undefined,
  });
}
