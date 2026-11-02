import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { OFFICIAL_GUILD_ID, resolveVoicePresenceConfig } from "../src/config/official.js";
import {
  VOICE_PRESENCE_STATUS,
  createVoicePresenceManager,
} from "../src/voice/presence.js";
import { createVoiceSessionCoordinator } from "../src/voice/session.js";
import {
  BOT,
  GUILD_ID,
  OTHER_GUILD_ID,
  PRESENCE_CHANNEL_ID,
  collectLogs,
  fakeChannel,
  fakeConnection,
  fakeVoice,
  tick,
  voiceConfig,
} from "./helpers.js";

function buildManager({
  voice = fakeVoice(),
  config = voiceConfig(),
  channel = fakeChannel(),
  sessions = createVoiceSessionCoordinator(),
  logger,
  ...rest
} = {}) {
  const { logger: defaultLogger, records } = collectLogs();

  const manager = createVoicePresenceManager({
    bot: BOT,
    client: {},
    config,
    logger: logger ?? defaultLogger,
    voice,
    sessions,
    fetchChannel: async () => (typeof channel === "function" ? channel() : channel),
    baseDelayMs: 1,
    maxDelayMs: 2,
    jitterRatio: 0,
    ...rest,
  });

  return { manager, voice, records, sessions };
}

describe("official voice presence configuration", () => {
  it("uses the central official channel by default", () => {
    const resolved = resolveVoicePresenceConfig({ enabled: true, officialGuildId: GUILD_ID });
    assert.equal(resolved.enabled, true);
    assert.equal(resolved.channelId, PRESENCE_CHANNEL_ID);
  });

  it("defaults to the central official guild", () => {
    const resolved = resolveVoicePresenceConfig({ enabled: true });
    assert.equal(resolved.enabled, true);
    assert.equal(resolved.guildId, OFFICIAL_GUILD_ID);
    assert.equal(resolved.guildIdSource, "official");
  });

  it("refuses a malformed explicit guild id", () => {
    const resolved = resolveVoicePresenceConfig({ enabled: true, officialGuildId: "not-a-guild" });
    assert.equal(resolved.enabled, false);
    assert.equal(resolved.reason, "invalid-official-guild");
  });

  it("disables presence when explicitly turned off", () => {
    const resolved = resolveVoicePresenceConfig({ enabled: false, officialGuildId: GUILD_ID });
    assert.equal(resolved.enabled, false);
    assert.equal(resolved.reason, "disabled");
  });

  it("rejects a malformed channel id", () => {
    const resolved = resolveVoicePresenceConfig({
      enabled: true,
      officialGuildId: GUILD_ID,
      presenceChannelId: "not-a-snowflake",
    });
    assert.equal(resolved.enabled, false);
    assert.equal(resolved.reason, "invalid-channel-id");
  });
});

describe("voice presence manager", () => {
  it("never connects when disabled", async () => {
    const { manager, voice } = buildManager({
      config: voiceConfig({ enabled: false }),
    });

    await manager.start();

    assert.equal(voice.joins.length, 0);
    assert.equal(manager.state().status, VOICE_PRESENCE_STATUS.DISABLED);
  });

  it("joins the central official guild when no guild is configured", async () => {
    const { manager, voice } = buildManager({
      config: voiceConfig({ officialGuildId: "" }),
      channel: fakeChannel({ guildId: OFFICIAL_GUILD_ID }),
    });

    await manager.start();

    assert.deepEqual(voice.joins, [
      { guildId: OFFICIAL_GUILD_ID, channelId: PRESENCE_CHANNEL_ID },
    ]);
    assert.equal(manager.state().guildId, OFFICIAL_GUILD_ID);
    assert.equal(manager.state().guildIdSource, "official");
  });

  it("joins the configured channel silently and reports readiness", async () => {
    const { manager, voice } = buildManager();

    await manager.start();
    assert.deepEqual(voice.joins, [{ guildId: GUILD_ID, channelId: PRESENCE_CHANNEL_ID }]);

    voice.current.setStatus("ready");

    assert.equal(manager.state().status, VOICE_PRESENCE_STATUS.CONNECTED);
    assert.equal(manager.state().joined, true);
    assert.equal(manager.health().ok, true);
  });

  it("refuses to join a channel belonging to another guild", async () => {
    const { manager, voice, records } = buildManager({
      channel: fakeChannel({ guildId: OTHER_GUILD_ID }),
    });

    await manager.start();

    assert.equal(voice.joins.length, 0);
    assert.equal(manager.state().status, VOICE_PRESENCE_STATUS.FAILED);
    assert.equal(manager.state().lastError, "wrong-guild");
    assert.ok(records.some((record) => record.msg === "voice presence refused"));
  });

  it("refuses a channel that is not a voice channel", async () => {
    const { manager, voice } = buildManager({
      channel: fakeChannel({ type: 0, voiceBased: false }),
    });

    await manager.start();

    assert.equal(voice.joins.length, 0);
    assert.equal(manager.state().lastError, "not-a-voice-channel");
  });

  it("refuses a deleted or inaccessible channel", async () => {
    const { manager, voice } = buildManager({ channel: null });

    await manager.start();

    assert.equal(voice.joins.length, 0);
    assert.equal(manager.state().status, VOICE_PRESENCE_STATUS.FAILED);
    assert.equal(manager.state().lastError, "channel-unavailable");
  });

  it("refuses to join without ViewChannel and Connect", async () => {
    const { manager, voice } = buildManager({
      channel: fakeChannel({ permissions: ["ViewChannel"] }),
    });

    await manager.start();

    assert.equal(voice.joins.length, 0);
    assert.equal(manager.state().lastError, "missing-permissions");
  });

  it("adopts an existing connection instead of opening a second one", async () => {
    const existing = fakeConnection("ready");
    const { manager, voice } = buildManager({ voice: fakeVoice({ existing }) });

    await manager.start();

    assert.equal(voice.joins.length, 0);
    assert.equal(manager.state().status, VOICE_PRESENCE_STATUS.CONNECTED);
    assert.equal(manager.getConnection(), existing);
  });

  it("reconnects with a bounded backoff after a disconnect", async () => {
    const { manager, voice } = buildManager();
    await manager.start();
    voice.current.setStatus("ready");

    voice.current.setStatus("disconnected");
    assert.equal(manager.state().status, VOICE_PRESENCE_STATUS.RECONNECTING);
    assert.equal(manager.state().attempts, 1);

    await tick(25);

    assert.equal(voice.joins.length, 2);
    assert.equal(manager.getConnection()?.listenerCount("stateChange"), 1);
  });

  it("gives up after the configured number of attempts", async () => {
    const { manager, voice } = buildManager({ maxAttempts: 0 });
    await manager.start();
    voice.current.setStatus("ready");

    voice.current.setStatus("disconnected");

    assert.equal(manager.state().status, VOICE_PRESENCE_STATUS.FAILED);
  });

  it("defers to an active audio session", async () => {
    const sessions = createVoiceSessionCoordinator();
    const { manager, voice } = buildManager({ sessions });

    const lease = sessions.acquire({ guildId: GUILD_ID, owner: "player" });
    await manager.start();

    assert.equal(voice.joins.length, 0);
    assert.equal(manager.state().status, VOICE_PRESENCE_STATUS.DEFERRED);
    assert.equal(manager.state().sessions, 1);

    lease.release();
  });

  it("does not destroy a connection owned by a session on shutdown", async () => {
    const sessions = createVoiceSessionCoordinator();
    const { manager, voice } = buildManager({ sessions });

    await manager.start();
    voice.current.setStatus("ready");

    const lease = sessions.acquire({ guildId: GUILD_ID, owner: "player" });
    await manager.stop();

    assert.notEqual(voice.current?.state?.status, "destroyed");
    lease.release();
  });

  it("cleans up its connection and listeners on shutdown", async () => {
    const { manager, voice } = buildManager();
    await manager.start();
    const connection = voice.current;
    connection.setStatus("ready");

    await manager.stop();

    assert.equal(manager.state().status, VOICE_PRESENCE_STATUS.STOPPED);
    assert.equal(connection.listenerCount("stateChange"), 0);
    assert.equal(voice.current, null);
  });

  it("does not reconnect after shutdown", async () => {
    const { manager, voice } = buildManager();
    await manager.start();
    const connection = voice.current;
    connection.setStatus("ready");

    await manager.stop();
    connection.setStatus("disconnected");
    await tick(10);

    assert.equal(voice.joins.length, 1);
  });
});
