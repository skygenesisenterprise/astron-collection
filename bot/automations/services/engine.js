/**
 * Workflow engine: conditions, ordered actions, retries, idempotency and runs.
 *
 * Discord side effects are injected as `executeAction`, so the engine itself is
 * testable without a gateway and cannot send anything by accident.
 */

import { randomUUID } from "node:crypto";

import { ACTION_RETRIES } from "../config/bot.js";

export function renderWorkflowText(template, context = {}) {
  return String(template ?? "")
    .replaceAll("{user}", context.userId ? `<@${context.userId}>` : "")
    .replaceAll("{user.name}", context.userName ?? "membre")
    .replaceAll("{server}", context.guildName ?? "le serveur")
    .replaceAll("{channel}", context.channelId ? `<#${context.channelId}>` : "")
    .replaceAll("{content}", context.content ?? "")
    .slice(0, 2000);
}

/** Conditions are ANDed. Unknown keys are ignored rather than trusted. */
export function matchesConditions(conditions = {}, context = {}) {
  if (conditions.channelId && context.channelId !== conditions.channelId) {
    return { ok: false, reason: "channel" };
  }
  if (conditions.userId && context.userId !== conditions.userId) {
    return { ok: false, reason: "user" };
  }
  if (conditions.roleId) {
    const hasRole = context.member?.roles?.cache?.has?.(conditions.roleId) ?? false;
    if (!hasRole) return { ok: false, reason: "role" };
  }
  if (conditions.contains) {
    const haystack = String(context.content ?? "").toLowerCase();
    if (!haystack.includes(String(conditions.contains).toLowerCase())) {
      return { ok: false, reason: "contains" };
    }
  }
  return { ok: true };
}

export function matchesTrigger(trigger, context = {}) {
  const config = trigger.config ?? {};
  if (trigger.type === "message") {
    if (config.channelId && context.channelId !== config.channelId) return false;
    if (config.contains && !String(context.content ?? "").toLowerCase().includes(config.contains.toLowerCase())) {
      return false;
    }
    return true;
  }
  if (trigger.type === "event") {
    return !config.eventType || config.eventType === context.eventType;
  }
  if (trigger.type === "member_join") return true;
  if (trigger.type === "schedule") return true;
  return false;
}

export function createWorkflowEngine({
  repo,
  runs,
  logger,
  metrics,
  executeAction,
  clock = () => new Date(),
  retries = ACTION_RETRIES,
}) {
  async function run(workflow, trigger, context = {}, { idempotencyKey = null } = {}) {
    if (!workflow.enabled) return { status: "skipped", steps: [] };

    if (idempotencyKey && runs.hasRun(workflow.id, idempotencyKey)) {
      metrics?.inc("workflow_duplicate_total");
      return { status: "duplicate", steps: [] };
    }

    const startedAt = clock().toISOString();
    const condition = matchesConditions(trigger?.config?.conditions ?? {}, context);
    const actions = repo.listActions(workflow.id);
    const steps = [];

    if (!condition.ok) {
      runs.record({
        id: randomUUID(),
        workflowId: workflow.id,
        guildId: workflow.guild_id,
        triggerType: trigger?.type ?? "manual",
        status: "skipped",
        detail: [{ step: "conditions", ok: false, reason: condition.reason }],
        idempotencyKey,
        startedAt,
        finishedAt: clock().toISOString(),
        error: null,
      });
      return { status: "skipped", steps, reason: condition.reason };
    }

    for (const action of actions) {
      let lastError = null;
      let succeeded = false;

      for (let attempt = 0; attempt <= retries && !succeeded; attempt += 1) {
        try {
          await executeAction(action, context);
          succeeded = true;
        } catch (error) {
          lastError = error;
          logger?.warn("workflow action failed", {
            workflowId: workflow.id,
            actionId: action.id,
            type: action.type,
            attempt,
            err: error,
          });
        }
      }

      steps.push({
        actionId: action.id,
        type: action.type,
        ok: succeeded,
        error: succeeded ? null : lastError?.message ?? "unknown error",
      });
    }

    const failed = steps.some((step) => !step.ok);
    const status = failed ? "failed" : "success";

    try {
      runs.record({
        id: randomUUID(),
        workflowId: workflow.id,
        guildId: workflow.guild_id,
        triggerType: trigger?.type ?? "manual",
        status,
        detail: steps,
        idempotencyKey,
        startedAt,
        finishedAt: clock().toISOString(),
        error: failed ? steps.find((step) => !step.ok)?.error ?? "action failed" : null,
      });
    } catch (error) {
      if (String(error?.message ?? "").includes("UNIQUE")) return { status: "duplicate", steps };
      throw error;
    }

    metrics?.inc(`workflow_runs_total`, { status });
    logger?.info("workflow executed", { workflowId: workflow.id, status, steps: steps.length });
    return { status, steps };
  }

  /** Evaluate actions without touching Discord; used by `/test`. */
  async function dryRun(workflow, trigger, context = {}) {
    const condition = matchesConditions(trigger?.config?.conditions ?? {}, context);
    const actions = repo.listActions(workflow.id).map((action) => ({
      id: action.id,
      type: action.type,
      config: action.config,
      wouldRun: condition.ok,
    }));
    return { ok: condition.ok, reason: condition.reason ?? null, actions };
  }

  return { run, dryRun, matchesConditions, matchesTrigger };
}
