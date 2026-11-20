/** Automations composition: workflows, actions, scheduler, event ingestion. */

import path from "node:path";

import {
  createDatabase,
  createEventBus,
  createMetrics,
  createOutbox,
  createSettingsStore,
  createWebhookSink,
  runMigrations,
} from "../../../packages/discord-framework/src/index.js";
import { BOT, SETTINGS_DEFAULTS, SETTINGS_VALIDATORS } from "../config/bot.js";
import { createRunRepository } from "../repositories/runs.js";
import { createWorkflowRepository } from "../repositories/workflows.js";
import { cronMatches } from "./cron.js";
import { createWorkflowEngine, matchesTrigger, renderWorkflowText } from "./engine.js";
import { createWorkflowService } from "./workflows.js";

export async function createServices({ config, logger, registry }) {
  const dataDir = config.dataDir || path.resolve(config.botRoot, "data");
  const databasePath = config.databasePath || path.join(dataDir, `${BOT}.sqlite3`);

  const db = createDatabase({ file: databasePath, logger });
  runMigrations(db, path.resolve(config.botRoot, "migrations"), { logger });

  const metrics = createMetrics({ prefix: `astron_${BOT}` });
  const settings = createSettingsStore({
    db,
    bot: BOT,
    defaults: SETTINGS_DEFAULTS,
    validators: SETTINGS_VALIDATORS,
  });

  const sinks = [];
  if (config.eventUrl && config.eventSecret) {
    sinks.push(createWebhookSink({ url: config.eventUrl, secret: config.eventSecret, logger }));
  }
  const events = createEventBus({ source: BOT, sinks, logger, metrics });
  const outbox = createOutbox({ db, bus: events, logger });

  let client = null;
  function attachClient(discordClient) {
    client = discordClient;
  }

  const repo = createWorkflowRepository({ db });
  const runs = createRunRepository({ db });

  async function executeAction(action, context) {
    const guild = client?.guilds?.cache?.get(context.guildId);
    if (!guild) throw new Error("Guild is not cached.");

    if (action.type === "send_message") {
      const channelId = action.config.channelId ?? context.channelId;
      const channel = channelId ? client.channels.cache.get(channelId) : null;
      if (!channel?.send) throw new Error("Channel is not available.");
      await channel.send({
        content: renderWorkflowText(action.config.message, {
          ...context,
          guildName: guild.name,
        }),
        allowedMentions: { parse: [] },
      });
      return;
    }

    if (action.type === "dm") {
      const user = await client.users.fetch(context.userId);
      await user.send(renderWorkflowText(action.config.message, { ...context, guildName: guild.name }));
      return;
    }

    if (action.type === "add_role" || action.type === "remove_role") {
      const member = context.member ?? (await guild.members.fetch(context.userId));
      const role = guild.roles.cache.get(action.config.roleId);
      if (!role) throw new Error("Role is not available.");
      if (action.type === "add_role") await member.roles.add(role, "Automation");
      else await member.roles.remove(role, "Automation");
      return;
    }

    if (action.type === "emit_event") {
      outbox.enqueue(action.config.eventType, {
        guildId: context.guildId,
        data: { workflowId: context.workflowId ?? null, source: "automations" },
      });
    }
  }

  const engine = createWorkflowEngine({ repo, runs, logger, metrics, executeAction });
  const workflows = createWorkflowService({ repo, runs, engine, settings, logger });

  async function runWorkflow(workflow, trigger, context, key) {
    return engine.run(workflow, trigger, context, { idempotencyKey: key });
  }

  async function handleMessage(message) {
    if (!message.inGuild() || message.author.bot) return 0;
    const candidates = repo.enabledWithTriggerType(message.guildId, "message");
    let started = 0;

    for (const workflow of candidates) {
      const triggers = repo
        .listTriggers(workflow.id)
        .filter((trigger) => trigger.type === "message" && matchesTrigger(trigger, {
          channelId: message.channelId,
          content: message.content,
        }));
      if (triggers.length === 0) continue;

      const context = {
        guildId: message.guildId,
        userId: message.author.id,
        userName: message.author.username,
        channelId: message.channelId,
        content: message.content,
        member: message.member,
      };

      await runWorkflow(workflow, triggers[0], context, `message:${message.id}:${workflow.id}`);
      started += 1;
    }

    return started;
  }

  async function handleMemberJoin(member) {
    const candidates = repo.enabledWithTriggerType(member.guild.id, "member_join");
    let started = 0;

    for (const workflow of candidates) {
      const trigger = repo.listTriggers(workflow.id).find((entry) => entry.type === "member_join");
      if (!trigger) continue;
      await runWorkflow(
        workflow,
        trigger,
        {
          guildId: member.guild.id,
          userId: member.id,
          userName: member.user?.username,
          member,
        },
        `member:${member.guild.id}:${member.id}:${workflow.id}`,
      );
      started += 1;
    }

    return started;
  }

  async function handleEvent(envelope) {
    if (!envelope?.guildId || typeof envelope.type !== "string") return 0;
    const candidates = repo.enabledWithTriggerType(envelope.guildId, "event");
    let started = 0;

    for (const workflow of candidates) {
      const triggers = repo
        .listTriggers(workflow.id)
        .filter(
          (trigger) =>
            trigger.type === "event" &&
            (!trigger.config.eventType || trigger.config.eventType === envelope.type),
        );
      if (triggers.length === 0) continue;

      await runWorkflow(
        workflow,
        triggers[0],
        {
          guildId: envelope.guildId,
          userId: envelope.subject?.id ?? null,
          eventType: envelope.type,
          data: envelope.data,
        },
        `event:${envelope.id}:${workflow.id}`,
      );
      started += 1;
    }

    return started;
  }

  async function runScheduled(date = new Date()) {
    const minuteKey = date.toISOString().slice(0, 16);
    const candidates = repo.enabledScheduled();
    let started = 0;

    for (const workflow of candidates) {
      for (const trigger of repo.listTriggers(workflow.id)) {
        if (trigger.type !== "schedule") continue;
        if (!cronMatches(trigger.config.cron, date)) continue;

        await runWorkflow(
          workflow,
          trigger,
          { guildId: workflow.guild_id, startedAt: minuteKey },
          `schedule:${minuteKey}:${workflow.id}:${trigger.id}`,
        );
        started += 1;
      }
    }

    return started;
  }

  let timer = null;
  let lastMinute = null;
  let busy = false;

  function start() {
    if (timer) return;
    timer = setInterval(async () => {
      if (busy) return;
      busy = true;
      try {
        const now = new Date();
        const minute = now.toISOString().slice(0, 16);
        if (minute !== lastMinute) {
          lastMinute = minute;
          await runScheduled(now);
        }
        await outbox.flush();
      } catch (error) {
        logger.warn("automations tick failed", { err: error });
      } finally {
        busy = false;
      }
    }, 15_000);
    timer.unref?.();
    logger.info("automations services started", { database: databasePath });
  }

  return {
    bot: BOT,
    config,
    logger,
    metrics,
    db,
    settings,
    events,
    outbox,
    repo,
    runs,
    workflows,
    engine,
    attachClient,
    handleMessage,
    handleMemberJoin,
    handleEvent,
    runScheduled,
    registry,
    start,
    close: () => {
      if (timer) clearInterval(timer);
      timer = null;
      try {
        db.close();
      } catch (error) {
        logger.warn("database close failed", { err: error });
      }
    },
  };
}
