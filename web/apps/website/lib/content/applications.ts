/**
 * Applications content.
 *
 * Every list here is derived from the repository, not from a roadmap:
 *   - the five distributions and their roles: `bot/README.md`
 *   - the command catalogue: `bot/*\/commands/` (identical across the five today)
 *   - framework guarantees: `packages/discord-framework/README.md`
 *   - intents and permissions: `bot/README.md`
 * `bot/automation` is listed by the Makefile and the release workflow but its
 * directory does not exist, so the app is published as *planned* with no
 * feature list (WEBSITE_AUDIT.md, V-02/V-03).
 */

import { links } from "./links";

export type AppStatus = "available" | "in_development" | "planned";

export interface Application {
	slug: string;
	name: string;
	/** Two characters shown in the monogram tile. */
	monogram: string;
	tagline: string;
	/** Why the distribution exists. */
	role: string;
	status: AppStatus;
	/** One paragraph used on cards and page intros. */
	summary: string;
	/** Problem it solves, in the words of a server admin. */
	problem: string;
	/** Verified capabilities. */
	highlights: string[];
	useCases: string[];
	/** Example interaction, shown as a terminal/Slash block. */
	example?: { label: string; content: string; note?: string };
	config?: { name: string; value: string; note: string }[];
	image?: string;
	docsHref?: string;
}

export const statusLabel: Record<AppStatus, string> = {
	available: "Available",
	in_development: "In development",
	planned: "Planned",
};

/**
 * The catalogue every distribution ships today. Presented once, with the
 * explicit statement that the distributions differ by deployment intent.
 */
export const sharedCommands: { command: string; description: string }[] = [
	{ command: "/config", description: "Per-guild channels and roles" },
	{ command: "/welcome", description: "Welcome message and optional DM" },
	{ command: "/farewell", description: "Farewell message on leave" },
	{ command: "/levels", description: "XP and level configuration" },
	{ command: "/rank", description: "Member rank and progress" },
	{ command: "/poll", description: "Reaction poll" },
	{ command: "/remind", description: "Scheduled reminder" },
	{ command: "/8ball", description: "Prompt answer" },
	{ command: "/dice", description: "Dice roll" },
	{ command: "/ban", description: "Ban a member" },
	{ command: "/kick", description: "Kick a member" },
	{ command: "/mute", description: "Timeout a member" },
	{ command: "/unmute", description: "Remove a timeout" },
	{ command: "/warn", description: "Record a warning" },
	{ command: "/purge", description: "Bulk delete messages" },
	{ command: "/automod", description: "AutoMod configuration" },
	{ command: "/serverinfo", description: "Server details" },
	{ command: "/userinfo", description: "Member details" },
	{ command: "/prefix", description: "Prefix configuration" },
	{ command: "/ping", description: "Latency check" },
];

/** Intents and partials requested by all five distributions (`bot/README.md`). */
export const intents: { name: string; reason: string }[] = [
	{ name: "Guilds", reason: "Guild and channel cache, command registration" },
	{
		name: "GuildMembers",
		reason: "Welcome and farewell, join roles, member moderation",
	},
	{
		name: "GuildMessages + MessageContent",
		reason: "Prefix commands, XP, AutoMod",
	},
	{ name: "GuildModeration", reason: "Bans, kicks, audit log" },
	{ name: "GuildMessageReactions", reason: "Reaction roles and panels" },
	{ name: "GuildVoiceStates", reason: "Required for voice presence" },
	{ name: "GuildScheduledEvents", reason: "Event features" },
	{
		name: "AutoModerationConfiguration + AutoModerationExecution",
		reason: "AutoMod rules and actions",
	},
	{ name: "DirectMessages", reason: "Welcome DMs and reminders" },
];

export const requiredPermissions: string[] = [
	"View Channels + Connect — voice presence",
	"Manage Roles — `config` roles, join roles",
	"Kick Members / Ban Members / Moderate Members — moderation",
	"Manage Channels — tickets",
	"Send Messages + Embed Links — welcome, logs, levels",
	"Manage Messages — purge, polls",
	"Read Message History — logging",
];

export const applications: Application[] = [
	{
		slug: "astron",
		name: "Astron",
		monogram: "AS",
		tagline: "The complete bot",
		role: "Community, moderation, engagement and operations in one distribution.",
		status: "available",
		summary:
			"The distribution to pick when you want a single bot covering the day-to-day of a server: configuration, welcomes, levels, polls, moderation and AutoMod.",
		problem:
			"A server ends up with four bots that each do one thing, four dashboards to configure them, and nobody sure which one muted whom. Astron covers the common surface in one process you can host yourself.",
		highlights: [
			"Per-guild configuration through `/config` (channels and roles)",
			"Welcome and farewell messages, with optional welcome DMs",
			"XP, levels and `/rank`",
			"Polls, reminders, `/8ball` and `/dice`",
			"Ban, kick, mute, unmute, warn and purge with permission checks",
			"AutoMod configuration alongside native Discord moderation",
			"`/serverinfo`, `/userinfo`, `/prefix` and `/ping`",
		],
		useCases: [
			"A community that wants one bot instead of a stack of overlapping ones",
			"A server that needs moderation history in its own data store",
			"A gaming or creator community that relies on XP and polls",
		],
		example: {
			label: "Discord · slash command",
			content: "/config channel channel:#mod-log\n/config role moderator:@Moderator\n/warn member:@member reason:\"Repeated off-topic\"",
			note: "Commands are registered by the bot and re-authorised at execution.",
		},
		config: [
			{
				name: "ASTRON_MAIN_DISCORD_TOKEN",
				value: "<bot token>",
				note: "Required. Per-bot credential (shared DISCORD_TOKEN is a deprecated fallback).",
			},
			{
				name: "ASTRON_MAIN_DISCORD_CLIENT_ID",
				value: "<application id>",
				note: "Required. Used to register the command catalogue.",
			},
			{
				name: "ASTRON_COMMAND_SCOPE",
				value: "global",
				note: "`global`, `guild` (with ASTRON_COMMAND_GUILD_ID) or `none`.",
			},
			{
				name: "REDIS_URL",
				value: "redis://…",
				note: "Optional cache. Without it the bot keeps using its local JSON store.",
			},
		],
		docsHref: links.docs.home,
	},
	{
		slug: "guild",
		name: "Astron Guild",
		monogram: "GU",
		tagline: "Guild center",
		role: "Community management and member experience as a dedicated distribution.",
		status: "available",
		summary:
			"A dedicated process for the community side of the platform: configuration, welcomes, levels and member information, deployed separately from moderation.",
		problem:
			"When community features and moderation run in the same process, tuning one restarts the other. Splitting them lets each scale and restart on its own schedule.",
		highlights: [
			"`/config` for per-guild channels and roles",
			"Welcome and farewell messages",
			"Levels, XP and `/rank`",
			"Polls and reminders",
			"`/serverinfo` and `/userinfo`",
			"Its own token, data directory and Redis key prefix",
		],
		useCases: [
			"A large community where welcome traffic should not compete with moderation",
			"A network of servers with a shared community experience",
			"A server that wants to restart community features without dropping AutoMod",
		],
		example: {
			label: "Discord · slash command",
			content: "/welcome channel:#welcome message:\"Welcome to the server, {user}!\"\n/levels channel:#level-up",
			note: "Deployment intent differs from Astron; the catalogue is shared.",
		},
		docsHref: links.docs.home,
	},
	{
		slug: "logger",
		name: "Astron Logger",
		monogram: "LG",
		tagline: "Logging and audit",
		role: "Event and audit logging for servers that need a trace of what happened.",
		status: "available",
		summary:
			"A dedicated distribution for traceability: it keeps member events and moderation records, and answers the question \"who did what, and when?\".",
		problem:
			"Discord's own audit log is short-lived and shallow. Investigating an incident weeks later needs events stored somewhere you control.",
		highlights: [
			"Moderation actions recorded with the acting moderator and reason",
			"Warning history kept in the bot's own data store",
			"AutoMod configuration and enforcement events",
			"`/serverinfo` and `/userinfo` for context during review",
			"Structured JSON logs on stdout, with secrets redacted by the framework",
		],
		useCases: [
			"A server that answers to a community or a moderation team",
			"Incident review after a raid or a contested ban",
			"Keeping an audit trail on your own infrastructure",
		],
		example: {
			label: "Container · structured log line",
			content: '{"level":"info","bot":"logger","msg":"command executed","command":"warn"}',
			note: "Keys matching token|secret|password|authorization are redacted before output.",
		},
		docsHref: links.docs.home,
	},
	{
		slug: "protect",
		name: "Astron Protect",
		monogram: "PR",
		tagline: "Moderation and safety",
		role: "A dedicated safety instance for moderation, AutoMod and server protection.",
		status: "available",
		summary:
			"Moderation separated from everything else, so a raid response is not queued behind welcome messages or level updates.",
		problem:
			"When a raid starts, the moderation path must be the shortest one. Sharing a process with community features adds latency where it hurts most.",
		highlights: [
			"Ban, kick, mute and unmute with permission checks",
			"Warnings and purge",
			"AutoMod configuration and enforcement",
			"Four-layer authorisation, fail-closed: user permissions, bot permissions, business rules, registration hint",
			"Contained handlers — a failing command never takes the process down",
		],
		useCases: [
			"A public server that needs moderation to stay responsive under load",
			"A moderation team that restarts its safety bot independently",
			"A community that separates duties between bots and roles",
		],
		example: {
			label: "Discord · slash command",
			content: "/automod enabled:true\n/ban member:@account reason:\"Raid participation\"",
			note: "Every execution re-checks user permissions, bot permissions and the bot's policy.",
		},
		docsHref: links.docs.home,
	},
	{
		slug: "player",
		name: "Astron Player",
		monogram: "PL",
		tagline: "Voice",
		role: "Voice-capable distribution built on @discordjs/voice.",
		status: "in_development",
		summary:
			"Joins the official presence channel silently and coordinates audio sessions through the shared voice layer. Playback commands are not shipped yet.",
		problem:
			"Voice is the part of a community stack that breaks most often: connections drop, sessions collide, and a restart leaves a ghost client in the channel.",
		highlights: [
			"Silent presence in the official voice channel, no command needed",
			"Reconnects with exponential backoff and jitter",
			"One connection per guild, adopted rather than duplicated",
			"Session leases so an audio owner keeps its connection",
			"Refuses a channel outside the official guild, or one it cannot join",
		],
		useCases: [
			"A community that wants the bot present in its voice channel by default",
			"A deployment preparing for audio features on a stable voice layer",
		],
		example: {
			label: "Server · environment",
			content: "ASTRON_VOICE_PRESENCE_ENABLED=true\nASTRON_PRESENCE_VOICE_CHANNEL_ID=<channel id>",
			note: "Playback is not available today; the presence layer is.",
		},
		docsHref: links.docs.home,
		image: undefined,
	},
	{
		slug: "automation",
		name: "Astron Automation",
		monogram: "AU",
		tagline: "Planned",
		role: "Task automation, scheduled from the platform.",
		status: "planned",
		summary:
			"Listed in the release catalogue and the Makefile. The distribution does not exist yet, so no feature is published here.",
		problem:
			"Repetitive community operations — scheduled announcements, rotating roles, periodic clean-up — still need a person or an external script.",
		highlights: [],
		useCases: [],
		docsHref: links.docs.home,
	},
];

export function getApplication(slug: string): Application | undefined {
	return applications.find((application) => application.slug === slug);
}
