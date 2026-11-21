/**
 * Editorial content for the Astron Collection homepage.
 *
 * The six bots and their capabilities are not redeclared here: they are read
 * from `productMenuFamilies`, the same records that drive the site navigation.
 * This module only adds the homepage framing, the by-need index and the
 * verified destinations used by the closing sections.
 *
 * Integrity rules:
 * - No bot is given a price, availability state, invite link or customer claim.
 * - The dashboard is described as a separate authenticated surface, which is
 *   what `links.console` is.
 * - Every external destination is a URL already published in the repository.
 */

import { getProductMenuFamily, type ProductMenuFamily } from "./navigation";
import { links, siteTitle } from "./site";

export const homeDestinations = {
	dashboard: links.console,
	documentation: "https://docs.astron-collection.com/docs/core",
	repository: links.github,
	organisation: links.githubOrg,
	discussions: `${links.github}/discussions`,
	discord: "https://discord.gg/GUkDugVh34",
} as const;

export const BOT_IDS = [
	"astron",
	"automations",
	"guild",
	"logger",
	"player",
	"protect",
] as const;

export type BotId = (typeof BOT_IDS)[number];

/** Resolve one of the six published bot families without a second record. */
export function getHomeBot(id: BotId): ProductMenuFamily & { id: BotId } {
	const bot = getProductMenuFamily(id);
	if (!bot) {
		throw new Error(`Unknown Astron Collection bot: ${id}`);
	}
	return { ...bot, id };
}

export const homeBots: (ProductMenuFamily & { id: BotId })[] =
	BOT_IDS.map(getHomeBot);

/** Resolve capability ids against the published family record. */
export function getPublishedCapabilities(
	botId: BotId,
	capabilityIds: readonly string[],
) {
	const bot = getHomeBot(botId);
	return capabilityIds.flatMap((id) => {
		const capability = bot.capabilities.find((entry) => entry.id === id);
		return capability ? [capability] : [];
	});
}

/* -------------------------------------------------------------------------- */
/* 01 — The collection                                                        */
/* -------------------------------------------------------------------------- */

export const collectionSection = {
	index: "01",
	eyebrow: "The collection",
	title: "Six bots. One server",
	highlight: "One collection",
	description:
		"Astron Collection is six Discord bots, each built around one clear job: run the platform, automate the routine, manage the community, keep the record, play the audio and protect the server.",
	body: "The bots share a collection and a public identity. Each one keeps its own scope, so you can start with the surface your server needs today and add another without relearning the collection.",
	primary: {
		href: "#bots",
		label: "Install a bot",
		external: false,
	},
	secondary: {
		href: homeDestinations.dashboard,
		label: "Open the dashboard",
		external: true,
	},
	note: "One collection, six separate scopes. No implied integration between them.",
} as const;

/* -------------------------------------------------------------------------- */
/* 02 — The six bots                                                          */
/* -------------------------------------------------------------------------- */

export const botsSection = {
	index: "02",
	eyebrow: "The six bots",
	title: "Choose a bot. Read its published scope",
	description:
		"The selector is the shortest route into the collection. Every capability below is the same record that drives the product navigation, so the homepage cannot drift from the rest of the site.",
} as const;

/* -------------------------------------------------------------------------- */
/* 03 — By need                                                               */
/* -------------------------------------------------------------------------- */

export interface HomeNeed {
	id: string;
	number: string;
	title: string;
	description: string;
	botId: BotId;
	capabilityIds: string[];
}

export const needsSection = {
	index: "03",
	eyebrow: "By need",
	title: "Start with what your server actually does",
	description:
		"The collection is easier to read by job than by feature count. Pick the work you need covered; the index points to the bot that publishes it.",
	note: "A need is a way into the collection, not a bundle. Each bot keeps its own scope.",
} as const;

export const homeNeeds: HomeNeed[] = [
	{
		id: "run-the-server",
		number: "01",
		title: "Run the everyday server",
		description:
			"Commands, applications, permissions and configuration in one core platform.",
		botId: "astron",
		capabilityIds: ["commands", "permissions", "configuration"],
	},
	{
		id: "remove-the-repetition",
		number: "02",
		title: "Remove the repetition",
		description:
			"Turn events and schedules into repeatable workflows, with executions you can inspect.",
		botId: "automations",
		capabilityIds: ["workflows", "triggers", "schedules"],
	},
	{
		id: "grow-the-community",
		number: "03",
		title: "Grow the community",
		description:
			"Welcome new members, organise roles and keep everyday participation moving.",
		botId: "guild",
		capabilityIds: ["welcome", "roles", "engagement"],
	},
	{
		id: "keep-a-record",
		number: "04",
		title: "Keep a record",
		description:
			"Audit administrative changes, server events and moderation actions in one history.",
		botId: "logger",
		capabilityIds: ["audit-logs", "event-logs", "log-management"],
	},
	{
		id: "listen-together",
		number: "05",
		title: "Listen together",
		description:
			"Playback, playlists and a shared queue for the voice channels your members already use.",
		botId: "player",
		capabilityIds: ["playback", "playlists", "queue-management"],
	},
	{
		id: "protect-the-server",
		number: "06",
		title: "Protect the server",
		description:
			"Anti-spam, anti-raid, verification and rules for the moments that need a boundary.",
		botId: "protect",
		capabilityIds: ["anti-spam", "anti-raid", "verification"],
	},
];

/* -------------------------------------------------------------------------- */
/* 04 — One server, six surfaces                                              */
/* -------------------------------------------------------------------------- */

export interface EcosystemStage {
	id: string;
	label: string;
	botId: BotId;
	detail: string;
	capabilityIds: string[];
}

export const ecosystemSection = {
	index: "04",
	eyebrow: "One server, six surfaces",
	title: "The collection covers the day, not just the setup",
	description:
		"A server moves between arrival, interaction, routine, safety, memory and atmosphere. The six bots are arranged around those surfaces, so the collection reads as one operation.",
	note: "The stages describe coverage, not a shared data flow between the bots.",
} as const;

export const ecosystemStages: EcosystemStage[] = [
	{
		id: "arrival",
		label: "Arrival",
		botId: "guild",
		detail: "Welcome, roles and the first steps a member takes.",
		capabilityIds: ["welcome", "roles"],
	},
	{
		id: "interaction",
		label: "Interaction",
		botId: "astron",
		detail: "Commands, applications, permissions and configuration.",
		capabilityIds: ["commands", "permissions"],
	},
	{
		id: "routine",
		label: "Routine",
		botId: "automations",
		detail: "Workflows, triggers, schedules and reusable templates.",
		capabilityIds: ["workflows", "schedules"],
	},
	{
		id: "safety",
		label: "Safety",
		botId: "protect",
		detail: "Anti-spam, anti-raid, verification and threat detection.",
		capabilityIds: ["anti-raid", "anti-spam"],
	},
	{
		id: "record",
		label: "Record",
		botId: "logger",
		detail: "Audit, event, message and moderation history.",
		capabilityIds: ["audit-logs", "event-logs"],
	},
	{
		id: "atmosphere",
		label: "Atmosphere",
		botId: "player",
		detail: "Playback, playlists and shared voice sessions.",
		capabilityIds: ["playback", "playlists"],
	},
];

/* -------------------------------------------------------------------------- */
/* 05 — Central management                                                    */
/* -------------------------------------------------------------------------- */

export const dashboardSection = {
	index: "05",
	eyebrow: "Central management",
	title: "One dashboard. A separate, authenticated surface",
	description:
		"The dashboard is the signed-in surface for Astron Collection. Account access is handled there; this page describes the collection and does not reproduce the console.",
	points: [
		{
			title: "One entry point",
			body: "A single route to the authenticated console, linked from the collection.",
		},
		{
			title: "Authentication stays separate",
			body: "Sign-in and account access belong to the dashboard service, not to this website.",
		},
		{
			title: "No credentials here",
			body: "The homepage never asks for a password or reproduces an authenticated screen.",
		},
	],
	cta: {
		href: homeDestinations.dashboard,
		label: "Open the dashboard",
		external: true,
	},
	note: "The panel is a schematic of that boundary, not a screenshot.",
} as const;

/* -------------------------------------------------------------------------- */
/* 06 — Developers and contributors                                           */
/* -------------------------------------------------------------------------- */

export interface DeveloperLink {
	label: string;
	description: string;
	href: string;
	external: boolean;
}

export const developersSection = {
	index: "06",
	eyebrow: "Developers & contributors",
	title: "A platform you can inspect and extend",
	description:
		"Commands, applications, integrations and extensions are part of the scope Astron publishes. The documentation and the public repository are where that surface is maintained.",
	note: "A public repository is not a support contract. Issues and releases describe what is currently provided, and they remain the maintained record.",
} as const;

export const developerLinks: DeveloperLink[] = [
	{
		label: "Documentation",
		description: "Guides for the platform and its bots.",
		href: homeDestinations.documentation,
		external: true,
	},
	{
		label: "Source repository",
		description: "Code, issues and release history.",
		href: homeDestinations.repository,
		external: true,
	},
	{
		label: "All repositories",
		description: "Every public project published by the organisation.",
		href: homeDestinations.organisation,
		external: true,
	},
	{
		label: "Community Discord",
		description: "Questions from other builders and operators.",
		href: homeDestinations.discord,
		external: true,
	},
];

/* -------------------------------------------------------------------------- */
/* 07 — Community                                                             */
/* -------------------------------------------------------------------------- */

export const communitySection = {
	index: "07",
	eyebrow: "Community",
	title: "The conversation is part of the collection",
	description:
		"The Astron Collection Discord is where questions, support and conversation happen. The invite is the same one published in the repository and the documentation.",
	primary: {
		href: homeDestinations.discord,
		label: "Join the Discord",
		external: true,
	},
	secondary: {
		href: homeDestinations.discussions,
		label: "GitHub discussions",
		external: true,
	},
} as const;

/* -------------------------------------------------------------------------- */
/* 08 — Final call to action                                                  */
/* -------------------------------------------------------------------------- */

export interface HomeCtaPathway {
	label: string;
	description: string;
	href: string;
	external?: boolean;
}

export const homeCta = {
	index: "08",
	eyebrow: "Next step",
	title: "Your server. Six bots. One collection",
	description:
		"Choose a bot to install, open the dashboard or join the community.",
	pathways: [
		{
			label: "Install a bot",
			description: "Pick a bot, then install it from its panel.",
			href: "#bots",
		},
		{
			label: "Meet the six bots",
			description: "Capabilities and published scope, bot by bot.",
			href: "#bots",
		},
		{
			label: "Open the dashboard",
			description: "The authenticated surface for your account.",
			href: homeDestinations.dashboard,
			external: true,
		},
		{
			label: "Join the community",
			description: "Questions, support and conversation.",
			href: homeDestinations.discord,
			external: true,
		},
	] satisfies HomeCtaPathway[],
	note: "Every route above is maintained today.",
} as const;

/* -------------------------------------------------------------------------- */
/* Homepage metadata                                                          */
/* -------------------------------------------------------------------------- */

export const homeSeo = {
	title: siteTitle,
	description:
		"Astron Collection brings six Discord bots together: Astron for commands and configuration, Automations for workflows, Guild for community, Logger for records, Player for audio and Protect for safety.",
} as const;
