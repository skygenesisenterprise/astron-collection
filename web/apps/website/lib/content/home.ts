/**
 * Homepage content.
 *
 * Structure follows the conversion patterns audited on mee6.xyz (hero with a
 * product-in-context preview, factual trust strip, capability cards, how it
 * works, editions, FAQ, closing CTA). The copy stays inside what the repository
 * verifies — no invented numbers, testimonials or shipped features.
 */

export type CapabilityIcon =
	| "community"
	| "moderation"
	| "automod"
	| "audit"
	| "config"
	| "voice"
	| "developers"
	| "deployment";

export interface Capability {
	icon: CapabilityIcon;
	title: string;
	description: string;
	href: string;
	linkLabel: string;
}

export const capabilities: Capability[] = [
	{
		icon: "community",
		title: "Community",
		description:
			"Welcome and farewell messages, XP, levels and ranks, polls and reminders — the daily surface of a server.",
		href: "/applications/astron",
		linkLabel: "Astron",
	},
	{
		icon: "moderation",
		title: "Moderation",
		description:
			"Ban, kick, mute, unmute, warn and purge, with permissions re-checked on every execution.",
		href: "/applications/protect",
		linkLabel: "Protect",
	},
	{
		icon: "automod",
		title: "AutoMod",
		description:
			"Configure Discord AutoMod and let the bot enforce it alongside native moderation tools.",
		href: "/applications/protect",
		linkLabel: "Protect",
	},
	{
		icon: "audit",
		title: "Logging & audit",
		description:
			"Moderation actions, warnings and member events kept in your own data store, with structured JSON logs.",
		href: "/applications/logger",
		linkLabel: "Logger",
	},
	{
		icon: "config",
		title: "Per-guild configuration",
		description:
			"Channels and roles are set where the community lives, through `/config` — no dashboard round-trip.",
		href: "/applications/guild",
		linkLabel: "Guild",
	},
	{
		icon: "voice",
		title: "Voice presence",
		description:
			"A silent presence in the official channel, reconnecting with backoff and coordinating audio sessions.",
		href: "/applications/player",
		linkLabel: "Player",
	},
	{
		icon: "developers",
		title: "Developer surfaces",
		description:
			"OpenAPI, CLI, TypeScript SDK and an MCP server — 724 operations, one permission model.",
		href: "/developers",
		linkLabel: "Developers",
	},
	{
		icon: "deployment",
		title: "Self-hosted or Cloud",
		description:
			"Run the whole platform on your infrastructure, or let SGE operate the control plane.",
		href: "/platform",
		linkLabel: "Platform",
	},
];

export const trustFacts = [
	{ value: "5", label: "Discord applications" },
	{ value: "20", label: "Shared commands" },
	{ value: "724", label: "API operations" },
	{ value: "MIT", label: "Licence" },
];

export const steps = [
	{
		title: "Pick a distribution",
		description:
			"One bot for everything, or a dedicated process per responsibility. Each has its own token, data volume and Redis prefix.",
		href: "/applications",
		linkLabel: "Compare applications",
	},
	{
		title: "Configure it in Discord",
		description:
			"Channels, roles, welcomes, levels and AutoMod are set with `/config` and the command set, in the guild itself.",
		href: "/applications/astron",
		linkLabel: "See the commands",
	},
	{
		title: "Operate it from the console",
		description:
			"Deploy, back up and monitor the services behind the bots — self-hosted, or managed by SGE.",
		href: "/manager",
		linkLabel: "Open the console overview",
	},
];

export interface FaqEntry {
	question: string;
	answer: string;
}

export const faqs: FaqEntry[] = [
	{
		question: "Do I need to run all five applications?",
		answer:
			"No. Each distribution is deployed on its own, with its own Discord application, token, data volume and Redis key prefix. Nothing forces you to adopt the whole collection at once.",
	},
	{
		question: "Are the applications actually different from each other?",
		answer:
			"Today they ship the same 20-command catalogue. They differ by deployment intent: community, logging, protection, voice or a single complete bot. The pages say so rather than inventing separate feature lists.",
	},
	{
		question: "Where do I configure the bot?",
		answer:
			"In Discord. `/config` sets the channels and roles per guild, and the rest of the catalogue handles welcomes, levels, polls and moderation. There is no separate bot settings dashboard to keep in sync.",
	},
	{
		question: "Does Astron Manager administer my Discord server?",
		answer:
			"No. The console manages the platform around the bots — servers, deployments, databases, domains, backups and access. Discord appears in the console as a notification channel, not as a guild administration panel.",
	},
	{
		question: "Can I self-host everything?",
		answer:
			"Yes. The platform runs as four services — PostgreSQL, Redis, client and API — from a single Compose stack, with no Traefik, Swarm or host Docker socket required for the platform itself. The bots have their own images and Compose files.",
	},
	{
		question: "What does Astron Collection Cloud operate?",
		answer:
			"The control plane: console, API, availability, upgrades and monitoring. Your workloads keep running on the servers you connect, and your application data stays there.",
	},
	{
		question: "Is music playback available?",
		answer:
			"Not yet. Astron Player ships voice presence — silent join, reconnect with backoff, session leases — but playback commands are not part of the catalogue, and the page marks it as in development.",
	},
	{
		question: "Do self-hosted installs send telemetry?",
		answer:
			"No. A self-hosted installation runs on your PostgreSQL, Redis and volumes; Sky Genesis Enterprise has no access to that data and receives nothing from it.",
	},
];
