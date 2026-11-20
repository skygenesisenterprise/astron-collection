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
import { BOT, LINKS } from "./bot.js";

const botRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = path.resolve(botRoot, "..", "..");

// The bot's own `.env` wins; the repository `.env` fills the gaps.
for (const envFile of [path.join(botRoot, ".env"), path.join(repositoryRoot, ".env")]) {
  if (fs.existsSync(envFile)) dotenv.config({ path: envFile, override: false });
}

const schema = defineConfigSchema({
  bot: BOT,
  variables: [
    ...botCredentialVariables(BOT),
    ...runtimeVariables(),
    {
      key: "databasePath",
      env: ["ASTRON_DATABASE_PATH"],
      default: "",
      description: "SQLite file; defaults to <dataDir>/astron.sqlite3.",
    },
    {
      key: "docsUrl",
      env: ["ASTRON_DOCS_URL"],
      default: LINKS.docs,
    },
    {
      key: "supportUrl",
      env: ["ASTRON_SUPPORT_URL"],
      default: LINKS.issues,
    },
    {
      key: "invitePermissions",
      env: ["ASTRON_INVITE_PERMISSIONS"],
      default: "2048",
      description: "Permission bitmask embedded in /invite (Send Messages).",
    },
  ],
});

const result = loadConfig({ schema });

export const env = Object.freeze({
  ...result.values,
  bot: BOT,
  // Shape consumed by the framework runtime and deployment CLI.
  isConfigured: result.ok,
  missingRequiredVars: result.missing,
  warnings: result.warnings,
  configResult: result,
  botRoot,
});

export { schema };
