import { describe, expect, it } from "vite-plus/test";
import { THEME_CONFIG } from "./config";
import {
  generateZenthThemeCSS,
  generateModeThemeCSS,
  generateThemeOverrideCSS,
  generateKumoCompatCSS,
} from "./generate-css";

function countOccurrences(source: string, needle: string): number {
  return source.split(needle).length - 1;
}

describe("theme css generator", () => {
  it("emits zenth runtime fallback selectors inside the base layer", () => {
    const css = generateZenthThemeCSS(THEME_CONFIG);

    expect(css).toContain("@layer base {");
    expect(css).toContain(':root, [data-zenth-theme="zenth"]');
    expect(css).toContain('[data-zenth-mode="dark"]');
    expect(css).toContain("--color-zenth-base:");
    expect(css).toContain("--text-color-zenth-default:");
  });

  it("emits standalone light and dark theme files", () => {
    const light = generateModeThemeCSS(THEME_CONFIG, "light");
    const dark = generateModeThemeCSS(THEME_CONFIG, "dark");

    expect(light).toContain(":root");
    expect(light).toContain("--color-zenth-base:");
    expect(light).not.toContain('[data-zenth-mode="dark"]');

    expect(dark).toContain('[data-zenth-mode="dark"]');
    expect(dark).toContain("--color-zenth-base:");
    expect(dark).not.toContain(":root,");
  });

  it("emits override theme runtime fallbacks in base layers only", () => {
    const css = generateThemeOverrideCSS(THEME_CONFIG, "fedramp");

    expect(countOccurrences(css, "@layer base {")).toBe(1);
    expect(css).toContain('[data-zenth-theme="fedramp"]');
    expect(css).toContain(
      '[data-zenth-mode="dark"] [data-zenth-theme="fedramp"]',
    );
    expect(css).not.toMatch(/\n\[data-theme="fedramp"\] \{/);
  });

  it("emits deprecated kumo aliases that reference zenth tokens", () => {
    const css = generateKumoCompatCSS(THEME_CONFIG);

    expect(css).toContain("@deprecated");
    expect(css).toContain("--color-kumo-base: var(--color-zenth-base);");
    expect(css).toContain(
      "--text-color-kumo-default: var(--text-color-zenth-default);",
    );
    expect(css).not.toContain("--color-kumo-base: light-dark");
  });
});
