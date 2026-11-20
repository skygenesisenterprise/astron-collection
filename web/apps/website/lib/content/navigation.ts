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

import {
	productCategories,
	type NavCategory,
} from "./ecosystem";
import { links } from "./site";

export { productCategories } from "./ecosystem";
export type {
	NavCategory,
	NavMaturity,
	NavProduct,
	NavProductKind,
	ProductCategoryId,
} from "./ecosystem";

export type NavSectionId =
	| "products"
	| "solutions"
	| "developers"
	| "resources"
	| "company";

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
}

const CATALOGUE_HREF = "/products";
const DEVELOPER_PLATFORM_HREF = "/products/developer-platform";

/**
 * The five primary entries, in the fixed institutional order. Pricing is
 * deliberately absent: it remains reachable from the product catalogue and
 * the footer, where it is contextually meaningful.
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
			"Use-case paths that combine products around an organisation's problem.",
		columns: [
			{
				title: "Infrastructure and operations",
				links: [
					{
						href: "/solutions/enterprise",
						label: "Enterprise infrastructure",
						description: "Dedicated estates with a written operating scope",
					},
					{
						href: "/solutions/hosting-providers",
						label: "Hosting providers",
						description: "Capacity and primitives for a platform",
					},
					{
						href: "/solutions/ai-research",
						label: "AI and research",
						description: "Accelerators, storage and repeatable environments",
					},
				],
			},
			{
				title: "Build and run",
				links: [
					{
						href: "/solutions/developers",
						label: "Developer infrastructure",
						description: "Provisioning, delivery and operations for engineering teams",
					},
					{
						href: "/solutions/startups",
						label: "Startups",
						description: "Start with one product and keep the exit ramp",
					},
				],
			},
			{
				title: "Business and organisation",
				links: [
					{
						href: "/solutions/small-business",
						label: "Small business",
						description: "Websites, mail and the infrastructure behind them",
					},
					{
						href: "/contact-sales",
						label: "Discuss a requirement",
						description: "Describe the workload, region and constraints",
					},
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
			"Documentation, publishing surfaces and the open-source projects behind the platforms.",
		columns: [
			{
				title: "Documentation",
				links: [
					{
						href: "/resources/documentation",
						label: "Documentation",
						description: "Product guides and installation notes",
					},
					{
						href: "/resources/api",
						label: "API reference",
						description: "The public HTTP API",
					},
					{
						href: "/resources/tutorials",
						label: "Tutorials",
						description: "End-to-end walkthroughs",
					},
					{
						href: "/infrastructure/architecture",
						label: "Architecture guides",
						description: "Resource model and building blocks",
					},
				],
			},
			{
				title: "Developer platforms",
				href: DEVELOPER_PLATFORM_HREF,
				links: [
					{
						href: DEVELOPER_PLATFORM_HREF,
						label: "Giteria",
						description: "Git hosting and code collaboration",
					},
					{
						href: DEVELOPER_PLATFORM_HREF,
						label: "EDL",
						description: "Engineering and developer tooling",
					},
					{
						href: DEVELOPER_PLATFORM_HREF,
						label: "React SDS",
						description: "Design-system components",
					},
					{
						href: DEVELOPER_PLATFORM_HREF,
						label: "React Zicons",
						description: "Icon set",
					},
					{
						href: DEVELOPER_PLATFORM_HREF,
						label: "React Desktop",
						description: "Desktop-style interface components",
					},
					{
						href: DEVELOPER_PLATFORM_HREF,
						label: "Enterprise Action",
						description: "Enterprise pipeline automation",
					},
				],
			},
			{
				title: "Community and open source",
				links: [
					{
						href: links.githubOrg,
						label: "GitHub organisation",
						description: "All Sky Genesis Enterprise repositories",
						external: true,
					},
					{
						href: links.github,
						label: "Source code",
						description: "This website's repository",
						external: true,
					},
					{
						href: "/resources/support",
						label: "Support routes",
						description: "Documentation, status and contact",
					},
					{
						href: links.status,
						label: "Service status",
						description: "Operational state",
						external: true,
					},
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
		description:
			"Institutional information, technical knowledge and communication.",
		columns: [
			{
				title: "Knowledge",
				links: [
					{
						href: "/resources/documentation",
						label: "Documentation",
						description: "Guides maintained with the platform",
					},
					{
						href: "/resources/api",
						label: "API reference",
						description: "Endpoints, authentication and errors",
					},
					{
						href: "/resources/tutorials",
						label: "Tutorials",
						description: "Walkthroughs with prerequisites",
					},
					{
						href: "/infrastructure/architecture",
						label: "Architecture resources",
						description: "How the primitives fit together",
					},
				],
			},
			{
				title: "News and media",
				links: [
					{
						href: links.blog,
						label: "Blog",
						description: "Engineering notes and product changes",
						external: true,
					},
					{
						href: "/company/newsroom",
						label: "Newsroom",
						description: "Announcements and press enquiries",
					},
				],
			},
			{
				title: "Support",
				links: [
					{
						href: "/resources/support",
						label: "Support",
						description: "How to get help, and what each route covers",
					},
					{
						href: links.status,
						label: "Service status",
						description: "Live operational state",
						external: true,
					},
					{
						href: "/company/contact",
						label: "Contact",
						description: "Sales, partnership and security routes",
					},
				],
			},
			{
				title: "Infrastructure",
				links: [
					{
						href: "/infrastructure",
						label: "Infrastructure overview",
						description: "Owned and partner capacity, stated plainly",
					},
					{
						href: "/infrastructure/locations",
						label: "Locations",
						description: "Regions and their verification state",
					},
					{
						href: "/infrastructure/data-centers",
						label: "Data centres",
						description: "Owned facilities and partner facilities",
					},
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
		label: "Company",
		href: "/company",
		description:
			"Sky Genesis Enterprise as an organisation: structure, partners and responsibility.",
		columns: [
			{
				title: "About SGE",
				links: [
					{
						href: "/company/about",
						label: "About us",
						description: "Who we are and what we build",
					},
					{
						href: "/company/careers",
						label: "Careers",
						description: "Roles, published when they are open",
					},
					{
						href: "/company/newsroom",
						label: "Newsroom",
						description: "Company and product announcements",
					},
					{
						href: "/company/contact",
						label: "Contact",
						description: "Choose the route that matches your request",
					},
				],
			},
			{
				title: "Partners and ecosystem",
				links: [
					{
						href: "/company/partners",
						label: "Our partners",
						description: "Infrastructure suppliers and service partners",
					},
					{
						href: "/infrastructure/partners",
						label: "Infrastructure partners",
						description: "The provider of record per product",
					},
					{
						href: links.githubOrg,
						label: "Open source ecosystem",
						description: "Repositories and contribution routes",
						external: true,
					},
					{
						href: links.skyGenesis,
						label: "Sky Genesis Enterprise",
						description: "The organisation behind the brand",
						external: true,
					},
				],
			},
			{
				title: "Trust and responsibility",
				links: [
					{
						href: "/legal/privacy",
						label: "Privacy",
						description: "How personal data is handled",
					},
					{
						href: "/legal/terms",
						label: "Terms of service",
						description: "The terms governing use",
					},
					{
						href: "/legal/acceptable-use",
						label: "Acceptable use",
						description: "What may not run on the platform",
					},
					{
						href: "/legal/cookies",
						label: "Cookies",
						description: "What the website stores",
					},
				],
			},
			{
				title: "Infrastructure",
				links: [
					{
						href: "/infrastructure",
						label: "Infrastructure overview",
						description: "The hybrid operating model",
					},
					{
						href: "/infrastructure/architecture",
						label: "Architecture",
						description: "Technical building blocks",
					},
					{
						href: "/infrastructure/locations",
						label: "Locations",
						description: "Regions, verification state",
					},
					{
						href: "/infrastructure/global-network",
						label: "Global network",
						description: "Connectivity, published and unpublished",
					},
				],
			},
		],
		footerLinks: [
			{ href: "/company", label: "Company overview" },
			{ href: "/contact-sales", label: "Contact sales" },
		],
	},
];

/** Utility destinations kept beside the primary entries. */
export const utilityNav: NavLink[] = [
	{ href: links.docs.home, label: "Docs", external: true },
	{ href: links.status, label: "Status", external: true },
	{ href: "/resources/support", label: "Support" },
];
