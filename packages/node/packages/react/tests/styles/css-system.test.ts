import { describe, it, expect } from "vite-plus/test";
import { existsSync, readFileSync } from "fs";
import { execSync } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const packageRoot = join(__dirname, "../..");
const distStyles = join(packageRoot, "dist/styles");
const packageJson = JSON.parse(
  readFileSync(join(packageRoot, "package.json"), "utf-8"),
);

const isBuilt = existsSync(join(distStyles, "styles.css"));

const read = (relativePath: string) =>
  readFileSync(join(distStyles, relativePath), "utf-8");

describe.skipIf(!isBuilt)("CSS design system (post-build)", () => {
  describe("Published artifacts", () => {
    const required = [
      "styles.css",
      "tokens.css",
      "tailwind.css",
      "themes/light.css",
      "themes/dark.css",
      "theme-zenth.css",
      "theme-fedramp.css",
      "theme-kumo.css",
      "kumo.css",
      "kumo-standalone.css",
    ];

    for (const file of required) {
      it(`ships ${file}`, () => {
        expect(existsSync(join(distStyles, file))).toBe(true);
      });
    }
  });

  describe("Package exports resolve to published files", () => {
    const cssExports = Object.entries(packageJson.exports).filter(
      ([, target]) =>
        typeof target === "string" &&
        target.includes("/styles/") &&
        !target.includes("*"),
    ) as Array<[string, string]>;

    it("declares the documented public CSS entry points", () => {
      expect(packageJson.exports["./styles.css"]).toBe(
        "./dist/styles/styles.css",
      );
      expect(packageJson.exports["./tokens.css"]).toBe(
        "./dist/styles/tokens.css",
      );
      expect(packageJson.exports["./themes/light.css"]).toBe(
        "./dist/styles/themes/light.css",
      );
      expect(packageJson.exports["./themes/dark.css"]).toBe(
        "./dist/styles/themes/dark.css",
      );
    });

    for (const [exportPath, target] of cssExports) {
      it(`${exportPath} points at an existing file`, () => {
        const resolved = join(packageRoot, target as string);
        if (!existsSync(resolved)) {
          console.error(`❌ ${exportPath} → missing ${target}`);
        }
        expect(existsSync(resolved)).toBe(true);
      });
    }
  });

  describe("Compiled stylesheet is self-contained", () => {
    it("has no unresolved Tailwind build directives", () => {
      const css = read("styles.css");
      expect(css).not.toContain('@import "tailwindcss"');
      expect(css).not.toContain("@source");
      expect(css).not.toContain("@theme");
      expect(css).not.toContain("@apply");
    });

    it("contains the Company semantic tokens", () => {
      const css = read("styles.css");
      for (const token of [
        "--color-zenth-base",
        "--color-zenth-canvas",
        "--color-zenth-elevated",
        "--color-zenth-line",
        "--color-zenth-brand",
        "--text-color-zenth-default",
        "--text-color-zenth-subtle",
        "--text-color-zenth-danger",
        "--radius-zenth-md",
        "--shadow-zenth-sm",
      ]) {
        expect(css).toContain(token);
      }
    });

    it("contains the utilities used by library components", () => {
      const css = read("styles.css");
      for (const utility of [
        ".bg-zenth-base",
        ".text-zenth-default",
        ".ring-zenth-line",
        ".h-6\\.5",
        ".size-1\\.75",
        ".bg-\\(--zenth-button-emphasis-bg\\)",
      ]) {
        expect(css).toContain(utility);
      }
    });

    it("ships light and dark mode selectors", () => {
      const css = read("styles.css");
      expect(css).toMatch(/\[data-zenth-mode=(?:"dark"|dark)\]/);
      expect(css).toMatch(/\[data-mode=(?:"dark"|dark)\]/);
      expect(css).toContain("color-scheme:dark");
    });

    it("keeps the deprecated kumo aliases for migration", () => {
      const css = read("styles.css");
      expect(css).toContain("--color-kumo-base:var(--color-zenth-base)");
      expect(css).toContain(
        "--text-color-kumo-default:var(--text-color-zenth-default)",
      );
    });
  });

  describe("Theme entry points", () => {
    it("tokens.css exposes variables without component styles", () => {
      const css = read("tokens.css");
      expect(css).toContain("--color-zenth-base");
      expect(css).toContain("--text-color-zenth-default");
      expect(css).not.toContain('@import "tailwindcss"');
      expect(css).not.toContain(".bg-zenth-base");
    });

    it("light and dark theme files contain their own values", () => {
      const light = read("themes/light.css");
      const dark = read("themes/dark.css");

      expect(light).toContain(":root");
      expect(light).toContain("--color-zenth-base");
      expect(dark).toMatch(/\[data-zenth-mode=(?:"dark"|dark)\]/);
      expect(dark).toContain("--color-zenth-base");
    });

    it("raw Tailwind entry keeps @theme and does not ship preflight", () => {
      const entry = read("tailwind.css");
      const theme = read("theme-zenth.css");
      expect(theme).toContain("@theme");
      expect(entry).toContain("theme-zenth.css");
      expect(theme).toContain("--color-zenth-base");
      expect(entry).not.toContain("@import \"tailwindcss\"");
    });
  });

  describe("Source naming", () => {
    it("no library component uses a kumo- class or attribute", () => {
      const result = execSync(
        String.raw`grep -rnE "kumo-|data-kumo" src/components src/blocks src/utils src/catalog src/code src/command-line --include='*.tsx' --include='*.ts' || true`,
        { cwd: packageRoot, encoding: "utf-8" },
      );
      expect(result.trim()).toBe("");
    });
  });
});
