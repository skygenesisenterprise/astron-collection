#!/usr/bin/env node
/**
 * Company Theme Generator CLI
 *
 * Generates theme CSS files from the centralized configuration.
 *
 * Usage:
 *   pnpm codegen:themes           # Generate all themes
 *   pnpm codegen:themes --list    # List all tokens
 *   pnpm codegen:themes --dry-run # Preview without writing
 */

import * as path from "node:path";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { writeFormattedFile } from "../format-generated.js";
import {
  generateAllThemes,
  listAllTokens,
  getTokenRenameMap,
} from "./generate-css.js";
import { THEME_CONFIG, AVAILABLE_THEMES } from "./config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STYLES_DIR = path.resolve(__dirname, "../../src/styles");

function parseArgs(args: string[]) {
  return {
    list: args.includes("--list"),
    dryRun: args.includes("--dry-run"),
    renameMap: args.includes("--rename-map"),
    help: args.includes("--help") || args.includes("-h"),
  };
}

function printHelp() {
  console.log(`
Company Theme Generator

Usage:
  tsx scripts/theme-generator/index.ts [options]

Options:
  --list          List all tokens
  --dry-run       Preview generated CSS without writing files
  --rename-map    Output JSON mapping of token rename plans
  --help, -h      Show this help message

Output:
  Generates theme CSS files in src/styles/:
  - theme-zenth.css     Base theme with all tokens
  - theme-fedramp.css   FedRAMP theme overrides
  - themes/light.css    Light-mode token values
  - themes/dark.css     Dark-mode token values
  - theme-kumo.css      Deprecated legacy aliases
`);
}

function printTokenList() {
  const tokens = listAllTokens(THEME_CONFIG);

  for (const type of ["text", "color", "typography"] as const) {
    const group = tokens.filter((token) => token.type === type);
    if (group.length === 0) continue;

    console.log(`\n=== ${type[0].toUpperCase()}${type.slice(1)} Tokens ===\n`);
    for (const token of group) {
      console.log(`${token.currentName} (${token.themes.join(", ")})`);
    }
  }

  console.log(`\nTotal: ${tokens.length} tokens`);
  console.log(`Available themes: ${AVAILABLE_THEMES.join(", ")}`);
}

function printRenameMap() {
  console.log(JSON.stringify(getTokenRenameMap(THEME_CONFIG), null, 2));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  if (args.list) {
    printTokenList();
    process.exit(0);
  }

  if (args.renameMap) {
    printRenameMap();
    process.exit(0);
  }

  console.log("Company Theme Generator\n");
  console.log(`Output directory: ${STYLES_DIR}`);
  console.log("");

  const files = generateAllThemes({ outputDir: STYLES_DIR });

  for (const [filename, content] of files) {
    const filepath = path.join(STYLES_DIR, filename);

    if (args.dryRun) {
      console.log(`\n=== ${filename} ===\n`);
      console.log(content);
    } else {
      mkdirSync(path.dirname(filepath), { recursive: true });
      await writeFormattedFile(filepath, content);
      console.log(`  Wrote ${filename}`);
    }
  }

  if (!args.dryRun) {
    console.log("\nTheme generation complete!");
  }
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
