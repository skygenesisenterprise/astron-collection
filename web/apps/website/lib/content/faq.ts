import type { FaqEntry } from "./home";

/** FAQ content for inner pages. Every answer is verifiable in the repository. */

export const applicationsFaqs: FaqEntry[] = [
	{
		question: "Which application should I start with?",
		answer:
			"Astron covers the common surface in a single process: configuration, welcomes, levels, polls, moderation and AutoMod. Split into dedicated distributions when you have a reason to restart one without the others.",
	},
	{
		question: "Can two distributions share one Discord application?",
		answer:
			"Not recommended. A global command registration replaces the whole catalogue of that application, so each distribution should use its own Application ID. Two distributions can share one application only with a guild-scoped, coordinated catalogue.",
	},
	{
		question: "Do the applications share data?",
		answer:
			"No. Each distribution has its own data directory, image and Redis key prefix. Running several of them does not merge settings, warnings or level data.",
	},
	{
		question: "What Discord permissions do they need?",
		answer:
			"Permissions are declared per command and re-checked at execution. The individual pages list the intents requested and the bot permissions each feature needs, so you can grant only what you enable.",
	},
	{
		question: "Is there a hosted version of the bots?",
		answer:
			"The console is hosted as Astron Collection Cloud. The bots run where you deploy them — on your own infrastructure, or on servers you connect to a Cloud workspace.",
	},
];

export const managerFaqs: FaqEntry[] = [
	{
		question: "Can I administer my Discord server from the console?",
		answer:
			"No. Guild configuration stays in Discord through `/config` and the command set. The console manages the platform around the bots: infrastructure, deployments, data and access.",
	},
	{
		question: "Do I need the console to run the bots?",
		answer:
			"No. Every distribution runs standalone with its own token and volume. The console is for the services you operate alongside them.",
	},
	{
		question: "What does the console need to run?",
		answer:
			"A PostgreSQL database, Redis, the API service and the client. The self-hosted stack starts all four from one Compose file.",
	},
	{
		question: "Is the console open source?",
		answer:
			"Yes. The console, the API and the background services are part of the MIT-licensed repository.",
	},
];

export const platformFaqs: FaqEntry[] = [
	{
		question: "Do I need Kubernetes?",
		answer:
			"No. The platform is built on Docker, with Docker Swarm for multi-node deployments and Traefik for routing. Multi-node distributes workloads; it is not automatic high availability.",
	},
	{
		question: "How do the services talk to each other?",
		answer:
			"The API is the contract. The console is a client of it, and background work and scheduled jobs run outside the request path. A deployment started from CI and one started from the interface are the same deployment.",
	},
	{
		question: "Where does state live?",
		answer:
			"PostgreSQL owns platform state, Redis holds cache and queues, S3-compatible storage receives backups, and each bot keeps its own volume. Nothing is duplicated between the browser and the API.",
	},
	{
		question: "Can I use only the Discord bots?",
		answer:
			"Yes. The distributions do not import the console or the platform packages. You can run one bot and nothing else.",
	},
];

export const selfHostedFaqs: FaqEntry[] = [
	{
		question: "What do I need to self-host?",
		answer:
			"A Linux host with Docker and the Compose plugin. Node.js 24.4+ is only needed to develop against the sources; the container images do not require a local toolchain.",
	},
	{
		question: "Can I start on a single server?",
		answer:
			"Yes. Start with the local server, then add remote servers over SSH and group them into a Swarm cluster when a single host is no longer enough.",
	},
	{
		question: "How do I upgrade?",
		answer:
			"Pull the revision and rebuild: `git pull && make docker-up`. Migrations are applied by the API container, and the database volume is preserved across restarts.",
	},
	{
		question: "How do backups work?",
		answer:
			"`make backup` writes a SQL dump, and `make restore FILE=…` reads one back. Docker named volumes can be scheduled to an S3-compatible destination; bind mounts are not covered. Test the restore before you need it.",
	},
];

export const cloudFaqs: FaqEntry[] = [
	{
		question: "Is Cloud a different product?",
		answer:
			"No. It is the same console, API, CLI, SDK and MCP server. The difference is that SGE operates the control plane: availability, upgrades and monitoring.",
	},
	{
		question: "Where does my data live on Cloud?",
		answer:
			"Your workloads keep running on the servers you connect, and your application data stays there. The control plane stores the account and platform state it needs to operate.",
	},
	{
		question: "What does it cost?",
		answer:
			"Commercial terms are not published on this site. They are set by Sky Genesis Enterprise; contact is the honest next step rather than an invented price.",
	},
	{
		question: "Can I move between Cloud and self-hosting?",
		answer:
			"Both run the same platform, so the migration is a redeploy rather than a rewrite: the same images, environment variables and API contract.",
	},
];

export const developerFaqs: FaqEntry[] = [
	{
		question: "Does the API cover everything the console does?",
		answer:
			"Yes. The console is a client of the API, which is why automation is not a second-class path — the same permissions and audit entries apply.",
	},
	{
		question: "How do I authenticate?",
		answer:
			"With an API key. A key inherits the permissions of the account that created it, so create keys under an account with only the access the automation needs.",
	},
	{
		question: "Is the MCP server read-only?",
		answer:
			"By default it exposes workflow capabilities, most of them read-only. Writes such as `execute_deployment` require an approval token, and destructive operations are opt-in.",
	},
	{
		question: "Where is the specification?",
		answer:
			"The generated OpenAPI document is committed in the repository (`openapi.json`), and the SDK and MCP catalogue derive from the same source.",
	},
];
