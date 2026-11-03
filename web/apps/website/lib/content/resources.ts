/** Resource pages: community, open source, changelog, status, contact. */

import { links } from "./links";

export const resourcePages = [
	{
		href: "/resources/community",
		title: "Community",
		description: "Discord, discussions, issues and the contribution guide.",
	},
	{
		href: "/resources/open-source",
		title: "Open source",
		description: "MIT licence, repository layout and how to contribute.",
	},
	{
		href: "/resources/changelog",
		title: "Changelog",
		description: "Releases, fixes and breaking changes, straight from GitHub.",
	},
	{
		href: "/resources/status",
		title: "Service status",
		description: "Incidents, maintenance windows and uptime.",
	},
	{
		href: "/resources/contact",
		title: "Contact",
		description: "Sales, support and security disclosure.",
	},
];

export const communityChannels = [
	{
		title: "Discord",
		description:
			"Questions, setup help and community conversation. The fastest place to get an answer.",
		href: links.community.discord,
		label: "Join the Discord",
	},
	{
		title: "GitHub Discussions",
		description:
			"Longer-form questions, deployment stories and proposals that should outlive a chat thread.",
		href: links.github.discussions,
		label: "Open Discussions",
	},
	{
		title: "GitHub Issues",
		description:
			"Bugs and feature requests, with reproduction steps. Never report a vulnerability here.",
		href: links.github.issues,
		label: "Open Issues",
	},
];

export const contributionPaths = [
	{
		title: "Code",
		description:
			"Fix bugs, add commands or improve the console. PR titles follow Conventional Commits.",
	},
	{
		title: "Documentation",
		description:
			"Correct a step, add an example, document a limitation you hit.",
	},
	{
		title: "Testing",
		description:
			"Run releases, report regressions and confirm fixes on your own deployment.",
	},
	{
		title: "Triage",
		description:
			"Reproduce reports, ask for the missing detail, close what is already fixed.",
	},
];

export const repositoryLayout = [
	{ path: "apps/", role: "Console, background work, scheduler, status page, monitoring" },
	{ path: "bot/", role: "Five Discord distributions" },
	{ path: "packages/", role: "Shared framework, server, status engine, tRPC/OpenAPI, MCP" },
	{ path: "web/", role: "Marketing website and documentation site" },
	{ path: "scripts/", role: "Install, worktree and documentation tooling" },
];

export const statusChecks = [
	{
		title: "Platform availability",
		description:
			"The status page tracks components independently, so a degraded API does not read as a total outage.",
	},
	{
		title: "Incidents",
		description:
			"Published as they are opened, updated while they are investigated and closed with a resolution.",
	},
	{
		title: "Maintenance",
		description:
			"Scheduled windows are announced in advance with the affected components.",
	},
];
