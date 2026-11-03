import type { Config } from "tailwindcss";

/**
 * Tailwind for the Astron Collection site.
 *
 * Mirror of the documentation site's `@theme` mapping
 * (`web/apps/docs/app/global.css`): the same token names, radius scale and
 * letter-spacing scale. Channels live in `styles/tailwind.css`.
 */
const config = {
	darkMode: ["class"],
	content: [
		"./app/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./lib/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: "1.5rem",
			screens: { "2xl": "1200px" },
		},
		extend: {
			colors: {
				background: "oklch(var(--background) / <alpha-value>)",
				foreground: "oklch(var(--foreground) / <alpha-value>)",
				border: "oklch(var(--border) / <alpha-value>)",
				"border-strong": "oklch(var(--border-strong) / <alpha-value>)",
				input: "oklch(var(--input) / <alpha-value>)",
				ring: "oklch(var(--ring) / <alpha-value>)",
				card: {
					DEFAULT: "oklch(var(--card) / <alpha-value>)",
					foreground: "oklch(var(--card-foreground) / <alpha-value>)",
				},
				popover: {
					DEFAULT: "oklch(var(--popover) / <alpha-value>)",
					foreground: "oklch(var(--popover-foreground) / <alpha-value>)",
				},
				primary: {
					DEFAULT: "oklch(var(--primary) / <alpha-value>)",
					foreground: "oklch(var(--primary-foreground) / <alpha-value>)",
				},
				secondary: {
					DEFAULT: "oklch(var(--secondary) / <alpha-value>)",
					foreground: "oklch(var(--secondary-foreground) / <alpha-value>)",
				},
				muted: {
					DEFAULT: "oklch(var(--muted) / <alpha-value>)",
					foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
				},
				accent: {
					DEFAULT: "oklch(var(--accent) / <alpha-value>)",
					foreground: "oklch(var(--accent-foreground) / <alpha-value>)",
				},
				destructive: {
					DEFAULT: "oklch(var(--destructive) / <alpha-value>)",
					foreground: "oklch(var(--destructive-foreground) / <alpha-value>)",
				},
				/* Site aliases kept for readable component code. */
				subtle: {
					DEFAULT: "oklch(var(--muted) / <alpha-value>)",
					foreground: "oklch(var(--muted-foreground) / <alpha-value>)",
				},
				success: "oklch(var(--success) / <alpha-value>)",
				warning: "oklch(var(--warning) / <alpha-value>)",
				danger: "oklch(var(--destructive) / <alpha-value>)",
				signal: "oklch(var(--signal) / <alpha-value>)",
				chart: {
					1: "oklch(var(--chart-1) / <alpha-value>)",
					2: "oklch(var(--chart-2) / <alpha-value>)",
					3: "oklch(var(--chart-3) / <alpha-value>)",
					4: "oklch(var(--chart-4) / <alpha-value>)",
					5: "oklch(var(--chart-5) / <alpha-value>)",
				},
			},
			borderColor: {
				DEFAULT: "oklch(var(--border) / <alpha-value>)",
			},
			/* Same scale as the docs: sm = radius-4, md = radius-2, lg = radius. */
			borderRadius: {
				xs: "calc(var(--radius) - 4px)",
				sm: "calc(var(--radius) - 4px)",
				DEFAULT: "calc(var(--radius) - 2px)",
				md: "calc(var(--radius) - 2px)",
				lg: "var(--radius)",
				xl: "calc(var(--radius) + 4px)",
				"2xl": "calc(var(--radius) + 8px)",
				"3xl": "calc(var(--radius) + 12px)",
			},
			/* Same shadow scale as `styles/globals.css`, resolved per theme. */
			boxShadow: {
				"2xs": "var(--shadow-2xs)",
				xs: "var(--shadow-xs)",
				sm: "var(--shadow-sm)",
				DEFAULT: "var(--shadow)",
				md: "var(--shadow-md)",
				lg: "var(--shadow-lg)",
				xl: "var(--shadow-xl)",
				"2xl": "var(--shadow-2xl)",
				float: "var(--shadow-float)",
			},
			fontFamily: {
				sans: [
					"var(--font-sans)",
					"Inter",
					"system-ui",
					"-apple-system",
					"Segoe UI",
					"sans-serif",
				],
				mono: ["var(--font-mono)"],
				/* Legacy alias: the display face is the sans stack now. */
				display: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
			},
			/* Letter-spacing anchored on --tracking-normal, as in the docs. */
			letterSpacing: {
				tighter: "calc(var(--tracking-normal) - 0.05em)",
				tight: "calc(var(--tracking-normal) - 0.025em)",
				normal: "var(--tracking-normal)",
				wide: "calc(var(--tracking-normal) + 0.025em)",
				wider: "calc(var(--tracking-normal) + 0.05em)",
				widest: "calc(var(--tracking-normal) + 0.1em)",
			},
			keyframes: {
				"accordion-down": {
					from: { height: "0" },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: "0" },
				},
				pulseDot: {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0.35" },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
				"pulse-dot": "pulseDot 2s ease-in-out infinite",
			},
		},
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
