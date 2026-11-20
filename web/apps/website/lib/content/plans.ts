/**
 * Pricing page content — the single source of truth for the commercial offer.
 *
 * Model:
 * - Astron Collection Cloud is the only mode sold as a platform subscription
 *   (Free, Pro, Enterprise).
 * - Self and Hybrid are deployment modes, never a fourth plan.
 * - A subscription pays for the platform. Infrastructure is metered separately.
 *
 * Price fields are deliberately structured for publication but left without
 * amounts: no commercial price has been approved. The card renderer displays
 * the amount as soon as `amountMinor` is set; nothing else has to change.
 */

import { links } from "./site";

export type PlanId = "free" | "pro" | "enterprise";

export type SubscriptionPrice = {
	/** `quote` is a commercial model, not a missing price. */
	state: "not_published" | "quote";
	/** Integer minor units (cents). Null until the price is approved. */
	amountMinor: number | null;
	currency: "EUR";
	interval: "month";
	note: string;
};

export type SubscriptionPlan = {
	id: PlanId;
	name: string;
	headline: string;
	audience: string;
	summary: string;
	price: SubscriptionPrice;
	featured: boolean;
	features: readonly string[];
	limitNote: string;
	cta: { label: string; href: string; external?: boolean };
};

export type ServiceFamily = {
	name: string;
	href: string;
	description: string;
};

export type ComparisonRow = {
	capability: string;
	free: string;
	pro: string;
	enterprise: string;
};

export type FaqEntry = { question: string; answer: string };

export const planSection = {
	eyebrow: "Cloud subscriptions",
	title: "Platform plans, not infrastructure.",
	description:
		"Three plans on Astron Collection Cloud. Each one opens the same six service families; what changes is the depth you can operate, the quotas you get and the support behind them.",
	note: "Subscription plans are platform plans. The 14 resource plans in the catalogue are consumption items, not subscriptions. Prices are not published yet: every plan is modelled and none is an offer.",
} as const;

const unpublished: SubscriptionPrice = {
	state: "not_published",
	amountMinor: null,
	currency: "EUR",
	interval: "month",
	note: "Monthly or annual billing · EUR, excluding VAT",
};

export const plans: readonly SubscriptionPlan[] = [
	{
		id: "free",
		name: "Free",
		headline: "Explore your infrastructure",
		audience: "Individuals, independent developers, students, small projects",
		summary:
			"Discover the platform and run a small infrastructure from a single workspace.",
		price: unpublished,
		featured: false,
		features: [
			"All six service families",
			"Core compute and container lifecycle",
			"Essential storage management",
			"Base networking and security controls",
			"Limited monitoring and history",
			"Essential API and developer tools",
		],
		limitNote:
			"One workspace, one owner, community documentation and support. Numeric quotas are published with the plan.",
		cta: { label: "Start for free", href: links.console, external: true },
	},
	{
		id: "pro",
		name: "Pro",
		headline: "Operate your infrastructure",
		audience:
			"Professional developers, freelancers, startups, small and mid-sized teams",
		summary:
			"Administer production infrastructure with higher quotas, automation and priority support.",
		price: unpublished,
		featured: true,
		features: [
			"Higher quotas across every family",
			"Advanced compute and container management",
			"Extended storage and database capabilities",
			"Advanced networking and security controls",
			"Extended monitoring, alerting and history",
			"Automation, members and permissions",
			"Advanced API and integrations",
		],
		limitNote:
			"Multiple workspaces, roles and permissions, priority support. Numeric quotas are published with the plan.",
		cta: { label: "Get started with Pro", href: links.console, external: true },
	},
	{
		id: "enterprise",
		name: "Enterprise",
		headline: "Govern your infrastructure",
		audience:
			"Enterprises, public administrations, organisations with governance requirements",
		summary:
			"Run critical infrastructure with contractual governance, security policies and support.",
		price: {
			state: "quote",
			amountMinor: null,
			currency: "EUR",
			interval: "month",
			note: "Scoped and quoted individually",
		},
		featured: false,
		features: [
			"Capacity adapted to your requirements",
			"Advanced governance and custom RBAC",
			"Extended audit and traceability",
			"Advanced security policies",
			"Multiple environments and integrations",
			"Dedicated and hybrid infrastructure",
			"Contractual support, SLA and onboarding",
		],
		limitNote:
			"Scope, commitments and support terms are defined in the agreement.",
		cta: { label: "Contact sales", href: "/contact-sales" },
	},
];

export const families = {
	section: {
		eyebrow: "One subscription, six families",
		title: "Every plan covers the whole platform.",
		description:
			"The six families are not six separate subscriptions. A plan sets how deeply you can operate within each one, and infrastructure consumption is metered the same way in every plan.",
	},
	items: [
		{
			name: "Compute & Containers",
			href: "/products/compute-infrastructure",
			description:
				"Virtual machines, containers, GPU capacity and clusters managed from one workspace.",
		},
		{
			name: "Storage & Databases",
			href: "/products/storage-databases",
			description:
				"Object and block storage, backups, retention and managed database engines.",
		},
		{
			name: "Networking & Connectivity",
			href: "/products/network-edge",
			description:
				"Private networks, DNS, load balancing and the entry points to your services.",
		},
		{
			name: "Security & Protection",
			href: "/products/security-identity",
			description:
				"Identity, access control, network firewalling and secret management.",
		},
		{
			name: "Observability & Operations",
			href: "/products/cloud-management",
			description:
				"Resource state, monitoring, alerting and cost visibility across the estate.",
		},
		{
			name: "Developer Platform",
			href: "/products/developer-platform",
			description:
				"APIs, deployment automation, integrations and the tooling teams build with.",
		},
	] satisfies readonly ServiceFamily[],
} as const;

export const comparison = {
	section: {
		eyebrow: "Plan comparison",
		title: "Compare what each plan can do.",
		description:
			"The difference between plans is the depth of management, not access to a family. Support and governance change with the plan; consumption is metered identically.",
	},
	rows: [
		{
			capability: "Compute & Containers",
			free: "Core resources and lifecycle, single workspace",
			pro: "Advanced lifecycle and higher quotas across workspaces",
			enterprise: "Custom capacity, dedicated hardware and private estates",
		},
		{
			capability: "Storage & Databases",
			free: "Essential object and block storage",
			pro: "Extended storage, managed databases and backup policies",
			enterprise: "Dedicated storage pools and custom retention",
		},
		{
			capability: "Networking & Connectivity",
			free: "Essential connectivity between resources",
			pro: "Advanced networking options",
			enterprise: "Isolated network boundaries and custom topologies",
		},
		{
			capability: "Security & Protection",
			free: "Base security controls",
			pro: "Additional controls and policies",
			enterprise: "Advanced policies, extended audit and custom RBAC",
		},
		{
			capability: "Observability & Operations",
			free: "Limited monitoring and history",
			pro: "Extended monitoring, alerting and history",
			enterprise: "Multi-environment oversight and extended retention",
		},
		{
			capability: "Developer Platform",
			free: "Essential API and developer tools",
			pro: "Advanced API, integrations and automation",
			enterprise: "Custom integrations and governed automation",
		},
		{
			capability: "Governance & access",
			free: "Single owner",
			pro: "Members, roles and permissions",
			enterprise: "Custom RBAC, multiple environments, extended audit",
		},
		{
			capability: "Support",
			free: "Community documentation and support",
			pro: "Priority support",
			enterprise: "Contractual support, SLA and technical onboarding",
		},
	] satisfies readonly ComparisonRow[],
	note: "The scope above describes what each plan unlocks. Numeric thresholds are finalised with the plan and published before billing opens.",
} as const;

export const consumption = {
	section: {
		eyebrow: "Platform and consumption",
		title: "Infrastructure pricing — Pay for the resources you use.",
		description:
			"A Astron Collection bill has two parts: the platform subscription, and the infrastructure that is actually consumed. Keeping them separate is what makes the invoice predictable.",
	},
	subscription: {
		title: "Platform subscription",
		description:
			"Pays for the right to use the platform. It sets what you can manage, not how much hardware you own.",
		items: [
			"Access to platform features",
			"Management quotas",
			"Organisational limits and workspaces",
			"Automation capabilities",
			"Advanced and governance features",
			"Support level and service commitments",
		],
	},
	consumption: {
		title: "Infrastructure consumption",
		description:
			"Metered per resource, per unit, and invoiced separately from the subscription when Astron Collection provides the resource.",
		items: [
			{ resource: "CPU", unit: "vCPU-hour" },
			{ resource: "Memory", unit: "GB-month" },
			{ resource: "Block storage", unit: "GB-month, provisioned" },
			{ resource: "Object storage", unit: "GB-month, stored" },
			{ resource: "Backups", unit: "GB-month, retained" },
			{ resource: "Network traffic", unit: "GB transferred" },
			{ resource: "Public IP addresses", unit: "address-month" },
			{ resource: "Reserved capacity", unit: "reservation-month" },
			{ resource: "Container and job runtime", unit: "execution-hour" },
			{ resource: "Dedicated servers", unit: "server-month" },
			{ resource: "Add-on services", unit: "service-month" },
		],
	},
	statement:
		"Pro and Enterprise never include a physical server, unlimited memory or free infrastructure capacity. Server, storage, network and backup costs are metered on top of the platform fee.",
	useNote:
		"On Self, resources run on infrastructure you control and are not billed by Astron Collection. The platform subscription does not apply to Self.",
	billing:
		"Unit rates are not published yet. When they are, every resource will state its amount, currency and billing interval, and the invoice will keep platform and infrastructure lines separate.",
	resourceLinksNote: "Resource-level plans by category",
	resourceLinks: [
		{ label: "Compute", href: "/pricing/compute" },
		{ label: "Storage", href: "/pricing/storage" },
		{ label: "Networking", href: "/pricing/networking" },
		{ label: "Hosting", href: "/pricing/hosting" },
		{ label: "Enterprise", href: "/pricing/enterprise" },
	],
} as const;

export const dedicated = {
	section: {
		eyebrow: "Dedicated bare metal",
		title: "Dedicated infrastructure. One unified control plane.",
		description:
			"Physical servers dedicated to one organisation, managed from the same Astron Collection workspace as virtual resources. The hardware is sized for you; the control plane stays unified.",
	},
	capabilities: [
		"Hardware resources exposed to your workspace",
		"Hypervisor administration within the agreed scope",
		"Virtual machines and containers on the host",
		"Storage and network management",
		"Start, stop and lifecycle operations",
		"Monitoring and resource state",
		"Remote access and console where the service provides it",
		"Operations recorded in the workspace",
	],
	boundary:
		"Firmware updates, BMC access and physical interventions remain with the operator unless the contract states otherwise.",
	costs: [
		{ label: "Dedicated server", value: "Billed per server, per month" },
		{
			label: "Cloud subscription",
			value: "Free, Pro or Enterprise, billed separately",
		},
		{ label: "Managed services", value: "Optional, scoped in writing" },
		{ label: "Physical interventions", value: "Quoted individually" },
	],
	primary: { label: "Design a dedicated footprint", href: "/contact-sales" },
	secondary: { label: "Bare metal details", href: "/products/bare-metal" },
} as const;

export const deployment = {
	section: {
		eyebrow: "Deployment",
		title: "Your infrastructure. Your choice.",
		description:
			"The same control plane can be operated by us, installed on your infrastructure, or both at once. Only Cloud carries a platform subscription.",
	},
	note: "Self and Hybrid are deployment modes, not subscription tiers. A single workspace can combine a Cloud control plane with local installations.",
	modes: [
		{
			id: "cloud",
			name: "Cloud",
			description:
				"Hosted and operated by Sky Genesis Enterprise. You manage your infrastructure from the Astron Collection console.",
			points: [
				"Free, Pro and Enterprise subscriptions",
				"Access at dash.astron-collection.com",
				"No installation or upgrade work",
			],
			primary: {
				label: "Open the console",
				href: links.console,
				external: true,
			},
			secondary: { label: "Compare plans", href: "#plans" },
		},
		{
			id: "self",
			name: "Self",
			description:
				"Install and operate Astron Collection on infrastructure you control, without a Cloud subscription or a Cloud account.",
			points: [
				"Open-source core, free to self-host",
				"You keep control of the installation",
				"No periodic remote validation",
				"Enterprise capabilities require a commercial licence",
			],
			primary: {
				label: "Installation guide",
				href: links.docs.differences,
				external: true,
			},
			secondary: { label: "Consult the catalogue", href: "/products" },
		},
		{
			id: "hybrid",
			name: "Hybrid",
			description:
				"Combine the centralised control plane with one or more local Astron Collection Self installations.",
			points: [
				"Centralised management across sites",
				"Local infrastructure keeps operating autonomously",
				"No dependency on permanent Cloud availability",
			],
			primary: { label: "Plan a hybrid deployment", href: "/contact-sales" },
			secondary: {
				label: "Cloud vs Self",
				href: links.docs.differences,
				external: true,
			},
		},
	],
} as const;

export const enterprise = {
	section: {
		eyebrow: "Enterprise and public sector",
		title: "Built for organisations that answer for their infrastructure.",
		description:
			"Enterprise is not Pro with larger quotas. It is the plan for governance, traceability and contractual commitments across multiple environments.",
	},
	capabilities: [
		"Infrastructure governance across projects and environments",
		"Customisable RBAC and permission model",
		"Extended audit and traceability of operations",
		"Multiple environment management",
		"Specific integrations with existing systems",
		"Dedicated and private infrastructure options",
		"Hybrid deployment across sites",
		"Contractual support, SLA and technical onboarding",
	],
	commitments: [
		"An SLA exists only where the agreement states one.",
		"No certification, regulatory compliance or legal sovereignty is claimed on this page.",
	],
	primary: { label: "Contact sales", href: "/contact-sales" },
	secondary: { label: "Trust hub", href: "/company/trust" },
} as const;

export const pricingFaqs: readonly FaqEntry[] = [
	{
		question: "What is included in each Astron Collection plan?",
		answer:
			"Every plan covers the same six service families. Free covers core management with limited history and community support. Pro raises quotas and adds advanced automation, members, permissions and priority support. Enterprise adds governance, extended audit, dedicated infrastructure and contractual support. Infrastructure consumption is billed on top of the subscription in every plan.",
	},
	{
		question: "Are infrastructure resources included in the subscription?",
		answer:
			"No. A subscription pays for the platform: features, management quotas, automation and support. CPU, memory, storage, traffic, addresses, backups and dedicated servers are metered separately — or paid to your own provider when you run Self.",
	},
	{
		question: "What happens when I exceed my quotas?",
		answer:
			"Management quotas cap what the platform allows you to create or operate on the current plan. When a threshold is reached, the additional action is blocked until the quota is raised. The behaviour of each quota is stated with the plan, and no overage is charged silently.",
	},
	{
		question: "Can I upgrade or downgrade my subscription?",
		answer:
			"Yes. A plan change is made from the console and applies from the next billing period unless the agreement says otherwise. A downgrade requires the workspace to fit within the lower quotas before it is applied.",
	},
	{
		question: "Can I use Astron Collection without subscribing to Cloud?",
		answer:
			"Yes. Astron Collection Self runs on infrastructure you control, with no Cloud subscription and no Cloud account.",
	},
	{
		question: "Is Astron Collection Self free to use?",
		answer:
			"The open-source core is free to self-host. Enterprise capabilities, such as advanced RBAC, audit and white labelling, require a commercial licence. Support and onboarding are separate services.",
	},
	{
		question: "What is the difference between Cloud, Self and Hybrid?",
		answer:
			"Cloud is operated by Sky Genesis Enterprise and billed as a subscription. Self is installed and operated by you. Hybrid joins the two: a central control plane with local installations that keep operating autonomously.",
	},
	{
		question: "Can I connect my own infrastructure providers?",
		answer:
			"Astron Collection is designed to manage infrastructure across providers rather than lock a workspace to one. Self and Hybrid are the modes for infrastructure you already operate; supported providers and integrations are documented in the product documentation and added as they are verified.",
	},
	{
		question: "Is Dedicated Bare Metal included in Pro or Enterprise?",
		answer:
			"No. A dedicated server is a separate resource billed per server. It can be attached to a Pro or Enterprise workspace and managed from the same control plane, but it is never included in the subscription.",
	},
	{
		question: "How does infrastructure consumption billing work?",
		answer:
			"Consumption is metered per unit — vCPU-hours, GB-months, transferred traffic or address-months, for example — and invoiced alongside the subscription, with platform and infrastructure lines kept separate. Unit rates are not published yet; they will show the amount, currency and billing interval per resource.",
	},
	{
		question: "What support is included in each plan?",
		answer:
			"Free includes documentation and community support. Pro includes priority support. Enterprise includes contractual support with an SLA and technical onboarding. A response commitment exists only where the agreement states one.",
	},
	{
		question: "Can I migrate from Self to Cloud or Hybrid?",
		answer:
			"Yes. Both modes use the same control plane model, so a Self installation can be connected to a Cloud workspace in Hybrid, or moved to a Cloud subscription. Scope, data transfer and downtime are agreed in writing before the change.",
	},
];

export const finalCta = {
	eyebrow: "Start here",
	title: "One control plane for your whole infrastructure.",
	description:
		"Start free, operate on Pro, or run Astron Collection on your own infrastructure with Self and Hybrid.",
	primary: { label: "Start for free", href: links.console, external: true },
	secondary: { label: "Contact sales", href: "/contact-sales" },
	tertiary: {
		label: "Read the documentation",
		href: links.docs.home,
		external: true,
	},
	note: "Cloud prices are being finalised. Each plan is published with its amount before billing opens; no placeholder price is shown.",
} as const;
