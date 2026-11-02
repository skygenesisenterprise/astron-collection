/**
 * Command deployment.
 *
 * Registering a command catalogue is a destructive operation: a global PUT
 * replaces the whole global catalogue of the application. Three guards make it
 * safe to run on every start:
 *
 *  - an idempotency hash: an unchanged catalogue is not re-sent;
 *  - an application-id guard: a state file written for another Application ID is
 *    never overwritten, so two distributions sharing a token cannot clobber
 *    each other's commands;
 *  - an explicit scope (`global`, `guild`, `none`), with guild deployment
 *    requiring its guild id.
 */

import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import { validateCommand } from "../commands/contract.js";
import { ERROR_CODES, AstronError, ConfigurationError } from "../errors.js";

export const DEPLOYMENT_SCOPES = Object.freeze(["global", "guild", "none"]);

export function computeManifestHash(definitions) {
  const canonical = JSON.stringify(definitions);
  return createHash("sha256").update(canonical).digest("hex").slice(0, 32);
}

function normalizeDefinitions(commands) {
  return commands
    .map((command) => (typeof command.json === "function" ? command.json() : command.definition))
    .sort((left, right) => (left.type ?? 1) - (right.type ?? 1) || left.name.localeCompare(right.name));
}

export function validateCatalogue(commands) {
  const errors = [];
  const names = new Set();

  for (const command of commands) {
    const check = validateCommand(command);
    if (!check.ok) errors.push(...check.errors);

    const json = typeof command.json === "function" ? command.json() : command.definition;
    const key = `${json?.type ?? 1}:${json?.name}`;
    if (names.has(key)) errors.push(`Duplicate definition '${json?.name}'.`);
    names.add(key);
  }

  return errors;
}

async function defaultReadState(statePath) {
  try {
    return JSON.parse(await fs.readFile(statePath, "utf8"));
  } catch {
    return {};
  }
}

async function defaultWriteState(statePath, state) {
  await fs.mkdir(path.dirname(statePath), { recursive: true });
  await fs.writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

export function applicationCommandsRoute(clientId) {
  return `/applications/${clientId}/commands`;
}

export function applicationGuildCommandsRoute(clientId, guildId) {
  return `/applications/${clientId}/guilds/${guildId}/commands`;
}

/**
 * @returns {{status: "deployed"|"unchanged"|"planned"|"skipped", count: number, hash: string, scope: string, guildId?: string}}
 */
export async function deployCommands({
  bot,
  config,
  commands,
  rest,
  logger,
  statePath = path.resolve("data", "command-deployment.json"),
  readState = defaultReadState,
  writeState = defaultWriteState,
  now = () => new Date(),
  force = false,
  dryRun = false,
  scope = config?.commandScope ?? "global",
  guildId = config?.commandGuildId,
} = {}) {
  const clientId = config?.clientId;

  if (!clientId) {
    throw new ConfigurationError("Cannot deploy commands without DISCORD_CLIENT_ID.", {
      meta: { bot },
    });
  }

  if (!DEPLOYMENT_SCOPES.includes(scope)) {
    throw new AstronError(`Unknown command scope '${scope}'.`, {
      code: ERROR_CODES.DEPLOY_SCOPE_INVALID,
      expected: true,
      meta: { bot, scope },
    });
  }

  const definitions = normalizeDefinitions(commands ?? []);
  const validationErrors = validateCatalogue(commands ?? []);

  if (validationErrors.length) {
    throw new AstronError(`Invalid command catalogue: ${validationErrors.join("; ")}`, {
      code: ERROR_CODES.COMMAND_INVALID,
      expected: true,
      meta: { bot, errors: validationErrors },
    });
  }

  const hash = computeManifestHash(definitions);
  const summary = { count: definitions.length, hash, scope, guildId: scope === "guild" ? guildId : undefined };

  if (scope === "none") {
    logger?.info("command deployment skipped", { reason: "scope none", ...summary });
    return { status: "skipped", ...summary };
  }

  if (scope === "guild" && !guildId) {
    throw new AstronError("Guild command scope requires ASTRON_COMMAND_GUILD_ID.", {
      code: ERROR_CODES.DEPLOY_SCOPE_INVALID,
      expected: true,
      meta: { bot },
    });
  }

  const state = (await readState(statePath)) ?? {};

  if (state.applicationId && state.applicationId !== clientId) {
    throw new AstronError(
      `Deployment state belongs to application ${state.applicationId}, refusing to overwrite the catalogue of application ${clientId}.`,
      {
        code: ERROR_CODES.DEPLOY_APPLICATION_MISMATCH,
        expected: true,
        meta: { bot, stateApplicationId: state.applicationId, applicationId: clientId },
      },
    );
  }

  const unchanged =
    state.hash === hash &&
    state.scope === scope &&
    (state.guildId ?? undefined) === (summary.guildId ?? undefined);

  if (unchanged && !force) {
    logger?.info("command deployment unchanged", summary);
    return { status: "unchanged", ...summary };
  }

  if (dryRun) {
    logger?.info("command deployment planned (dry run)", summary);
    return { status: "planned", ...summary };
  }

  if (!rest) {
    throw new ConfigurationError("Cannot deploy commands without a REST client.", { meta: { bot } });
  }

  const route =
    scope === "guild"
      ? applicationGuildCommandsRoute(clientId, guildId)
      : applicationCommandsRoute(clientId);

  await rest.put(route, { body: definitions });

  await writeState(statePath, {
    applicationId: clientId,
    scope,
    guildId: summary.guildId ?? null,
    hash,
    count: definitions.length,
    names: definitions.map((definition) => definition.name),
    deployedAt: now().toISOString(),
  });

  logger?.info("commands deployed", summary);
  return { status: "deployed", ...summary };
}

/** Create the discord.js REST client lazily: the framework keeps no dependency. */
export async function createRestClient({
  token,
  loadDiscord = () => import("discord.js"),
} = {}) {
  const { REST } = await loadDiscord();
  return new REST({ version: "10" }).setToken(token);
}
