import { describe, expect, it } from "vitest";
import {
	ACCOUNT_DESTINATIONS,
	CLOUD_DESTINATION_MIN_LICENSE,
	createNavigation,
	findActiveNavigation,
	isNavigationChildActive,
	isNavigationItemActive,
	organizationPath,
	resolveRecentNavigationPage,
	resolveContextualNavigation,
	resolveWorkspaceNavigation,
	type PanelNavigation,
	type PanelNavigationItem,
} from "@/components/panel/navigation";
import { updateRecentPages } from "@/components/panel/recent-pages";

const ORG = "a6369a86743b73f5e58185a5e3b43a1b";
const OTHER_ORG = "f3dd4410d9bcf95499d55f6d569b87e5";

const ALL_PERMISSIONS = {
	dnsProvider: { read: true },
	traffic: { read: true },
};

function create(
	options: Partial<Parameters<typeof createNavigation>[0]> = {},
): PanelNavigation {
	return createNavigation({
		organizationId: ORG,
		environment: "cloud",
		permissions: ALL_PERMISSIONS,
		license: "enterprise",
		...options,
	});
}

function items(navigation: PanelNavigation): PanelNavigationItem[] {
	return navigation.sections.flatMap((section) => section.items);
}

function ids(navigation: PanelNavigation): string[] {
	return items(navigation).map((item) => item.id);
}

describe("panel navigation structure", () => {
	it("renders the requested sections in order", () => {
		const navigation = create();

		expect(navigation.sections.map((section) => section.id)).toEqual([
			"main",
			"infrastructure",
			"protect",
		]);
		expect(navigation.sections.map((section) => section.label)).toEqual([
			undefined,
			"Infrastructure",
			"Protect & Connect",
		]);
	});

	it("renders the primary group without a heading", () => {
		const main = create().sections[0];

		expect(main?.id).toBe("main");
		expect(main?.label).toBeUndefined();
		expect(main?.items.map((item) => item.id)).toEqual([
			"home",
			"history",
			"domains",
			"observability",
		]);
		expect(main?.items.map((item) => item.label)).toEqual([
			"Overview",
			"Activity",
			"Domains",
			"Observability",
		]);
	});

	it("keeps Gérer le compte out of the section tree as a utility entry", () => {
		const navigation = create();

		expect(navigation.footer.map((item) => item.id)).toEqual(["account"]);
		expect(navigation.footer[0]?.label).toBe("Account Settings");
		expect(navigation.footer[0]?.expandable).toBe(true);
		expect(
			navigation.sections
				.flatMap((section) => section.items)
				.map((item) => item.id),
		).not.toContain("account");
	});

	it("keeps available account pages active under the persistent entry", () => {
		expect(ACCOUNT_DESTINATIONS.length).toBeGreaterThan(0);
		expect(ACCOUNT_DESTINATIONS.every((entry) => entry.implemented)).toBe(true);
		expect(ACCOUNT_DESTINATIONS.map((entry) => entry.path)).toContain(
			"account/members",
		);
	});

	it("declares every destination of the panel", () => {
		expect(ids(create())).toEqual([
			"home",
			"history",
			"domains",
			"observability",
			"infrastructure",
			"telecom",
			"compute",
			"storage",
			"media",
			"realtime",
			"development",
			"applicationSecurity",
			"zeroTrust",
			"networks",
			"threats",
			"delivery",
		]);
	});

	it("splits worker services between Compute and Development & Runtime", () => {
		const all = items(create());
		const compute = all.find((item) => item.id === "compute");
		const development = all.find((item) => item.id === "development");

		expect(compute?.children?.map((child) => child.label)).toEqual([
			"Workers & Pages",
			"Workers for Platforms",
			"Containers",
			"Durable Objects",
			"Browser Rendering",
			"VPC",
		]);
		expect(development?.children?.map((child) => child.label)).toEqual([
			"Queues",
			"Workflows",
			"Observability",
			"Feature Flags",
			"Plans",
		]);

		const hrefs = all.flatMap(
			(item) =>
				item.children?.filter((child) => child.implemented).map((child) => child.href) ??
				[],
		);
		expect(new Set(hrefs).size).toBe(hrefs.length);
	});

	it("keeps the prescribed global hierarchy and order", () => {
		const navigation = create();

		expect(
			navigation.sections.map((section) => ({
				label: section.label,
				items: section.items.map((item) => item.label),
			})),
		).toEqual([
			{
				label: undefined,
				items: ["Overview", "Activity", "Domains", "Observability"],
			},
			{
				label: "Infrastructure",
				items: [
					"Cloud",
					"Telecom",
					"Compute",
					"Data & Storage",
					"Media",
					"Realtime",
					"Development & Runtime",
				],
			},
			{
				label: "Protect & Connect",
				items: [
					"Application Security",
					"Identity & Access",
					"Networks",
					"Threat Detection & Response",
					"Delivery & Performance",
				],
			},
		]);
		expect(navigation.footer.map((item) => item.label)).toEqual([
			"Account Settings",
		]);
	});

	it("labels the infrastructure destination as Cloud", () => {
		const cloud = items(create()).find((item) => item.id === "infrastructure");
		expect(cloud).toMatchObject({
			label: "Cloud",
			href: `/${ORG}/cloud/overview`,
			implemented: true,
		});
	});

	it("exposes active product routes under their global destinations", () => {
		const navigationItems = items(create());
		const childItems = (id: string) =>
			navigationItems.find((item) => item.id === id)?.children ?? [];

		expect(childItems("applicationSecurity").every((child) => child.implemented))
			.toBe(true);
		expect(childItems("networks").every((child) => child.implemented)).toBe(true);
		expect(childItems("media").every((child) => child.implemented)).toBe(true);
		expect(
			childItems("storage").find((child) =>
				child.href.endsWith("/r2/secrets-store"),
			)?.implemented,
		).toBe(false);
		expect(childItems("telecom")).toEqual([]);
	});

	it("gives Cloud a dropdown and keeps Telecom a simple workspace link", () => {
		const navigationItems = items(create());
		const cloud = navigationItems.find((item) => item.id === "infrastructure");
		const telecom = navigationItems.find((item) => item.id === "telecom");

		expect(cloud).toMatchObject({
			id: "infrastructure",
			label: "Cloud",
			href: `/${ORG}/cloud/overview`,
			implemented: true,
			expandable: true,
		});
		expect(cloud?.children?.map((child) => child.label)).toEqual([
			"Overview",
			"Access Control",
			"Settings",
		]);
		expect(cloud?.children?.map((child) => child.href)).toEqual([
			`/${ORG}/cloud/overview`,
			`/${ORG}/account/members`,
			`/${ORG}/account/configurations`,
		]);
		expect(cloud?.children?.every((child) => child.implemented)).toBe(true);
		expect(telecom).toMatchObject({
			id: "telecom",
			label: "Telecom",
			href: `/${ORG}/telecom/overview`,
			implemented: true,
			expandable: false,
		});
		expect(telecom?.children).toBeUndefined();
	});

	it("uses stable ids without duplicates", () => {
		const navigationIds = ids(create());

		expect(new Set(navigationIds).size).toBe(navigationIds.length);
	});
});

describe("panel navigation organization scope", () => {
	it("builds every href from the organization in the URL", () => {
		for (const item of items(create())) {
			expect(item.href.startsWith(`/${ORG}/`)).toBe(true);
		}
	});

	it("moves every destination when the organization changes", () => {
		const first = create({ organizationId: ORG });
		const second = create({ organizationId: OTHER_ORG });

		expect(items(first).map((item) => item.href)).not.toEqual(
			items(second).map((item) => item.href),
		);
		for (const item of items(second)) {
			expect(item.href.startsWith(`/${OTHER_ORG}/`)).toBe(true);
		}
	});

	it("encodes the organization and path segments exactly once", () => {
		expect(organizationPath(ORG, "home")).toBe(`/${ORG}/home`);
		expect(organizationPath(ORG, "security/zero-trust")).toBe(
			`/${ORG}/security/zero-trust`,
		);
	});

	it("activates global simple destinations", () => {
		const implemented = items(create()).filter((item) => item.implemented);

		expect(implemented.map((item) => item.id)).toEqual([
			"home",
			"observability",
			"infrastructure",
			"telecom",
		]);
		expect(implemented[0]?.href).toBe(`/${ORG}/home`);
	});

	it("shows recent visits in the Activity dropdown", () => {
		const navigation = create({
			recentPages: [
				{
					path: "workers/containers",
					section: "Compute",
					item: "Containers",
				},
				{ path: "domains/overview", section: "Domains", item: "Overview" },
				{
					path: "domains/example.com",
					section: "Domains",
					item: "example.com",
				},
			],
		});
		const activity = items(navigation).find((item) => item.id === "history");

		expect(activity?.children).toMatchObject([
			{
				id: "history.recent.workers.containers",
				label: "Compute / Containers",
				href: `/${ORG}/workers/containers`,
				implemented: true,
			},
			{
				id: "history.recent.domains.overview",
				label: "Domains / Overview",
				href: `/${ORG}/domains/overview`,
				implemented: true,
			},
			{
				id: "history.recent.domains.example.com",
				label: "Domains / example.com",
				href: `/${ORG}/domains/example.com`,
				implemented: true,
			},
		]);
	});

	it("does not show recent links hidden by the current permission or license", () => {
		const navigation = create({
			license: "free",
			recentPages: [
				{
					path: "workers/containers",
					section: "Compute",
					item: "Containers",
				},
				{ path: "r2/overview", section: "Data & Storage", item: "Overview" },
			],
		});
		const activity = items(navigation).find((item) => item.id === "history");

		expect(activity?.children?.map((child) => child.href)).toEqual([
			`/${ORG}/workers/containers`,
		]);
	});

	it("resolves visited pages from the global navigation without query strings", () => {
		const navigation = create();

		expect(
			resolveRecentNavigationPage(
				navigation,
				`/${ORG}/workers/containers?tab=deployments`,
			),
		).toEqual({
			path: "workers/containers",
			section: "Compute",
			item: "Containers",
		});
		expect(
			resolveRecentNavigationPage(
				navigation,
				`/${OTHER_ORG}/workers/containers`,
			),
		).toBeUndefined();
		expect(
			resolveRecentNavigationPage(navigation, `/${ORG}/domains/example.com`),
		).toEqual({
			path: "domains/example.com",
			section: "Domains",
			item: "example.com",
		});
	});

	it("moves a repeated visit to the front and keeps five recent pages", () => {
		const previous = Array.from({ length: 5 }, (_, index) => ({
			path: `ai/page-${index}`,
			section: "AI",
			item: `Page ${index}`,
		}));

		expect(
			updateRecentPages(previous, {
				path: "ai/page-3",
				section: "AI",
				item: "Page 3",
			}).map((page) => page.path),
		).toEqual([
			"ai/page-3",
			"ai/page-0",
			"ai/page-1",
			"ai/page-2",
			"ai/page-4",
		]);
		expect(
			updateRecentPages(previous, {
				path: "ai/page-5",
				section: "AI",
				item: "Page 5",
			}).map((page) => page.path),
		).toEqual([
			"ai/page-5",
			"ai/page-0",
			"ai/page-1",
			"ai/page-2",
			"ai/page-3",
		]);
	});

	it("activates present Domains pages in the submenu", () => {
		const domains = items(create()).find((item) => item.id === "domains");

		expect(domains).toMatchObject({
			implemented: false,
			expandable: true,
		});
		expect(domains?.children?.map((child) => child.href)).toEqual([
			`/${ORG}/domains/overview`,
			`/${ORG}/domains/registrations`,
			`/${ORG}/domains/transfers`,
		]);
		expect(domains?.children?.every((child) => child.implemented)).toBe(true);
	});

	it("keeps the whole tree without dead links", () => {
		for (const item of items(create())) {
			if (item.implemented) continue;
			expect(item.href.startsWith(`/${ORG}/`)).toBe(true);
			expect(item.href).not.toBe(`/${ORG}/home`);
		}
	});

	it("keeps Telecom simple while Cloud and other destinations expand", () => {
		const navigation = create();
		// `account` is pinned to the footer, outside the scrollable tree.
		const expandable = [...items(navigation), ...navigation.footer]
			.filter((item) => item.expandable)
			.map((item) => item.id);

		expect(expandable).not.toContain("home");
		expect(expandable).toEqual(
			expect.arrayContaining([
				"history",
				"domains",
				"observability",
				"compute",
				"infrastructure",
				"account",
			]),
		);
		expect(expandable).not.toContain("telecom");
	});

	it("omits the new-product badges", () => {
		expect(items(create()).some((item) => item.badge)).toBe(false);
	});
});

describe("panel navigation active entry", () => {
	it("does not mark Activity active in the global workspace", () => {
		const activity = items(
			create({
				recentPages: [
					{
						path: "workers/containers",
						section: "Compute",
						item: "Containers",
					},
				],
			}),
		).find((item) => item.id === "history");
		if (!activity) throw new Error("Activity navigation item is missing");

		expect(
			isNavigationItemActive(activity, {
				pathname: `/${ORG}/workers/containers`,
			}),
		).toBe(false);
		const recentChild = activity.children?.[0];
		if (!recentChild) throw new Error("Recent Activity link is missing");
		expect(
			isNavigationChildActive(activity, recentChild, {
				pathname: `/${ORG}/workers/containers`,
			}),
		).toBe(false);
	});

	it("selects the Cloud overview inside its dropdown", () => {
		const cloud = items(create()).find((item) => item.id === "infrastructure");
		const overview = cloud?.children?.[0];
		const accessControl = cloud?.children?.[1];
		if (!cloud || !overview || !accessControl) {
			throw new Error("Cloud navigation is missing");
		}

		expect(
			isNavigationChildActive(cloud, overview, {
				pathname: `/${ORG}/cloud/overview`,
			}),
		).toBe(true);
		expect(
			isNavigationChildActive(cloud, overview, {
				pathname: `/${ORG}/cloud/compute`,
			}),
		).toBe(false);
		expect(
			isNavigationChildActive(cloud, accessControl, {
				pathname: `/${ORG}/account/members`,
			}),
		).toBe(true);
	});

	it("selects Accueil on the workspace home", () => {
		const navigation = create();
		const active = findActiveNavigation(navigation, {
			pathname: `/${ORG}/home`,
		});

		expect(active?.section.id).toBe("main");
		expect(active?.item.id).toBe("home");
	});

	it("keeps Accueil selected on nested workspace pages", () => {
		const home = items(create()).find((item) => item.id === "home");

		expect(
			home && isNavigationItemActive(home, { pathname: `/${ORG}/home/` }),
		).toBe(true);
		expect(
			home && isNavigationItemActive(home, { pathname: `/${ORG}/home/stats` }),
		).toBe(true);
	});

	it("does not select Accueil for another organization's route", () => {
		const home = items(create()).find((item) => item.id === "home");

		expect(
			home && isNavigationItemActive(home, { pathname: `/${OTHER_ORG}/home` }),
		).toBe(false);
		expect(
			findActiveNavigation(create(), { pathname: `/${OTHER_ORG}/home` }),
		).toBeUndefined();
	});

	it("does not treat a longer sibling path as a prefix match", () => {
		const home = items(create()).find((item) => item.id === "home");

		expect(
			home && isNavigationItemActive(home, { pathname: `/${ORG}/homestead` }),
		).toBe(false);
	});
});

describe("panel navigation permissions", () => {
	it("hides destinations whose permission is missing", () => {
		const navigation = create({ permissions: {} });
		const navigationIds = ids(navigation);

		expect(navigationIds).not.toContain("domains");
		expect(navigationIds).not.toContain("observability");
		expect(navigationIds).toContain("home");
		expect(navigation.footer.map((item) => item.id)).toEqual(["account"]);
	});

	it("shows destinations granted by the permission map", () => {
		const navigation = create({
			permissions: { dnsProvider: { read: true }, traffic: { read: false } },
		});
		const navigationIds = ids(navigation);

		expect(navigationIds).toContain("domains");
		expect(navigationIds).not.toContain("observability");
	});

	it("treats an unknown permission map as no permissions", () => {
		expect(ids(create({ permissions: undefined }))).not.toContain("domains");
	});
});

describe("panel navigation licences", () => {
	it("never gates a self-hosted workspace", () => {
		const unlicensed = ids(create({ environment: "self", license: null }));
		const enterprise = ids(create({ environment: "self", license: "enterprise" }));

		expect(unlicensed).toEqual(enterprise);
		expect(unlicensed).toContain("zeroTrust");
	});

	it("expands the Cloud menu with the licence tier", () => {
		const free = ids(create({ environment: "cloud", license: "free" }));
		const pro = ids(create({ environment: "cloud", license: "pro" }));
		const enterprise = ids(
			create({ environment: "cloud", license: "enterprise" }),
		);

		expect(free).not.toContain("storage");
		expect(free).not.toContain("zeroTrust");
		expect(pro).toContain("storage");
		expect(pro).not.toContain("zeroTrust");
		expect(enterprise).toContain("storage");
		expect(enterprise).toContain("zeroTrust");
	});

	it("treats an unlicensed Cloud workspace as Free", () => {
		expect(ids(create({ license: null }))).toEqual(
			ids(create({ license: "free" })),
		);
	});

	it("declares an entitlement for every destination", () => {
		const declared = Object.keys(CLOUD_DESTINATION_MIN_LICENSE);

		expect(new Set(declared).size).toBe(declared.length);
		expect(declared).toEqual(
			expect.arrayContaining([
				"home",
				"domains",
				"storage",
				"zeroTrust",
				"account",
			]),
		);
	});
});

describe("workspace navigation", () => {
	function resolve(pathname: string) {
		return resolveWorkspaceNavigation({
			organizationId: ORG,
			environment: "cloud",
			permissions: ALL_PERMISSIONS,
			license: "enterprise",
			pathname,
		});
	}

	it("stays global when the URL is not inside a workspace", () => {
		const resolved = resolve(`/${ORG}/home`);

		expect(resolved.workspace.kind).toBe("global");
		expect(resolved.workspace.id).toBe("global");
		expect(resolved.contextual).toEqual([]);
		expect(resolved.sections.map((section) => section.id)).toEqual([
			"main",
			"infrastructure",
			"protect",
		]);
	});

	it("opens the infrastructure workspace without removing global sections", () => {
		const resolved = resolve(`/${ORG}/infrastructure/network`);

		expect(resolved.workspace).toMatchObject({
			kind: "infrastructure",
			id: "infrastructure",
			label: "Infrastructure",
		});
		expect(resolved.sections.map((section) => section.id)).toEqual([
			"main",
			"infrastructure",
			"protect",
		]);
		expect(resolved.contextual.map((section) => section.label)).toEqual([
			"Overview",
			"Compute",
			"Storage Infrastructure",
			"Infrastructure Networking",
			"Infrastructure Security",
			"Operations",
		]);
	});

	it("opens the domain workspace of a product surface", () => {
		const resolved = resolve(`/${ORG}/ai/agents`);

		expect(resolved.workspace).toMatchObject({
			kind: "domain",
			id: "domain:ai",
			label: "AI",
		});
		expect(resolved.contextual).toHaveLength(1);
		expect(
			resolved.contextual[0]?.items.map((item) => item.href),
		).toContain(`/${ORG}/ai/agents`);
	});

	it("opens a Telecom workspace with its current route active", () => {
		const resolved = resolve(`/${ORG}/telecom/overview`);

		expect(resolved.workspace).toMatchObject({
			kind: "domain",
			id: "domain:telecom",
			label: "Telecom",
			basePath: "telecom",
		});
		expect(resolved.contextual[0]?.items.map((item) => item.label)).toEqual([
			"Overview",
			"Connectivity",
			"IP & Numbering",
			"Internet & Routing",
			"Private Networks",
			"Voice & Telephony",
			"Operator Services",
			"Monitoring & Quality",
			"Operations",
		]);
		expect(resolved.contextual[0]?.items[0]).toMatchObject({
			href: `/${ORG}/telecom/overview`,
			implemented: true,
		});
		expect(
			resolved.contextual
				.flatMap((section) => section.items)
				.slice(1)
				.every((item) => !item.implemented),
		).toBe(true);
		expect(resolved.footer.map((item) => item.label)).toEqual([
			"Account Settings",
		]);
	});

	it("activates AI workspace entries that have route files", () => {
		const resolved = resolve(`/${ORG}/ai/agents`);

		expect(
			resolved.contextual
				.flatMap((section) => section.items)
				.every((item) => item.implemented),
		).toBe(true);
	});

	it("prefers the resource workspace inside a product domain", () => {
		const resolved = resolve(`/${ORG}/domains/dom_123/dns/records`);

		expect(resolved.workspace.kind).toBe("resource");
		expect(resolved.workspace.id).toBe("resource:domain:dom_123");
		expect(resolved.workspace.parent).toMatchObject({
			id: "domain:domains",
			label: "Domains",
			href: `/${ORG}/domains/overview`,
		});
		expect(resolved.contextual[0]?.items[0]).toMatchObject({
			label: "Overview",
			href: `/${ORG}/domains/dom_123`,
			implemented: true,
		});
		expect(
			resolved.contextual[0]?.items.slice(1).every((item) => !item.implemented),
		).toBe(true);
		expect(resolved.contextual[0]?.items.map((item) => item.label)).toContain(
			"DNS",
		);
		const dns = resolved.contextual[0]?.items.find(
			(item) => item.label === "DNS",
		);
		expect(dns?.expandable).toBe(true);
		expect(dns?.children).toEqual([
			{
				id: "domain.dns.records",
				label: "Records",
				href: `/${ORG}/domains/dom_123/dns/records`,
				implemented: true,
			},
			{
				id: "domain.dns.analytics",
				label: "Analytics",
				href: `/${ORG}/domains/dom_123/dns/analytics`,
				implemented: false,
			},
			{
				id: "domain.dns.settings",
				label: "Settings",
				href: `/${ORG}/domains/dom_123/dns/settings`,
				implemented: false,
			},
		]);
		expect(
			dns?.children?.some((child) =>
				isNavigationChildActive(dns, child, {
					pathname: `/${ORG}/domains/dom_123/dns/records`,
				}),
			),
		).toBe(true);
	});

	it("detects an infrastructure resource under the infrastructure umbrella", () => {
		const resolved = resolve(
			`/${ORG}/infrastructure/servers/srv_1/monitoring`,
		);

		expect(resolved.workspace.id).toBe("resource:server:srv_1");
		expect(resolved.workspace.parent).toMatchObject({
			id: "infrastructure",
			label: "Infrastructure",
		});
	});

	it("ignores a path that belongs to another organization", () => {
		const resolved = resolve(`/${OTHER_ORG}/ai/agents`);

		expect(resolved.workspace.kind).toBe("global");
		expect(resolved.contextual).toEqual([]);
	});
});

describe("panel contextual navigation", () => {
	it("adds the domain destinations under the workspace tree", () => {
		const section = resolveContextualNavigation({
			organizationId: ORG,
			resource: { kind: "domain", id: "dom_123" },
		});

		expect(section.id).toBe("contextual-domain");
		expect(section.label).toBe("Domain");
		expect(section.items.map((item) => item.label)).toEqual([
			"Overview",
			"History",
			"AI Crawl Control",
			"Agent Readiness",
			"Analytics",
			"Observability",
			"DNS",
			"Email",
			"SSL/TLS",
			"Security",
			"Access",
			"Speed",
			"Caching",
			"Workers Routes",
			"Rules",
			"Error Pages",
			"Network",
			"Traffic",
			"Web3",
		]);
		expect(section.items.find((item) => item.label === "Observability")?.badge).toBe(
			"New",
		);
		expect(section.items.find((item) => item.label === "Error Pages")?.badge).toBe(
			"New",
		);
		expect(section.items.map((item) => item.href)).toEqual([
			`/${ORG}/domains/dom_123`,
			`/${ORG}/domains/dom_123/history`,
			`/${ORG}/domains/dom_123/ai-crawl-control`,
			`/${ORG}/domains/dom_123/agent-readiness`,
			`/${ORG}/domains/dom_123/analytics`,
			`/${ORG}/domains/dom_123/observability`,
			`/${ORG}/domains/dom_123/dns`,
			`/${ORG}/domains/dom_123/email`,
			`/${ORG}/domains/dom_123/ssl`,
			`/${ORG}/domains/dom_123/security`,
			`/${ORG}/domains/dom_123/access`,
			`/${ORG}/domains/dom_123/speed`,
			`/${ORG}/domains/dom_123/caching`,
			`/${ORG}/domains/dom_123/workers-routes`,
			`/${ORG}/domains/dom_123/rules`,
			`/${ORG}/domains/dom_123/error-pages`,
			`/${ORG}/domains/dom_123/network`,
			`/${ORG}/domains/dom_123/traffic`,
			`/${ORG}/domains/dom_123/web3`,
		]);
	});

	it("prepares instance and bucket environments without linking a missing page", () => {
		const instance = resolveContextualNavigation({
			organizationId: ORG,
			resource: { kind: "instance", id: "inst_1" },
		});
		const bucket = resolveContextualNavigation({
			organizationId: ORG,
			resource: { kind: "bucket", id: "bkt_1" },
		});

		expect(instance.items.map((item) => item.label)).toEqual([
			"Overview",
			"Monitoring",
			"Configuration",
			"Network",
			"Storage",
			"Activity",
		]);
		expect(bucket.items.map((item) => item.label)).toEqual([
			"Overview",
			"Objects",
			"Access",
			"Lifecycle",
			"Monitoring",
		]);
		for (const item of [...instance.items, ...bucket.items]) {
			expect(item.implemented).toBe(false);
		}
	});
});

describe("panel workspace navigation", () => {
	function resolve(
		pathname: string,
		options: Partial<Parameters<typeof resolveWorkspaceNavigation>[0]> = {},
	) {
		return resolveWorkspaceNavigation({
			organizationId: ORG,
			environment: "cloud",
			permissions: ALL_PERMISSIONS,
			license: "enterprise",
			pathname,
			...options,
		});
	}

	it("keeps the global workspace on organization pages", () => {
		const resolved = resolve(`/${ORG}/home`);

		expect(resolved.workspace.kind).toBe("global");
		expect(resolved.workspace.id).toBe("global");
		expect(resolved.contextual).toEqual([]);
		expect(resolved.sections.map((section) => section.id)).toEqual([
			"main",
			"infrastructure",
			"protect",
		]);
	});

	it("opens the infrastructure workspace and links its existing routes", () => {
		const resolved = resolve(`/${ORG}/infrastructure/network`);

		expect(resolved.workspace.kind).toBe("infrastructure");
		expect(resolved.workspace.id).toBe("infrastructure");
		expect(resolved.contextual.map((section) => section.label)).toEqual([
			"Overview",
			"Compute",
			"Storage Infrastructure",
			"Infrastructure Networking",
			"Infrastructure Security",
			"Operations",
		]);
		const hrefs = resolved.contextual.flatMap((section) =>
			section.items.map((item) => item.href),
		);
		expect(hrefs).toContain(`/${ORG}/network/overview`);
		expect(hrefs).toContain(`/${ORG}/workers/containers`);
		expect(
			resolved.contextual
				.flatMap((section) => section.items)
				.filter((item) => item.implemented)
				.map((item) => item.href),
		).toEqual(
			expect.arrayContaining([
				`/${ORG}/workers/containers`,
				`/${ORG}/r2/overview`,
				`/${ORG}/network/overview`,
				`/${ORG}/network/tunnels`,
				`/${ORG}/network/ip-addresses/custom-ips`,
				`/${ORG}/network/ip-addresses/proxy-ips`,
				`/${ORG}/observability`,
			]),
		);
		for (const href of hrefs) {
			expect(href.startsWith(`/${ORG}/`)).toBe(true);
		}
	});

	it("opens a domain workspace and keeps the global tree", () => {
		const resolved = resolve(`/${ORG}/ai/agents`);

		expect(resolved.workspace.kind).toBe("domain");
		expect(resolved.workspace.id).toBe("domain:ai");
		expect(resolved.workspace.label).toBe("AI");
		expect(resolved.contextual.map((section) => section.label)).toEqual([
			"AI",
		]);
		expect(
			resolved.contextual[0]?.items.map((item) => item.href),
		).toContain(`/${ORG}/ai/agents`);
		// The organization-wide navigation is still the same tree.
		expect(resolved.sections).toEqual(create().sections);
		expect(resolved.footer.map((item) => item.id)).toEqual(["account"]);
	});

	it("selects the longest domain workspace for nested routes", () => {
		const resolved = resolve(`/${ORG}/network/tunnels`);

		expect(resolved.workspace.kind).toBe("domain");
		expect(resolved.workspace.id).toBe("domain:networks");
	});

	it("opens the Cloud workspace from its global Overview entry", () => {
		const resolved = resolve(`/${ORG}/cloud/overview`);

		expect(resolved.workspace).toMatchObject({
			kind: "domain",
			id: "domain:cloud",
			label: "Cloud",
			basePath: "cloud",
			parent: {
				id: "global",
				label: "Global Workspace",
				href: `/${ORG}/home`,
			},
		});
		expect(resolved.exclusive).toBe(true);
		expect(resolved.sections).toEqual(create().sections);
		expect(resolved.contextual).toHaveLength(1);

		const items = resolved.contextual[0]?.items ?? [];
		expect(items).toHaveLength(18);
		expect(items.map((item) => item.label)).toEqual([
			"Overview",
			"Compute",
			"Storage",
			"Network & Security",
			"High Availability",
			"Replication",
			"Migration",
			"Disaster Recovery",
			"Tasks & Jobs",
			"Events & Audit",
			"Health & Metrics",
			"Maintenance",
			"Updates",
			"Notifications",
			"Access Control",
			"Resource Policies",
			"Certificates",
			"Providers & Integrations",
		]);
		expect(items[0]).toMatchObject({
			label: "Overview",
			href: `/${ORG}/cloud/overview`,
			implemented: true,
		});
		expect(items.filter((item) => item.implemented)).toHaveLength(1);
		expect(
			items.find((item) => item.label === "Compute")?.children?.map(
				(child) => child.label,
			),
		).toEqual([
			"Virtual Machines",
			"Containers",
			"Resource Pools",
			"Clusters",
			"Nodes",
			"Images & Templates",
		]);
		expect(
			items.find((item) => item.label === "Storage")?.children?.map(
				(child) => child.label,
			),
		).toEqual([
			"Storage Pools",
			"Volumes & Disks",
			"Backups",
			"Snapshots",
		]);
		expect(
			items.find((item) => item.label === "Network & Security")?.children?.map(
				(child) => child.label,
			),
		).toEqual([
			"Interfaces",
			"Virtual Networks",
			"VLANs & Bridges",
			"IP Addresses",
			"DNS & DHCP",
			"Firewalls",
			"VPN",
			"Load Balancers",
		]);
		expect(
			items
				.find((item) => item.label === "Providers & Integrations")
				?.children?.map((child) => child.label),
		).toEqual(["Providers", "Integrations"]);
		expect(
			Object.fromEntries(
				items
					.filter((item) => item.expandable)
					.map((item) => [item.label, item.children?.length ?? 0]),
			),
		).toEqual({
			Compute: 6,
			Storage: 4,
			"Network & Security": 8,
			"High Availability": 3,
			Replication: 3,
			Migration: 3,
			"Disaster Recovery": 3,
			"Tasks & Jobs": 3,
			"Events & Audit": 3,
			"Health & Metrics": 3,
			Maintenance: 2,
			Updates: 3,
			Notifications: 3,
			"Access Control": 5,
			"Resource Policies": 3,
			Certificates: 3,
			"Providers & Integrations": 2,
		});
		expect(new Set(items.map((item) => item.icon)).size).toBe(items.length);
	});

	it("prepares contextual navigation for Cloud clusters and nodes", () => {
		const cluster = resolve(`/${ORG}/cloud/clusters/cl_1/overview`);
		const node = resolve(`/${ORG}/cloud/nodes/node_1/overview`);

		expect(cluster.workspace.id).toBe("resource:cluster:cl_1");
		expect(cluster.workspace.parent).toMatchObject({
			id: "domain:cloud",
			label: "Cloud",
			href: `/${ORG}/cloud/overview`,
		});
		expect(
			cluster.contextual[0]?.items.every((item) => !item.implemented),
		).toBe(true);
		expect(node.workspace.id).toBe("resource:node:node_1");
		expect(node.workspace.parent?.id).toBe("domain:cloud");
	});

	it("opens a resource workspace under its parent", () => {
		const resolved = resolve(`/${ORG}/domains/dom_123/dns`);

		expect(resolved.workspace.kind).toBe("resource");
		expect(resolved.workspace.id).toBe("resource:domain:dom_123");
		expect(resolved.workspace.parent?.id).toBe("domain:domains");
		expect(resolved.workspace.parent?.href).toBe(`/${ORG}/domains/overview`);
		expect(resolved.contextual).toHaveLength(1);
		expect(
			resolved.contextual[0]?.items.map((item) => item.href),
		).toContain(`/${ORG}/domains/dom_123/dns`);
	});

	it("makes a domain workspace exclusive so it replaces the global tree", () => {
		const domain = resolve(`/${ORG}/domains/dom_123`);
		const cloud = resolve(`/${ORG}/cloud/overview`);
		const product = resolve(`/${ORG}/ai/agents`);
		const organization = resolve(`/${ORG}/home`);

		expect(domain.exclusive).toBe(true);
		expect(cloud.exclusive).toBe(true);
		expect(product.exclusive).toBe(false);
		expect(organization.exclusive).toBe(false);
	});

	it("activates the overview and returns to the Domains list for a domain name", () => {
		const pathname = `/${ORG}/domains/example.com`;
		const resolved = resolve(pathname);
		const overview = resolved.contextual[0]?.items[0];

		expect(resolved.workspace).toMatchObject({
			kind: "resource",
			id: "resource:domain:example.com",
			parent: {
				id: "domain:domains",
				label: "Domains",
				href: `/${ORG}/domains/overview`,
			},
		});
		expect(overview).toMatchObject({
			label: "Overview",
			href: pathname,
			implemented: true,
		});
		expect(
			overview && isNavigationItemActive(overview, { pathname }),
		).toBe(true);
	});

	it("does not treat a workspace root as a resource", () => {
		const resolved = resolve(`/${ORG}/domains`);

		expect(resolved.workspace.kind).toBe("domain");
		expect(resolved.workspace.id).toBe("domain:domains");
	});

	it("detects infrastructure resources from their URL", () => {
		const resolved = resolve(`/${ORG}/network/tunnels/tun_1/overview`);

		expect(resolved.workspace.kind).toBe("resource");
		expect(resolved.workspace.id).toBe("resource:tunnel:tun_1");
		expect(resolved.workspace.parent?.id).toBe("domain:networks");
		expect(resolved.contextual[0]?.label).toBe("Tunnel");
	});

	it("ignores paths of another organization", () => {
		const resolved = resolve(`/${OTHER_ORG}/ai/agents`);

		expect(resolved.workspace.kind).toBe("global");
		expect(resolved.contextual).toEqual([]);
	});
});
