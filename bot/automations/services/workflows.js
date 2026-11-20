/** Workflow authoring with strict validation of triggers and actions. */

import { randomUUID } from "node:crypto";

import {
  EVENT_TYPES,
  NotFoundError,
  UserInputError,
} from "../../../packages/discord-framework/src/index.js";
import { ACTION_TYPES, TRIGGER_TYPES } from "../config/bot.js";
import { validateCron } from "./cron.js";

const SNOWFLAKE = /^\d{17,20}$/;
const EVENT_NAME = /^[a-z][a-z0-9_.]{2,63}$/;
const MAX_TEXT = 2000;

function requireText(value, label, max = MAX_TEXT) {
  const text = String(value ?? "").trim();
  if (!text) throw new UserInputError(`${label} is required.`, { userMessage: `${label} est requis.` });
  return text.slice(0, max);
}

function optionalSnowflake(value, label) {
  if (value === null || value === undefined || value === "") return null;
  if (!SNOWFLAKE.test(String(value))) {
    throw new UserInputError(`${label} is not a snowflake.`, {
      userMessage: `${label} doit être un identifiant Discord valide.`,
    });
  }
  return String(value);
}

export function validateTrigger(type, config = {}) {
  if (!TRIGGER_TYPES.includes(type)) {
    throw new UserInputError(`Unknown trigger '${type}'.`, {
      userMessage: `Déclencheur inconnu : ${type}.`,
    });
  }

  if (type === "schedule") {
    validateCron(config.cron);
    return { cron: String(config.cron).trim() };
  }

  if (type === "event") {
    const eventType = requireText(config.eventType, "Event type", 64);
    if (!EVENT_NAME.test(eventType)) {
      throw new UserInputError("Invalid event type.", { userMessage: "Type d'événement invalide." });
    }
    return { eventType };
  }

  if (type === "message") {
    return {
      contains: config.contains ? String(config.contains).slice(0, 200) : null,
      channelId: optionalSnowflake(config.channelId, "Channel"),
      conditions: {
        roleId: optionalSnowflake(config.conditions?.roleId, "Role"),
      },
    };
  }

  return {};
}

export function validateAction(type, config = {}) {
  if (!ACTION_TYPES.includes(type)) {
    throw new UserInputError(`Unknown action '${type}'.`, {
      userMessage: `Action inconnue : ${type}.`,
    });
  }

  if (type === "send_message") {
    return {
      channelId: optionalSnowflake(config.channelId, "Channel"),
      message: requireText(config.message, "Message"),
    };
  }
  if (type === "dm") return { message: requireText(config.message, "Message") };
  if (type === "add_role" || type === "remove_role") {
    const roleId = optionalSnowflake(config.roleId, "Role");
    if (!roleId) {
      throw new UserInputError("Role is required.", { userMessage: "Un rôle est requis." });
    }
    return { roleId };
  }

  if (!EVENT_TYPES.includes(config.eventType)) {
    throw new UserInputError("Unknown contract event.", {
      userMessage: `Événement de contrat inconnu : ${config.eventType ?? "absent"}.`,
    });
  }
  return { eventType: config.eventType };
}

export function createWorkflowService({ repo, runs, engine, settings, logger }) {
  function requireWorkflow(guildId, id) {
    const workflow = repo.get(guildId, id);
    if (!workflow) throw new NotFoundError("Workflow not found.", { userMessage: "Workflow introuvable." });
    return workflow;
  }

  function get(guildId, id) {
    const workflow = requireWorkflow(guildId, id);
    return {
      ...workflow,
      enabled: Boolean(workflow.enabled),
      triggers: repo.listTriggers(id),
      actions: repo.listActions(id),
    };
  }

  function create({ guildId, name, description = "", createdBy }) {
    const limit = settings.get(guildId, "maxWorkflows");
    if (repo.countForGuild(guildId) >= limit) {
      throw new UserInputError("Workflow limit reached.", {
        userMessage: `Ce serveur a atteint la limite de ${limit} workflows.`,
      });
    }

    return repo.create({
      id: randomUUID(),
      guildId,
      name: requireText(name, "Name", 100),
      description: String(description ?? "").slice(0, 500),
      createdBy,
    });
  }

  function list(guildId) {
    return repo.list(guildId).map((workflow) => ({
      ...workflow,
      enabled: Boolean(workflow.enabled),
      triggers: repo.listTriggers(workflow.id).length,
      actions: repo.listActions(workflow.id).length,
    }));
  }

  function setEnabled(guildId, id, enabled) {
    requireWorkflow(guildId, id);
    return repo.update(guildId, id, { enabled });
  }

  function remove(guildId, id) {
    requireWorkflow(guildId, id);
    return repo.remove(guildId, id);
  }

  function addTrigger(guildId, workflowId, type, config) {
    requireWorkflow(guildId, workflowId);
    const validated = validateTrigger(type, config);
    return repo.addTrigger({
      id: randomUUID(),
      workflowId,
      guildId,
      type,
      config: validated,
    });
  }

  function removeTrigger(guildId, workflowId, triggerId) {
    requireWorkflow(guildId, workflowId);
    return repo.removeTrigger(guildId, workflowId, triggerId);
  }

  function addAction(guildId, workflowId, type, config) {
    requireWorkflow(guildId, workflowId);
    const limit = settings.get(guildId, "maxActionsPerWorkflow");
    if (repo.listActions(workflowId).length >= limit) {
      throw new UserInputError("Action limit reached.", {
        userMessage: `Ce workflow est limité à ${limit} actions.`,
      });
    }

    return repo.addAction({
      id: randomUUID(),
      workflowId,
      guildId,
      type,
      config: validateAction(type, config),
    });
  }

  function removeAction(guildId, workflowId, actionId) {
    requireWorkflow(guildId, workflowId);
    return repo.removeAction(guildId, workflowId, actionId);
  }

  async function test(guildId, workflowId, context) {
    const workflow = get(guildId, workflowId);
    const result = await engine.dryRun(workflow, workflow.triggers[0], context);
    logger?.debug("workflow dry run", { workflowId, result });
    return { workflow, ...result };
  }

  function history(guildId, workflowId = null, limit = 10) {
    return runs.list(guildId, workflowId, Math.min(Number(limit) || 10, 50));
  }

  return {
    get,
    create,
    list,
    setEnabled,
    remove,
    addTrigger,
    removeTrigger,
    addAction,
    removeAction,
    test,
    history,
  };
}
