/** Platform architecture, console capabilities and the two deployment models. */

export interface ComponentEntry {
	name: string;
	path: string;
	role: string;
}

/** Verified against the workspace layout in README.md. */
export const services: ComponentEntry[] = [
	{
		name: "Astron Manager",
		path: "apps/astron",
		role: "Console, API server and application runtime",
	},
	{
		name: "Background work",
		path: "apps/api",
		role: "Asynchronous jobs and workflows (Inngest), port 4000",
	},
	{
		name: "Scheduler",
		path: "apps/schedules",
		role: "Recurring jobs and scheduled tasks (BullMQ), port 4001",
	},
	{
		name: "Status page",
		path: "apps/status",
		role: "Public incidents, maintenance and uptime (Next.js)",
	},
	{
		name: "Monitoring",
		path: "apps/monitoring",
		role: "Resource and container metrics (Go)",
	},
	{
		name: "Discord applications",
		path: "bot/*",
		role: "Five deployable distributions on one framework",
	},
];

export const packages: ComponentEntry[] = [
	{
		name: "discord-framework",
		path: "packages/discord-framework",
		role: "Lifecycle, command contract, routing, permissions, logs, deployment, voice",
	},
	{
		name: "server",
		path: "packages/server",
		role: "Core server logic, persistence and platform utilities",
	},
	{
		name: "status",
		path: "packages/status",
		role: "Status engine: model, computation, persistence, public and admin APIs",
	},
	{
		name: "trpc-openapi",
		path: "packages/trpc-openapi",
		role: "tRPC ↔ OpenAPI integration",
	},
	{
		name: "mcp",
		path: "packages/mcp",
		role: "Model Context Protocol server over the platform API",
	},
];

/** Framework guarantees that make the collection one platform. */
export const framework: { title: string; description: string }[] = [
	{
		title: "One command contract",
		description:
			"Definitions, handlers and metadata are separate, so the same command shape works in every distribution.",
	},
	{
		title: "Isolated catalogues",
		description:
			"A registry refuses a command that belongs to another bot and detects duplicates at load time.",
	},
	{
		title: "Four-layer authorisation",
		description:
			"User permissions, bot permissions, business policy and the registration hint are checked separately — and a missing layer denies.",
	},
	{
		title: "Contained failures",
		description:
			"Every event handler and command runs behind its own error boundary; a throw is logged and the process keeps running.",
	},
	{
		title: "Safe logs",
		description:
			"Structured JSON on stdout with secret redaction, so container logs are safe to ship to a log store.",
	},
	{
		title: "Guarded deployment",
		description:
			"Command registration is hashed and idempotent, and a state file written for another application ID is refused.",
	},
];

/** Console capabilities, from the routers and dashboard screens. */
export const managerSections: {
	title: string;
	description: string;
	items: string[];
}[] = [
	{
		title: "Servers and infrastructure",
		description:
			"Where workloads run: the local server, remote servers over SSH, and Docker Swarm for multi-node deployments.",
		items: [
			"Local server and remote servers over SSH",
			"Swarm clusters, node membership and placement",
			"Registries with stored credentials",
			"Volumes, mounts and object storage",
		],
	},
	{
		title: "Applications",
		description:
			"Sources, build types, deployments and the history needed to understand what is running.",
		items: [
			"Git providers (GitHub, GitLab, Gitea, Bitbucket) and plain Docker images",
			"Dockerfile, Nixpacks, Railpack, buildpacks or prebuilt image",
			"Deployment history and rollback",
			"Compose projects managed as one unit",
		],
	},
	{
		title: "Data",
		description:
			"Databases provisioned by the platform, with backups you schedule and test.",
		items: [
			"PostgreSQL, MySQL, MariaDB, MongoDB, Redis, libSQL",
			"Scheduled database and volume backups",
			"S3-compatible destinations",
			"Restore workflows",
		],
	},
	{
		title: "Access",
		description:
			"Who can see and change what, enforced by the API rather than by the interface.",
		items: [
			"Organisations, projects and environments",
			"Custom roles and permissions",
			"Single sign-on (Auth0, Zitadel, Keycloak, Okta, Azure)",
			"API keys, sessions and two-factor authentication",
		],
	},
	{
		title: "Operations",
		description:
			"The daily work: knowing what happened, and being told when something changes.",
		items: [
			"Audit log across the organisation",
			"Metrics and container monitoring",
			"Notification channels, including Discord webhooks",
			"Status page incidents and maintenance windows",
		],
	},
	{
		title: "Networking",
		description:
			"Making a service reachable, and keeping certificates valid without a manual step.",
		items: [
			"Domains bound to service ports",
			"Traefik routing and TLS certificates",
			"DNS providers and records",
			"Cloud domain flows",
		],
	},
];

/** Self vs Cloud — factual differences, not marketing symmetry. */
export const deploymentModels: {
	key: "self" | "cloud";
	name: string;
	operator: string;
	summary: string;
	points: string[];
	responsibilities: string[];
	href: string;
}[] = [
	{
		key: "self",
		name: "Self-hosted",
		operator: "You operate the platform",
		summary:
			"Install the stack on infrastructure you control. Four services — PostgreSQL, Redis, client and API — with no Traefik, no Swarm and no host Docker socket required to run the platform itself.",
		points: [
			"Free and open source (MIT)",
			"Database, Redis, backups and secrets stay inside your boundary",
			"Same product surface as Cloud",
			"One Docker Compose stack, or the Makefile targets",
		],
		responsibilities: [
			"Host, network boundary, TLS and exposure",
			"Upgrades (pull, rebuild, restart)",
			"Backups and restore tests",
			"PostgreSQL and Redis operations",
		],
		href: "/platform/self-hosted",
	},
	{
		key: "cloud",
		name: "Astron Collection Cloud",
		operator: "SGE operates the control plane",
		summary:
			"A managed instance of the same platform. SGE runs, monitors and upgrades the control plane; your workloads keep running on the servers you connect.",
		points: [
			"Nothing to install to get started",
			"Upgrades and monitoring handled by SGE",
			"Same console and API as the self-hosted platform",
			"Your applications and data stay on your infrastructure",
		],
		responsibilities: [
			"Availability and upgrades of the control plane",
			"Platform monitoring and support",
			"Account and access management",
			"Workspace and environment provisioning",
		],
		href: "/platform/cloud",
	},
];

/** Deployment targets exposed by the root Dockerfile. */
export const dockerTargets = [
	{ name: "selfhosted", role: "Default self-hosted image with deployment tooling" },
	{ name: "cloud", role: "Cloud runtime without the self-hosted tooling" },
	{ name: "console", role: "Console product flavour" },
	{ name: "dev", role: "Development image with hot reload" },
	{ name: "status", role: "Standalone status page" },
];
