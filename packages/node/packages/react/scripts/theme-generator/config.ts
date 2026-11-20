/**
 * Kumo Theme Configuration
 *
 * Single source of truth for all semantic color tokens and typography.
 * This config is used to generate:
 * - theme-kumo.css (base theme)
 * - theme-fedramp.css (fedramp overrides)
 * - Any future theme files
 *
 * Token naming:
 * - Key = current token name used in codebase
 * - newName = future name (empty string = no migration planned)
 */

import type { ThemeConfig } from "./types.js";

export const THEME_CONFIG: ThemeConfig = {
  /**
   * Text color tokens
   * Used with: text-{token}
   * CSS variable: --text-color-{token}
   */
  text: {
    "zenth-default": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-900, oklch(21% 0.006 285.885))",
          dark: "var(--color-zenth-neutral-100, oklch(97% 0 0))",
        },
      },
    },
    "zenth-inverse": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-100, oklch(97% 0 0))",
          dark: "var(--color-zenth-neutral-900, oklch(20.5% 0 0))",
        },
      },
    },
    "zenth-strong": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-950, oklch(14.5% 0 0))", // darker than default
          dark: "var(--color-zenth-neutral-50, oklch(98.5% 0 0))", // lighter than default
        },
      },
    },
    "zenth-subtle": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-600, #5a616d)", // AA on the light canvas
          dark: "var(--color-zenth-neutral-400, #9aa1ac)", // darker than default
        },
      },
    },
    "zenth-inactive": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-300, oklch(87% 0 0))", // lighter than subtle
          dark: "var(--color-zenth-neutral-600, oklch(43.9% 0 0))", // darker than subtle
        },
      },
    },
    "zenth-placeholder": {
      // in between subtle and inactive
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-400, oklch(70.8% 0 0))",
          dark: "var(--color-zenth-neutral-500, oklch(55.6% 0 0))",
        },
      },
    },
    "zenth-brand": {
      newName: "",
      description:
        "Company brand text color (blue #1769E0, lightened in dark mode)",
      theme: {
        zenth: {
          light: "var(--color-zenth-blue-500, #1769e0)",
          dark: "var(--color-zenth-blue-400, #4b91f0)",
        },
      },
    },
    "zenth-link": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-blue-800, #0b3d91)",
          dark: "var(--color-zenth-blue-400, #4b91f0)",
        },
      },
    },
    "zenth-info": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-blue-800, #0b3d91)",
          dark: "var(--color-zenth-blue-400, #4b91f0)",
        },
      },
    },
    "zenth-success": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-emerald-800, oklch(43.2% 0.095 166.913))",
          dark: "var(--color-zenth-emerald-200, oklch(90.5% 0.093 164.15))",
        },
      },
    },
    "zenth-danger": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-red-700, oklch(50.5% 0.213 27.518))",
          dark: "var(--color-zenth-red-400, oklch(70.4% 0.191 22.216))",
        },
      },
    },
    "zenth-warning": {
      newName: "",
      theme: {
        zenth: {
          light: "oklch(59.7% 0.144 57.5)",
          dark: "var(--color-zenth-orange-400, oklch(75% 0.183 55.934))",
        },
      },
    },

    /*
     * Badge text color tokens
     * Subtle variants need colored text; inverted needs flipping text
     */
    "zenth-badge-orange-subtle": {
      newName: "",
      description: "Text color for subtle orange badge",
      theme: {
        zenth: {
          light: "var(--color-zenth-orange-800, oklch(47% 0.157 37.304))",
          dark: "var(--color-zenth-orange-200, oklch(90.1% 0.076 70.697))",
        },
      },
    },
    "zenth-badge-teal-subtle": {
      newName: "",
      description: "Text color for subtle teal badge",
      theme: {
        zenth: {
          light: "var(--color-zenth-teal-800, oklch(43.7% 0.078 188.216))",
          dark: "var(--color-zenth-teal-200, oklch(91% 0.096 180.426))",
        },
      },
    },
    "zenth-badge-neutral-subtle": {
      newName: "",
      description: "Text color for subtle neutral badge",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-800, oklch(26.9% 0 0))",
          dark: "var(--color-zenth-neutral-200, oklch(92.2% 0 0))",
        },
      },
    },
    "zenth-badge-inverted": {
      newName: "",
      description:
        "Text color for inverted badge (white in light, black in dark)",
      theme: {
        zenth: {
          light: "var(--color-white, #fff)",
          dark: "var(--color-black, #000)",
        },
      },
    },
  },

  /**
   * Color tokens
   * Used with: bg-{token}, border-{token}, ring-{token}, etc.
   * CSS variable: --color-{token}
   */
  color: {
    "zenth-canvas": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-25, #f7f8fa)",
          dark: "var(--color-zenth-neutral-1000, #0b0d10)",
        },
        fedramp: {
          light: "#5b697c",
          dark: "#5b697c",
        },
      },
    },
    "zenth-elevated": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-white, #ffffff)",
          dark: "var(--color-zenth-graphite-900, #1b1e25)",
        },
      },
    },
    "zenth-recessed": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-125, #f2f4f7)",
          dark: "var(--color-zenth-graphite-950, #111318)",
        },
      },
    },
    "zenth-base": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-white, #ffffff)",
          dark: "var(--color-zenth-graphite-950, #111318)",
        },
        fedramp: {
          light: "#5b697c",
          dark: "#5b697c",
        },
      },
    },
    "zenth-tint": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-25, #f7f8fa)",
          dark: "var(--color-zenth-graphite-900, #1b1e25)",
        },
      },
    },
    "zenth-contrast": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-graphite-950, #111318)",
          dark: "var(--color-zenth-neutral-25, #f7f8fa)",
        },
      },
    },
    "zenth-overlay": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-25, #f7f8fa)",
          dark: "var(--color-zenth-graphite-900, #1b1e25)",
        },
      },
    },
    "zenth-control": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-white, #ffffff)",
          dark: "var(--color-zenth-graphite-900, #1b1e25)",
        },
      },
    },
    "zenth-interact": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-150, #e9ebef)",
          dark: "var(--color-zenth-graphite-700, #343a46)",
        },
      },
    },
    "zenth-fill": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-150, #e9ebef)",
          dark: "var(--color-zenth-graphite-900, #1b1e25)",
        },
      },
    },
    "zenth-fill-hover": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-25, #f7f8fa)",
          dark: "var(--color-zenth-graphite-700, #343a46)",
        },
      },
    },
    "zenth-brand": {
      newName: "",
      description: "Company brand surface (blue #1769E0)",
      theme: {
        zenth: {
          light: "var(--color-zenth-blue-500, #1769e0)",
          dark: "var(--color-zenth-blue-500, #1769e0)",
        },
      },
    },
    "zenth-brand-hover": {
      newName: "",
      description: "Brand hover state (deep blue #0B3D91)",
      theme: {
        zenth: {
          light: "var(--color-zenth-blue-800, #0b3d91)",
          dark: "var(--color-zenth-blue-800, #0b3d91)",
        },
      },
    },
    "zenth-line": {
      newName: "",
      theme: {
        zenth: {
          light: "#e1e4ea",
          dark: "var(--color-zenth-neutral-750, #2a2f39)",
        },
      },
    },
    "zenth-hairline": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-150, #e9ebef)",
          dark: "var(--color-zenth-graphite-900, #1b1e25)",
        },
        fedramp: {
          light: "#c8d4e5",
          dark: "#c8d4e5",
        },
      },
    },
    "zenth-focus": {
      newName: "",
      description: "Primary focus ring/border color (brand blue)",
      theme: {
        zenth: {
          light: "var(--color-zenth-blue-500, #1769e0)",
          dark: "var(--color-zenth-blue-400, #4b91f0)",
        },
      },
    },
    "zenth-shadow-edge": {
      newName: "",
      description: "Tight spread shadow color for control thumbs/knobs",
      theme: {
        zenth: {
          light: "oklch(0% 0 0 / 0.12)",
          dark: "oklch(100% 0 0 / 0.1)",
        },
      },
    },
    "zenth-shadow-drop": {
      newName: "",
      description: "Drop shadow color for control thumbs/knobs",
      theme: {
        zenth: {
          light: "oklch(0% 0 0 / 0.08)",
          dark: "oklch(0% 0 0 / 0.3)",
        },
      },
    },
    "zenth-arrow-edge": {
      newName: "",
      description:
        "Arrow border edge fill for popover/tooltip arrows (visible in light mode). Matches kumo-line so the arrow border aligns with the popup outline.",
      theme: {
        zenth: {
          light: "oklch(14.5% 0 0 / 0.1)",
          dark: "transparent",
        },
      },
    },
    "zenth-arrow-stroke": {
      newName: "",
      description:
        "Arrow border stroke fill for popover/tooltip arrows (visible in dark mode). Matches kumo-line so the arrow border aligns with the popup outline.",
      theme: {
        zenth: {
          light: "transparent",
          dark: "var(--color-zenth-neutral-750, oklch(32% 0 0))",
        },
      },
    },
    "zenth-info-tint": {
      newName: "",
      theme: {
        zenth: {
          light: "#1769e01f",
          dark: "#4b91f02e",
        },
      },
    },
    "zenth-info": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-blue-500, #1769e0)",
          dark: "var(--color-zenth-blue-400, #4b91f0)",
        },
      },
    },
    "zenth-warning-tint": {
      newName: "",
      theme: {
        zenth: {
          light: "oklch(93.1% 0.107 94.6 / 0.20)",
          dark: "oklch(35.3% 0.079 65.0 / 0.37)",
        },
      },
    },
    "zenth-warning": {
      newName: "",
      theme: {
        zenth: {
          light: "oklch(73.9% 0.177 58.2)",
          dark: "oklch(64.5% 0.168 50.0)",
        },
      },
    },
    "zenth-danger-tint": {
      newName: "",
      theme: {
        zenth: {
          light: "oklch(93.6% 0.032 17.7 / 0.42)",
          dark: "oklch(42.9% 0.176 28.7 / 0.17)",
        },
      },
    },
    "zenth-danger": {
      newName: "",
      // Aligned with fill.kumo-danger so `bg-kumo-danger` matches `fill-kumo-danger`.
      theme: {
        zenth: {
          light: "var(--color-zenth-red-500, oklch(63.7% 0.237 25.331))",
          dark: "var(--color-zenth-red-600, oklch(57.7% 0.245 27.325))",
        },
      },
    },
    "zenth-success-tint": {
      newName: "",
      theme: {
        zenth: {
          light: "oklch(96.2% 0.043 156.7 / 0.57)",
          dark: "oklch(39.3% 0.096 152.3 / 0.20)",
        },
      },
    },
    "zenth-success": {
      newName: "",
      theme: {
        zenth: {
          light: "var(--color-zenth-emerald-600, oklch(59.6% 0.145 163.225))",
          dark: "var(--color-zenth-emerald-400, oklch(76.5% 0.177 163.223))",
        },
      },
    },

    /*
     * Banner background tokens
     * Pre-baked opacity per mode so banners don't need dark: overrides.
     * Mirrors the *-tint hues but tuned for the Banner component's surface contrast.
     */
    "zenth-banner-info": {
      newName: "",
      description: "Info banner background (informational/default variant)",
      theme: {
        zenth: {
          light: "oklch(93.2% 0.032 255.585 / 0.7)",
          dark: "oklch(37.9% 0.146 265.522 / 0.5)",
        },
      },
    },
    "zenth-banner-warning": {
      newName: "",
      description: "Warning banner background (alert variant)",
      theme: {
        zenth: {
          light: "var(--color-zenth-yellow-100, oklch(97.3% 0.071 103.193))",
          dark: "oklch(55.4% 0.135 66.442 / 0.5)",
        },
      },
    },

    /*
     * Badge color tokens
     * Solid variants: vivid background, white text
     * Subtle variants: tinted background, darker text (flips in dark mode)
     */

    // Red
    "zenth-badge-red": {
      newName: "",
      description: "Red badge background",
      theme: {
        zenth: {
          light: "var(--color-zenth-red-600, oklch(57.7% 0.245 27.325))",
          dark: "var(--color-zenth-red-700, oklch(50.5% 0.213 27.518))",
        },
      },
    },

    // Green
    "zenth-badge-green": {
      newName: "",
      description: "Green badge background",
      theme: {
        zenth: {
          light: "var(--color-zenth-emerald-600, oklch(59.6% 0.145 163.225))",
          dark: "var(--color-zenth-emerald-700, oklch(50.8% 0.118 165.612))",
        },
      },
    },

    // Orange
    "zenth-badge-orange": {
      newName: "",
      description: "Orange badge background",
      theme: {
        zenth: {
          light: "var(--color-zenth-orange-650, oklch(81.5% 0.197 76))",
          dark: "var(--color-zenth-orange-650, oklch(81.5% 0.197 76))",
        },
      },
    },

    // Purple
    "zenth-badge-purple": {
      newName: "",
      description: "Purple badge background",
      theme: {
        zenth: {
          light: "var(--color-zenth-purple-600, oklch(55.8% 0.288 302.321))",
          dark: "var(--color-zenth-purple-700, oklch(49.6% 0.265 301.924))",
        },
      },
    },

    // Teal
    "zenth-badge-teal": {
      newName: "",
      description: "Teal badge background",
      theme: {
        zenth: {
          light: "var(--color-zenth-teal-650, oklch(54.9% 0.096 184.565))",
          dark: "var(--color-zenth-teal-700, oklch(51.1% 0.096 186.391))",
        },
      },
    },

    // Blue
    "zenth-badge-blue": {
      newName: "",
      description: "Blue badge background",
      theme: {
        zenth: {
          light: "var(--color-zenth-blue-500, #1769e0)",
          dark: "var(--color-zenth-blue-500, #1769e0)",
        },
      },
    },

    // Neutral
    "zenth-badge-neutral": {
      newName: "",
      description: "Neutral badge background",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-500, #747b87)",
          dark: "var(--color-zenth-neutral-600, #5a616d)",
        },
      },
    },
    // NOTE: kumo-badge-neutral-subtle omitted — same pair as kumo-fill.
    // Badge uses bg-kumo-fill instead.

    // Inverted
    "zenth-badge-inverted": {
      newName: "",
      description:
        "Inverted badge background (near-black in light, white in dark)",
      theme: {
        zenth: {
          light: "var(--color-zenth-neutral-950, oklch(14.5% 0 0))",
          dark: "var(--color-white, #fff)",
        },
      },
    },
  },

  /**
   * Typography tokens
   * Used with: text-{size} utilities
   * CSS variables: --text-{size}, --text-{size}--line-height
   *
   * Note: Typography is NOT theme-dependent (no light/dark mode).
   * Values are the same across color modes but may differ per theme.
   */
  typography: {
    xs: {
      newName: "",
      theme: {
        zenth: "12px",
      },
    },
    "xs--line-height": {
      newName: "",
      theme: {
        zenth: "calc(1 / 0.75)",
      },
    },
    sm: {
      newName: "",
      theme: {
        zenth: "13px",
      },
    },
    "sm--line-height": {
      newName: "",
      theme: {
        zenth: "calc(1 / 0.85)",
      },
    },
    base: {
      newName: "",
      theme: {
        zenth: "14px",
      },
    },
    "base--line-height": {
      newName: "",
      theme: {
        zenth: "1.5",
      },
    },
    lg: {
      newName: "",
      theme: {
        zenth: "16px",
      },
    },
    "lg--line-height": {
      newName: "",
      theme: {
        zenth: "1.5",
      },
    },
  },
};

/** List of all available themes */
export const AVAILABLE_THEMES = ["zenth", "fedramp"] as const;
export type AvailableTheme = (typeof AVAILABLE_THEMES)[number];
