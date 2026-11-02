#!/usr/bin/env node
/**
 * Bot isolation check.
 *
 * The architecture invariant is that a bot never loads another bot's catalogue.
 * This script enforces it statically, so a bad import fails CI instead of
 * shipping a bot that silently runs its neighbour's commands.
 *
 * Run: node scripts/check-bots.mjs
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const BOTS_DIR = path.join(ROOT, "bot");
const FRAMEWORK_IMPORT = "../../packages/discord-framework/src/index.js";
const REQUIRED_ENTRIES = [
  "index.js",
  "config/env.js",
  "deploy-commands.js",
  "commands",
  "events",
  "Dockerfile",
  "docker-compose.yml",
  "entrypoint.sh",
  ".env.example",
];

const failures = [];

async function exists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const target = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "data") continue;
      files.push(...(await walk(target)));
    } else if (entry.isFile()) {
      files.push(target);
    }
  }

  return files;
}

const relative = (file) => path.relative(ROOT, file).split(path.sep).join("/");
const bots = (await fs.readdir(BOTS_DIR, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

if (bots.length === 0) {
  failures.push("bot/: no bot directory found");
}

for (const bot of bots) {
  const botDir = path.join(BOTS_DIR, bot);

  for (const entry of REQUIRED_ENTRIES) {
    if (!(await exists(path.join(botDir, entry)))) {
      failures.push(`bot/${bot}: missing ${entry}`);
    }
  }

  const index = await fs.readFile(path.join(botDir, "index.js"), "utf8").catch(() => "");
  if (!index.includes(FRAMEWORK_IMPORT)) {
    failures.push(`bot/${bot}/index.js: does not import the shared framework`);
  }
  if (/\bnew\s+Client\s*\(/.test(index)) {
    failures.push(`bot/${bot}/index.js: creates its own Discord client instead of the framework's`);
  }

  const config = await fs.readFile(path.join(botDir, "config/env.js"), "utf8").catch(() => "");
  if (!config.includes(FRAMEWORK_IMPORT)) {
    failures.push(`bot/${bot}/config/env.js: does not import the shared framework`);
  }
  if (!config.includes(`bot: "${bot}"`)) {
    failures.push(`bot/${bot}/config/env.js: declares a bot name that does not match its directory`);
  }

  const deploy = await fs.readFile(path.join(botDir, "deploy-commands.js"), "utf8").catch(() => "");
  if (!deploy.includes("deployCommands")) {
    failures.push(`bot/${bot}/deploy-commands.js: does not use the framework deployer`);
  }

  for (const file of await walk(botDir)) {
    if (!file.endsWith(".js")) continue;

    const name = path.basename(file);
    if (name === "interactionCreate.js") {
      failures.push(`${relative(file)}: interactionCreate is owned by the framework router`);
    }

    const source = await fs.readFile(file, "utf8");
    const specifiers = [
      ...source.matchAll(/(?:from\s+|import\s*\(\s*|require\s*\(\s*)["']([^"']+)["']/g),
    ].map((match) => match[1]);

    for (const specifier of specifiers) {
      for (const other of bots) {
        if (other === bot) continue;

        const foreign =
          new RegExp(`(^|/)bot/${other}(/|$)`).test(specifier) ||
          new RegExp(`(^|/|\\.\\./)${other}/`).test(specifier) ||
          specifier === `@astron-collection/${other}`;

        if (foreign) {
          failures.push(`${relative(file)}: imports the '${other}' bot ('${specifier}')`);
        }
      }
    }
  }
}

const frameworkDir = path.join(ROOT, "packages", "discord-framework");
for (const entry of ["package.json", "src/index.js"]) {
  if (!(await exists(path.join(frameworkDir, entry)))) {
    failures.push(`packages/discord-framework: missing ${entry}`);
  }
}

if (failures.length > 0) {
  console.error("Bot isolation check failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log(`Bot isolation check passed (${bots.length} bots: ${bots.join(", ")}).`);
