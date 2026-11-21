/**
 * Automated protection.
 *
 * Detection is stateful within the process (sliding windows) and every decision
 * is written to the detections table and mirrored as a `security.alert` event.
 * The thresholds are per-guild settings, never global constants.
 */

import { EVENT_TYPES, nowIso } from "@astron-collection/discord-framework";

const WINDOW_MS = 60_000;
const SUSPICIOUS_HOSTS = [
  /(^|\.)dlscord/i,
  /(^|\.)discord[-.]?(gift|nitro|free)/i,
  /(^|\.)steamcommu[a-z0-9-]*ty/i,
  /(^|\.)free[-.]?nitro/i,
  /(^|\.)nitro[-.]?gift/i,
  /(^|\.)gift[-.]?discord/i,
  /(^|\.)airdrop[-.]?steam/i,
];

export function isPhishing(content) {
  if (typeof content !== "string") return false;
  const urls = content.match(/https?:\/\/[^\s<>()]+/gi) ?? [];

  for (const raw of urls) {
    try {
      const host = new URL(raw).hostname;
      if (SUSPICIOUS_HOSTS.some((pattern) => pattern.test(host))) return true;
    } catch {
      // A malformed URL is not evidence of phishing.
    }
  }

  return false;
}

export function createSecurityService({
  settings,
  detections,
  cases,
  quarantine,
  outbox,
  logger,
  metrics,
  clock = () => Date.now(),
}) {
  /** @type {Map<string, number[]>} guild:user -> message timestamps */
  const messageWindows = new Map();
  /** @type {Map<string, number[]>} guild -> join timestamps */
  const joinWindows = new Map();

  function prune(timestamps, windowMs) {
    const cutoff = clock() - windowMs;
    return timestamps.filter((timestamp) => timestamp > cutoff);
  }

  function alert({ guildId, kind, severity, userId = null, channelId = null, detail, actionTaken }) {
    detections.record({ guildId, kind, severity, userId, channelId, detail: detail.slice(0, 1000), actionTaken });
    outbox.enqueue(EVENT_TYPES.SECURITY_ALERT, {
      guildId,
      data: {
        kind,
        severity,
        userId,
        channelId,
        detail: detail.slice(0, 1000),
        actionTaken: actionTaken.slice(0, 200),
      },
    });
    metrics.inc("security_detections_total", { kind, severity });
    logger.warn("security detection", { guildId, kind, severity, userId, actionTaken });
  }

  async function deleteMessage(message) {
    try {
      await message.delete();
      return true;
    } catch (error) {
      logger.debug("could not delete message", { messageId: message.id, err: error });
      return false;
    }
  }

  async function timeoutMember(member, seconds, reason) {
    try {
      await member.timeout(seconds * 1000, reason);
      return true;
    } catch (error) {
      logger.debug("could not timeout member", { userId: member?.id, err: error });
      return false;
    }
  }

  async function onMessage(message) {
    if (!message.guild || message.author.bot) return { action: "ignored" };

    const guildId = message.guild.id;
    const config = settings.getAll(guildId);

    if (config.antiphish.enabled && isPhishing(message.content)) {
      const deleted = await deleteMessage(message);
      alert({
        guildId,
        kind: "phishing",
        severity: "high",
        userId: message.author.id,
        channelId: message.channelId,
        detail: "Suspicious phishing link detected and removed.",
        actionTaken: deleted ? "message deleted" : "detection only (delete failed)",
      });
      return { action: deleted ? "deleted" : "detected", kind: "phishing" };
    }

    if (config.mentionSpam.enabled && message.mentions.users.size > config.mentionSpam.maxMentions) {
      const deleted = await deleteMessage(message);
      alert({
        guildId,
        kind: "mention_spam",
        severity: "medium",
        userId: message.author.id,
        channelId: message.channelId,
        detail: `Message mentioned ${message.mentions.users.size} users (max ${config.mentionSpam.maxMentions}).`,
        actionTaken: deleted ? "message deleted" : "detection only",
      });
      return { action: "deleted", kind: "mention_spam" };
    }

    if (config.antispam.enabled) {
      const key = `${guildId}:${message.author.id}`;
      const window = prune([...(messageWindows.get(key) ?? []), clock()], config.antispam.windowSeconds * 1000);
      messageWindows.set(key, window);

      if (window.length > config.antispam.maxMessages) {
        messageWindows.delete(key);
        const deleted = await deleteMessage(message);
        const member = message.member ?? (await message.guild.members.fetch(message.author.id).catch(() => null));
        const timedOut = member ? await timeoutMember(member, config.antispam.timeoutSeconds, "Anti-spam") : false;

        alert({
          guildId,
          kind: "spam",
          severity: "medium",
          userId: message.author.id,
          channelId: message.channelId,
          detail: `More than ${config.antispam.maxMessages} messages in ${config.antispam.windowSeconds}s.`,
          actionTaken: [deleted ? "message deleted" : "delete failed", timedOut ? "member timed out" : "no timeout"]
            .join(", ")
            .slice(0, 200),
        });

        if (timedOut) {
          cases.create({
            guildId,
            action: "timeout",
            targetId: message.author.id,
            targetTag: message.author.tag,
            moderatorId: message.client.user.id,
            moderatorTag: message.client.user.tag,
            reason: "Anti-spam automatique",
            durationSeconds: config.antispam.timeoutSeconds,
          });
        }

        return { action: "timeout", kind: "spam" };
      }
    }

    return { action: "allowed" };
  }

  async function onMemberJoin(member) {
    const guildId = member.guild.id;
    const config = settings.getAll(guildId);
    if (!config.antiraid.enabled) return { action: "allowed" };

    const now = clock();
    const window = prune([...(joinWindows.get(guildId) ?? []), now], WINDOW_MS);
    joinWindows.set(guildId, window);

    const accountAgeMs = now - member.user.createdTimestamp;
    const tooNew = accountAgeMs < config.antiraid.minAccountAgeDays * 86_400_000;
    const raidDetected = window.length >= config.antiraid.joinsPerMinute;

    if (!tooNew && !raidDetected) return { action: "allowed" };

    let actionTaken = "alert only";
    if (config.antiraid.action === "quarantine") {
      try {
        await quarantine.apply({
          guild: member.guild,
          member,
          reason: raidDetected ? "Anti-raid: quarantine" : "Anti-raid: new account",
          actorId: "system",
        });
        actionTaken = "member quarantined";
      } catch (error) {
        logger.warn("anti-raid quarantine failed", { guildId, userId: member.id, err: error });
      }
    } else if (config.antiraid.action === "kick") {
      try {
        await member.kick("Anti-raid");
        actionTaken = "member kicked";
      } catch (error) {
        logger.warn("anti-raid kick failed", { guildId, userId: member.id, err: error });
      }
    }

    alert({
      guildId,
      kind: "raid",
      severity: raidDetected ? "critical" : "medium",
      userId: member.id,
      detail: raidDetected
        ? `${window.length} joins within ${WINDOW_MS / 1000}s (threshold ${config.antiraid.joinsPerMinute}).`
        : `Account created ${Math.round(accountAgeMs / 86_400_000)} day(s) ago (minimum ${config.antiraid.minAccountAgeDays}).`,
      actionTaken,
    });

    return { action: actionTaken };
  }

  async function onMemberRemove(member) {
    if (!quarantine.isQuarantined(member.guild.id, member.id)) return;
    quarantine.release({ guild: member.guild, member, reason: "Member left the guild", actorId: "system" }).catch(() => {});
  }

  async function onAutomodExecution(execution) {
    const guildId = execution.guild?.id;
    if (!guildId) return;

    alert({
      guildId,
      kind: "automod",
      severity: "medium",
      userId: execution.userId ?? null,
      channelId: execution.channelId ?? null,
      detail: `Discord AutoModeration rule ${execution.ruleId ?? "unknown"} triggered (${execution.action?.type ?? "unknown"}).`,
      actionTaken: "recorded",
    });
  }

  async function status(guildId) {
    return {
      settings: settings.getAll(guildId),
      detections24h: detections.countSince(guildId, new Date(clock() - 86_400_000).toISOString()),
      recent: detections.recent(guildId, 5),
    };
  }

  return { onMessage, onMemberJoin, onMemberRemove, onAutomodExecution, status, isPhishing, alert, nowIso };
}
