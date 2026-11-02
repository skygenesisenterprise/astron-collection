import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

import { parseBotConfig } from "../../../packages/discord-framework/src/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const botRoot = path.resolve(__dirname, "..");
const repositoryRoot = path.resolve(botRoot, "..", "..");

for (const envFile of [path.join(botRoot, ".env"), path.join(repositoryRoot, ".env")]) {
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile, override: false });
  }
}

export const env = parseBotConfig(process.env, { bot: "protect" });

export { assertDiscordEnv } from "../../../packages/discord-framework/src/index.js";
