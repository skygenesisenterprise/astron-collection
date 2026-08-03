import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const botRoot = path.resolve(__dirname, "..");
const workspaceRoot = path.resolve(botRoot, "..");
const envFile = path.join(workspaceRoot, ".env");

if (fs.existsSync(envFile)) {
  dotenv.config({ path: envFile, override: false });
}

const requiredVars = ["DISCORD_TOKEN", "DISCORD_CLIENT_ID"];
const missingRequiredVars = requiredVars.filter((key) => !process.env[key]);

export const env = {
  token: process.env.DISCORD_TOKEN ?? "",
  clientId: process.env.DISCORD_CLIENT_ID ?? "",
  welcomeDmEnabled: process.env.DISCORD_WELCOME_DM_ENABLED !== "false",
  commandScope: process.env.DISCORD_COMMAND_SCOPE ?? "global",
  version: process.env.APP_VERSION ?? "1.1.0",
  commitSha: process.env.GIT_COMMIT_SHA ?? process.env.COMMIT_SHA ?? "unknown",
  buildDate: process.env.BUILD_DATE ?? "unknown",
  environment: process.env.NODE_ENV ?? "development",
  announceDeployments: process.env.DISCORD_ANNOUNCE_DEPLOYMENTS !== "false",
  missingRequiredVars,
  isConfigured: missingRequiredVars.length === 0,
};

export function assertDiscordEnv() {
  if (!env.isConfigured) {
    throw new Error(
      `Missing required environment variables: ${env.missingRequiredVars.join(", ")}`
    );
  }
}
