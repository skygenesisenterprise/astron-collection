/** Runtime status shared by `/status` and its refresh button. */

import {
  COLORS,
  formatDuration,
  formatNumber,
} from "@astron-collection/discord-framework/ui";
import { embed } from "@astron-collection/discord-framework/ui";

export function createStatusService({ bot, config, db, registry, metrics }) {
  function databaseOk() {
    try {
      return db.get("SELECT 1 AS ok")?.ok === 1;
    } catch {
      return false;
    }
  }

  function snapshot(client) {
    return {
      bot,
      tag: client?.user?.tag ?? "unknown",
      id: client?.user?.id ?? "unknown",
      uptimeMs: client?.uptime ?? Math.round(process.uptime() * 1000),
      guilds: client?.guilds?.cache?.size ?? 0,
      commands: registry.size,
      ping: client?.ws?.ping ?? null,
      memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
      database: databaseOk(),
      version: config.version,
      environment: config.environment,
      node: process.version,
    };
  }

  function render(client) {
    const state = snapshot(client);
    const status = state.database ? "Operational" : "Degraded";

    return embed({
      title: `${bot} status`,
      description: `**${status}** — generalist bot of the Astron Collection.`,
      color: state.database ? COLORS.success : COLORS.warning,
      fields: [
        { name: "Application", value: state.tag, inline: true },
        { name: "Version", value: state.version, inline: true },
        { name: "Environment", value: state.environment, inline: true },
        { name: "Uptime", value: formatDuration(state.uptimeMs), inline: true },
        { name: "Guilds", value: formatNumber(state.guilds), inline: true },
        { name: "Commands", value: formatNumber(state.commands), inline: true },
        { name: "Gateway latency", value: state.ping === null ? "—" : `${state.ping} ms`, inline: true },
        { name: "Memory (RSS)", value: `${state.memoryMb} MB`, inline: true },
        { name: "Database", value: state.database ? "SQLite OK" : "Unavailable", inline: true },
        { name: "Runtime", value: `Node ${state.node}`, inline: true },
      ],
      footer: "Astron Collection",
    });
  }

  return { snapshot, render, databaseOk, metrics };
}
