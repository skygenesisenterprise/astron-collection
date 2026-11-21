import { EPHEMERAL, UserInputError, formatDuration } from "@astron-collection/discord-framework";
import { infoEmbed } from "@astron-collection/discord-framework/ui";

export function requireGuild(interaction) {
  if (!interaction.inCachedGuild()) {
    throw new UserInputError("Guild only command.", {
      userMessage: "Cette commande doit être utilisée dans un serveur.",
    });
  }
  return interaction;
}

export function reasonOf(interaction, fallback = "Aucune raison fournie") {
  return interaction.options.getString("reason")?.trim() || fallback;
}

export function caseEmbed(record) {
  return infoEmbed(`Case #${record.case_number} — ${record.action}`, record.reason, {
    fields: [
      { name: "Target", value: record.target_tag ?? `<@${record.target_id}>`, inline: true },
      { name: "Moderator", value: record.moderator_tag ?? `<@${record.moderator_id}>`, inline: true },
      { name: "Status", value: record.status, inline: true },
      { name: "Created", value: `<t:${Math.floor(Date.parse(record.created_at) / 1000)}:F>`, inline: true },
      ...(record.duration_seconds
        ? [{ name: "Duration", value: formatDuration(record.duration_seconds * 1000), inline: true }]
        : []),
      ...(record.note ? [{ name: "Note", value: record.note, inline: false }] : []),
    ],
    footer: "Protect — moderation case",
  });
}

export function caseSummary(record) {
  const target = record.target_tag ?? `<@${record.target_id}>`;
  return `**#${record.case_number}** ${record.action} — ${target} — ${record.reason.slice(0, 120)}`;
}

export { EPHEMERAL };
