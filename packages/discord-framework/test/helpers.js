import { EventEmitter } from "node:events";
import { createCommandDefinition, defineCommand } from "../src/commands/contract.js";
import { createLogger } from "../src/logger.js";

export const BOT = "testbot";
export const GUILD_ID = "110000000000000000";
export const OTHER_GUILD_ID = "120000000000000000";
export const PRESENCE_CHANNEL_ID = "1564590674194473000";

export function collectLogs() {
  const records = [];
  const logger = createLogger({
    bot: BOT,
    level: "debug",
    sink: (record) => records.push(record),
    clock: () => new Date("2026-01-01T00:00:00.000Z"),
  });
  return { logger, records };
}

/** Minimal PermissionsBitField double: named permissions plus an optional mask. */
export function bitfield(granted = [], mask = 0n) {
  const set = new Set(granted.map(String));
  return {
    mask,
    has(required) {
      const list = Array.isArray(required) ? required : [required];
      return list.every((permission) => {
        if (typeof permission === "bigint") return mask !== 0n && (mask & permission) === permission;
        return set.has(String(permission));
      });
    },
  };
}

export function testCommand({
  name = "ping",
  type = 1,
  execute = async () => {},
  permissions,
  cooldown,
  dmPermission = false,
  defaultMemberPermissions,
  availability,
  autocomplete,
  handlers,
} = {}) {
  const data = createCommandDefinition(name, `Description of ${name}`);
  const json = data.toJSON();
  json.type = type;
  if (dmPermission) json.dm_permission = true;
  if (defaultMemberPermissions !== undefined) {
    json.default_member_permissions = defaultMemberPermissions;
  }

  return defineCommand({
    data: { toJSON: () => json },
    execute,
    autocomplete,
    bot: BOT,
    availability,
    permissions,
    cooldown,
    handlers,
  });
}

export function chatInput({
  commandName = "ping",
  guildId = GUILD_ID,
  userId = "user-1",
  userPermissions = [],
  botPermissions = [],
} = {}) {
  const replies = [];
  const interaction = {
    commandName,
    user: { id: userId, tag: "User#0001" },
    guildId,
    guild: {
      id: guildId,
      members: { me: { id: "bot-1", permissions: bitfield(botPermissions) } },
    },
    memberPermissions: bitfield(userPermissions),
    replied: false,
    deferred: false,
    reply: async (payload) => {
      replies.push(payload);
      interaction.replied = true;
      return payload;
    },
    followUp: async (payload) => {
      replies.push(payload);
      return payload;
    },
    inGuild: () => Boolean(guildId),
    isChatInputCommand: () => true,
    isUserContextMenuCommand: () => false,
    isMessageContextMenuCommand: () => false,
    isAutocomplete: () => false,
    isButton: () => false,
    isAnySelectMenu: () => false,
    isModalSubmit: () => false,
    replies,
  };
  return interaction;
}

export function componentInteraction(kind, customId) {
  const replies = [];
  const interaction = {
    customId,
    user: { id: "user-1" },
    guildId: GUILD_ID,
    replied: false,
    deferred: false,
    reply: async (payload) => {
      replies.push(payload);
      interaction.replied = true;
    },
    followUp: async (payload) => {
      replies.push(payload);
    },
    inGuild: () => true,
    isChatInputCommand: () => false,
    isUserContextMenuCommand: () => false,
    isMessageContextMenuCommand: () => false,
    isAutocomplete: () => false,
    isButton: () => kind === "button",
    isAnySelectMenu: () => kind === "select",
    isModalSubmit: () => kind === "modal",
    replies,
  };
  return interaction;
}

export function fakeClient({ login } = {}) {
  const client = new EventEmitter();
  client.user = { id: "bot-1", tag: "Bot#0001" };
  client.guilds = { cache: new Map([[GUILD_ID, { id: GUILD_ID, memberCount: 3 }]]) };
  client.login = async () => {
    if (login) await login();
    client.emit("clientReady", client);
  };
  client.destroy = async () => {
    client.emit("destroyed");
  };
  return client;
}

export function fakeChannel({
  guildId = GUILD_ID,
  channelId = PRESENCE_CHANNEL_ID,
  type = 2,
  voiceBased = true,
  permissions = ["ViewChannel", "Connect"],
} = {}) {
  return {
    id: channelId,
    type,
    guildId,
    isVoiceBased: () => voiceBased,
    guild: {
      id: guildId,
      members: { me: { id: "bot-1" } },
      voiceAdapterCreator: () => ({ createVoiceConnection: () => {} }),
    },
    permissionsFor: () => bitfield(permissions),
  };
}

export function fakeConnection(status = "connecting") {
  const connection = new EventEmitter();
  connection.state = { status };
  connection.destroy = () => {
    connection.state = { status: "destroyed" };
    connection.emit("stateChange", { status: "ready" }, { status: "destroyed" });
  };
  connection.setStatus = (next) => {
    const previous = connection.state;
    connection.state = { status: next };
    connection.emit("stateChange", previous, connection.state);
  };
  return connection;
}

export function fakeVoice({ existing = null } = {}) {
  const joins = [];
  let current = existing;

  return {
    joins,
    STATUS: { Ready: "ready", Disconnected: "disconnected", Destroyed: "destroyed" },
    join(channel) {
      joins.push({ guildId: channel.guildId, channelId: channel.id });
      current = fakeConnection("connecting");
      return current;
    },
    getConnection() {
      return current;
    },
    destroy(connection) {
      connection?.destroy?.();
      current = null;
    },
    isReady(connection) {
      return connection?.state?.status === "ready";
    },
    statusOf(connection) {
      return connection?.state?.status ?? "unknown";
    },
    get current() {
      return current;
    },
  };
}

export function voiceConfig({
  enabled = true,
  officialGuildId = GUILD_ID,
  presenceChannelId = PRESENCE_CHANNEL_ID,
} = {}) {
  return {
    bot: BOT,
    voice: { enabled, officialGuildId, presenceChannelId },
  };
}

export const tick = (ms = 5) => new Promise((resolve) => setTimeout(resolve, ms));
