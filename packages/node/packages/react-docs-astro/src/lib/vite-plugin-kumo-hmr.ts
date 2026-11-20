import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Resolve once — points at the sibling kumo package root
const kumoRoot = resolve(__dirname, "../../../kumo");
const kumoSrc = resolve(kumoRoot, "src");

/**
 * Map every `@company/kumo` sub-path export to its source equivalent.
 *
 * In dev mode Vite will resolve these to the raw .ts/.tsx source files,
 * which means file-watcher-based HMR works instantly — no rebuild of
 * the kumo package required.
 *
 * In production builds (astro build) this plugin is NOT loaded, so the
 * normal package.json `exports` field is used (dist/), which validates
 * the real consumer experience.
 */
const aliases: Record<string, string> = {
  // Main barrel — resolves to source index.ts
  "@company/kumo": resolve(kumoSrc, "index.ts"),

  // CSS styles — resolve to source CSS
  "@company/kumo/styles/tailwind": resolve(kumoSrc, "styles/kumo.css"),
  "@company/kumo/styles/standalone": resolve(
    kumoSrc,
    "styles/kumo-standalone.css",
  ),
  "@company/kumo/styles": resolve(kumoSrc, "styles/kumo.css"),

  // JSON registry — these live outside src/ and are NOT built, so same
  // path works in dev and prod.  We alias anyway so Vite can resolve
  // the workspace:* link correctly and watch the file.
  "@company/kumo/ai/component-registry.json": resolve(
    kumoRoot,
    "ai/component-registry.json",
  ),

  // Theme generator — resolve to source TS so the docs color page
  // always reflects the latest config without a kumo build step.
  "@company/kumo/scripts/theme-generator/config": resolve(
    kumoRoot,
    "scripts/theme-generator/config.ts",
  ),
  "@company/kumo/scripts/theme-generator/types": resolve(
    kumoRoot,
    "scripts/theme-generator/types.ts",
  ),

  // Code highlighting has separate client and server entry points.
  "@company/kumo/code": resolve(kumoSrc, "code/index.ts"),
  "@company/kumo/code/server": resolve(kumoSrc, "code/server.tsx"),
};

/**
 * Vite plugin that rewires `@company/kumo` imports to the raw source
 * files of the sibling package during `astro dev`.
 *
 * **Why not just use `resolve.alias`?**
 * `resolve.alias` is a simple prefix match — it can't distinguish
 * `@company/kumo` from `@company/kumo-figma` without a trailing
 * slash, and it can't handle the overlapping sub-path exports cleanly.
 * A plugin gives us exact-match control.
 */
export function kumoHmrPlugin() {
  return {
    name: "vite-plugin-kumo-hmr",
    enforce: "pre" as const,

    resolveId(source: string) {
      // Exact match first (most imports)
      if (aliases[source]) {
        return aliases[source];
      }

      // Sub-path component imports: @company/kumo/components/button
      // → packages/kumo/src/components/button/index.ts
      if (source.startsWith("@company/kumo/components/")) {
        const componentName = source.replace(
          "@company/kumo/components/",
          "",
        );
        return resolve(kumoSrc, `components/${componentName}/index.ts`);
      }

      // Primitives: @company/kumo/primitives/dialog
      // → packages/kumo/src/primitives/dialog.ts
      if (source.startsWith("@company/kumo/primitives/")) {
        const primitiveName = source.replace(
          "@company/kumo/primitives/",
          "",
        );
        return resolve(kumoSrc, `primitives/${primitiveName}.ts`);
      }
      if (source === "@company/kumo/primitives") {
        return resolve(kumoSrc, "primitives/index.ts");
      }

      // Utils barrel
      if (source === "@company/kumo/utils") {
        return resolve(kumoSrc, "utils/index.ts");
      }

      // Catalog barrel
      if (source === "@company/kumo/catalog") {
        return resolve(kumoSrc, "catalog/index.ts");
      }

      // Registry barrel
      if (source === "@company/kumo/registry") {
        return resolve(kumoSrc, "registry/index.ts");
      }

      // Catch-all for any other @company/kumo/styles/* CSS imports
      if (source.startsWith("@company/kumo/styles/")) {
        const styleName = source.replace("@company/kumo/styles/", "");
        return resolve(kumoSrc, `styles/${styleName}.css`);
      }

      return undefined;
    },

    configResolved(config: { server: { fs: { allow: string[] } } }) {
      // Append kumo source to the existing allow list rather than replacing it.
      // Using config() would shallow-merge and override Astro/Vite defaults.
      if (config.server?.fs?.allow) {
        config.server.fs.allow.push(kumoRoot);
      }
    },
  };
}
