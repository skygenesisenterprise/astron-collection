/**
 * Single source of truth for the global header navigation.
 *
 * The header, its mega-menus and the mobile navigation all read this module;
 * no link is defined inside a component.
 *
 * Destination policy:
 * - `href` is only present when the destination exists in this application.
 * - A product without a published detail page inherits its category overview
 *   (the catalogue or an existing family overview) instead of receiving a
 *   placeholder URL.
 * - External destinations are marked `external` and always absolute.
 * - Availability, pricing and maturity are never inferred here. `maturity` is
 *   only set when the state is verified; today no product entry qualifies, so
 *   the field stays unset rather than inventing an availability claim.
 */

import { type NavCategory, productCategories } from "./ecosystem";
import { links } from "./site";

export type {
	NavCategory,
	NavMaturity,
	NavProduct,
	NavProductKind,
	ProductCategoryId,
} from "./ecosystem";
export { productCategories } from "./ecosystem";

export type NavSectionId =
	| "products"
	| "solutions"
	| "developers"
	| "resources"
	| "company"
	| "pricing";

export interface NavLink {
	href: string;
	label: string;
	description?: string;
	external?: boolean;
}

export interface NavColumn {
	title: string;
	/** Column overview destination, when one exists. */
	href?: string;
	links: NavLink[];
}

export interface NavSection {
	id: NavSectionId;
	label: string;
	/** Landing page for the section, when one exists. */
	href?: string;
	description: string;
	columns: NavColumn[];
	footerLinks: NavLink[];
	/** Only the Products section carries the formal product categories. */
	categories?: NavCategory[];
	families?: ProductMenuFamily[];
}

export interface ProductMenuCapability {
	id: string;
	label: string;
	description: string;
	href: string;
}

export interface ProductMenuFamily {
	id: string;
	label: string;
	description: string;
	href: string;
	capabilities: ProductMenuCapability[];
}

const CATALOGUE_HREF = "/products";

interface ProductMenuCapabilityInput {
	id: string;
	label: string;
	description: string;
}

interface ProductMenuFamilyInput {
	id: string;
	label: string;
	description: string;
	capabilities: ProductMenuCapabilityInput[];
}

function withProductRoutes(
	families: ProductMenuFamilyInput[],
): ProductMenuFamily[] {
	return families.map((family) => ({
		...family,
		href: `/products/${family.id}`,
		capabilities: family.capabilities.map((capability) => ({
			...capability,
			href: `/products/${family.id}/${capability.id}`,
		})),
	}));
}

export const productMenuFamilies: ProductMenuFamily[] = withProductRoutes([
	{
		id: "astron",
		label: "Astron",
		description: "Core Platform",
		capabilities: [
			{
				id: "commands",
				label: "Commands",
				description: "Interact with your server through powerful commands.",
			},
			{
				id: "applications",
				label: "Applications",
				description: "Manage applications and server functionality.",
			},
			{
				id: "permissions",
				label: "Permissions",
				description: "Control access to commands and capabilities.",
			},
			{
				id: "integrations",
				label: "Integrations",
				description: "Connect external services and platforms.",
			},
			{
				id: "extensions",
				label: "Extensions",
				description: "Extend functionality through custom components.",
			},
			{
				id: "configuration",
				label: "Configuration",
				description: "Customize and manage your Astron experience.",
			},
		],
	},
	{
		id: "automations",
		label: "Automations",
		description: "Workflow Automation",
		capabilities: [
			{
				id: "workflows",
				label: "Workflows",
				description: "Design and orchestrate automated processes.",
			},
			{
				id: "triggers",
				label: "Triggers",
				description: "Initiate workflows from events and conditions.",
			},
			{
				id: "actions",
				label: "Actions",
				description: "Execute operations across your server.",
			},
			{
				id: "schedules",
				label: "Schedules",
				description: "Automate recurring tasks and operations.",
			},
			{
				id: "executions",
				label: "Executions",
				description: "Monitor workflow execution and results.",
			},
			{
				id: "templates",
				label: "Templates",
				description: "Deploy reusable automation templates.",
			},
		],
	},
	{
		id: "guild",
		label: "Guild",
		description: "Community Management",
		capabilities: [
			{
				id: "members",
				label: "Members",
				description: "Manage community members and their activity.",
			},
			{
				id: "roles",
				label: "Roles",
				description: "Organize roles and community permissions.",
			},
			{
				id: "welcome",
				label: "Welcome",
				description: "Create personalized member onboarding experiences.",
			},
			{
				id: "engagement",
				label: "Engagement",
				description: "Encourage participation and community activity.",
			},
			{
				id: "moderation",
				label: "Moderation",
				description: "Manage interactions and community standards.",
			},
			{
				id: "server-management",
				label: "Server Management",
				description: "Centralize everyday server administration.",
			},
		],
	},
	{
		id: "logger",
		label: "Logger",
		description: "Observability and Auditing",
		capabilities: [
			{
				id: "audit-logs",
				label: "Audit Logs",
				description: "Track administrative changes and actions.",
			},
			{
				id: "event-logs",
				label: "Event Logs",
				description: "Record important server events.",
			},
			{
				id: "message-logs",
				label: "Message Logs",
				description: "Monitor message-related activity.",
			},
			{
				id: "member-logs",
				label: "Member Logs",
				description: "Track membership and profile changes.",
			},
			{
				id: "moderation-logs",
				label: "Moderation Logs",
				description: "Maintain records of moderation actions.",
			},
			{
				id: "log-management",
				label: "Log Management",
				description: "Organize and manage historical records.",
			},
		],
	},
	{
		id: "player",
		label: "Player",
		description: "Audio Platform",
		capabilities: [
			{
				id: "playback",
				label: "Playback",
				description: "Control audio playback in voice channels.",
			},
			{
				id: "playlists",
				label: "Playlists",
				description: "Create and manage music collections.",
			},
			{
				id: "queue-management",
				label: "Queue Management",
				description: "Organize and control playback queues.",
			},
			{
				id: "audio-sources",
				label: "Audio Sources",
				description: "Access supported audio providers.",
			},
			{
				id: "voice-sessions",
				label: "Voice Sessions",
				description: "Manage active audio sessions.",
			},
			{
				id: "audio-settings",
				label: "Audio Settings",
				description: "Customize playback and audio behavior.",
			},
		],
	},
	{
		id: "protect",
		label: "Protect",
		description: "Security Platform",
		capabilities: [
			{
				id: "anti-spam",
				label: "Anti-Spam",
				description: "Prevent unwanted and repetitive messages.",
			},
			{
				id: "anti-raid",
				label: "Anti-Raid",
				description: "Defend against coordinated server attacks.",
			},
			{
				id: "auto-moderation",
				label: "Auto Moderation",
				description: "Enforce automated moderation policies.",
			},
			{
				id: "verification",
				label: "Verification",
				description: "Verify members before granting access.",
			},
			{
				id: "security-rules",
				label: "Security Rules",
				description: "Define and enforce protection policies.",
			},
			{
				id: "threat-detection",
				label: "Threat Detection",
				description: "Identify suspicious activities and threats.",
			},
		],
	},
]);

export function getProductMenuFamily(id: string | undefined) {
	return productMenuFamilies.find((family) => family.id === id);
}

export function getProductMenuCapability(
	familyId: string | undefined,
	capabilityId: string | undefined,
) {
	return getProductMenuFamily(familyId)?.capabilities.find(
		(capability) => capability.id === capabilityId,
	);
}

function astronFamilyHref(familyId: string) {
	const family = getProductMenuFamily(familyId);
	if (!family) throw new Error(`Unknown Astron Collection family: ${familyId}`);
	return family.href;
}

function astronLink(familyId: string, capabilityId: string): NavLink {
	const capability = getProductMenuCapability(familyId, capabilityId);
	if (!capability) {
		throw new Error(
			`Unknown Astron Collection capability: ${familyId}/${capabilityId}`,
		);
	}
	return {
		href: capability.href,
		label: capability.label,
		description: capability.description,
	};
}

/**
 * The six primary entries, in the fixed institutional order. Pricing is a
 * direct page link after the Astron Collection project entry.
 */
export const mainNav: NavSection[] = [
	{
		id: "products",
		label: "Products",
		href: CATALOGUE_HREF,
		description:
			"The SGE product ecosystem, organised in six official categories.",
		columns: [],
		categories: productCategories,
		families: productMenuFamilies,
		footerLinks: [
			{
				href: CATALOGUE_HREF,
				label: "Explore all products",
				description: "The complete catalogue by product family",
			},
			{
				href: "/pricing",
				label: "Pricing",
				description: "Billing models and publication state",
			},
			{
				href: "/contact-sales",
				label: "Contact sales",
				description: "Scoped capacity and commercial terms",
			},
		],
	},
	{
		id: "solutions",
		label: "Solutions",
		href: "/solutions",
		description:
			"Use-case paths built from the Astron Collection product families.",
		columns: [
			{
				title: "Community operations",
				href: astronFamilyHref("guild"),
				links: [
					astronLink("guild", "members"),
					astronLink("guild", "roles"),
					astronLink("guild", "welcome"),
					astronLink("guild", "moderation"),
				],
			},
			{
				title: "Server automation",
				href: astronFamilyHref("automations"),
				links: [
					astronLink("automations", "workflows"),
					astronLink("automations", "triggers"),
					astronLink("automations", "actions"),
					astronLink("automations", "schedules"),
				],
			},
			{
				title: "Trust and moderation",
				href: astronFamilyHref("protect"),
				links: [
					astronLink("protect", "anti-spam"),
					astronLink("protect", "anti-raid"),
					astronLink("protect", "verification"),
					astronLink("protect", "security-rules"),
				],
			},
			{
				title: "Activity and insight",
				href: astronFamilyHref("logger"),
				links: [
					astronLink("logger", "audit-logs"),
					astronLink("logger", "event-logs"),
					astronLink("logger", "message-logs"),
					astronLink("logger", "log-management"),
				],
			},
		],
		footerLinks: [
			{ href: "/solutions", label: "All solutions" },
			{ href: "/products", label: "Browse the catalogue" },
		],
	},
	{
		id: "developers",
		label: "Developers",
		description:
			"Integration surfaces exposed by the Astron Collection products.",
		columns: [
			{
				title: "Commands and applications",
				href: astronFamilyHref("astron"),
				links: [
					astronLink("astron", "commands"),
					astronLink("astron", "applications"),
					astronLink("astron", "integrations"),
					astronLink("astron", "extensions"),
				],
			},
			{
				title: "Workflow engine",
				href: astronFamilyHref("automations"),
				links: [
					astronLink("automations", "workflows"),
					astronLink("automations", "triggers"),
					astronLink("automations", "actions"),
					astronLink("automations", "executions"),
				],
			},
			{
				title: "Events and audit",
				href: astronFamilyHref("logger"),
				links: [
					astronLink("logger", "audit-logs"),
					astronLink("logger", "event-logs"),
					astronLink("logger", "member-logs"),
					astronLink("logger", "moderation-logs"),
				],
			},
			{
				title: "Voice and media",
				href: astronFamilyHref("player"),
				links: [
					astronLink("player", "playback"),
					astronLink("player", "playlists"),
					astronLink("player", "audio-sources"),
					astronLink("player", "voice-sessions"),
				],
			},
		],
		footerLinks: [
			{ href: "/resources", label: "Developer resources" },
			{ href: links.githubOrg, label: "GitHub", external: true },
		],
	},
	{
		id: "resources",
		label: "Resources",
		href: "/resources",
		description: "Learning paths for the Astron Collection product families.",
		columns: [
			{
				title: "Getting started with Astron",
				href: astronFamilyHref("astron"),
				links: [
					astronLink("astron", "commands"),
					astronLink("astron", "applications"),
					astronLink("astron", "configuration"),
					astronLink("astron", "permissions"),
				],
			},
			{
				title: "Automation patterns",
				href: astronFamilyHref("automations"),
				links: [
					astronLink("automations", "workflows"),
					astronLink("automations", "triggers"),
					astronLink("automations", "actions"),
					astronLink("automations", "templates"),
				],
			},
			{
				title: "Community playbooks",
				href: astronFamilyHref("guild"),
				links: [
					astronLink("guild", "members"),
					astronLink("guild", "roles"),
					astronLink("guild", "welcome"),
					astronLink("guild", "engagement"),
				],
			},
			{
				title: "Safety playbooks",
				href: astronFamilyHref("protect"),
				links: [
					astronLink("protect", "anti-spam"),
					astronLink("protect", "anti-raid"),
					astronLink("protect", "verification"),
					astronLink("protect", "threat-detection"),
				],
			},
		],
		footerLinks: [
			{ href: "/resources", label: "All resources" },
			{ href: links.status, label: "Service status", external: true },
		],
	},
	{
		id: "company",
		label: "Astron Collection",
		href: "/company",
		description:
			"The open-source Astron Collection project: source, governance, releases and support.",
		columns: [
			{
				title: "Project",
				href: "/company/about",
				links: [
					{
						href: "/company/about",
						label: "Overview",
						description: "The project and the team behind it",
					},
					{
						href: links.github,
						label: "Repository",
						description: "Code, history and repository activity",
						external: true,
					},
					{
						href: links.docs.home,
						label: "Documentation",
						description: "Product and operator guides",
						external: true,
					},
					{
						href: links.status,
						label: "Status",
						description: "Current operational state",
						external: true,
					},
				],
			},
			{
				title: "Source",
				links: [
					{
						href: links.githubOrg,
						label: "Organisation",
						description: "All Sky Genesis Enterprise repositories",
						external: true,
					},
					{
						href: links.github,
						label: "Source code",
						description: "The main project repository",
						external: true,
					},
					{
						href: `${links.github}/issues`,
						label: "Issues",
						description: "Bugs and feature requests",
						external: true,
					},
					{
						href: `${links.github}/pulls`,
						label: "Pull requests",
						description: "Open and merged changes",
						external: true,
					},
				],
			},
			{
				title: "Community",
				links: [
					{
						href: `${links.github}/discussions`,
						label: "Discussions",
						description: "Questions and design conversation",
						external: true,
					},
					{
						href: `${links.github}/graphs/contributors`,
						label: "Contributors",
						description: "People who build the project",
						external: true,
					},
					{
						href: `${links.github}/blob/master/CODE_OF_CONDUCT.md`,
						label: "Code of conduct",
						description: "Rules for participation",
						external: true,
					},
					{
						href: `${links.github}/blob/master/Governance.md`,
						label: "Governance",
						description: "How decisions are made",
						external: true,
					},
				],
			},
			{
				title: "Releases and support",
				links: [
					{
						href: `${links.github}/releases`,
						label: "Releases",
						description: "Published versions and notes",
						external: true,
					},
					{
						href: `${links.github}/blob/master/SECURITY.md`,
						label: "Security policy",
						description: "How to report vulnerabilities",
						external: true,
					},
					{
						href: links.docs.support,
						label: "Documentation support",
						description: "Guides for getting help",
						external: true,
					},
					{
						href: "/resources/support",
						label: "Support routes",
						description: "Internal support destinations",
					},
				],
			},
		],
		footerLinks: [
			{ href: links.github, label: "Project repository", external: true },
			{ href: `${links.github}/releases`, label: "Releases", external: true },
		],
	},
	{
		id: "pricing",
		label: "Pricing",
		href: "/pricing",
		description: "Plans and billing models for the Astron Collection.",
		columns: [],
		footerLinks: [],
	},
];

/** Utility destinations kept beside the primary entries. */
export const utilityNav: NavLink[] = [
	{ href: links.docs.home, label: "Docs", external: true },
	{ href: links.status, label: "Status", external: true },
	{ href: "/resources/support", label: "Support" },
];
