/**
 * Audit logging.
 *
 * Two sources feed one table: Discord gateway events projected locally, and
 * versioned contracts delivered by the other bots. Both pass the same guild
 * filters, category switches and ignore lists; contract events are deduplicated
 * by envelope id so an outbox retry is harmless.
 */

import {
  EVENT_TYPES,
  nowIso,
  validateEvent,
} from "@astron-collection/discord-framework";
import { LOG_COLORS } from "../config/bot.js";
import { paginate } from "@astron-collection/discord-framework";
import { projectDiscordEvent } from "./discord-event-projector.js";

const MAX_SUMMARY_LENGTH = 500;

export function createLogService({
  db,
  repo,
  settings,
  logger,
  metrics,
  exportMaxRows = 5000,
  clock = () => new Date(),
}) {
  let client = null;

  function attachClient(discordClient) {
    client = discordClient;
  }

  function enabled(guildId, category) {
    const config = settings.getAll(guildId);
    return config.categories?.[category] !== false;
  }

  function ignored(guildId, { channelId = null, actorId = null, bot = false } = {}) {
    const config = settings.getAll(guildId);
    if (bot && config.ignoreBots) return true;
    if (channelId && (config.ignoreChannels ?? []).includes(channelId)) return true;
    if (actorId && (config.ignoreUsers ?? []).includes(actorId)) return true;
    return false;
  }

  function deliver(guildId, entry) {
    const channelId = settings.get(guildId, "logChannelId");
    if (!channelId || !client) return;

    const channel = client.channels?.cache?.get(channelId);
    if (!channel?.send) return;

    channel
      .send({
        embeds: [
          {
            color: LOG_COLORS[entry.category] ?? 0x95a5a6,
            title: entry.eventType,
            description: entry.summary.slice(0, MAX_SUMMARY_LENGTH),
            fields: [
              ...(entry.actorId ? [{ name: "Actor", value: `<@${entry.actorId}>`, inline: true }] : []),
              ...(entry.targetId ? [{ name: "Target", value: `<@${entry.targetId}>`, inline: true }] : []),
              ...(entry.channelId ? [{ name: "Channel", value: `<#${entry.channelId}>`, inline: true }] : []),
            ],
            footer: { text: `source: ${entry.sourceBot} • category: ${entry.category}` },
            timestamp: entry.occurredAt,
          },
        ],
      })
      .catch((error) => logger.debug("log mirror failed", { err: error, guildId }));
  }

  function persist(entry) {
    const result = repo.insert(entry);
    if (result.inserted) {
      metrics.inc("log_entries_total", { category: entry.category });
      deliver(entry.guildId, entry);
    }
    return result;
  }

  function recordDiscord(eventName, args = []) {
    const projected = projectDiscordEvent(eventName, args);
    if (!projected?.guildId) return null;
    if (!enabled(projected.guildId, projected.category)) return null;
    if (ignored(projected.guildId, { channelId: projected.channelId, actorId: projected.actorId })) return null;

    return persist({
      guildId: projected.guildId,
      category: projected.category,
      eventType: projected.eventType,
      actorId: projected.actorId,
      targetId: projected.targetId,
      channelId: projected.channelId,
      summary: projected.summary,
      payload: projected.payload,
      sourceBot: "logger",
      eventId: null,
      occurredAt: projected.occurredAt,
      receivedAt: nowIso(clock),
    });
  }

  function projectContract(envelope) {
    const data = envelope.data;

    switch (envelope.type) {
      case EVENT_TYPES.MODERATION_CASE_CREATED:
        return {
          category: "moderation",
          eventType: `case.${data.action}`,
          actorId: data.moderatorId,
          targetId: data.targetId,
          channelId: null,
          summary: `Case #${data.caseNumber} — ${data.action} — ${data.targetTag ?? data.targetId}: ${data.reason}`,
          payload: data,
        };
      case EVENT_TYPES.MODERATION_CASE_UPDATED:
        return {
          category: "moderation",
          eventType: `case.${data.status}`,
          actorId: data.updatedBy,
          targetId: null,
          channelId: null,
          summary: `Case #${data.caseNumber} ${data.status}${data.note ? ` — ${data.note}` : ""}`,
          payload: data,
        };
      case EVENT_TYPES.SECURITY_ALERT:
        return {
          category: "security",
          eventType: `security.${data.kind}`,
          actorId: data.userId ?? null,
          targetId: data.userId ?? null,
          channelId: data.channelId ?? null,
          summary: `[${data.severity}] ${data.kind}: ${data.detail} (${data.actionTaken})`,
          payload: data,
        };
      case EVENT_TYPES.MEMBER_JOINED:
        return {
          category: "members",
          eventType: "member.join",
          actorId: data.userId,
          targetId: data.userId,
          channelId: null,
          summary: `Member joined (${data.memberCount} members)`,
          payload: data,
        };
      case EVENT_TYPES.MEMBER_LEFT:
        return {
          category: "members",
          eventType: "member.leave",
          actorId: data.userId,
          targetId: data.userId,
          channelId: null,
          summary: `Member left (${data.memberCount} members)`,
          payload: data,
        };
      case EVENT_TYPES.LEVEL_UP:
        return {
          category: "community",
          eventType: "level.up",
          actorId: data.userId,
          targetId: data.userId,
          channelId: null,
          summary: `Level ${data.level} reached (${data.totalXp} XP)`,
          payload: data,
        };
      case EVENT_TYPES.SUGGESTION_CREATED:
        return {
          category: "community",
          eventType: "suggestion.created",
          actorId: data.authorId,
          targetId: null,
          channelId: null,
          summary: `Suggestion: ${data.content.slice(0, 300)}`,
          payload: data,
        };
      case EVENT_TYPES.WORKFLOW_EXECUTED:
        return {
          category: "automation",
          eventType: "workflow.executed",
          actorId: null,
          targetId: null,
          channelId: null,
          summary: `Workflow ${data.workflowId} ${data.status} in ${data.durationMs}ms`,
          payload: data,
        };
      case EVENT_TYPES.TRACK_STARTED:
        return {
          category: "community",
          eventType: "track.started",
          actorId: data.requestedBy,
          targetId: null,
          channelId: null,
          summary: `Track played: ${data.title}`,
          payload: data,
        };
      default:
        return null;
    }
  }

  /** @returns {{ok: boolean, status: number, reason?: string, entryId?: number}} */
  function ingestEnvelope(envelope) {
    const check = validateEvent(envelope);
    if (!check.ok) {
      metrics.inc("ingest_rejected_total", { reason: "invalid" });
      return { ok: false, status: 400, reason: check.errors.join("; ") };
    }

    const guildId = envelope.guildId;
    const projected = projectContract(envelope);
    if (!projected) {
      metrics.inc("ingest_rejected_total", { reason: "unsupported" });
      return { ok: false, status: 422, reason: `Unsupported contract '${envelope.type}'.` };
    }

    if (!enabled(guildId, projected.category)) {
      metrics.inc("ingest_skipped_total", { reason: "category-disabled" });
      return { ok: true, status: 202, skipped: "category-disabled" };
    }
    if (ignored(guildId, { channelId: projected.channelId, actorId: projected.actorId })) {
      metrics.inc("ingest_skipped_total", { reason: "ignored" });
      return { ok: true, status: 202, skipped: "ignored" };
    }

    const result = persist({
      guildId,
      category: projected.category,
      eventType: projected.eventType,
      actorId: projected.actorId,
      targetId: projected.targetId,
      channelId: projected.channelId,
      summary: projected.summary,
      payload: { ...projected.payload, envelope: { id: envelope.id, type: envelope.type, version: envelope.version, source: envelope.source } },
      sourceBot: envelope.source,
      eventId: envelope.id,
      occurredAt: envelope.occurredAt,
      receivedAt: nowIso(clock),
    });

    metrics.inc("ingested_events_total", { type: envelope.type, source: envelope.source });
    return { ok: true, status: result.inserted ? 202 : 200, duplicate: !result.inserted, entryId: result.id };
  }

  function search(guildId, filters = {}) {
    const { page, pageSize, offset, limit } = paginate({
      page: filters.page,
      pageSize: filters.pageSize ?? 10,
    });
    const rows = repo.search(guildId, filters, { limit, offset });
    const total = repo.count(guildId, filters);
    return {
      rows,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / pageSize)),
      pageSize,
    };
  }

  function get(guildId, id) {
    return repo.find(guildId, id);
  }

  function exportJson(guildId, filters = {}) {
    const rows = repo.exportRows(guildId, filters, exportMaxRows);
    return {
      rows,
      truncated: rows.length >= exportMaxRows,
      json: JSON.stringify(
        {
          exportedAt: nowIso(clock),
          guildId,
          filters,
          count: rows.length,
          truncated: rows.length >= exportMaxRows,
          entries: rows,
        },
        null,
        2,
      ),
    };
  }

  function applyRetention(guildId) {
    const days = settings.get(guildId, "retentionDays");
    const cutoff = new Date(clock().getTime() - Number(days) * 86_400_000).toISOString();
    const deleted = repo.purgeBefore(guildId, cutoff);
    if (deleted > 0) logger.info("audit retention applied", { guildId, days, deleted });
    return deleted;
  }

  function retentionSweep() {
    let deleted = 0;
    for (const guildId of settings.list()) deleted += applyRetention(guildId);
    return deleted;
  }

  return {
    attachClient,
    recordDiscord,
    ingestEnvelope,
    search,
    get,
    exportJson,
    applyRetention,
    retentionSweep,
    stats: (guildId) => repo.stats(guildId),
  };
}

