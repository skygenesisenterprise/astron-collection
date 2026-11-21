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
    ...runtimeVariables({
      eventUrlEnv: ["ASTRON_EVENT_URL", "ASTRON_LOGGER_EVENT_URL"],
      eventSecretEnv: ["ASTRON_EVENT_SECRET", "ASTRON_LOGGER_EVENT_SECRET"],
    }),
    { key: "databasePath", env: ["ASTRON_DATABASE_PATH"], default: "" },
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
