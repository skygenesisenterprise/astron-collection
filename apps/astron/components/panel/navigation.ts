import {
	ArrowCircleUpIcon,
	ArrowsClockwiseIcon,
	ArrowsLeftRightIcon,
	BellIcon,
	BroadcastIcon,
	BugIcon,
	CertificateIcon,
	ClockCounterClockwiseIcon,
	CodeIcon,
	CopyIcon,
	CpuIcon,
	DatabaseIcon,
	GaugeIcon,
	GearIcon,
	GlobeIcon,
	HardDrivesIcon,
	HouseIcon,
	type Icon,
	ImagesIcon,
	LifebuoyIcon,
	ListChecksIcon,
	NetworkIcon,
	PhoneIcon,
	PulseIcon,
	ScalesIcon,
	ShieldCheckIcon,
	ShieldWarningIcon,
	WrenchIcon,
} from "@phosphor-icons/react";

/**
 * Navigation model of the Astron Collection panel.
 *
 * This is the organization-wide product surface served under `/{organizationId}` —
 * not the infrastructure dashboard under `/dashboard`. The two surfaces share
 * the same navigation *concepts* (destinations, placements, environment and
 * licence gating) but not the same tree, because they expose different
 * products.
 *
 * Responsibilities are split the same way as in the dashboard navigation:
 * - this module owns destinations, sections, permissions and licences;
 * - the shell (`panel-shell.tsx`) only renders the resolved tree;
 * - the server (`lib/organization-page.ts`) remains authoritative for access.
 */

export type NavigationEnvironment = "self" | "cloud";

export type LicenseTier = "free" | "pro" | "enterprise";

const LICENSE_RANK: Record<LicenseTier, number> = {
	free: 0,
	pro: 1,
	enterprise: 2,
};

/** Structural shape of a permission map (`api.user.getPermissions`). */
export type PermissionMap = Record<
	string,
	Record<string, boolean | undefined> | undefined
>;

export type NavigationDestination = {
	label: string;
	/** Path inside the workspace, relative to `/{organizationId}`. */
	path: string;
	icon: Icon;
	/** Extra paths that also select this destination. */
	activePaths?: readonly string[];
	/** Permission required to see the destination, as `resource.action`. */
	requires?: string;
	/** Whether the destination is exposed as an active navigation link. */
	implemented?: boolean;
	/** Optional pill rendered next to the label. */
	badge?: string;
	/** Optional heading shown above the destination's submenu. */
	subMenuLabel?: string;
};

/**
 * Every panel destination, declared once. The key is the stable id used by
 * placements and rendered into `PanelNavigationItem.id`.
 */
const NAVIGATION_DESTINATIONS = {
	home: {
		label: "Overview",
		path: "home",
		icon: HouseIcon,
		implemented: true,
	},
	history: {
		label: "Activity",
		path: "history",
		icon: ClockCounterClockwiseIcon,
	},
	domains: {
		label: "Domains",
		path: "domains",
		icon: GlobeIcon,
		requires: "dnsProvider.read",
	},
	observability: {
		label: "Observability",
		path: "observability",
		icon: PulseIcon,
		implemented: true,
		requires: "traffic.read",
	},
	// Keep the stable destination ID separate from the operational
	// Infrastructure Workspace.
	infrastructure: {
		label: "Cloud",
		path: "cloud/overview",
		icon: HardDrivesIcon,
		implemented: true,
	},
	telecom: {
		label: "Telecom",
		path: "telecom/overview",
		icon: PhoneIcon,
		implemented: true,
	},
	compute: {
		label: "Compute",
		path: "compute",
		icon: CpuIcon,
		subMenuLabel: "Service",
	},
	storage: {
		label: "Data & Storage",
		path: "storage",
		icon: DatabaseIcon,
	},
	media: {
		label: "Media",
		path: "media",
		icon: ImagesIcon,
	},
	realtime: {
		label: "Realtime",
		path: "realtime",
		icon: BroadcastIcon,
	},
	development: {
		label: "Development & Runtime",
		path: "development",
		icon: CodeIcon,
	},
	applicationSecurity: {
		label: "Application Security",
		path: "security/applications",
		icon: ShieldCheckIcon,
	},
	zeroTrust: {
		label: "Identity & Access",
		path: "security/zero-trust",
		icon: ShieldWarningIcon,
	},
	networks: {
		label: "Networks",
		path: "networks",
		icon: NetworkIcon,
	},
	threats: {
		label: "Threat Detection & Response",
		path: "security/threats",
		icon: BugIcon,
	},
	delivery: {
		label: "Delivery & Performance",
		path: "delivery",
		icon: GaugeIcon,
	},
	account: {
		label: "Account Settings",
		path: "account",
		icon: GearIcon,
	},
} satisfies Record<string, NavigationDestination>;

type NavigationDestinationId = keyof typeof NAVIGATION_DESTINATIONS;

/**
 * Cloud entitlement matrix: the minimum licence required to render a
 * destination. Only the managed Cloud product is gated; a self-hosted instance
 * is unlicensed and keeps its whole tree.
 *
 * Navigation visibility is presentation only: direct URL access stays protected
 * by membership and permission checks on the server.
 */
export const CLOUD_DESTINATION_MIN_LICENSE = {
	home: "free",
	history: "free",
	domains: "free",
	observability: "free",
	infrastructure: "free",
	telecom: "free",
	compute: "free",
	storage: "pro",
	media: "pro",
	realtime: "pro",
	development: "free",
	applicationSecurity: "pro",
	zeroTrust: "enterprise",
	networks: "free",
	threats: "enterprise",
	delivery: "free",
	account: "free",
} satisfies Record<NavigationDestinationId, LicenseTier>;

/** A destination as placed in a section. Environments default to all. */
export type NavigationPlacement = {
	destination: NavigationDestinationId;
	environments?: readonly NavigationEnvironment[];
	/** Overrides the shared entitlement for this placement. */
	minLicense?: LicenseTier;
};

export type NavigationSectionDefinition = {
	id: string;
	/** Omitted when the entries need no heading, as for the primary group. */
	label?: string;
	items: readonly NavigationPlacement[];
	environments?: readonly NavigationEnvironment[];
};

/**
 * The Global Workspace tree: product sections in the requested order. A
 * destination with children can expose its available pages even when it has no
 * landing page of its own.
 */
export const NAVIGATION_SECTIONS: readonly NavigationSectionDefinition[] = [
	{
		id: "main",
		items: [
			{ destination: "home" },
			{ destination: "history" },
			{ destination: "domains" },
			{ destination: "observability" },
		],
	},
	{
		id: "infrastructure",
		label: "Infrastructure",
		items: [
			{ destination: "infrastructure" },
			{ destination: "telecom" },
			{ destination: "compute" },
			{ destination: "storage" },
			{ destination: "media" },
			{ destination: "realtime" },
			{ destination: "development" },
		],
	},
	{
		id: "protect",
		label: "Protect & Connect",
		items: [
			{ destination: "applicationSecurity" },
			{ destination: "zeroTrust" },
			{ destination: "networks" },
			{ destination: "threats" },
			{ destination: "delivery" },
		],
	},
];

/**
 * Entries pinned to the sidebar footer. They are outside the scrollable tree
 * so the account entry is reachable from every page of the panel.
 */
export const FOOTER_NAVIGATION: readonly NavigationPlacement[] = [
	{ destination: "account" },
];

/**
 * Entries of the Account Settings sub-menu, in the order the panel lists them.
 */
export const ACCOUNT_DESTINATIONS: readonly {
	label: string;
	path: string;
	implemented: boolean;
}[] = [
	{ label: "Members", path: "account/members", implemented: true },
	{ label: "Billing", path: "account/billing", implemented: true },
	{
		label: "Account API Tokens",
		path: "account/api-tokens",
		implemented: true,
	},
	{ label: "OAuth Clients", path: "account/oauth-clients", implemented: true },
	{ label: "Audit Logs", path: "account/audit-log", implemented: true },
	{ label: "Notifications", path: "account/notifications", implemented: true },
	{
		label: "Blocked Content",
		path: "account/blocked-content",
		implemented: true,
	},
	{
		label: "Abuse Reports",
		path: "account/abuse-reports",
		implemented: true,
	},
	{ label: "Carbon Impact Report", path: "account/carbon", implemented: true },
	{
		label: "Configurations",
		path: "account/configurations",
		implemented: true,
	},
	{ label: "Resource Tags", path: "account/tags", implemented: true },
];

export type PanelNavigationChild = {
	id: string;
	label: string;
	group?: string;
	description?: string;
	/** Absolute, workspace-scoped href. */
	href: string;
	/** Whether this route is exposed as an active navigation link. */
	implemented: boolean;
};

export type RecentNavigationPage = {
	path: string;
	section: string;
	item: string;
};

export type PanelNavigationItem = {
	id: string;
	label: string;
	/** Absolute, workspace-scoped href. Always built from the URL organization. */
	href: string;
	icon: Icon;
	/** Whether this route is exposed as an active navigation link. */
	implemented: boolean;
	/** Whether the destination will expose a contextual sub-navigation. */
	expandable: boolean;
	/** Optional pill rendered next to the label. */
	badge?: string;
	minLicense?: LicenseTier;
	subMenuLabel?: string;
	/** Entries of the destination's own sub-menu, rendered when expanded. */
	children?: PanelNavigationChild[];
};

export type PanelNavigationSection = {
	id: string;
	label?: string;
	items: PanelNavigationItem[];
};

export type PanelNavigation = {
	organizationId: string;
	sections: PanelNavigationSection[];
	/** Persistent entries rendered in the sidebar footer. */
	footer: PanelNavigationItem[];
};

/**
 * Builds an absolute path inside a workspace. Every destination goes through
 * this helper so a page can never link to another organization by accident.
 */
export function organizationPath(organizationId: string, path: string): string {
	const segments = path
		.split("/")
		.filter(Boolean)
		.map((segment) => encodeURIComponent(segment));
	return [`/${encodeURIComponent(organizationId)}`, ...segments].join("/");
}

function readPermission(permissions: unknown, requirement: string): boolean {
	if (!permissions || typeof permissions !== "object") return false;
	const [resource, action] = requirement.split(".");
	if (!resource || !action) return false;
	const actions = (permissions as Record<string, unknown>)[resource];
	if (!actions || typeof actions !== "object") return false;
	return (actions as Record<string, unknown>)[action] === true;
}

function passesLicense(
	minimum: LicenseTier | undefined,
	license: LicenseTier | null,
): boolean {
	if (!minimum) return true;
	// An unresolved licence counts as Free: the navigation is presentation
	// only, and hiding every gated destination would turn a slow entitlement
	// load into an empty menu.
	return LICENSE_RANK[license ?? "free"] >= LICENSE_RANK[minimum];
}

function isInEnvironment(
	environments: readonly NavigationEnvironment[] | undefined,
	environment: NavigationEnvironment,
): boolean {
	return !environments || environments.includes(environment);
}

function resolveDomainChildren(organizationId: string): PanelNavigationChild[] {
	return [
		{
			id: "overview",
			label: "Overview",
			path: "domains/overview",
			implemented: true,
		},
		{
			id: "registrations",
			label: "Records",
			path: "domains/registrations",
			implemented: true,
		},
		{
			id: "transfers",
			label: "Transfers",
			path: "domains/transfers",
			implemented: true,
		},
	].map((entry) => ({
		id: `domains.${entry.id}`,
		label: entry.label,
		href: organizationPath(organizationId, entry.path),
		implemented: entry.implemented === true,
	}));
}

/**
 * Global sub-menu of the Cloud destination, shaped like the Domains sub-menu:
 * three entries only. Overview opens the Cloud Workspace; Access Control and
 * Settings are organization-wide pages reached without entering the workspace.
 */
function resolveCloudChildren(organizationId: string): PanelNavigationChild[] {
	return [
		{
			id: "overview",
			label: "Overview",
			path: "cloud/overview",
			implemented: true,
		},
		{
			id: "access-control",
			label: "Access Control",
			path: "account/members",
			implemented: true,
		},
		{
			id: "settings",
			label: "Settings",
			path: "account/configurations",
			implemented: true,
		},
	].map((entry) => ({
		id: `cloud.${entry.id}`,
		label: entry.label,
		href: organizationPath(organizationId, entry.path),
		implemented: entry.implemented === true,
	}));
}

type ServiceDestination = {
	readonly label: string;
	readonly group: string;
	readonly description: string;
	readonly path: string;
	readonly implemented: boolean;
};

/**
 * Global children of Compute. These pages are owned by Compute only; the
 * Development & Runtime parent exposes the remaining worker services so no
 * route appears twice in the global tree.
 */
const COMPUTE_SERVICE_DESTINATIONS: readonly ServiceDestination[] = [
	{
		label: "Workers & Pages",
		group: "Compute",
		description: "Application execution and hosting",
		path: "workers",
		implemented: true,
	},
	{
		label: "Workers for Platforms",
		group: "Compute",
		description: "Multi-tenant execution platform",
		path: "workers/platforms",
		implemented: true,
	},
	{
		label: "Containers",
		group: "Compute",
		description: "Container execution",
		path: "workers/containers",
		implemented: true,
	},
	{
		label: "Durable Objects",
		group: "Compute",
		description: "Distributed state and coordination",
		path: "workers/durable-objects",
		implemented: true,
	},
	{
		label: "Browser Rendering",
		group: "Compute",
		description: "Browser execution",
		path: "workers/browser-run",
		implemented: true,
	},
	{
		label: "VPC",
		group: "Networking",
		description: "Virtual private network",
		path: "workers/vpc",
		implemented: true,
	},
];

/** Global children of Development & Runtime, disjoint from Compute. */
const DEVELOPMENT_SERVICE_DESTINATIONS: readonly ServiceDestination[] = [
	{
		label: "Queues",
		group: "Messaging & Events",
		description: "Message queues",
		path: "workers/queues",
		implemented: true,
	},
	{
		label: "Workflows",
		group: "Automation & Orchestration",
		description: "Durable process execution",
		path: "workers/workflows",
		implemented: true,
	},
	{
		label: "Observability",
		group: "Observability",
		description: "Monitoring and diagnostics",
		path: "workers/observability",
		implemented: true,
	},
	{
		label: "Feature Flags",
		group: "Development & Runtime",
		description: "Product and offer flags",
		path: "workers/flagship",
		implemented: true,
	},
	{
		label: "Plans",
		group: "Account & Billing",
		description: "Plans and pricing",
		path: "workers/plans",
		implemented: true,
	},
];

function resolveServiceChildren(
	organizationId: string,
	prefix: string,
	entries: readonly ServiceDestination[],
): PanelNavigationChild[] {
	return entries.map((entry) => ({
		id: `${prefix}.${entry.path.replaceAll("/", ".")}`,
		label: entry.label,
		group: entry.group,
		description: entry.description,
		href: organizationPath(organizationId, entry.path),
		implemented: entry.implemented,
	}));
}

function resolveComputeChildren(
	organizationId: string,
): PanelNavigationChild[] {
	return resolveServiceChildren(
		organizationId,
		"compute",
		COMPUTE_SERVICE_DESTINATIONS,
	);
}

function resolveDevelopmentChildren(
	organizationId: string,
): PanelNavigationChild[] {
	return resolveServiceChildren(
		organizationId,
		"development",
		DEVELOPMENT_SERVICE_DESTINATIONS,
	);
}

function resolvePlacement(
	placement: NavigationPlacement,
	opts: {
		organizationId: string;
		environment: NavigationEnvironment;
		permissions?: unknown;
		license: LicenseTier | null;
		recentPages?: readonly RecentNavigationPage[];
	},
): PanelNavigationItem | undefined {
	if (!isInEnvironment(placement.environments, opts.environment)) {
		return undefined;
	}

	const destination: NavigationDestination =
		NAVIGATION_DESTINATIONS[placement.destination];

	if (
		destination.requires &&
		!readPermission(opts.permissions, destination.requires)
	) {
		return undefined;
	}

	const minLicense =
		placement.minLicense ??
		(opts.environment === "cloud"
			? CLOUD_DESTINATION_MIN_LICENSE[placement.destination]
			: undefined);
	if (!passesLicense(minLicense, opts.license)) return undefined;

	return {
		id: placement.destination,
		label: destination.label,
		href: organizationPath(opts.organizationId, destination.path),
		icon: destination.icon,
		implemented: destination.implemented === true,
		// Every destination except the workspace home leads to a deeper level
		// (a list, then a resource) and is rendered with a disclosure chevron.
		expandable:
			placement.destination !== "home" && placement.destination !== "telecom",
		badge: destination.badge,
		minLicense,
		subMenuLabel: destination.subMenuLabel,
		children: resolveDestinationChildren(
			opts.organizationId,
			placement.destination,
			opts.recentPages,
		),
	};
}

export function createNavigation(opts: {
	organizationId: string;
	environment: NavigationEnvironment;
	permissions?: unknown;
	license?: LicenseTier | null;
	recentPages?: readonly RecentNavigationPage[];
}): PanelNavigation {
	const context = {
		organizationId: opts.organizationId,
		environment: opts.environment,
		permissions: opts.permissions,
		license: opts.license ?? null,
		recentPages: opts.recentPages,
	};

	const sections: PanelNavigationSection[] = [];
	for (const section of NAVIGATION_SECTIONS) {
		if (!isInEnvironment(section.environments, opts.environment)) continue;

		const items: PanelNavigationItem[] = [];
		for (const placement of section.items) {
			const item = resolvePlacement(placement, context);
			if (item) items.push(item);
		}

		if (items.length > 0) {
			sections.push({ id: section.id, label: section.label, items });
		}
	}

	const availableHrefs = new Set(
		sections.flatMap((section) =>
			section.items.flatMap((item) =>
				item.id === "history"
					? []
					: [
							...(item.implemented ? [item.href] : []),
							...(item.children
								?.filter((child) => child.implemented)
								.map((child) => child.href) ?? []),
						],
			),
		),
	);
	const domainsDestination = sections
		.flatMap((section) => section.items)
		.find((item) => item.id === "domains");
	if (domainsDestination) {
		const domainPrefix = `${domainsDestination.href}/`;
		for (const item of sections.flatMap((section) => section.items)) {
			if (item.id !== "history") continue;
			for (const child of item.children ?? []) {
				if (!child.href.startsWith(domainPrefix)) continue;
				const domainName = child.href.slice(domainPrefix.length);
				if (
					domainName &&
					!domainName.includes("/") &&
					decodeSegment(domainName) !== "add-site" &&
					!DOMAIN_STATIC_PAGES.has(decodeSegment(domainName))
				) {
					availableHrefs.add(child.href);
				}
			}
		}
	}
	for (const item of sections.flatMap((section) => section.items)) {
		if (item.id === "history") {
			item.children = item.children?.filter((child) =>
				availableHrefs.has(child.href),
			);
		}
	}

	const footer = FOOTER_NAVIGATION.map((placement) =>
		resolvePlacement(placement, context),
	).filter((item): item is PanelNavigationItem => item !== undefined);

	return { organizationId: opts.organizationId, sections, footer };
}

function normalizePath(pathname: string): string {
	return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

/**
 * Whether an absolute workspace href is the current location or one of its
 * descendants. Shared by menu entries and their sub-entries, so a product
 * surface stays marked while one of its pages is open.
 */
export function isNavigationHrefActive(
	href: string,
	location: { pathname: string },
): boolean {
	const pathname = normalizePath(location.pathname);
	const target = normalizePath(href);
	return pathname === target || pathname.startsWith(`${target}/`);
}

/** Whether a rendered entry is the current location. */
export function isNavigationItemActive(
	item: PanelNavigationItem,
	location: { pathname: string },
): boolean {
	if (item.id === "history") return false;
	return isNavigationHrefActive(item.href, location);
}

export function isNavigationChildActive(
	parent: PanelNavigationItem,
	child: PanelNavigationChild,
	location: { pathname: string },
): boolean {
	return (
		parent.id !== "history" &&
		child.implemented &&
		isNavigationHrefActive(child.href, location)
	);
}

/**
 * Resolves the visited route to a named global navigation entry. Only routes
 * exposed by the global navigation are recorded as recent destinations.
 */
export function resolveRecentNavigationPage(
	navigation: PanelNavigation,
	pathname: string,
): RecentNavigationPage | undefined {
	const currentPath = normalizePath(pathname.split(/[?#]/)[0] ?? pathname);
	const organizationPrefix = `${organizationPath(navigation.organizationId, "")}/`;
	if (!currentPath.startsWith(organizationPrefix)) return undefined;

	const entries = navigation.sections.flatMap((section) =>
		section.items.flatMap((item) => {
			if (item.id === "history") return [];
			const children =
				item.children
					?.filter((child) => child.implemented)
					.map((child) => ({
						href: child.href,
						section: item.label,
						item: child.label,
					})) ?? [];
			const destination = item.implemented
				? [
						{
							href: item.href,
							section: section.label ?? "Workspace",
							item: item.label,
						},
					]
				: [];
			return [...children, ...destination];
		}),
	);
	const entry = entries.find(
		(candidate) => normalizePath(candidate.href) === currentPath,
	);

	const encodedPath = currentPath.slice(organizationPrefix.length);
	const path = encodedPath
		.split("/")
		.map((segment) => decodeSegment(segment))
		.join("/");
	if (!entry) {
		const domainPrefix = `${organizationPath(
			navigation.organizationId,
			"domains",
		)}/`;
		if (!currentPath.startsWith(domainPrefix)) return undefined;
		const domainPath = currentPath.slice(domainPrefix.length);
		const [domainName, ...nestedSegments] = domainPath.split("/");
		if (
			!domainName ||
			DOMAIN_STATIC_PAGES.has(decodeSegment(domainName)) ||
			decodeSegment(domainName) === "add-site" ||
			nestedSegments.length > 0
		) {
			return undefined;
		}
		return { path, section: "Domains", item: decodeSegment(domainName) };
	}

	return { path, section: entry.section, item: entry.item };
}

export function findActiveNavigation(
	navigation: PanelNavigation,
	location: { pathname: string },
):
	| {
			section: PanelNavigationSection;
			item: PanelNavigationItem;
	  }
	| undefined {
	for (const section of navigation.sections) {
		const item = section.items.find((candidate) =>
			isNavigationItemActive(candidate, location),
		);
		if (item) return { section, item };
	}
	return undefined;
}

/* -------------------------------------------------------------------------- */
/* Contextual navigation                                                      */
/* -------------------------------------------------------------------------- */

/**
 * A resource opened inside the workspace. The sidebar keeps its global tree and
 * adds the resource's own destinations below it.
 */
export type ContextualResource =
	| { kind: "domain"; id: string }
	| { kind: "instance"; id: string }
	| { kind: "bucket"; id: string }
	| { kind: "database"; id: string }
	| { kind: "vm"; id: string }
	| { kind: "server"; id: string }
	| { kind: "tunnel"; id: string }
	// Cloud Workspace resources. Their routes are declared now so opening a
	// cluster, a node or a VM can later expose resource-specific destinations
	// without changing the navigation model.
	| { kind: "cluster"; id: string }
	| { kind: "node"; id: string }
	| { kind: "cloudVm"; id: string };

type ContextualDestination = {
	label: string;
	path: string;
	implemented?: boolean;
	badge?: string;
	children?: readonly ContextualDestination[];
};

/**
 * Resource workspaces: one entry per resource kind. `basePath` is where the
 * resource lives, `match` is the path prefix used to detect it in a URL, and
 * `items` is the navigation determined by the resource type.
 */
const RESOURCE_WORKSPACES: Record<
	ContextualResource["kind"],
	{
		label: string;
		basePath: string;
		match: readonly string[];
		items: readonly ContextualDestination[];
	}
> = {
	domain: {
		label: "Domain",
		basePath: "domains",
		match: ["domains"],
		// Keep the domain capabilities in the same order as the domain dashboard.
		// Routes without a page stay disabled until their screens are implemented.
		items: [
			{ label: "Overview", path: "", implemented: true },
			{ label: "History", path: "history" },
			{ label: "AI Crawl Control", path: "ai-crawl-control" },
			{ label: "Agent Readiness", path: "agent-readiness" },
			{ label: "Analytics", path: "analytics" },
			{ label: "Observability", path: "observability", badge: "New" },
			{
				label: "DNS",
				path: "dns",
				children: [
					{ label: "Records", path: "dns/records", implemented: true },
					{ label: "Analytics", path: "dns/analytics" },
					{ label: "Settings", path: "dns/settings" },
				],
			},
			{ label: "Email", path: "email" },
			{ label: "SSL/TLS", path: "ssl" },
			{ label: "Security", path: "security" },
			{ label: "Access", path: "access" },
			{ label: "Speed", path: "speed" },
			{ label: "Caching", path: "caching" },
			{ label: "Workers Routes", path: "workers-routes" },
			{ label: "Rules", path: "rules" },
			{ label: "Error Pages", path: "error-pages", badge: "New" },
			{ label: "Network", path: "network" },
			{ label: "Traffic", path: "traffic" },
			{ label: "Web3", path: "web3" },
		],
	},
	instance: {
		label: "Instance",
		basePath: "compute",
		match: ["compute"],
		items: [
			{ label: "Overview", path: "overview" },
			{ label: "Monitoring", path: "monitoring" },
			{ label: "Configuration", path: "configuration" },
			{ label: "Network", path: "network" },
			{ label: "Storage", path: "storage" },
			{ label: "Activity", path: "activity" },
		],
	},
	bucket: {
		label: "Bucket",
		basePath: "storage",
		match: ["r2"],
		items: [
			{ label: "Overview", path: "overview" },
			{ label: "Objects", path: "objects" },
			{ label: "Access", path: "access" },
			{ label: "Lifecycle", path: "lifecycle" },
			{ label: "Monitoring", path: "monitoring" },
		],
	},
	database: {
		label: "Database",
		basePath: "infrastructure/databases",
		match: ["infrastructure", "databases"],
		items: [
			{ label: "Overview", path: "overview" },
			{ label: "Tables", path: "tables" },
			{ label: "Queries", path: "queries" },
			{ label: "Backups", path: "backups" },
			{ label: "Access", path: "access" },
			{ label: "Monitoring", path: "monitoring" },
		],
	},
	vm: {
		label: "Virtual Machine",
		basePath: "infrastructure/vm",
		match: ["infrastructure", "vm"],
		items: [
			{ label: "Overview", path: "overview" },
			{ label: "Monitoring", path: "monitoring" },
			{ label: "Configuration", path: "configuration" },
			{ label: "Network", path: "network" },
			{ label: "Storage", path: "storage" },
			{ label: "Activity", path: "activity" },
		],
	},
	server: {
		label: "Physical Server",
		basePath: "infrastructure/servers",
		match: ["infrastructure", "servers"],
		items: [
			{ label: "Overview", path: "overview" },
			{ label: "Monitoring", path: "monitoring" },
			{ label: "Configuration", path: "configuration" },
			{ label: "Network", path: "network" },
			{ label: "Storage", path: "storage" },
			{ label: "Activity", path: "activity" },
		],
	},
	tunnel: {
		label: "Tunnel",
		basePath: "network/tunnels",
		match: ["network", "tunnels"],
		items: [
			{ label: "Overview", path: "overview" },
			{ label: "Routes", path: "routes" },
			{ label: "Connectors", path: "connectors" },
			{ label: "Analytics", path: "analytics" },
		],
	},
	// Resource workspaces of the Cloud Workspace. The list pages and these
	// contextual pages do not exist yet; declaring them here keeps the model
	// ready for the cluster/node/VM screens without linking to a missing route.
	cluster: {
		label: "Cluster",
		basePath: "cloud/clusters",
		match: ["cloud", "clusters"],
		items: [
			{ label: "Overview", path: "overview" },
			{ label: "Nodes", path: "nodes" },
			{ label: "Virtual Machines", path: "virtual-machines" },
			{ label: "Storage", path: "storage" },
			{ label: "Networking", path: "networking" },
			{ label: "High Availability", path: "high-availability" },
			{ label: "Tasks", path: "tasks" },
			{ label: "Settings", path: "settings" },
		],
	},
	node: {
		label: "Node",
		basePath: "cloud/nodes",
		match: ["cloud", "nodes"],
		items: [
			{ label: "Overview", path: "overview" },
			{ label: "Virtual Machines", path: "virtual-machines" },
			{ label: "Containers", path: "containers" },
			{ label: "Storage", path: "storage" },
			{ label: "Networking", path: "networking" },
			{ label: "Tasks", path: "tasks" },
			{ label: "Updates", path: "updates" },
			{ label: "Settings", path: "settings" },
		],
	},
	cloudVm: {
		label: "Virtual Machine",
		basePath: "cloud/virtual-machines",
		match: ["cloud", "virtual-machines"],
		items: [
			{ label: "Overview", path: "overview" },
			{ label: "Monitoring", path: "monitoring" },
			{ label: "Configuration", path: "configuration" },
			{ label: "Networking", path: "networking" },
			{ label: "Storage", path: "storage" },
			{ label: "Snapshots", path: "snapshots" },
			{ label: "Backups", path: "backups" },
			{ label: "Activity", path: "activity" },
		],
	},
};

/**
 * Resolves the contextual section for a resource. It is deliberately additive:
 * the caller renders the global navigation first and this section underneath,
 * so a resource never replaces the workspace tree.
 */
export function resolveContextualNavigation(opts: {
	organizationId: string;
	resource: ContextualResource;
}): PanelNavigationSection {
	const definition = RESOURCE_WORKSPACES[opts.resource.kind];
	const base = [definition.basePath, opts.resource.id];

	return {
		id: `contextual-${opts.resource.kind}`,
		label: definition.label,
		items: definition.items.map((destination) => ({
			id: `${opts.resource.kind}.${destination.path.replaceAll("/", ".")}`,
			label: destination.label,
			href: organizationPath(
				opts.organizationId,
				[...base, destination.path].filter(Boolean).join("/"),
			),
			icon: buildContextualIcon(
				destination.path.split("/").at(-1) ?? destination.path,
			),
			implemented: destination.implemented === true,
			badge: destination.badge,
			expandable: Boolean(destination.children?.length),
			children: destination.children?.map((child) => ({
				id: `${opts.resource.kind}.${child.path.replaceAll("/", ".")}`,
				label: child.label,
				href: organizationPath(
					opts.organizationId,
					[...base, child.path].filter(Boolean).join("/"),
				),
				implemented: child.implemented === true,
			})),
			minLicense: undefined,
		})),
	};
}

function buildContextualIcon(path: string): Icon {
	switch (path) {
		case "dns":
		case "records":
			return GlobeIcon;
		case "ai-crawl-control":
			return BugIcon;
		case "agent-readiness":
			return ShieldCheckIcon;
		case "ssl":
		case "security":
			return ShieldCheckIcon;
		case "email":
			return BroadcastIcon;
		case "analytics":
		case "monitoring":
		case "traffic":
		case "observability":
			return PulseIcon;
		case "speed":
			return GaugeIcon;
		case "caching":
			return DatabaseIcon;
		case "workers-routes":
			return CodeIcon;
		case "rules":
			return GearIcon;
		case "error-pages":
			return ShieldWarningIcon;
		case "web3":
			return GlobeIcon;
		case "network":
			return NetworkIcon;
		case "history":
			return ClockCounterClockwiseIcon;
		case "storage":
			return DatabaseIcon;
		case "activity":
			return ClockCounterClockwiseIcon;
		case "objects":
			return ImagesIcon;
		default:
			return GaugeIcon;
	}
}

/* -------------------------------------------------------------------------- */
/* Workspace-based navigation                                                 */
/* -------------------------------------------------------------------------- */

/**
 * A workspace is a navigation context, not a second navigation system: the
 * global tree is always built first and the active workspace contributes
 * additional sections underneath it.
 *
 * - `global`: organization-wide entry point (the tree above);
 * - `infrastructure`: operational umbrella for compute, storage, network and
 *   security products;
 * - `domain`: one product surface (AI, storage, networking, …);
 * - `resource`: a single resource opened inside its parent workspace.
 *
 * The resolver is declarative: URLs are matched against the definitions below,
 * so deep links, browser navigation and future routes work without the shell
 * knowing about any particular product.
 */
export type WorkspaceKind = "global" | "infrastructure" | "domain" | "resource";

export type NavigationWorkspace = {
	kind: WorkspaceKind;
	/** Stable id: `global`, `infrastructure`, `domain:ai`, … */
	id: string;
	label: string;
	/** Root of the workspace, relative to `/{organizationId}`. */
	basePath?: string;
	/** Workspace this one was opened from, for resource contexts. */
	parent?: { id: string; label: string; href: string };
};

export type WorkspaceNavigation = PanelNavigation & {
	workspace: NavigationWorkspace;
	/**
	 * Sections owned by the active workspace. They are additive by default: the
	 * global tree above stays intact, so moving between workspaces never removes
	 * the organization-wide navigation.
	 */
	contextual: PanelNavigationSection[];
	/**
	 * When true the workspace owns the whole sidebar: the global tree is not
	 * rendered above it. Domain resources use this so a domain page shows the
	 * domain's own destinations instead of mixing them with the account tree.
	 */
	exclusive: boolean;
};

const GLOBAL_WORKSPACE: NavigationWorkspace = {
	kind: "global",
	id: "global",
	label: "Global Workspace",
};

type WorkspaceEntryDefinition = {
	/** Stable id scoped to the section. Defaults to the route path. */
	id?: string;
	label: string;
	path: string;
	implemented?: boolean;
	/** Optional icon for an entry that groups other destinations. */
	icon?: Icon;
	/**
	 * Destinations of a functional domain. A parent with children is rendered
	 * as a disclosure, so its own landing page may remain unimplemented.
	 */
	children?: readonly WorkspaceEntryDefinition[];
};

type WorkspaceSectionDefinition = {
	id: string;
	/** Omitted when the workspace header already names the section. */
	label?: string;
	items: readonly WorkspaceEntryDefinition[];
};

type DomainWorkspaceDefinition = {
	/** Short id used in `domain:{id}`. */
	id: string;
	label: string;
	basePath: string;
	/** Destination used when returning to this workspace from a resource. */
	parentPath?: string;
	/**
	 * Whether the workspace owns the whole sidebar. Cloud uses this so its
	 * complete navigation is shown on every Cloud page instead of being
	 * appended below the organization-wide tree.
	 */
	exclusive?: boolean;
	/** Destination used to leave an exclusive workspace. */
	parent?: { label: string; path: string };
	sections: readonly WorkspaceSectionDefinition[];
};

function buildWorkspaceChild(
	organizationId: string,
	parentId: string,
	entry: WorkspaceEntryDefinition,
): PanelNavigationChild {
	return {
		id: `${parentId}.${entry.id ?? entry.path}`,
		label: entry.label,
		href: organizationPath(organizationId, entry.path),
		implemented: entry.implemented === true,
	};
}

function buildWorkspaceItem(
	organizationId: string,
	sectionId: string,
	entry: WorkspaceEntryDefinition,
): PanelNavigationItem {
	const id = `${sectionId}.${entry.id ?? entry.path}`;
	return {
		id,
		label: entry.label,
		href: organizationPath(organizationId, entry.path),
		icon: entry.icon ?? buildContextualIcon(entry.path.split("/").pop() ?? ""),
		implemented: entry.implemented === true,
		expandable: Boolean(entry.children?.length),
		children: entry.children?.map((child) =>
			buildWorkspaceChild(organizationId, id, child),
		),
	};
}

function buildWorkspaceSection(
	organizationId: string,
	definition: WorkspaceSectionDefinition,
): PanelNavigationSection {
	return {
		id: definition.id,
		label: definition.label,
		items: definition.items.map((entry) =>
			buildWorkspaceItem(organizationId, definition.id, entry),
		),
	};
}

const INFRASTRUCTURE_WORKSPACE: {
	id: string;
	label: string;
	basePath: string;
	sections: readonly WorkspaceSectionDefinition[];
} = {
	id: "infrastructure",
	label: "Infrastructure",
	basePath: "infrastructure",
	sections: [
		{
			id: "infrastructure-overview",
			label: "Overview",
			items: [{ label: "Overview", path: "infrastructure" }],
		},
		{
			id: "infrastructure-compute",
			label: "Compute",
			items: [
				{ label: "Physical Servers", path: "infrastructure/servers" },
				{ label: "Virtual Machines", path: "infrastructure/vm" },
				{ label: "Instances", path: "infrastructure/instances" },
				{
					label: "Containers",
					path: "workers/containers",
					implemented: true,
				},
			],
		},
		{
			id: "infrastructure-storage",
			label: "Storage Infrastructure",
			items: [
				{
					label: "Object Storage",
					path: "r2/overview",
					implemented: true,
				},
				{ label: "Databases", path: "infrastructure/databases" },
			],
		},
		{
			id: "infrastructure-network",
			label: "Infrastructure Networking",
			items: [
				{
					label: "Networks",
					path: "network/overview",
					implemented: true,
				},
				{
					label: "Tunnels",
					path: "network/tunnels",
					implemented: true,
				},
				{
					label: "Custom IP Addresses",
					path: "network/ip-addresses/custom-ips",
					implemented: true,
				},
				{
					label: "Proxy IP Addresses",
					path: "network/ip-addresses/proxy-ips",
					implemented: true,
				},
			],
		},
		{
			id: "infrastructure-security",
			label: "Infrastructure Security",
			items: [{ label: "Infrastructure Security", path: "security" }],
		},
		{
			id: "infrastructure-operations",
			label: "Operations",
			items: [
				{
					label: "Monitoring",
					path: "observability",
					implemented: true,
				},
				{ label: "Operations", path: "infrastructure/operations" },
				{ label: "Terminal Access", path: "infrastructure/terminal" },
			],
		},
	],
};

/** Product surfaces that open a workspace of their own. */
/**
 * The Cloud Workspace is the operational environment for infrastructure
 * administration. Its sidebar keeps the same depth as the domain workspace
 * (18 entries including Overview). Every functional group from Compute to
 * Providers & Integrations owns its own set of child menus.
 */
const CLOUD_WORKSPACE: DomainWorkspaceDefinition = {
	id: "cloud",
	label: "Cloud",
	basePath: "cloud",
	parentPath: "cloud/overview",
	// Cloud owns the whole sidebar: opening Overview must show the complete
	// Cloud navigation instead of appending it under the global tree.
	exclusive: true,
	parent: { label: "Global Workspace", path: "home" },
	sections: [
		{
			id: "cloud",
			items: [
				{
					id: "overview",
					label: "Overview",
					path: "cloud/overview",
					icon: HouseIcon,
					implemented: true,
				},
				{
					id: "compute",
					label: "Compute",
					path: "cloud/compute",
					icon: CpuIcon,
					children: [
						{
							id: "virtual-machines",
							label: "Virtual Machines",
							path: "cloud/virtual-machines",
						},
						{
							id: "containers",
							label: "Containers",
							path: "cloud/containers",
						},
						{
							id: "resource-pools",
							label: "Resource Pools",
							path: "cloud/resource-pools",
						},
						{
							id: "clusters",
							label: "Clusters",
							path: "cloud/clusters",
						},
						{ id: "nodes", label: "Nodes", path: "cloud/nodes" },
						{
							id: "images",
							label: "Images & Templates",
							path: "cloud/images",
						},
					],
				},
				{
					id: "storage",
					label: "Storage",
					path: "cloud/storage",
					icon: DatabaseIcon,
					children: [
						{
							id: "pools",
							label: "Storage Pools",
							path: "cloud/storage/pools",
						},
						{
							id: "volumes",
							label: "Volumes & Disks",
							path: "cloud/storage/volumes",
						},
						{
							id: "backups",
							label: "Backups",
							path: "cloud/storage/backups",
						},
						{
							id: "snapshots",
							label: "Snapshots",
							path: "cloud/storage/snapshots",
						},
					],
				},
				{
					id: "networking",
					label: "Network & Security",
					path: "cloud/networking",
					icon: NetworkIcon,
					children: [
						{
							id: "interfaces",
							label: "Interfaces",
							path: "cloud/networking/interfaces",
						},
						{
							id: "virtual-networks",
							label: "Virtual Networks",
							path: "cloud/networking/virtual-networks",
						},
						{
							id: "vlans",
							label: "VLANs & Bridges",
							path: "cloud/networking/vlans",
						},
						{
							id: "ip-addresses",
							label: "IP Addresses",
							path: "cloud/networking/ip-addresses",
						},
						{
							id: "dns-dhcp",
							label: "DNS & DHCP",
							path: "cloud/networking/dns-dhcp",
						},
						{
							id: "firewalls",
							label: "Firewalls",
							path: "cloud/networking/firewalls",
						},
						{
							id: "vpn",
							label: "VPN",
							path: "cloud/networking/vpn",
						},
						{
							id: "load-balancers",
							label: "Load Balancers",
							path: "cloud/networking/load-balancers",
						},
					],
				},
				{
					id: "high-availability",
					label: "High Availability",
					path: "cloud/availability/high-availability",
					icon: ArrowsClockwiseIcon,
					children: [
						{
							id: "groups",
							label: "HA Groups",
							path: "cloud/availability/high-availability/groups",
						},
						{
							id: "status",
							label: "HA Status",
							path: "cloud/availability/high-availability/status",
						},
						{
							id: "fencing",
							label: "Fencing",
							path: "cloud/availability/high-availability/fencing",
						},
					],
				},
				{
					id: "replication",
					label: "Replication",
					path: "cloud/availability/replication",
					icon: CopyIcon,
					children: [
						{
							id: "jobs",
							label: "Replication Jobs",
							path: "cloud/availability/replication/jobs",
						},
						{
							id: "targets",
							label: "Replication Targets",
							path: "cloud/availability/replication/targets",
						},
						{
							id: "schedules",
							label: "Schedules",
							path: "cloud/availability/replication/schedules",
						},
					],
				},
				{
					id: "migration",
					label: "Migration",
					path: "cloud/availability/migration",
					icon: ArrowsLeftRightIcon,
					children: [
						{
							id: "live",
							label: "Live Migration",
							path: "cloud/availability/migration/live",
						},
						{
							id: "cold",
							label: "Cold Migration",
							path: "cloud/availability/migration/cold",
						},
						{
							id: "history",
							label: "Migration History",
							path: "cloud/availability/migration/history",
						},
					],
				},
				{
					id: "disaster-recovery",
					label: "Disaster Recovery",
					path: "cloud/availability/disaster-recovery",
					icon: LifebuoyIcon,
					children: [
						{
							id: "plans",
							label: "Recovery Plans",
							path: "cloud/availability/disaster-recovery/plans",
						},
						{
							id: "tests",
							label: "Recovery Tests",
							path: "cloud/availability/disaster-recovery/tests",
						},
						{
							id: "runbooks",
							label: "Runbooks",
							path: "cloud/availability/disaster-recovery/runbooks",
						},
					],
				},
				{
					id: "tasks",
					label: "Tasks & Jobs",
					path: "cloud/operations/tasks",
					icon: ListChecksIcon,
					children: [
						{
							id: "active",
							label: "Active Tasks",
							path: "cloud/operations/tasks/active",
						},
						{
							id: "scheduled",
							label: "Scheduled Jobs",
							path: "cloud/operations/tasks/scheduled",
						},
						{
							id: "history",
							label: "Task History",
							path: "cloud/operations/tasks/history",
						},
					],
				},
				{
					id: "events",
					label: "Events & Audit",
					path: "cloud/operations/events",
					icon: ClockCounterClockwiseIcon,
					children: [
						{
							id: "events",
							label: "Events",
							path: "cloud/operations/events/events",
						},
						{
							id: "audit",
							label: "Audit Log",
							path: "cloud/operations/events/audit",
						},
						{
							id: "alerts",
							label: "Alerts",
							path: "cloud/operations/events/alerts",
						},
					],
				},
				{
					id: "health",
					label: "Health & Metrics",
					path: "cloud/operations/health",
					icon: PulseIcon,
					children: [
						{
							id: "health",
							label: "Health",
							path: "cloud/operations/health/health",
						},
						{
							id: "metrics",
							label: "Metrics",
							path: "cloud/operations/health/metrics",
						},
						{
							id: "servers",
							label: "Metric Servers",
							path: "cloud/operations/health/metric-servers",
						},
					],
				},
				{
					id: "maintenance",
					label: "Maintenance",
					path: "cloud/operations/maintenance",
					icon: WrenchIcon,
					children: [
						{
							id: "windows",
							label: "Maintenance Windows",
							path: "cloud/operations/maintenance/windows",
						},
						{
							id: "plans",
							label: "Maintenance Plans",
							path: "cloud/operations/maintenance/plans",
						},
					],
				},
				{
					id: "updates",
					label: "Updates",
					path: "cloud/operations/updates",
					icon: ArrowCircleUpIcon,
					children: [
						{
							id: "available",
							label: "Available Updates",
							path: "cloud/operations/updates/available",
						},
						{
							id: "history",
							label: "Update History",
							path: "cloud/operations/updates/history",
						},
						{
							id: "policies",
							label: "Upgrade Policies",
							path: "cloud/operations/updates/policies",
						},
					],
				},
				{
					id: "notifications",
					label: "Notifications",
					path: "cloud/operations/notifications",
					icon: BellIcon,
					children: [
						{
							id: "targets",
							label: "Notification Targets",
							path: "cloud/operations/notifications/targets",
						},
						{
							id: "rules",
							label: "Notification Rules",
							path: "cloud/operations/notifications/rules",
						},
						{
							id: "history",
							label: "Notification History",
							path: "cloud/operations/notifications/history",
						},
					],
				},
				{
					id: "access-control",
					label: "Access Control",
					path: "cloud/administration/access-control",
					icon: ShieldCheckIcon,
					children: [
						{
							id: "users",
							label: "Users",
							path: "cloud/administration/access-control/users",
						},
						{
							id: "groups",
							label: "Groups",
							path: "cloud/administration/access-control/groups",
						},
						{
							id: "roles",
							label: "Roles",
							path: "cloud/administration/access-control/roles",
						},
						{
							id: "api-tokens",
							label: "API Tokens",
							path: "cloud/administration/access-control/api-tokens",
						},
						{
							id: "permissions",
							label: "Permissions",
							path: "cloud/administration/access-control/permissions",
						},
					],
				},
				{
					id: "resource-policies",
					label: "Resource Policies",
					path: "cloud/administration/resource-policies",
					icon: ScalesIcon,
					children: [
						{
							id: "policies",
							label: "Policies",
							path: "cloud/administration/resource-policies/policies",
						},
						{
							id: "assignments",
							label: "Assignments",
							path: "cloud/administration/resource-policies/assignments",
						},
						{
							id: "quotas",
							label: "Quotas",
							path: "cloud/administration/resource-policies/quotas",
						},
					],
				},
				{
					id: "certificates",
					label: "Certificates",
					path: "cloud/administration/certificates",
					icon: CertificateIcon,
					children: [
						{
							id: "list",
							label: "Certificates",
							path: "cloud/administration/certificates/list",
						},
						{
							id: "acme",
							label: "ACME",
							path: "cloud/administration/certificates/acme",
						},
						{
							id: "authorities",
							label: "Certificate Authorities",
							path: "cloud/administration/certificates/authorities",
						},
					],
				},
				{
					id: "providers-integrations",
					label: "Providers & Integrations",
					path: "cloud/administration",
					icon: GlobeIcon,
					children: [
						{
							id: "providers",
							label: "Providers",
							path: "cloud/administration/providers",
						},
						{
							id: "integrations",
							label: "Integrations",
							path: "cloud/administration/integrations",
						},
					],
				},
			],
		},
	],
};

/**
 * Standalone pages of the Domains sub-menu. They are reachable from the global
 * navigation only, so they must not be detected as a domain resource.
 */
const DOMAIN_STATIC_PAGES = new Set(["overview", "registrations", "transfers"]);

const DOMAIN_WORKSPACES: readonly DomainWorkspaceDefinition[] = [
	CLOUD_WORKSPACE,
	{
		id: "domains",
		label: "Domains",
		basePath: "domains",
		parentPath: "domains/overview",
		// The Domains pages live in the global tree, under the Domains
		// sub-menu: the workspace keeps the URL context but repeats none of
		// them in a contextual section.
		sections: [],
	},
	{
		id: "telecom",
		label: "Telecom",
		basePath: "telecom",
		sections: [
			{
				id: "domain-telecom",
				label: "Telecom",
				items: [
					{
						label: "Overview",
						path: "telecom/overview",
						implemented: true,
					},
					{ label: "Connectivity", path: "telecom/connectivity" },
					{ label: "IP & Numbering", path: "telecom/ip-numbering" },
					{
						label: "Internet & Routing",
						path: "telecom/internet-routing",
					},
					{
						label: "Private Networks",
						path: "telecom/private-networks",
					},
					{ label: "Voice & Telephony", path: "telecom/voice" },
					{ label: "Operator Services", path: "telecom/operators" },
					{
						label: "Monitoring & Quality",
						path: "telecom/monitoring",
					},
					{ label: "Operations", path: "telecom/operations" },
				],
			},
		],
	},
	{
		id: "ai",
		label: "AI",
		basePath: "ai",
		sections: [
			{
				id: "domain-ai",
				label: "AI",
				items: [
					{ label: "Agents", path: "ai/agents", implemented: true },
					{
						label: "AI Gateway",
						path: "ai/ai-gateway",
						implemented: true,
					},
					{
						label: "AI Search",
						path: "ai/ai-search",
						implemented: true,
					},
					{
						label: "MCP Servers",
						path: "ai/mcp-servers",
						implemented: true,
					},
					{ label: "Models", path: "ai/models", implemented: true },
					{ label: "Vectorize", path: "ai/vectorize", implemented: true },
					{
						label: "AI Services",
						path: "ai/workers-ai",
						implemented: true,
					},
				],
			},
		],
	},
	{
		id: "storage",
		label: "Data & Storage",
		basePath: "r2",
		sections: [
			{
				id: "domain-storage",
				label: "Data & Storage",
				items: [
					{ label: "Overview", path: "r2/overview", implemented: true },
					{ label: "Object Storage", path: "r2" },
					{
						label: "Key-Value Storage",
						path: "r2/kv",
						implemented: true,
					},
					{ label: "SQL Databases", path: "r2/d1", implemented: true },
					{
						label: "Database Connectivity",
						path: "r2/hyperdrives",
						implemented: true,
					},
					{
						label: "Build Artifacts",
						path: "r2/artifacts",
						implemented: true,
					},
					{ label: "K2", path: "r2/k2", implemented: true },
					{
						label: "Data Catalog",
						path: "r2/data-catalog",
						implemented: true,
					},
					{
						label: "Analytics",
						path: "r2/analytics-engine",
						implemented: true,
					},
					{ label: "Secrets Management", path: "r2/secrets-store" },
				],
			},
		],
	},
	{
		id: "media",
		label: "Media",
		basePath: "media",
		sections: [
			{
				id: "domain-media",
				label: "Media",
				items: [
					{ label: "Videos", path: "media/videos", implemented: true },
					{ label: "Hosting", path: "media/hosted", implemented: true },
					{ label: "Streaming", path: "media/stream", implemented: true },
					{
						label: "Transformations",
						path: "media/transformations",
						implemented: true,
					},
					{ label: "Analytics", path: "media/analytics", implemented: true },
					{ label: "Plans", path: "media/plans", implemented: true },
				],
			},
		],
	},
	{
		id: "realtime",
		label: "Realtime",
		basePath: "realtime",
		sections: [
			{
				id: "domain-realtime",
				label: "Realtime",
				items: [
					{ label: "Kit", path: "realtime/kit", implemented: true },
					{ label: "SFU", path: "realtime/sfu", implemented: true },
					{ label: "TURN", path: "realtime/turn", implemented: true },
					{ label: "MoQ", path: "realtime/moq", implemented: true },
					{
						label: "Analytics",
						path: "realtime/analytics",
						implemented: true,
					},
				],
			},
		],
	},
	{
		id: "development",
		label: "Development & Runtime",
		basePath: "workers",
		sections: [
			{
				id: "domain-development",
				label: "Development & Runtime",
				items: [
					{ label: "Overview", path: "workers", implemented: true },
					{
						label: "Persistent Objects",
						path: "workers/durable-objects",
						implemented: true,
					},
					{
						label: "Containers",
						path: "workers/containers",
						implemented: true,
					},
					{
						label: "Message Queues",
						path: "workers/queues",
						implemented: true,
					},
					{
						label: "Workflows",
						path: "workers/workflows",
						implemented: true,
					},
					{
						label: "Browser Rendering",
						path: "workers/browser-run",
						implemented: true,
					},
					{
						label: "Observability",
						path: "workers/observability",
						implemented: true,
					},
					{
						label: "Platforms",
						path: "workers/platforms",
						implemented: true,
					},
					{ label: "VPC", path: "workers/vpc", implemented: true },
					{
						label: "Feature Flags",
						path: "workers/flagship",
						implemented: true,
					},
					{ label: "Plans", path: "workers/plans", implemented: true },
				],
			},
		],
	},
	{
		id: "applicationSecurity",
		label: "Application Security",
		basePath: "security",
		sections: [
			{
				id: "domain-application-security",
				label: "Application Security",
				items: [
					{
						label: "Overview",
						path: "security/overview",
						implemented: true,
					},
					{
						label: "Web Application Firewall",
						path: "security/waf",
						implemented: true,
					},
					{
						label: "Human Verification",
						path: "security/turnstile",
						implemented: true,
					},
					{
						label: "Domain Access Restrictions",
						path: "security/dls",
						implemented: true,
					},
					{
						label: "Bot Management",
						path: "security/botbase",
						implemented: true,
					},
					{
						label: "Asset Inventory",
						path: "security/inventory",
						implemented: true,
					},
				],
			},
		],
	},
	{
		id: "zeroTrust",
		label: "Identity & Access",
		basePath: "one",
		sections: [
			{
				id: "domain-zero-trust",
				label: "Identity & Access",
				items: [
					{ label: "Overview", path: "one/overview", implemented: true },
					{
						label: "Access Controls",
						path: "one/access-controls/overview",
						implemented: true,
					},
					{
						label: "Browser Isolation",
						path: "one/browser-isolation/overview",
						implemented: true,
					},
					{
						label: "Data Loss Prevention",
						path: "one/dlp/overview",
						implemented: true,
					},
					{
						label: "Email Security",
						path: "one/email-security/overview",
						implemented: true,
					},
					{
						label: "Insights",
						path: "one/insights/overview",
						implemented: true,
					},
					{
						label: "Cloud & SaaS Integrations",
						path: "one/integrations/cloud-and-saas",
						implemented: true,
					},
					{
						label: "Identity Provider Integrations",
						path: "one/integrations/idp",
						implemented: true,
					},
					{
						label: "Service Integrations",
						path: "one/integrations/services",
						implemented: true,
					},
					{
						label: "Webhooks",
						path: "one/integrations/webhooks",
						implemented: true,
					},
					{
						label: "Reusable Components",
						path: "one/reusable-components/lists",
						implemented: true,
					},
					{
						label: "Traffic Controls",
						path: "one/traffic-controls/overview",
						implemented: true,
					},
					{
						label: "Team Resources",
						path: "one/team-resources/overview",
						implemented: true,
					},
					{
						label: "Cloud & SaaS Findings",
						path: "one/cloud-saas-findings/overview",
						implemented: true,
					},
					{
						label: "Workload Security",
						path: "one/cloud-workload-security/deployments",
						implemented: true,
					},
					{ label: "Settings", path: "one/settings", implemented: true },
				],
			},
		],
	},
	{
		id: "networks",
		label: "Networks",
		basePath: "network",
		sections: [
			{
				id: "domain-networks",
				label: "Networks",
				items: [
					{
						label: "Overview",
						path: "network/overview",
						implemented: true,
					},
					{ label: "Tunnels", path: "network/tunnels", implemented: true },
					{ label: "Mesh", path: "network/mesh", implemented: true },
					{
						label: "Routes",
						path: "network/routes-config",
						implemented: true,
					},
					{
						label: "Network Insights",
						path: "network/networking-insights",
						implemented: true,
					},
					{
						label: "Custom IP Addresses",
						path: "network/ip-addresses/custom-ips",
						implemented: true,
					},
					{
						label: "Proxy IP Addresses",
						path: "network/ip-addresses/proxy-ips",
						implemented: true,
					},
				],
			},
		],
	},
	{
		id: "threats",
		label: "Threat Detection & Response",
		basePath: "threats-defense",
		sections: [
			{
				id: "domain-threats",
				label: "Threat Detection & Response",
				items: [
					{
						label: "Overview",
						path: "threats-defense",
						implemented: true,
					},
					{
						label: "Investigate",
						path: "threats-defense/investigate",
						implemented: true,
					},
					{
						label: "Threat Intelligence",
						path: "threats-defense/threat-intelligence",
						implemented: true,
					},
				],
			},
		],
	},
	{
		id: "delivery",
		label: "Delivery & Performance",
		basePath: "bulk",
		sections: [
			{
				id: "domain-delivery",
				label: "Delivery & Performance",
				items: [
					{
						label: "Load Balancing",
						path: "bulk/load-balancing",
						implemented: true,
					},
					{ label: "Redirects", path: "bulk/redirects", implemented: true },
					{
						label: "Tag Management",
						path: "bulk/tag-management",
						implemented: true,
					},
				],
			},
		],
	},
	{
		id: "monetize",
		label: "Commerce",
		basePath: "monetize",
		sections: [
			{
				id: "domain-monetize",
				label: "Commerce",
				items: [
					{
						label: "Commerce Gateway",
						path: "monetize/monetization-gateway",
						implemented: true,
					},
				],
			},
		],
	},
	{
		id: "observability",
		label: "Observability",
		basePath: "observability",
		sections: [
			{
				id: "domain-observability",
				label: "Observability",
				items: [
					{
						label: "Overview",
						path: "observability",
						implemented: true,
					},
					{ label: "Logs", path: "observability/logs", implemented: true },
					{ label: "Traces", path: "observability/traces", implemented: true },
					{
						label: "Analytics",
						path: "observability/analytics",
						implemented: true,
					},
					{
						label: "Export Destinations",
						path: "observability/exporter/destinations",
						implemented: true,
					},
					{
						label: "Export Logs",
						path: "observability/exporter/logs",
						implemented: true,
					},
					{
						label: "Custom Notifications",
						path: "observability/notifications/custom",
						implemented: true,
					},
					{
						label: "Notification Destinations",
						path: "observability/notifications/destinations",
						implemented: true,
					},
					{
						label: "Notification Silences",
						path: "observability/notifications/silences",
						implemented: true,
					},
					{
						label: "Astron Collection Notifications",
						path: "observability/notifications/astron-collection",
						implemented: true,
					},
					{ label: "Usage", path: "observability/usage", implemented: true },
				],
			},
		],
	},
];

function resolveDestinationChildren(
	organizationId: string,
	destination: NavigationDestinationId,
	recentPages: readonly RecentNavigationPage[] = [],
): PanelNavigationChild[] | undefined {
	if (destination === "compute") {
		return resolveComputeChildren(organizationId);
	}

	if (destination === "development") {
		return resolveDevelopmentChildren(organizationId);
	}

	if (destination === "history") {
		return recentPages.map((page) => ({
			id: `history.recent.${page.path.replaceAll("/", ".")}`,
			label: `${page.section} / ${page.item}`,
			href: organizationPath(organizationId, page.path),
			implemented: true,
		}));
	}

	if (destination === "telecom") return undefined;

	if (destination === "infrastructure") {
		return resolveCloudChildren(organizationId);
	}

	if (destination === "domains") {
		return resolveDomainChildren(organizationId);
	}

	const workspace = DOMAIN_WORKSPACES.find(
		(candidate) => candidate.id === destination,
	);
	if (!workspace) return undefined;

	return workspace.sections.flatMap((section) =>
		section.items.map((entry) => {
			const relativePath =
				entry.path === workspace.basePath
					? "index"
					: entry.path.startsWith(`${workspace.basePath}/`)
						? entry.path.slice(workspace.basePath.length + 1)
						: entry.path;
			return {
				id: `${workspace.id}.${relativePath.replaceAll("/", ".")}`,
				label: entry.label,
				href: organizationPath(organizationId, entry.path),
				implemented: entry.implemented === true,
			};
		}),
	);
}

function decodeSegment(segment: string): string {
	try {
		return decodeURIComponent(segment);
	} catch {
		return segment;
	}
}

/** Segments of `pathname` inside the URL's organization, decoded. */
function workspaceSegments(pathname: string, organizationId: string): string[] {
	const parts = pathname.split("/").filter(Boolean);
	const root = parts[0];
	if (!root || decodeSegment(root) !== organizationId) return [];
	return parts.slice(1).map(decodeSegment);
}

function startsWithSegments(
	segments: readonly string[],
	prefix: readonly string[],
): boolean {
	return prefix.every((segment, index) => segments[index] === segment);
}

/**
 * Resolves the workspace a URL belongs to and the sections it adds.
 *
 * It never mutates the global tree: a domain or resource workspace only
 * enriches the sidebar, so the organization-wide navigation stays reachable
 * from anywhere.
 */
export function resolveWorkspaceNavigation(opts: {
	organizationId: string;
	environment: NavigationEnvironment;
	permissions?: unknown;
	license?: LicenseTier | null;
	pathname: string;
	recentPages?: readonly RecentNavigationPage[];
}): WorkspaceNavigation {
	const navigation = createNavigation(opts);
	const segments = workspaceSegments(opts.pathname, opts.organizationId);
	const resourceKinds = Object.keys(
		RESOURCE_WORKSPACES,
	) as ContextualResource["kind"][];

	// Resources are the most specific context: `domains/dom_1/dns` is the DNS
	// of one domain, not the Domains workspace.
	let resource:
		| { kind: ContextualResource["kind"]; id: string; depth: number }
		| undefined;
	for (const kind of resourceKinds) {
		const definition = RESOURCE_WORKSPACES[kind];
		if (segments.length <= definition.match.length) continue;
		if (!startsWithSegments(segments, definition.match)) continue;
		if (resource && resource.depth >= definition.match.length) continue;
		const id = segments[definition.match.length];
		if (!id) continue;
		if (kind === "domain" && DOMAIN_STATIC_PAGES.has(id)) continue;
		resource = { kind, id, depth: definition.match.length };
	}

	if (resource) {
		const definition = RESOURCE_WORKSPACES[resource.kind];
		const section = resolveContextualNavigation({
			organizationId: opts.organizationId,
			resource: { kind: resource.kind, id: resource.id },
		});

		// A resource is opened from its product surface (or from the
		// infrastructure umbrella), which gives the breadcrumb its parent.
		const parentCandidates = [
			...DOMAIN_WORKSPACES.map((workspace) => ({
				id: `domain:${workspace.id}`,
				label: workspace.label,
				basePath: workspace.basePath,
				parentPath: workspace.parentPath ?? workspace.basePath,
			})),
			{
				id: INFRASTRUCTURE_WORKSPACE.id,
				label: INFRASTRUCTURE_WORKSPACE.label,
				basePath: INFRASTRUCTURE_WORKSPACE.basePath,
				parentPath: INFRASTRUCTURE_WORKSPACE.basePath,
			},
		];
		const parent = parentCandidates
			.filter(
				(candidate) =>
					definition.basePath === candidate.basePath ||
					definition.basePath.startsWith(`${candidate.basePath}/`),
			)
			.sort(
				(first, second) => second.basePath.length - first.basePath.length,
			)[0];

		return {
			...navigation,
			workspace: {
				kind: "resource",
				id: `resource:${resource.kind}:${resource.id}`,
				label: section.label ?? definition.label,
				basePath: definition.basePath,
				parent: parent
					? {
							id: parent.id,
							label: parent.label,
							href: organizationPath(opts.organizationId, parent.parentPath),
						}
					: undefined,
			},
			contextual: [section],
			exclusive: resource.kind === "domain",
		};
	}

	if (startsWithSegments(segments, [INFRASTRUCTURE_WORKSPACE.basePath])) {
		return {
			...navigation,
			workspace: {
				kind: "infrastructure",
				id: INFRASTRUCTURE_WORKSPACE.id,
				label: INFRASTRUCTURE_WORKSPACE.label,
				basePath: INFRASTRUCTURE_WORKSPACE.basePath,
			},
			contextual: INFRASTRUCTURE_WORKSPACE.sections.map((section) =>
				buildWorkspaceSection(opts.organizationId, section),
			),
			exclusive: false,
		};
	}

	const domain = [...DOMAIN_WORKSPACES]
		.filter((candidate) =>
			startsWithSegments(segments, candidate.basePath.split("/")),
		)
		.sort((first, second) => second.basePath.length - first.basePath.length)[0];

	if (domain) {
		return {
			...navigation,
			workspace: {
				kind: "domain",
				id: `domain:${domain.id}`,
				label: domain.label,
				basePath: domain.basePath,
				parent:
					domain.exclusive && domain.parent
						? {
								id: "global",
								label: domain.parent.label,
								href: organizationPath(opts.organizationId, domain.parent.path),
							}
						: undefined,
			},
			contextual: domain.sections.map((section) =>
				buildWorkspaceSection(opts.organizationId, section),
			),
			exclusive: domain.exclusive === true,
		};
	}

	return {
		...navigation,
		workspace: GLOBAL_WORKSPACE,
		contextual: [],
		exclusive: false,
	};
}
