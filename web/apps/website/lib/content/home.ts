/**
 * Content for the homepage hero (`SignalHero`).
 *
 * The hero names the six-bot collection and carries the one install route; the
 * detailed scope for each bot stays in `home-collection.ts`.
 */

import { links } from "./site";

export const homeHero = {
	eyebrow: "Astron Collection · Discord suite",
	title: "Six Discord bots",
	highlight: "One server, covered",
	description:
		"Astron, Automations, Guild, Logger, Player and Protect cover commands, workflows, community, records, audio and safety — each with its own published scope.",
	primaryCta: {
		href: "#bots",
		label: "Install a bot",
	},
	secondaryCta: {
		href: links.console,
		label: "Open the dashboard",
		external: true,
	},
} as const;
