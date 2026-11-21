import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

import {
  botCredentialVariables,
  defineConfigSchema,
  loadConfig,
  runtimeVariables,
} from "@astron-collection/discord-framework";
import { BOT } from "./bot.js";

const botRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(botRoot, "..", "..");

for (const envFile of [path.join(botRoot, ".env"), path.join(repositoryRoot, ".env")]) {
  if (fs.existsSync(envFile)) dotenv.config({ path: envFile, override: false });
}

const schema = defineConfigSchema({
  bot: BOT,
  variables: [
    ...botCredentialVariables(BOT),
    ...runtimeVariables(),
    { key: "databasePath", env: ["ASTRON_DATABASE_PATH"], default: "" },
    {
      key: "ingestSecret",
      env: ["ASTRON_EVENT_SECRET", "ASTRON_INGEST_SECRET"],
      default: "",
      secret: true,
      description: "HMAC secret shared with producers (Protect, Guild, Automations, Player).",
    },
    {
      key: "ingestPath",
      env: ["ASTRON_INGEST_PATH"],
      default: "/ingest/events",
    },
    {
      key: "exportMaxRows",
      env: ["ASTRON_EXPORT_MAX_ROWS"],
      type: "integer",
      default: 5000,
      min: 100,
      max: 20000,
    },
  ],
});

const result = loadConfig({ schema });

export const env = Object.freeze({
  ...result.values,
  bot: BOT,
  isConfigured: result.ok,
  missingRequiredVars: result.missing,
  warnings: result.warnings,
  configResult: result,
  botRoot,
});

export { schema };
