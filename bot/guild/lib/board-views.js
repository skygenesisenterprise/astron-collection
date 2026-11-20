/** Poll and suggestion payloads shared by commands and component handlers. */

import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import { encodeCustomId } from "../../../packages/discord-framework/src/index.js";
import {
  COLORS,
  formatNumber,
  percent,
  progressBar,
} from "../../../packages/discord-framework/src/ui/index.js";

function optionLines(options, counts, total) {
  return options
    .map((label, index) => {
      const count = counts[String(index)] ?? 0;
      return `**${index + 1}.** ${label}\n${progressBar(count, total || 1, { size: 10 })} ${count} (${percent(count, total)})`;
    })
    .join("\n\n");
}

export function pollEmbed(poll, results) {
  const closed = Boolean(poll.closed_at);
  const winner = poll.options
    .map((label, index) => ({ label, count: results.counts[String(index)] ?? 0 }))
    .sort((left, right) => right.count - left.count)[0];

  return {
    color: COLORS.brand,
    title: "📊 Sondage",
    description: poll.question,
    fields: [
      { name: "Options", value: optionLines(poll.options, results.counts, results.total), inline: false },
      {
        name: "State",
        value: closed
          ? `Clos${winner && winner.count > 0 ? ` — gagnant : **${winner.label}**` : ""}`
          : `${formatNumber(results.total)} vote(s)`,
        inline: false,
      },
    ],
    footer: { text: `Poll ${poll.id.slice(0, 8)}` },
    timestamp: new Date().toISOString(),
  };
}

export function pollComponents(poll) {
  const row = new ActionRowBuilder();
  poll.options.forEach((label, index) => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(
          encodeCustomId({ namespace: "poll", action: "vote", value: `${poll.id}-${index}` }),
        )
        .setLabel(label.slice(0, 80))
        .setStyle(ButtonStyle.Primary)
        .setDisabled(Boolean(poll.closed_at)),
    );
  });
  return [row];
}

export function suggestionEmbed(suggestion, results, { status = suggestion.status } = {}) {
  return {
    color: status === "accepted" ? COLORS.success : status === "rejected" ? COLORS.danger : COLORS.warning,
    title: "💡 Suggestion",
    description: suggestion.content,
    fields: [
      { name: "Author", value: `<@${suggestion.author_id}>`, inline: true },
      { name: "Status", value: status, inline: true },
      { name: "Votes", value: `👍 ${results.up} — 👎 ${results.down}`, inline: true },
    ],
    footer: { text: `Suggestion ${suggestion.id.slice(0, 8)}` },
    timestamp: new Date().toISOString(),
  };
}

export function suggestionComponents(suggestion, status = suggestion.status) {
  const closed = status !== "open";
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(encodeCustomId({ namespace: "suggestion", action: "vote", value: `${suggestion.id}-up` }))
        .setLabel("Upvote")
        .setEmoji("👍")
        .setStyle(ButtonStyle.Success)
        .setDisabled(closed),
      new ButtonBuilder()
        .setCustomId(encodeCustomId({ namespace: "suggestion", action: "vote", value: `${suggestion.id}-down` }))
        .setLabel("Downvote")
        .setEmoji("👎")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(closed),
    ),
  ];
}

/** `uuid-up` -> `{id: uuid, suffix: "up"}`; uuids contain hyphens. */
export function splitBoardValue(value) {
  const index = String(value ?? "").lastIndexOf("-");
  if (index <= 0) return null;
  return { id: value.slice(0, index), suffix: value.slice(index + 1) };
}
