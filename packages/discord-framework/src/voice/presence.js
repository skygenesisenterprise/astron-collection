/**
 * Official voice presence manager.
 *
 * Behaviour (see the architecture issue):
 *
 *  - joins the single configured official presence channel, silently, after the
 *    client is ready, without any user command;
 *  - never joins a guild other than the configured official guild;
 *  - validates the guild, the channel id, the channel type and the ViewChannel /
 *    Connect permissions before connecting;
 *  - reconnects with exponential backoff and jitter, without flooding logs;
 *  - never opens a second connection when one already exists, and defers to an
 *    active audio session instead of competing with it;
 *  - cleans up on shutdown and exposes a health-readable state;
 *  - never blocks business features: every failure is reported, none is thrown
 *    at startup.
 */

import { ERROR_CODES } from "../errors.js";
import { resolveVoicePresenceConfig } from "../config/official.js";
import { createVoiceSessionCoordinator } from "./session.js";

export const VOICE_PRESENCE_STATUS = Object.freeze({
  DISABLED: "disabled",
  IDLE: "idle",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  DEFERRED: "deferred",
  RECONNECTING: "reconnecting",
  FAILED: "failed",
  STOPPED: "stopped",
});

const VOICE_CHANNEL_TYPES = new Set([2, 13]); // GuildVoice, GuildStageVoice
const REQUIRED_PERMISSIONS = ["ViewChannel", "Connect"];

function sleepDefault(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * @param {object} options
 * @param {string} options.bot
 * @param {any} options.client Discord client.
 * @param {object} options.config Parsed bot config (uses `voicePresence`).
 * @param {object} options.logger
 * @param {object} options.voice Adapter (see voice/adapter.js).
 * @param {object} [options.sessions] Session coordinator.
 * @param {number} [options.baseDelayMs] First reconnect delay.
 * @param {number} [options.maxDelayMs]
 * @param {number} [options.maxAttempts]
 * @param {number} [options.jitterRatio] 0..1, fraction of the delay randomised.
 * @param {() => number} [options.random]
 * @param {() => number} [options.clock]
 * @param {(ms: number) => Promise<unknown>} [options.sleep]
 */
export function createVoicePresenceManager({
  bot,
  client,
  config,
  logger,
  voice,
  sessions = createVoiceSessionCoordinator(),
  baseDelayMs = 2_000,
  maxDelayMs = 60_000,
  maxAttempts = 10,
  jitterRatio = 0.3,
  random = Math.random,
  clock = () => Date.now(),
  sleep = sleepDefault,
  fetchChannel = (channelId) => client.channels.fetch(channelId),
} = {}) {
  if (!bot) throw new Error("createVoicePresenceManager requires the bot name.");
  if (!client) throw new Error("createVoicePresenceManager requires the client.");
  if (!voice) throw new Error("createVoicePresenceManager requires a voice adapter.");

  const resolved = resolveVoicePresenceConfig({
    enabled: config?.voice?.enabled ?? config?.voicePresence?.enabled ?? false,
    officialGuildId: config?.voice?.officialGuildId ?? config?.voicePresence?.guildId ?? "",
    presenceChannelId:
      config?.voice?.presenceChannelId || config?.voicePresence?.channelId || undefined,
  });

  let status = resolved.enabled ? VOICE_PRESENCE_STATUS.IDLE : VOICE_PRESENCE_STATUS.DISABLED;
  let lastReason = resolved.reason;
  // Configured, or derived once from the presence channel. Never guessed.
  let officialGuildId = resolved.guildId;
  let connection = null;
  let boundConnection = null;
  let attempts = 0;
  let connectedAt = null;
  let lastError = null;
  let reconnectTimer = null;
  let stopped = false;
  let unlisten = [];
  const logged = new Set();

  function logOnce(key, level, message, details) {
    if (logged.has(key)) return;
    logged.add(key);
    logger?.[level]?.(message, details);
  }

  function setStatus(next) {
    if (status === next) return;
    status = next;
    logger?.debug("voice presence state", { status, guildId: officialGuildId, channelId: resolved.channelId });
  }

  function hasSession() {
    return officialGuildId ? sessions.hasLease(officialGuildId) : false;
  }

  function state() {
    return {
      status,
      guildId: officialGuildId,
      guildIdSource: officialGuildId ? resolved.guildIdSource : "none",
      channelId: resolved.channelId,
      reason: lastReason,
      attempts,
      connectedAt,
      connectedSinceMs: connectedAt ? clock() - connectedAt : 0,
      lastError,
      sessions: officialGuildId ? sessions.forGuild(officialGuildId).length : 0,
      joined: connection !== null && voice.isReady(connection),
    };
  }

  function health() {
    const healthy =
      status === VOICE_PRESENCE_STATUS.CONNECTED ||
      status === VOICE_PRESENCE_STATUS.DEFERRED ||
      status === VOICE_PRESENCE_STATUS.DISABLED;
    return { ok: healthy, ...state() };
  }

  function validateChannel(channel) {
    if (!channel) {
      return { ok: false, code: ERROR_CODES.VOICE_CHANNEL_INVALID, reason: "channel-unavailable" };
    }

    const channelGuildId = channel.guildId ?? channel.guild?.id;

    if (!officialGuildId || channelGuildId !== officialGuildId) {
      return { ok: false, code: ERROR_CODES.VOICE_WRONG_GUILD, reason: "wrong-guild" };
    }

    if (channel.id !== resolved.channelId) {
      return { ok: false, code: ERROR_CODES.VOICE_CHANNEL_INVALID, reason: "wrong-channel" };
    }

    const type = channel.type;
    if (typeof channel.isVoiceBased === "function" ? !channel.isVoiceBased() : !VOICE_CHANNEL_TYPES.has(type)) {
      return { ok: false, code: ERROR_CODES.VOICE_CHANNEL_INVALID, reason: "not-a-voice-channel" };
    }

    return { ok: true };
  }

  function checkPermissions(channel) {
    const me = channel.guild?.members?.me;
    const permissions = channel.permissionsFor?.(me);

    if (!permissions || typeof permissions.has !== "function") {
      // Unknown permissions are refused: fail-closed.
      return { ok: false, code: ERROR_CODES.VOICE_MISSING_PERMISSION, reason: "permissions-unknown" };
    }

    if (!permissions.has(REQUIRED_PERMISSIONS)) {
      return { ok: false, code: ERROR_CODES.VOICE_MISSING_PERMISSION, reason: "missing-permissions" };
    }

    return { ok: true };
  }

  function unbind() {
    for (const off of unlisten.splice(0)) {
      try {
        off();
      } catch {
        // listener already gone
      }
    }
    boundConnection = null;
  }

  function bind(connection_) {
    // The same connection is bound once, even across reconnects: duplicated
    // listeners are what turns a flapping connection into a reconnect loop.
    if (boundConnection === connection_) return;
    unbind();
    boundConnection = connection_;

    const onStateChange = (oldState, newState) => {
      if (stopped) return;

      if (newState.status === "ready") {
        attempts = 0;
        connectedAt = connectedAt ?? clock();
        setStatus(VOICE_PRESENCE_STATUS.CONNECTED);
        logOnce("connected", "info", "voice presence connected", {
          guildId: officialGuildId,
          channelId: resolved.channelId,
        });
        return;
      }

      if (newState.status === "disconnected") {
        connectedAt = null;
        scheduleReconnect("connection-disconnected");
        return;
      }

      if (newState.status === "destroyed") {
        connectedAt = null;
        if (!stopped) scheduleReconnect("connection-destroyed");
      }
    };

    connection_.on("stateChange", onStateChange);
    unlisten.push(() => connection_.off?.("stateChange", onStateChange));
  }

  function scheduleReconnect(reason) {
    if (stopped || reconnectTimer) return;

    if (hasSession()) {
      setStatus(VOICE_PRESENCE_STATUS.DEFERRED);
      logOnce("deferred", "info", "voice presence deferred to the active audio session", {
        reason,
      });
      return;
    }

    if (attempts >= maxAttempts) {
      setStatus(VOICE_PRESENCE_STATUS.FAILED);
      lastError = reason;
      logOnce("gave-up", "warn", "voice presence gave up reconnecting", {
        reason,
        attempts,
        guildId: officialGuildId,
      });
      return;
    }

    attempts += 1;
    const backoff = Math.min(baseDelayMs * 2 ** (attempts - 1), maxDelayMs);
    const jitter = backoff * jitterRatio * random();
    const delay = Math.round(backoff + jitter);

    setStatus(VOICE_PRESENCE_STATUS.RECONNECTING);
    logger?.debug("voice presence reconnecting", { attempt: attempts, delayMs: delay, reason });

    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      void connect();
    }, delay);
    reconnectTimer.unref?.();
  }

  async function connect() {
    if (stopped) return state();

    if (!resolved.enabled) {
      setStatus(VOICE_PRESENCE_STATUS.DISABLED);
      logOnce("disabled", "info", "voice presence disabled", { reason: resolved.reason });
      return state();
    }

    if (!resolved.channelId) {
      setStatus(VOICE_PRESENCE_STATUS.DISABLED);
      return state();
    }

    // A session may already own the guild's connection.
    if (hasSession()) {
      setStatus(VOICE_PRESENCE_STATUS.DEFERRED);
      return state();
    }

    let channel;
    try {
      channel = await fetchChannel(resolved.channelId);
    } catch (error) {
      lastError = "channel-fetch-failed";
      logger?.warn("voice presence channel unavailable", { err: error, channelId: resolved.channelId });
      scheduleReconnect("channel-fetch-failed");
      return state();
    }

    if (!channel) {
      lastError = "channel-unavailable";
      logger?.warn("voice presence refused", {
        code: ERROR_CODES.VOICE_CHANNEL_INVALID,
        reason: "channel-unavailable",
        channelId: resolved.channelId,
      });
      setStatus(VOICE_PRESENCE_STATUS.FAILED);
      return state();
    }

    if (hasSession()) {
      setStatus(VOICE_PRESENCE_STATUS.DEFERRED);
      return state();
    }

    let existing = voice.getConnection(officialGuildId);
    const existingStatus = existing ? voice.statusOf(existing) : null;

    if (existing && existingStatus === "disconnected") {
      // A disconnected connection is not reusable: drop it before rejoining.
      unbind();
      voice.destroy(existing);
      existing = null;
    }

    if (existing && existingStatus !== "destroyed") {
      // Adopt instead of joining twice (a session owner already connected).
      connection = existing;
      bind(existing);
      if (voice.isReady(existing)) {
        connectedAt ??= clock();
        setStatus(VOICE_PRESENCE_STATUS.CONNECTED);
      } else {
        setStatus(VOICE_PRESENCE_STATUS.CONNECTING);
      }
      return state();
    }

    const validation = validateChannel(channel);
    if (!validation.ok) {
      lastError = validation.reason;
      logger?.warn("voice presence refused", {
        code: validation.code,
        reason: validation.reason,
        guildId: officialGuildId,
        channelId: resolved.channelId,
      });
      setStatus(VOICE_PRESENCE_STATUS.FAILED);
      return state();
    }

    const permission = checkPermissions(channel);
    if (!permission.ok) {
      lastError = permission.reason;
      logger?.warn("voice presence refused: permissions", { reason: permission.reason });
      setStatus(VOICE_PRESENCE_STATUS.FAILED);
      return state();
    }

    setStatus(VOICE_PRESENCE_STATUS.CONNECTING);

    try {
      connection = voice.join(channel, { selfDeaf: true, selfMute: true });
      bind(connection);
      if (voice.isReady(connection)) {
        connectedAt = clock();
        setStatus(VOICE_PRESENCE_STATUS.CONNECTED);
      }
    } catch (error) {
      lastError = error.message;
      logger?.warn("voice presence join failed", { err: error });
      scheduleReconnect("join-failed");
    }

    return state();
  }

  async function start() {
    stopped = false;
    return connect();
  }

  async function stop() {
    stopped = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }

    unbind();

    const sessionActive = hasSession();

    if (connection && !sessionActive) {
      try {
        voice.destroy(connection);
      } catch (error) {
        logger?.debug("voice connection destroy failed", { err: error });
      }
    }

    connection = null;
    connectedAt = null;
    setStatus(VOICE_PRESENCE_STATUS.STOPPED);
    return state();
  }

  return {
    bot,
    start,
    stop,
    state,
    health,
    sessions,
    getConnection: () =>
      connection ?? (officialGuildId ? voice.getConnection(officialGuildId) : null) ?? null,
    get status() {
      return status;
    },
    config: resolved,
  };
}
