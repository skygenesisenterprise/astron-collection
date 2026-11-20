import {
  copyFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = join(__dirname, "../src/styles");
const distDir = join(__dirname, "../dist/styles");
const blocksSrcDir = join(__dirname, "../src/blocks");
// IMPORTANT: block source files must live in a separate directory from
// dist/src/blocks/ because dist/src/blocks/ contains generated .d.ts files.
const blocksDistDir = join(__dirname, "../dist/blocks-source");

function ensureDir(dir: string) {
  mkdirSync(dir, { recursive: true });
}

function runTailwind(input: string, output: string) {
  execSync(`npx tailwindcss -i ${input} -o ${output} --minify`, {
    stdio: "inherit",
  });
}

/**
 * Tailwind removes the bare `@layer` statement during minification, which lets
 * the consumer's stylesheet establish an order where base rules land after
 * utilities. Prepend it to the compiled output so the cascade always starts
 * with the canonical theme -> base -> components -> utilities order.
 */
function ensureLayerOrder(file: string) {
  const statement = "@layer theme, base, components, utilities;";
  const css = readFileSync(file, "utf-8");
  if (css.startsWith(statement)) return;
  writeFileSync(file, `${statement}\n${css}`);
}

function walkCssFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkCssFiles(fullPath));
    } else if (entry.name.endsWith(".css")) {
      files.push(fullPath);
    }
  }

  return files;
}

function assertContains(
  file: string,
  needles: string[],
  label: string,
): void {
  const content = readFileSync(file, "utf-8");
  const missing = needles.filter((needle) => !content.includes(needle));

  if (missing.length > 0) {
    console.error(`❌ ${label} is missing: ${missing.join(", ")}`);
    process.exit(1);
  }
}

ensureDir(distDir);
ensureDir(join(distDir, "themes"));

// ---------------------------------------------------------------------------
// 1. Copy the raw Tailwind source tree into dist so that
//    `@astron-collection/react/styles/tailwind` resolves its relative imports.
// ---------------------------------------------------------------------------
const RAW_ENTRY_FILES = new Set(["index.css", "tokens.css"]);

for (const file of walkCssFiles(srcDir)) {
  const rel = relative(srcDir, file);
  if (RAW_ENTRY_FILES.has(rel)) continue;

  const dest = join(distDir, rel);
  ensureDir(dirname(dest));
  copyFileSync(file, dest);
}

console.log("✓ Copied raw style sources to dist/styles/");

// ---------------------------------------------------------------------------
// 2. Compiled stylesheet: no Tailwind required in the consumer app.
// ---------------------------------------------------------------------------
console.log("📦 Compiling styles.css...");
try {
  runTailwind(join(srcDir, "index.css"), join(distDir, "styles.css"));
  ensureLayerOrder(join(distDir, "styles.css"));
  console.log("✓ Compiled styles.css");
} catch (error) {
  console.error("❌ Failed to compile styles.css:", error);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 3. Token-only entry (compiled so `@theme` becomes real :root variables).
// ---------------------------------------------------------------------------
console.log("📦 Compiling tokens.css...");
try {
  runTailwind(join(srcDir, "tokens.css"), join(distDir, "tokens.css"));
  console.log("✓ Compiled tokens.css");
} catch (error) {
  console.error("❌ Failed to compile tokens.css:", error);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 4. Legacy entry points (deprecated, kept working).
// ---------------------------------------------------------------------------
const distTailwindEntry = join(distDir, "tailwind.css");
writeFileSync(
  join(distDir, "kumo.css"),
  '/**\n * @deprecated Use "@astron-collection/react/styles/tailwind".\n */\n@import "./tailwind.css";\n',
);
writeFileSync(
  join(distDir, "kumo-binding.css"),
  '/**\n * @deprecated Use "@astron-collection/react/styles/tailwind".\n */\n@import "./tailwind.css";\n',
);

if (existsSync(join(distDir, "styles.css"))) {
  copyFileSync(join(distDir, "styles.css"), join(distDir, "kumo-standalone.css"));
}

// ---------------------------------------------------------------------------
// 5. Validate the published CSS surface. A successful Tailwind run alone is
//    not enough: utilities must actually be present in the compiled output.
// ---------------------------------------------------------------------------
console.log("🔎 Validating CSS output...");

const REQUIRED_DIST_FILES = [
  "styles.css",
  "tokens.css",
  "tailwind.css",
  "theme-zenth.css",
  "theme-fedramp.css",
  "theme-kumo.css",
  "themes/light.css",
  "themes/dark.css",
  "kumo.css",
  "kumo-standalone.css",
];

for (const file of REQUIRED_DIST_FILES) {
  const fullPath = join(distDir, file);
  if (!existsSync(fullPath)) {
    console.error(`❌ Missing expected CSS artifact: ${file}`);
    process.exit(1);
  }
}

assertContains(
  join(distDir, "styles.css"),
  [
    "--color-zenth-base",
    "--text-color-zenth-default",
    ".bg-zenth-base",
    ".text-zenth-default",
    ".ring-zenth-line",
    "@layer theme, base, components, utilities;",
  ],
  "compiled styles.css",
);

const compiled = readFileSync(join(distDir, "styles.css"), "utf-8");
for (const forbidden of ['@import "tailwindcss"', "@import 'tailwindcss'", "@source", "@theme"]) {
  if (compiled.includes(forbidden)) {
    console.error(
      `❌ styles.css still contains an unresolved build directive: ${forbidden}`,
    );
    process.exit(1);
  }
}

assertContains(
  join(distDir, "tokens.css"),
  ["--color-zenth-base", "--text-color-zenth-default"],
  "compiled tokens.css",
);

assertContains(
  join(distDir, "themes/light.css"),
  ["--color-zenth-base"],
  "themes/light.css",
);
assertContains(
  join(distDir, "themes/dark.css"),
  ["--color-zenth-base"],
  "themes/dark.css",
);
assertContains(
  join(distDir, "theme-kumo.css"),
  ["--color-kumo-base: var(--color-zenth-base)"],
  "legacy theme-kumo.css",
);

if (!existsSync(distTailwindEntry)) {
  console.error("❌ Missing raw Tailwind entry in dist/styles/tailwind.css");
  process.exit(1);
}

console.log("✅ CSS build complete");

// ---------------------------------------------------------------------------
// 6. Copy block source files for the CLI `add` command.
// ---------------------------------------------------------------------------
console.log("📦 Copying block source files...");

function copyBlockFiles(sourceDir: string, destDir: string): void {
  if (!existsSync(sourceDir)) {
    console.warn(`⚠ Warning: blocks source directory not found at ${sourceDir}`);
    return;
  }

  const blockDirs = readdirSync(sourceDir).filter((item) => {
    const itemPath = join(sourceDir, item);
    return statSync(itemPath).isDirectory();
  });

  for (const blockDir of blockDirs) {
    const blockSrcPath = join(sourceDir, blockDir);
    const blockDestPath = join(destDir, blockDir);

    ensureDir(blockDestPath);

    for (const file of readdirSync(blockSrcPath)) {
      if (!file.endsWith(".tsx")) continue;

      const srcFile = join(blockSrcPath, file);
      if (!statSync(srcFile).isFile()) continue;

      copyFileSync(srcFile, join(blockDestPath, file));
      console.log(`  ✓ Copied ${blockDir}/${file}`);
    }
  }
}

copyBlockFiles(blocksSrcDir, blocksDistDir);
console.log("✅ Block source files copied");
