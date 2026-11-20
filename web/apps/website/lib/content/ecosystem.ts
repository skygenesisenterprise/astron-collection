/**
 * The Sky Genesis Enterprise ecosystem and the homepage editorial content.
 *
 * This module is the single source of truth for the six technology categories
 * and their projects. It is also imported by the global navigation, so a
 * project is described once and never re-declared per surface.
 *
 * Integrity rules:
 * - `maturity` is only present when the state is verified. No project entry
 *   declares one today, so no maturity badge is rendered.
 * - `href` on a project is only present when a published page exists. The
 *   homepage and the navigation fall back to the category overview.
 * - No partnership, customer, certification or revenue claim is stored here.
 */

import { links } from "./site";

export type NavMaturity =
	| "available"
	| "preview"
	| "active-development"
	| "research";

export type NavProductKind = "product" | "component" | "integration";

export interface NavProduct {
	name: string;
	/** Positioning line, not a capability or availability claim. */
	description: string;
	/** Existing destination. Omitted when no public page is published. */
	href?: string;
	external?: boolean;
	kind?: NavProductKind;
	maturity?: NavMaturity;
	/** Brand family, when the project belongs to a transversal one. */
	family?: string;
}

export type ProductCategoryId =
	| "cloud-infrastructure"
	| "developer-platform"
	| "security-identity"
	| "business-productivity"
	| "communication-experiences"
	| "financial-platforms";

export interface NavCategory {
	id: ProductCategoryId;
	number: string;
	name: string;
	description: string;
	/** Technological scope, displayed as a compact list. */
	scope: string[];
	/** Existing overview page: a family overview or the product catalogue. */
	href: string;
	products: NavProduct[];
}

const CATALOGUE_HREF = "/products";
const DEVELOPER_PLATFORM_HREF = "/products/developer-platform";

/**
 * The six official technology domains. They are institutional
 * classifications, never derived from repository names.
 */
export const productCategories: NavCategory[] = [
	{
		id: "cloud-infrastructure",
		number: "01",
		name: "Cloud & Infrastructure",
		description:
			"Cloud infrastructure, hosting, deployment, compute, networking and infrastructure management.",
		scope: ["Cloud", "Hosting", "Networking", "Virtualisation", "Containers"],
		href: "/products/compute-infrastructure",
		products: [
			{
				name: "ZenthCloud",
				description: "Cloud infrastructure platform",
				family: "Zenth",
			},
			{
				name: "Notploy",
				description: "Application deployment and hosting platform",
			},
			{
				name: "Nocker",
				description: "Container build and runtime tooling",
			},
			{
				name: "OblivionOS",
				description: "Infrastructure operating-system project",
			},
		],
	},
	{
		id: "developer-platform",
		number: "02",
		name: "Developer & Platform",
		description:
			"Developer tools, software libraries, SDKs, frameworks, APIs and development platforms.",
		scope: ["SDKs", "Libraries", "Frameworks", "APIs", "Tooling"],
		href: DEVELOPER_PLATFORM_HREF,
		products: [
			{ name: "Giteria", description: "Git hosting and code collaboration" },
			{ name: "EDL", description: "Engineering and developer tooling" },
			{
				name: "React SDS",
				description: "React design-system components",
				kind: "component",
			},
			{
				name: "React Zicons",
				description: "React icon set",
				kind: "component",
			},
			{
				name: "React Desktop",
				description: "React components for desktop-style interfaces",
				kind: "component",
			},
			{
				name: "Enterprise Action",
				description: "Automation for enterprise delivery pipelines",
				kind: "integration",
			},
		],
	},
	{
		id: "security-identity",
		number: "03",
		name: "Security & Identity",
		description:
			"Identity management, authentication, access control, secrets management and security technologies.",
		scope: ["Identity", "Access control", "Secrets", "Security"],
		href: "/products/security-identity",
		products: [
			{
				name: "Aether Identity",
				description: "Identity and access management",
				family: "Aether",
			},
			{
				name: "Aether Vault",
				description: "Secrets and credential storage",
				family: "Aether",
			},
			{
				name: "Aether VPN",
				description: "Private network access",
				family: "Aether",
			},
		],
	},
	{
		id: "business-productivity",
		number: "04",
		name: "Business & Productivity",
		description:
			"Business applications, productivity software, collaboration and workplace technologies.",
		scope: ["Documents", "Collaboration", "Communication", "Workplace"],
		href: CATALOGUE_HREF,
		products: [
			{
				name: "Aether Mail",
				description: "Email and workplace communication",
				family: "Aether",
			},
			{
				name: "Aether Drive",
				description: "Document and file storage",
				family: "Aether",
			},
			{
				name: "Aether Calendar",
				description: "Scheduling and shared calendars",
				family: "Aether",
			},
			{
				name: "Aether Sheet",
				description: "Spreadsheets and structured data",
				family: "Aether",
			},
			{
				name: "Aether Forms",
				description: "Forms and data collection",
				family: "Aether",
			},
			{ name: "Aether Meet", description: "Video meetings", family: "Aether" },
			{
				name: "Aether Vids",
				description: "Video hosting and playback",
				family: "Aether",
			},
		],
	},
	{
		id: "communication-experiences",
		number: "05",
		name: "Communication & Digital Experiences",
		description:
			"Digital communities, communication platforms, media services and online experiences.",
		scope: ["Communities", "Media", "Editorial", "Digital experiences"],
		href: CATALOGUE_HREF,
		products: [
			{ name: "Guilderia", description: "Community platform" },
			{
				name: "Astron Collection",
				description: "Digital collection and media experiences",
			},
			{ name: "Kami-Sama", description: "Interactive community platform" },
			{
				name: "The Etheria Times",
				description: "Editorial and news publication",
			},
		],
	},
	{
		id: "financial-platforms",
		number: "06",
		name: "Financial & Specialized Platforms",
		description:
			"Financial infrastructure initiatives and specialised technological platforms.",
		scope: ["Financial technology", "Specialised platforms"],
		href: CATALOGUE_HREF,
		products: [
			{ name: "VaelixBank", description: "Financial services platform" },
		],
	},
];

export type CataloguedProject = {
	product: NavProduct;
	category: NavCategory;
};

/**
 * Curated homepage selection. Lookup goes through the categories above, so a
 * featured project always carries its real category and description.
 */
export const featuredProjectNames = [
	"Notploy",
	"ZenthCloud",
	"Aether Identity",
	"Aether Mail",
	"Giteria",
	"VaelixBank",
] as const;

export function getFeaturedProjects(): CataloguedProject[] {
	return featuredProjectNames.flatMap((name) => {
		for (const category of productCategories) {
			const product = category.products.find((entry) => entry.name === name);
			if (product) return [{ product, category }];
		}
		return [];
	});
}

export function getCategoryById(
	id: ProductCategoryId,
): NavCategory | undefined {
	return productCategories.find((category) => category.id === id);
}

/* -------------------------------------------------------------------------- */
/* 01 — Introducing Sky Genesis Enterprise                                    */
/* -------------------------------------------------------------------------- */

export const introduction = {
	eyebrow: "Sky Genesis Enterprise",
	title: "An independent technology group.",
	paragraphs: [
		"Sky Genesis Enterprise is a technology group. We develop software, platforms and infrastructure, and we operate them where that is useful to the organisations and people who depend on them.",
		"Our work spans cloud infrastructure, developer tooling, identity and security, productivity software, digital communities and specialised financial platforms. These are independent projects, not labels applied to a single product.",
		"We build in the open where we can. We prefer documented interfaces, self-hosting and interoperable standards over lock-in, and we publish the state of a project rather than implying a maturity it has not reached.",
	],
	principles: [
		{
			title: "Software freedom",
			description:
				"Source availability and the ability to run software on your own terms, wherever the project allows it.",
		},
		{
			title: "Infrastructure independence",
			description:
				"Avoiding unnecessary dependence on a single provider, platform or commercial relationship.",
		},
		{
			title: "Interoperability",
			description:
				"Documented interfaces and open formats over proprietary coupling.",
		},
		{
			title: "Responsible engineering",
			description:
				"Security and clarity treated as part of the product, not as marketing claims.",
		},
		{
			title: "Long-term sustainability",
			description:
				"Projects designed to be maintained, documented and handed over.",
		},
	],
	links: [
		{ href: "/company/about", label: "About Sky Genesis Enterprise" },
		{ href: "/products", label: "Explore the ecosystem" },
	],
} as const;

/* -------------------------------------------------------------------------- */
/* 02 — Technology domains                                                    */
/* -------------------------------------------------------------------------- */

export const domainsSection = {
	eyebrow: "Technology domains",
	title: "Six domains. One group.",
	description:
		"The group operates across complementary domains. Each category is an institutional classification with its own projects; a project belongs to the domain that describes its actual purpose, not to a single brand.",
	note: "A public repository does not by itself imply a finished or commercially available product. Availability and maturity are stated only where they are verified.",
} as const;

/* -------------------------------------------------------------------------- */
/* 03 — The ecosystem                                                         */
/* -------------------------------------------------------------------------- */

export const ecosystemSection = {
	eyebrow: "Our ecosystem",
	title: "Independent initiatives, shared foundations.",
	description:
		"The ecosystem is a set of independent projects, each published with its own scope and state. What they share is a way of working: deployment choices are documented, interfaces are explicit, and no project is presented as more mature than its published state.",
	note: "A family is a shared identity across domains, not a merged product. Aether covers identity, security and productivity; Zenth anchors cloud and infrastructure. Listing two projects together does not imply a shipped integration between them.",
} as const;

export interface EcosystemFamily {
	name: string;
	categories: { id: ProductCategoryId; name: string; href: string }[];
	projects: string[];
}

/** Families are derived from the category records, never declared twice. */
export function getFamilies(): EcosystemFamily[] {
	const families = new Map<string, EcosystemFamily>();
	for (const category of productCategories) {
		for (const product of category.products) {
			if (!product.family) continue;
			const family = families.get(product.family) ?? {
				name: product.family,
				categories: [],
				projects: [],
			};
			if (!family.categories.some((entry) => entry.id === category.id)) {
				family.categories.push({
					id: category.id,
					name: category.name,
					href: category.href,
				});
			}
			family.projects.push(product.name);
			families.set(product.family, family);
		}
	}
	return [...families.values()];
}

/* -------------------------------------------------------------------------- */
/* 04 — Featured projects                                                     */
/* -------------------------------------------------------------------------- */

export const productsSection = {
	eyebrow: "Featured projects",
	title: "Selected projects from across the group.",
	description:
		"A curated selection rather than the complete catalogue. Each project is shown with the domain it belongs to, its published state and the destination that currently exists for it.",
	note: "Maturity is only displayed where it can be verified. No project on this page is presented as commercially available; every entry links to the page that documents it today.",
} as const;

/** Rendered in place of a maturity badge while no project declares a verified
 * state. Keeping the wording here avoids per-component availability claims. */
export const projectState = {
	unverified: "State not verified",
	kind: {
		product: "Project",
		component: "Component",
		integration: "Integration",
	},
} as const;

/* -------------------------------------------------------------------------- */
/* 04 — Solutions and technologies                                            */
/* -------------------------------------------------------------------------- */

export type SolutionPattern = {
	id: string;
	title: string;
	description: string;
	productNames: string[];
	href: string;
	/** How the projects relate in this pattern. */
	relationship: "Conceptual combination" | "Documented solution path";
};

export const solutionsSection = {
	eyebrow: "Solutions and technologies",
	title: "How the projects can work together.",
	description:
		"A solution is a combination of projects addressing a specific need. The patterns below describe which projects apply; they do not imply a shipped integration between them.",
	note: "Integration between two projects is only stated where it is documented. Otherwise the pattern is a conceptual combination that an engagement may scope.",
} as const;

export const solutionPatterns: SolutionPattern[] = [
	{
		id: "infrastructure-management",
		title: "Infrastructure management",
		description:
			"Cloud capacity, container tooling and an infrastructure operating system, for teams that run their own workloads.",
		productNames: ["ZenthCloud", "Nocker", "OblivionOS"],
		href: "/solutions/enterprise",
		relationship: "Documented solution path",
	},
	{
		id: "application-deployment",
		title: "Application deployment",
		description:
			"A deployment platform paired with source hosting, for teams that ship from a repository.",
		productNames: ["Notploy", "Giteria"],
		href: "/solutions/developers",
		relationship: "Documented solution path",
	},
	{
		id: "identity-access",
		title: "Identity and secure access",
		description:
			"Identity, secrets and private connectivity as separate projects that an access model can combine.",
		productNames: ["Aether Identity", "Aether Vault", "Aether VPN"],
		href: "/products/security-identity",
		relationship: "Conceptual combination",
	},
	{
		id: "productivity",
		title: "Business productivity",
		description:
			"Mail, documents, scheduling and collaboration applications within one workplace family.",
		productNames: ["Aether Mail", "Aether Drive", "Aether Calendar"],
		href: "/products",
		relationship: "Conceptual combination",
	},
	{
		id: "digital-communication",
		title: "Digital communication",
		description:
			"Community, editorial and interactive platforms for organisations that publish and host conversations.",
		productNames: ["Guilderia", "The Etheria Times", "Kami-Sama"],
		href: "/products",
		relationship: "Conceptual combination",
	},
	{
		id: "financial-platforms",
		title: "Specialised financial platforms",
		description:
			"Financial infrastructure as its own activity, separate from the general cloud and productivity catalogue.",
		productNames: ["VaelixBank"],
		href: "/products",
		relationship: "Conceptual combination",
	},
];

/* -------------------------------------------------------------------------- */
/* 05 — Infrastructure and independence                                       */
/* -------------------------------------------------------------------------- */

export const independenceSection = {
	eyebrow: "Infrastructure and independence",
	title: "Control over where software runs.",
	description:
		"Technological autonomy is a design constraint, not a slogan. It means a deployment can stay under the control of the organisation that depends on it, and that the boundary between our operations and a customer's infrastructure is explicit.",
	points: [
		"Self-hosting is treated as a first-class way to run software, not as a downgraded edition.",
		"Interoperability is preferred over proprietary coupling, so a project can be replaced or moved.",
		"Operated services are described as operated services; nothing is presented as self-hosted when it is not.",
	],
	note: "Deployment support is documented per product. No project on this page is presented as supporting every deployment model.",
} as const;

export const deploymentModels = [
	{
		name: "Self-hosted",
		description:
			"Software operated on infrastructure the organisation controls, with its own accounts and data.",
	},
	{
		name: "Hybrid",
		description:
			"A local deployment combined with centrally operated services, with the boundary stated in the contract.",
	},
	{
		name: "Cloud-operated",
		description:
			"Services operated for the organisation by Sky Genesis Enterprise or a named infrastructure partner.",
	},
] as const;

/** Homepage section 04 — "Why choose" comparison, in the shape of a decision:
 * the closed-cloud alternative on the left, the group's design constraints on
 * the right. The right-hand points are the independence and sustainability
 * principles already published elsewhere on the site; only the framing is new. */
export const whySection = {
	eyebrow: "Why choose Sky Genesis Enterprise",
	title: "Independence is the design constraint.",
	description:
		"There are two ways to build a digital estate. The first rents capability and accepts the coupling that comes with it; the second is how the group designs, publishes and operates its projects.",
	before: {
		title: "Fighting infrastructure with “cloud”.",
		points: [
			"Proprietary coupling makes every project harder to replace, move or retire.",
			"A single provider relationship becomes a single point of dependency.",
			"Marketing language blurs what is operated for you and what you actually run.",
			"Tools are rented faster than they can be evaluated or exited.",
			"Security is sold as an add-on rather than designed into the product.",
		],
	},
	after: {
		title: "Shipping with Sky Genesis Enterprise.",
		points: [
			...independenceSection.points,
			"Security and clarity are treated as part of the product, not as marketing claims.",
			"Projects are designed to be maintained, documented and handed over.",
		],
	},
} as const;

/* -------------------------------------------------------------------------- */
/* 06 — Engineering principles                                               */
/* -------------------------------------------------------------------------- */

export const engineeringSection = {
	eyebrow: "Engineering principles",
	title: "Independence, openness, interoperability.",
	description:
		"The group's engineering constraints are published so they can be checked against the projects. They describe how software is designed and operated here; they are not a certification, an audit result or a service commitment.",
	note: independenceSection.note,
	countLabel: "published constraints",
} as const;

/* -------------------------------------------------------------------------- */
/* 07 — Open source and developers                                            */
/* -------------------------------------------------------------------------- */

export const openSourceSection = {
	eyebrow: "Open source and developers",
	title: "Libraries, tools and platforms in the open.",
	description:
		"The developer surface is made of distinct things: official libraries, developer tools and platforms. They are published and supported differently, and the page keeps that distinction visible.",
	note: "A public repository is not a support contract. Documentation, issues and releases describe what each project currently provides.",
} as const;

export type OpenSourceGroup = {
	id: string;
	title: string;
	description: string;
	items: { name: string; detail: string; packageName?: string }[];
};

export const openSourceGroups: OpenSourceGroup[] = [
	{
		id: "libraries",
		title: "Official libraries",
		description: "React packages maintained for use across SGE projects.",
		items: [
			{
				name: "React SDS",
				detail: "Design-system components for React applications",
				packageName: "@skygenesisenterprise/react-sds",
			},
			{
				name: "React Zicons",
				detail: "Icon set for React interfaces",
				packageName: "@skygenesisenterprise/react-zicons",
			},
		],
	},
	{
		id: "tools",
		title: "Developer tools",
		description: "Tooling for building and delivering software.",
		items: [
			{ name: "EDL", detail: "Engineering and developer tooling" },
			{
				name: "React Desktop",
				detail: "React components for desktop-style interfaces",
			},
			{
				name: "Enterprise Action",
				detail: "Automation for enterprise delivery pipelines",
			},
		],
	},
	{
		id: "platforms",
		title: "Platforms",
		description: "Hosted or self-hostable platforms with their own lifecycle.",
		items: [{ name: "Giteria", detail: "Git hosting and code collaboration" }],
	},
];

export const developerDestinations = [
	{
		label: "GitHub organisation",
		href: links.githubOrg,
		description: "Repositories, issues and contribution history",
		external: true,
	},
	{
		label: "Documentation",
		href: "/resources/documentation",
		description: "Guides maintained with the platform",
		external: false,
	},
	{
		label: "API reference",
		href: "/resources/api",
		description: "Endpoints, authentication and errors",
		external: false,
	},
	{
		label: "Tutorials",
		href: "/resources/tutorials",
		description: "End-to-end walkthroughs",
		external: false,
	},
] as const;

/* -------------------------------------------------------------------------- */
/* 07 — Partnerships and collaboration                                        */
/* -------------------------------------------------------------------------- */

export const partnershipsSection = {
	eyebrow: "Partnerships and collaboration",
	title: "Relationships, stated by their actual nature.",
	description:
		"A partner, an infrastructure provider, an institutional relationship and an expressed interest are not the same thing. Each is published with the label that describes it, and none is published before it is confirmed.",
	emptyState:
		"No partner relationship is currently published on this page. Infrastructure providers are named per product and region in the catalogue; that disclosure is not a group partnership.",
	relationshipTypes: [
		{
			title: "Official partners",
			description: "A confirmed commercial or strategic partnership.",
			state: "None published",
		},
		{
			title: "Technology partners",
			description: "A documented technical integration with a named product.",
			state: "None published",
		},
		{
			title: "Infrastructure partners",
			description:
				"A provider whose capacity is used and disclosed per product.",
			state: "Named per product",
		},
		{
			title: "Institutional relationships",
			description: "A membership, affiliation or formal cooperation.",
			state: "None published",
		},
		{
			title: "Research collaborations",
			description: "A joint research activity with a stated scope.",
			state: "None published",
		},
		{
			title: "Community and ecosystem",
			description:
				"An open-source or community relationship, without commercial status.",
			state: "Contribution route open",
		},
	],
	stateLegend:
		"Published state only. A relationship is listed once it is confirmed and named; an expressed interest is never shown as a partnership.",
	links: [
		{ href: "/company/partners", label: "Partnership routes" },
		{ href: "/infrastructure/partners", label: "Infrastructure providers" },
	],
} as const;

/* -------------------------------------------------------------------------- */
/* 08 — Research and innovation                                               */
/* -------------------------------------------------------------------------- */

export const researchSection = {
	eyebrow: "Research and innovation",
	title: "Long-term work, separated from finished products.",
	description:
		"The group works on infrastructure, security and developer technology. Research themes are listed as themes: they are not presented as completed products, published papers or commercial capabilities.",
	note: "No research output is currently published on this page. When a project has a verifiable state, it is described with that state.",
} as const;

export const researchAreas = [
	{
		title: "Infrastructure technologies",
		description: "Operating models for compute, storage and deployment.",
	},
	{
		title: "Distributed systems",
		description: "Coordination, reliability and data placement across nodes.",
	},
	{
		title: "Identity and security",
		description:
			"Access models, credentials and protection of digital estates.",
	},
	{
		title: "Developer tooling",
		description:
			"Interfaces, automation and the ergonomics of building software.",
	},
	{
		title: "Artificial intelligence",
		description:
			"Applied work around models, agents and supporting infrastructure.",
	},
	{
		title: "Open-source technology",
		description: "Components and standards intended for wider reuse.",
	},
] as const;

/* -------------------------------------------------------------------------- */
/* 09 — News and insights                                                     */
/* -------------------------------------------------------------------------- */

export const newsSection = {
	eyebrow: "News and insights",
	title: "Where the group publishes.",
	description:
		"Company and product communication is published through the newsroom, the blog and the repositories. This page does not generate announcements to fill a layout.",
	emptyState:
		"No announcement is published here yet. When there is something to announce, it will appear in the newsroom and in the repository history first.",
} as const;

export const newsDestinations = [
	{
		label: "Newsroom",
		href: "/company/newsroom",
		description: "Company and product announcements",
		external: false,
	},
	{
		label: "Blog",
		href: links.blog,
		description: "Engineering notes and product changes",
		external: true,
	},
	{
		label: "GitHub organisation",
		href: links.githubOrg,
		description: "Repository activity and releases",
		external: true,
	},
	{
		label: "Contact",
		href: "/company/contact",
		description: "Press and institutional enquiries",
		external: false,
	},
] as const;

/* -------------------------------------------------------------------------- */
/* 10 — Final call to action                                                  */
/* -------------------------------------------------------------------------- */

export const homeCta = {
	eyebrow: "Work with us",
	title: "Explore, contribute or partner.",
	description:
		"Whether you are evaluating infrastructure, contributing to a project, or exploring a partnership, there is a route that matches the conversation.",
	primary: { href: "/products", label: "Explore the ecosystem" },
	secondary: { href: "/company/contact", label: "Work with us" },
	tertiary: {
		href: links.githubOrg,
		label: "GitHub",
		external: true,
	},
	note: "No product on this website is presented as commercially available without a verified state.",
} as const;

/* -------------------------------------------------------------------------- */
/* Homepage metadata                                                          */
/* -------------------------------------------------------------------------- */

export const homeSeo = {
	title: "Sky Genesis Enterprise — An independent technology group",
	description:
		"Sky Genesis Enterprise develops software, platforms and infrastructure across cloud and infrastructure, developer platforms, security and identity, business productivity, digital experiences and specialised platforms.",
} as const;
