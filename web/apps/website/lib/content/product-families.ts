import type { ProductFamily } from "@/lib/domain/schema";

/**
 * Editorial content for the six family overview pages.
 *
 * Product facts (availability, delivery, regional state) stay in the
 * catalogue. This module only describes purpose, audience, realistic
 * workloads and relationships, and never claims a capability that the
 * catalogue does not carry.
 */

export type FamilyUseCase = {
	title: string;
	description: string;
	productIds: string[];
};

export type FamilyRelationship = {
	family: ProductFamily;
	description: string;
};

export type FamilyCapability = {
	title: string;
	description: string;
};

export type FamilyContent = {
	metaTitle: string;
	metaDescription: string;
	heroDescription: string;
	overview: string[];
	audience: string[];
	useCases: FamilyUseCase[];
	relationships: FamilyRelationship[];
	relatedProductIds: string[];
	capabilities?: FamilyCapability[];
	capabilitiesNote?: string;
};

export const familyContent: Record<ProductFamily, FamilyContent> = {
	"network-edge": {
		metaTitle: "Network & Edge — Astron Collection",
		metaDescription:
			"DNS, private networking, traffic routing and entry-point protection for Astron Collection services, with availability stated per service.",
		heroDescription:
			"Connect resources, publish services and protect the traffic that reaches them.",
		overview: [
			"Network & Edge groups the services between a visitor and a workload: authoritative DNS, private networks, and the entry points that route and protect HTTP and HTTPS traffic.",
			"Each service is catalogued individually. DNS and private networking have public detail pages; content delivery, load balancing, edge processing and certificates are listed with their current status rather than presented as live capacity.",
		],
		audience: [
			"Teams publishing web applications and APIs on Astron Collection",
			"Organisations connecting cloud resources to an existing network",
			"Operators who want DNS and entry-point protection in one account",
		],
		useCases: [
			{
				title: "Serve a web application",
				description:
					"Resolve a domain, connect the workload over a private network and protect the HTTP(S) entry point as those services open.",
				productIds: ["domain-services", "networking", "zenth-waf"],
			},
			{
				title: "Connect to an existing network",
				description:
					"Extend a project into infrastructure you already operate with an isolated private network and site-to-site connectivity.",
				productIds: ["networking", "compute-instances"],
			},
			{
				title: "Publish an API",
				description:
					"Route traffic to application services and add filtering, distribution or load balancing where the catalogue supports it.",
				productIds: ["zenth-proxy", "zenth-cdn", "zenth-lb"],
			},
		],
		relationships: [
			{
				family: "compute-infrastructure",
				description:
					"Compute resources attach to ZenthNetwork private networks. Public addressing and load balancing are separate catalogue entries, not implied parts of an instance.",
			},
			{
				family: "security-identity",
				description:
					"ZenthWAF and ZenthDDoS keep Network & Edge as their primary family and are cross-linked as related security services, so the same product is not defined twice.",
			},
			{
				family: "cloud-management",
				description:
					"Projects and resource inventory in Cloud Management provide the ownership boundary for networks, DNS zones and entry points.",
			},
		],
		relatedProductIds: [
			"networking",
			"domain-services",
			"zenth-waf",
			"zenth-ddos",
			"web-hosting",
		],
	},
	"compute-infrastructure": {
		metaTitle: "Compute & Infrastructure — Astron Collection",
		metaDescription:
			"Virtual machines, VPS, bare metal, GPU capacity, containers, Kubernetes and private cloud, with each operating model stated.",
		heroDescription:
			"Physical and virtual capacity for applications, workloads and private estates.",
		overview: [
			"Compute & Infrastructure covers the capacity applications run on: configurable instances, fixed-size VPS plans, dedicated servers, GPU accelerators, container environments, Kubernetes and private estates.",
			"Each offer has a different operating model. Instances and VPS share provider-operated infrastructure, bare metal is single-tenant hardware, and a private cloud reserves a pool for one organisation. The catalogue states those differences instead of presenting every option as the same product.",
		],
		audience: [
			"Teams running web services, APIs and staging environments",
			"Organisations that need dedicated hardware or reserved capacity",
			"Engineering teams standardising on containers or Kubernetes",
		],
		useCases: [
			{
				title: "Run a web service",
				description:
					"Start on a managed hosting plan or a configurable instance, attach persistent storage and grow the estate as traffic increases.",
				productIds: ["web-hosting", "compute-instances", "block-storage"],
			},
			{
				title: "Keep workloads isolated",
				description:
					"Use dedicated hardware or a reserved private estate with its own network boundary and quota model.",
				productIds: ["private-cloud", "bare-metal", "networking"],
			},
			{
				title: "Accelerate a model workload",
				description:
					"Attach whole GPUs to a virtual machine and keep datasets and checkpoints on storage in the same region.",
				productIds: ["gpu-instances", "block-storage", "object-storage"],
			},
		],
		relationships: [
			{
				family: "storage-databases",
				description:
					"Instances attach block volumes; datasets and artifacts live in object storage. Storage has its own lifecycle independent of the compute resource.",
			},
			{
				family: "developer-platform",
				description:
					"Kubernetes and container environments provide the runtime, while deployment, registries and pipelines sit above them in the developer family.",
			},
			{
				family: "network-edge",
				description:
					"Private networking connects instances and workloads; public addressing and load balancing are catalogued separately in Network & Edge.",
			},
		],
		relatedProductIds: [
			"compute-instances",
			"bare-metal",
			"kubernetes",
			"gpu-instances",
			"private-cloud",
		],
	},
	"storage-databases": {
		metaTitle: "Storage & Databases — Astron Collection",
		metaDescription:
			"Object and block storage, backups, retention and managed database engines, with lifecycle and availability stated per service.",
		heroDescription:
			"Store, protect, retain and operate the data your applications depend on.",
		overview: [
			"Storage & Databases groups the services that hold application state: object storage for unstructured data, block volumes for filesystems, backups and snapshots, long-term retention, and managed database engines.",
			"The catalogue separates storage primitives from the database service. PostgreSQL, MySQL, MariaDB and Redis are engines beneath ZenthDatabase rather than separate product families, and a database plan does not imply high availability unless its topology says so.",
		],
		audience: [
			"Applications that need a filesystem, object API or managed database",
			"Teams defining backup, retention and recovery policies",
			"Organisations moving from a single server to shared storage",
		],
		useCases: [
			{
				title: "Store application assets",
				description:
					"Keep media, backups and generated assets in buckets with scoped access keys and lifecycle rules.",
				productIds: ["object-storage", "zenth-cdn"],
			},
			{
				title: "Run a database",
				description:
					"Provision a managed engine with automated backups, and keep its storage and topology explicit per plan.",
				productIds: ["databases", "block-storage", "backup"],
			},
			{
				title: "Recover from a mistake",
				description:
					"Snapshot a volume before a change, or restore a scheduled backup into a new volume or instance.",
				productIds: ["backup", "block-storage", "object-storage"],
			},
		],
		relationships: [
			{
				family: "compute-infrastructure",
				description:
					"Block volumes attach to compute instances, and managed databases are reached over a private network rather than the public internet by default.",
			},
			{
				family: "developer-platform",
				description:
					"Applications reach object storage through its HTTP API; application secrets are catalogued in Developer Platform and Security & Identity.",
			},
			{
				family: "cloud-management",
				description:
					"Retention policies, resource inventory and cost visibility are managed across the estate in Cloud Management.",
			},
		],
		relatedProductIds: [
			"object-storage",
			"databases",
			"backup",
			"block-storage",
			"zenth-archive",
		],
	},
	"developer-platform": {
		metaTitle: "Developer Platform — Astron Collection",
		metaDescription:
			"Deployment, registries, pipelines, functions, jobs, secrets and observability for teams building on Astron Collection, with planned status stated.",
		heroDescription:
			"Build, deploy and operate applications on Astron Collection without running the tooling yourself.",
		overview: [
			"Developer Platform covers the services that help teams build, ship and operate applications: deployment, registries, pipelines, functions, jobs, secrets and observability.",
			"Most of this family is planned. The catalogue marks each service accordingly; nothing here is presented as generally available, and the relationship between ZenthPaaS and Notploy is not asserted on this website.",
		],
		audience: [
			"Engineering teams that deploy from a repository",
			"Platform teams that need repeatable build and release steps",
			"Operators who want observability and secret handling in one catalogue",
		],
		useCases: [
			{
				title: "Automate a deployment",
				description:
					"Build an artifact, run the pipeline and move it through a release lifecycle as those services open.",
				productIds: ["zenth-ci-cd", "zenth-build", "zenth-deploy"],
			},
			{
				title: "Run scheduled work",
				description:
					"Execute one-off and scheduled jobs, or event-driven functions, without maintaining a dedicated server.",
				productIds: ["zenth-jobs", "zenth-functions"],
			},
			{
				title: "Observe an application",
				description:
					"Collect metrics, logs and traces, and keep application credentials separate from the workloads that use them.",
				productIds: ["zenth-observability", "kubernetes", "zenth-secrets"],
			},
		],
		relationships: [
			{
				family: "compute-infrastructure",
				description:
					"Containers and Kubernetes provide the runtime underneath deployment services; the developer family does not duplicate the compute products.",
			},
			{
				family: "security-identity",
				description:
					"ZenthSecrets is cross-linked with Security & Identity, where ZenthVault holds the broader secret-management scope.",
			},
			{
				family: "cloud-management",
				description:
					"ZenthObservability is cross-linked with Cloud Management so monitoring appears in both the build and operate contexts without a second product record.",
			},
		],
		relatedProductIds: [
			"zenth-paas",
			"kubernetes",
			"zenth-functions",
			"zenth-observability",
			"zenth-secrets",
		],
	},
	"security-identity": {
		metaTitle: "Security & Identity — Astron Collection",
		metaDescription:
			"Identity, access, firewalling, audit trails and secret management for Astron Collection, with related network protection cross-linked.",
		heroDescription:
			"Protect resources, applications, identities and every path into your estate.",
		overview: [
			"Security & Identity covers how identities are established, how access is granted and how actions are made traceable. It also gathers the security services that apply across the estate.",
			"Network-facing protection such as ZenthWAF and ZenthDDoS keeps Network & Edge as its primary family and appears here as a related service. That avoids two competing definitions of the same product.",
		],
		audience: [
			"Organisations that need role-based access to cloud resources",
			"Teams that must trace who changed what",
			"Applications that need credentials kept out of source code",
		],
		useCases: [
			{
				title: "Control who can act",
				description:
					"Define identities and roles, grant access to resources and keep an audit trail of actions as those services open.",
				productIds: ["zenth-iam", "zenth-access", "zenth-audit"],
			},
			{
				title: "Protect a public application",
				description:
					"Filter HTTP(S) traffic, mitigate network attacks and enforce network policy at the entry point.",
				productIds: ["zenth-waf", "zenth-ddos", "zenth-firewall"],
			},
			{
				title: "Manage application secrets",
				description:
					"Keep credentials in a dedicated secret store and distribute them to workloads without embedding them in images.",
				productIds: ["zenth-vault", "zenth-secrets"],
			},
		],
		relationships: [
			{
				family: "network-edge",
				description:
					"ZenthWAF, ZenthDDoS and ZenthSSL belong to Network & Edge. Security & Identity links to them rather than redefining them as separate security products.",
			},
			{
				family: "developer-platform",
				description:
					"ZenthSecrets covers application secret management; ZenthVault here provides the wider secret-storage scope.",
			},
			{
				family: "cloud-management",
				description:
					"Organisation membership, projects and audit visibility connect identity decisions to the way the estate is organised.",
			},
		],
		relatedProductIds: [
			"zenth-iam",
			"zenth-access",
			"zenth-firewall",
			"zenth-vault",
			"zenth-audit",
		],
	},
	"cloud-management": {
		metaTitle: "Cloud Management — Astron Collection",
		metaDescription:
			"Projects, resources, orchestration, billing and support for operating a Astron Collection estate, with platform capabilities clearly separated.",
		heroDescription:
			"Organise, control, provision and monitor your cloud environment from one place.",
		overview: [
			"Cloud Management is how an organisation organises and operates its estate: projects and ownership, provisioning, cost visibility and support.",
			"Organizations, Workspaces, Projects, Environments and Resources are native Control Plane capabilities. They are discoverable in this family but are not separately purchasable products; the commercial services are orchestration, billing, support and managed operations.",
		],
		audience: [
			"Organisations managing several projects or environments",
			"Teams that need cost and usage visibility across resources",
			"Companies delegating infrastructure operations under a contract",
		],
		useCases: [
			{
				title: "Separate environments",
				description:
					"Give development, staging and production their own projects, resource boundaries and access rules.",
				productIds: ["zenth-orchestrator", "compute-instances", "networking"],
			},
			{
				title: "Understand usage",
				description:
					"Track resource inventory and cost visibility across projects as billing and observability services open.",
				productIds: ["zenth-billing", "zenth-observability"],
			},
			{
				title: "Hand over operations",
				description:
					"Delegate patching, monitoring and backup verification under a written scope with an escalation path.",
				productIds: ["managed-services", "zenth-support", "backup"],
			},
		],
		relationships: [
			{
				family: "compute-infrastructure",
				description:
					"Projects and quotas bound the compute, storage and private-cloud resources they contain; provisioning is orchestrated from here.",
			},
			{
				family: "security-identity",
				description:
					"Identity and audit services decide who can act in an organisation and record what changed.",
			},
			{
				family: "developer-platform",
				description:
					"ZenthObservability is cross-linked here for monitoring and operating applications, without creating a second observability product.",
			},
		],
		relatedProductIds: [
			"managed-services",
			"zenth-orchestrator",
			"zenth-billing",
			"zenth-support",
			"backup",
		],
		capabilities: [
			{
				title: "Organizations",
				description:
					"Membership and ownership for a company or institution using Astron Collection.",
			},
			{
				title: "Workspaces",
				description:
					"A collaborative grouping inside an organisation for teams that share resources.",
			},
			{
				title: "Projects",
				description:
					"The logical grouping and ownership boundary for resources, quotas and access.",
			},
			{
				title: "Environments",
				description:
					"Separation of development, staging and production within a project.",
			},
			{
				title: "Resources",
				description:
					"Inventory and lifecycle visibility across the resources a project contains.",
			},
		],
		capabilitiesNote:
			"Native Control Plane capabilities. They are included with the platform rather than sold as separate products, and no price or availability is attached to them here.",
	},
};
