import { links } from "./links";

/** Brand facts, navigation, footer and the global calls to action. */

export const site = {
	name: "Astron Collection",
	shortName: "Astron",
	company: "Sky Genesis Enterprise",
	tagline: "Focused Discord applications. One platform behind them.",
	description:
		"Astron Collection is an open-source suite of Discord applications — community, logging, protection, voice — built on a shared framework and managed from one console. Self-host it or use Astron Collection Cloud.",
	license: "MIT",
} as const;

export interface NavItem {
	href: string;
	label: string;
	description?: string;
	external?: boolean;
}

export interface NavGroup {
	title: string;
	items: NavItem[];
}

/** Primary navigation: five destinations, no more. */
export const nav: NavItem[] = [
	{ href: "/applications", label: "Applications" },
	{ href: "/platform", label: "Platform" },
	{ href: "/manager", label: "Manager" },
	{ href: "/developers", label: "Developers" },
	{ href: "/resources", label: "Resources" },
];

/** Applications submenu (desktop disclosure + mobile list). */
export const applicationNav: NavItem[] = [
	{
		href: "/applications",
		label: "All applications",
		description: "The six applications in the collection",
	},
	{
		href: "/applications/astron",
		label: "Astron",
		description: "Community and moderation, in one bot",
	},
	{
		href: "/applications/guild",
		label: "Astron Guild",
		description: "Guild center for community management",
	},
	{
		href: "/applications/logger",
		label: "Astron Logger",
		description: "Event and audit logging",
	},
	{
		href: "/applications/protect",
		label: "Astron Protect",
		description: "Moderation and server safety",
	},
	{
		href: "/applications/player",
		label: "Astron Player",
		description: "Voice presence and audio sessions",
	},
	{
		href: "/applications/automation",
		label: "Astron Automation",
		description: "Planned — no functionality published yet",
	},
];

/**
 * Global actions.
 *
 * `invite` is null until the public Discord invite URLs exist, so every
 * "Add to Discord" control points at the applications page instead of a
 * non-functional OAuth link (see WEBSITE_AUDIT.md, V-07).
 */
export const cta = {
	invite: { href: "/applications", label: "Add to Discord" },
	console: { href: links.console, label: "Open the console", external: true },
	docs: { href: links.docs.home, label: "Documentation", external: true },
	github: { href: links.github.repo, label: "Source code", external: true },
	discord: { href: links.community.discord, label: "Join the Discord", external: true },
} as const;

export const footerSections: { title: string; links: NavItem[] }[] = [
	{
		title: "Applications",
		links: [
			{ href: "/applications", label: "Overview" },
			{ href: "/applications/astron", label: "Astron" },
			{ href: "/applications/guild", label: "Astron Guild" },
			{ href: "/applications/logger", label: "Astron Logger" },
			{ href: "/applications/protect", label: "Astron Protect" },
			{ href: "/applications/player", label: "Astron Player" },
			{ href: "/applications/automation", label: "Astron Automation" },
		],
	},
	{
		title: "Platform",
		links: [
			{ href: "/platform", label: "Architecture" },
			{ href: "/manager", label: "Astron Manager" },
			{ href: "/platform/self-hosted", label: "Self-hosted" },
			{ href: "/platform/cloud", label: "Cloud" },
			{ href: "/developers", label: "Developers" },
		],
	},
	{
		title: "Resources",
		links: [
			{ href: links.docs.home, label: "Documentation", external: true },
			{ href: "/developers", label: "API & MCP" },
			{ href: "/resources/changelog", label: "Changelog" },
			{ href: "/resources/status", label: "Service status" },
			{ href: "/resources/community", label: "Community" },
			{ href: "/resources/contact", label: "Contact" },
		],
	},
	{
		title: "Project",
		links: [
			{ href: "/resources/open-source", label: "Open source (MIT)" },
			{ href: links.github.repo, label: "GitHub", external: true },
			{ href: links.github.issues, label: "Issues", external: true },
			{ href: links.github.discussions, label: "Discussions", external: true },
			{ href: "/legal/privacy", label: "Privacy" },
			{ href: "/legal/terms", label: "Terms" },
		],
	},
];

/** Routes published in the sitemap (single source of truth). */
export const siteRoutes: { path: string; priority: number }[] = [
	{ path: "", priority: 1 },
	{ path: "/applications", priority: 0.95 },
	{ path: "/applications/astron", priority: 0.9 },
	{ path: "/applications/guild", priority: 0.8 },
	{ path: "/applications/logger", priority: 0.8 },
	{ path: "/applications/protect", priority: 0.8 },
	{ path: "/applications/player", priority: 0.75 },
	{ path: "/applications/automation", priority: 0.6 },
	{ path: "/manager", priority: 0.9 },
	{ path: "/platform", priority: 0.9 },
	{ path: "/platform/self-hosted", priority: 0.85 },
	{ path: "/platform/cloud", priority: 0.85 },
	{ path: "/developers", priority: 0.85 },
	{ path: "/resources", priority: 0.7 },
	{ path: "/resources/community", priority: 0.6 },
	{ path: "/resources/open-source", priority: 0.6 },
	{ path: "/resources/changelog", priority: 0.5 },
	{ path: "/resources/status", priority: 0.5 },
	{ path: "/resources/contact", priority: 0.6 },
	{ path: "/legal/privacy", priority: 0.3 },
	{ path: "/legal/terms", priority: 0.3 },
];
