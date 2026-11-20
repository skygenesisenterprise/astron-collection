import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

import {
  botCredentialVariables,
  defineConfigSchema,
  loadConfig,
  runtimeVariables,
} from "../../../packages/discord-framework/src/index.js";
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
      key: "eventUrl",
      env: ["ASTRON_EVENT_URL", "ASTRON_LOGGER_EVENT_URL"],
      default: "",
      description: "Logger ingest endpoint for moderation events.",
    },
    {
      key: "eventSecret",
      env: ["ASTRON_EVENT_SECRET", "ASTRON_LOGGER_EVENT_SECRET"],
      default: "",
      secret: true,
    },
    {
      key: "reviewChannelId",
      env: ["ASTRON_REVIEW_CHANNEL_ID"],
      default: "",
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
