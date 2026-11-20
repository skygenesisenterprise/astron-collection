import { CatalogueSchema, type Catalogue, type Product } from "./schema";

/**
 * The validated commercial catalogue.
 *
 * Honesty rules enforced here and in `schema.ts`:
 * - No price is published until it has been approved (`status: "draft"`,
 *   `amountMinor: null`).
 * - Regions that have not been contractually verified cannot be marked
 *   commercially available.
 * - Products never reference a specific infrastructure supplier in their
 *   copy; supplier data only lives in availability entries.
 * - Availability and delivery model are separate fields. A service in this
 *   list is not orderable unless its regional entries say so.
 *
 * The dataset is intentionally small and explicit. It is designed to be
 * replaced by a public catalogue API later without changing the page
 * templates: see `queries.ts` for the access layer.
 */

const EU = "eu-core";
const GLOBAL = "global-partner";
const OWN = "company";
const PARTNER = "partner-network";

type AvailabilityInput = {
	regionId: string;
	providerId: string;
	deployment: Product["availabilityByRegion"][number]["deployment"];
	commercialStatus: Product["availabilityByRegion"][number]["commercialStatus"];
	operationalStatus: Product["availabilityByRegion"][number]["operationalStatus"];
	note: string;
};

function availabilityFor(
	productId: string,
	entries: AvailabilityInput[],
): Product["availabilityByRegion"] {
	return entries.map((entry) => ({ productId, ...entry }));
}

const euEntry = (
	commercialStatus: AvailabilityInput["commercialStatus"],
	note: string,
	deployment: AvailabilityInput["deployment"] = "shared",
): AvailabilityInput => ({
	regionId: EU,
	providerId: OWN,
	deployment,
	commercialStatus,
	operationalStatus: "unknown",
	note,
});

const partnerEntry = (
	commercialStatus: AvailabilityInput["commercialStatus"],
	note: string,
	deployment: AvailabilityInput["deployment"] = "managed",
): AvailabilityInput => ({
	regionId: GLOBAL,
	providerId: PARTNER,
	deployment,
	commercialStatus,
	operationalStatus: "unknown",
	note,
});

const catalogueData = {
	providers: [
		{
			id: OWN,
			name: "Company",
			type: "own" as const,
			website: "https://company.com",
			description:
				"Infrastructure operated directly by Company and Sky Genesis Enterprise. Capacity, locations and commercial terms are published per product once verified.",
			regions: [EU],
		},
		{
			id: PARTNER,
			name: "European partner infrastructure",
			type: "partner" as const,
			website: null,
			description:
				"External infrastructure suppliers integrated into the Company catalogue. Company does not own or operate partner data centres; the supplying provider is disclosed per product and region.",
			regions: [GLOBAL],
		},
	],
	regions: [
		{
			id: EU,
			name: "European Union — core",
			country: "Multiple EU member states",
			location: "Europe",
			verification: "pending" as const,
			notes:
				"Facility-level locations and contractual commitments are being confirmed. Nothing on this page should be read as a published data-centre address.",
		},
		{
			id: GLOBAL,
			name: "Partner network",
			country: "Multiple",
			location: "Worldwide",
			verification: "pending" as const,
			notes:
				"Capacity supplied by external infrastructure partners. The operating provider and country are disclosed before any contract is signed.",
		},
	],
	products: [
		/* ------------------------------------------------------------------ */
		/* Network & Edge                                                     */
		/* ------------------------------------------------------------------ */
		{
			id: "domain-services",
			route: "/products/domain-services",
			name: "ZenthDNS",
			family: "network-edge" as const,
			relatedFamilies: ["compute-infrastructure" as const],
			tagline: "Authoritative DNS zones and records",
			summary:
				"DNS zones, records and DNS hosting for domains you run on Company or elsewhere.",
			description:
				"ZenthDNS provides authoritative DNS zones and records for the domains you operate. Zones support common record types and can point at Company resources or external targets. Domain registration is delivered with an accredited registrar partner, and the registrar of record is visible in the contract.",
			availability: "limited" as const,
			deliveryModels: ["partner_provided" as const, "managed_service" as const],
			features: [
				"Authoritative DNS zones",
				"A, AAAA, CNAME, MX, TXT, NS and SRV records",
				"DNS pointing to Company or external services",
				"Domain registration through an accredited partner",
			],
			benefits: [
				"DNS and registration reachable from the same account",
				"Registrar of record disclosed in the contract",
				"Records can target services outside Company",
			],
			specs: [
				{
					title: "Registration",
					rows: [
						{ label: "Registrar", value: "Accredited partner; named in the contract" },
						{ label: "Extensions", value: "Published per partner" },
						{ label: "Renewal", value: "Manual or automatic" },
					],
				},
				{
					title: "DNS",
					rows: [
						{ label: "Records", value: "A, AAAA, CNAME, MX, TXT, NS, SRV" },
						{ label: "Targets", value: "Company or external" },
						{ label: "Hosting", value: "Authoritative zones" },
					],
				},
			],
			availabilityByRegion: availabilityFor("domain-services", [
				partnerEntry("partner_service", "Registration is delivered by an accredited registrar partner.", "managed"),
				{
					regionId: EU,
					providerId: PARTNER,
					deployment: "managed",
					commercialStatus: "partner_service",
					operationalStatus: "unknown",
					note: "Same registrar partner; the legal entity is disclosed before payment.",
				},
			]),
			related: ["networking", "web-hosting", "zenth-ssl"],
			featured: true,
			tags: ["dns", "domains", "records"],
			docsPath: "/resources/documentation",
			seo: {
				title: "ZenthDNS — Company",
				description:
					"Authoritative DNS zones and records for Company and external targets, with domain registration through an accredited partner.",
			},
		},
		{
			id: "networking",
			route: "/products/networking",
			name: "ZenthNetwork",
			family: "network-edge" as const,
			relatedFamilies: ["security-identity" as const, "compute-infrastructure" as const],
			tagline: "Private networks and connectivity between resources",
			summary:
				"Private networks that connect instances, containers and infrastructure you already operate.",
			description:
				"ZenthNetwork provides private networks and connectivity between Company resources. Networks are isolated per project, resources receive private addresses, and a site-to-site VPN links a project to infrastructure you already operate. Public addressing and load balancing are separate catalogue entries rather than implied parts of this service.",
			availability: "limited" as const,
			deliveryModels: ["company_operated" as const, "partner_provided" as const],
			benefits: [
				"Private networks isolated per project",
				"Site-to-site connectivity with existing infrastructure",
				"Addressing that stays stable when a resource is rebuilt",
			],
			features: [
				"Private network segmentation",
				"Private addressing per project",
				"Site-to-site VPN connectivity",
				"Attachment for compute and container resources",
			],
			specs: [
				{
					title: "Network services",
					rows: [
						{ label: "Private network", value: "Per-project isolated subnet" },
						{ label: "Addressing", value: "Private addresses per network" },
						{ label: "Connectivity", value: "Site-to-site VPN" },
						{ label: "Attachment", value: "Compute and container resources" },
					],
				},
				{
					title: "Limits",
					rows: [
						{ label: "Bandwidth", value: "Published per product and region" },
						{ label: "Cross-region", value: "Not presented as available until verified" },
					],
				},
			],
			availabilityByRegion: availabilityFor("networking", [
				euEntry("coming_soon", "Bandwidth allowances and cross-region options are not yet published."),
				partnerEntry("partner_service", "Partner network capacity; routes and bandwidth are quoted."),
			]),
			related: ["compute-instances", "block-storage", "private-cloud"],
			featured: true,
			tags: ["private network", "vpn", "connectivity"],
			docsPath: "/resources/documentation",
			seo: {
				title: "ZenthNetwork — Company",
				description:
					"Private networks, per-project addressing and site-to-site VPN connectivity for Company and existing infrastructure.",
			},
		},
		{
			id: "zenth-proxy",
			route: null,
			name: "ZenthProxy",
			family: "network-edge" as const,
			relatedFamilies: ["compute-infrastructure" as const, "security-identity" as const],
			tagline: "Reverse proxy and HTTP/HTTPS traffic routing",
			summary: "Reverse proxy and HTTP/HTTPS traffic routing.",
			description:
				"A reverse proxy for routing HTTP and HTTPS traffic to Company services. The service is catalogued as a planned offering; no endpoint, feature set, routing behaviour or availability is published yet.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["reverse proxy", "http", "routing"],
		},
		{
			id: "zenth-cdn",
			route: null,
			name: "ZenthCDN",
			family: "network-edge" as const,
			relatedFamilies: ["storage-databases" as const, "compute-infrastructure" as const],
			tagline: "Content distribution and caching",
			summary: "Content distribution and caching.",
			description:
				"Content distribution and caching for static and dynamic responses. Planned; no points of presence, cache behaviour or coverage is claimed.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["cdn", "caching"],
		},
		{
			id: "zenth-lb",
			route: null,
			name: "ZenthLB",
			family: "network-edge" as const,
			relatedFamilies: ["compute-infrastructure" as const],
			tagline: "Load balancing across services and instances",
			summary: "Load balancing across services and instances.",
			description:
				"Load balancing for HTTP(S) and TCP services across Company resources. The capability is modelled; supported algorithms, health checks and limits are not published.",
			availability: "coming_soon" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["load balancing"],
		},
		{
			id: "zenth-waf",
			route: null,
			name: "ZenthWAF",
			family: "network-edge" as const,
			relatedFamilies: ["security-identity" as const],
			tagline: "Web application firewall for HTTP(S) traffic",
			summary: "Web application firewall for HTTP(S) traffic.",
			description:
				"HTTP(S) request filtering for applications behind Company entry points. Rule sets, managed policies and logging are not published yet.",
			availability: "coming_soon" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["waf", "application security"],
		},
		{
			id: "zenth-ddos",
			route: null,
			name: "ZenthDDoS",
			family: "network-edge" as const,
			relatedFamilies: ["security-identity" as const],
			tagline: "DDoS protection for Company services",
			summary: "DDoS protection for traffic reaching Company services.",
			description:
				"Network-level mitigation for traffic reaching Company services. Scrubbing capacity, coverage and response commitments are not claimed.",
			availability: "coming_soon" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["ddos", "network security"],
		},
		{
			id: "zenth-edge",
			route: null,
			name: "ZenthEdge",
			family: "network-edge" as const,
			relatedFamilies: ["developer-platform" as const],
			tagline: "Edge-distributed services and processing",
			summary: "Edge-distributed services and processing.",
			description:
				"Edge execution for latency-sensitive workloads. Planned; no locations, runtimes or coverage are published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["edge", "compute"],
		},
		{
			id: "zenth-ssl",
			route: null,
			name: "ZenthSSL",
			family: "network-edge" as const,
			relatedFamilies: ["security-identity" as const],
			tagline: "TLS certificate lifecycle management",
			summary: "TLS certificate lifecycle management.",
			description:
				"Issuance and renewal of TLS certificates for Company-hosted services. Supported validation methods and automation are not published.",
			availability: "coming_soon" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["tls", "certificates"],
		},
		{
			id: "zenth-ip",
			route: null,
			name: "ZenthIP",
			family: "network-edge" as const,
			relatedFamilies: ["compute-infrastructure" as const],
			tagline: "Public IP address resources and management",
			summary: "Public IP address resources and management.",
			description:
				"Public IPv4 and IPv6 addresses that can be attached to Company resources. Allocation rules, quotas and pricing are not published.",
			availability: "coming_soon" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["ipv4", "ipv6", "public addresses"],
		},

		/* ------------------------------------------------------------------ */
		/* Compute & Infrastructure                                           */
		/* ------------------------------------------------------------------ */
		{
			id: "zenth-vps",
			route: null,
			name: "ZenthVPS",
			family: "compute-infrastructure" as const,
			relatedFamilies: ["developer-platform" as const],
			tagline: "Simplified virtual private servers",
			summary: "Fixed-size virtual private servers for small applications.",
			description:
				"Fixed-size virtual servers for small applications and first deployments. Planned; plan sizes, locations and commercial terms are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["vps", "virtual machines"],
		},
		{
			id: "compute-instances",
			route: "/products/public-cloud/compute",
			name: "ZenthCompute",
			family: "compute-infrastructure" as const,
			relatedFamilies: ["developer-platform" as const],
			tagline: "Configurable virtual machines with predictable resources",
			summary:
				"Virtual machines with dedicated vCPU and memory allocations, attached block storage and private networking.",
			description:
				"ZenthCompute provides the general-purpose virtual machines of Company. Each instance receives a fixed share of vCPU and memory, can attach block volumes, join a private network and be rebuilt from a snapshot. Instances are designed for web services, APIs, build agents, staging environments and background workers.",
			availability: "limited" as const,
			deliveryModels: ["company_operated" as const, "partner_provided" as const],
			benefits: [
				"Fixed resource allocations instead of shared, throttled CPU",
				"Rebuild or resize without re-installing the operating system",
				"Private networking and attachable block storage across instances",
			],
			features: [
				"Linux distributions and custom images",
				"Snapshots and image-based rebuilds",
				"Vertical scaling with a restart",
				"Cloud-init provisioning",
				"Private network attachment",
				"Hourly and monthly billing models",
			],
			specs: [
				{
					title: "Instance resources",
					rows: [
						{ label: "vCPU", value: "Shared or dedicated, selectable per plan" },
						{ label: "Memory", value: "Allocated in fixed ratios to vCPU" },
						{ label: "Local disk", value: "None — storage is attached separately" },
						{ label: "Network", value: "Private network attachment; public addressing separate" },
					],
				},
				{
					title: "Lifecycle",
					rows: [
						{ label: "Provisioning", value: "Image + cloud-init" },
						{ label: "Snapshots", value: "Consistent disk snapshots" },
						{ label: "Resize", value: "Restart required for vCPU/memory changes" },
						{ label: "Deletion", value: "Volumes retained unless explicitly removed" },
					],
				},
			],
			availabilityByRegion: availabilityFor("compute-instances", [
				euEntry("coming_soon", "Commercial opening and capacity per plan not yet published."),
				partnerEntry("partner_service", "Delivered through a partner provider; country disclosed at order."),
			]),
			related: ["block-storage", "networking", "kubernetes"],
			featured: true,
			tags: ["virtual machines", "linux", "instances"],
			docsPath: "/resources/documentation",
			seo: {
				title: "ZenthCompute — Company",
				description:
					"General-purpose virtual machines with fixed vCPU and memory, attached block storage, snapshots and private networking.",
			},
		},
		{
			id: "bare-metal",
			route: "/products/bare-metal",
			name: "ZenthBareMetal",
			family: "compute-infrastructure" as const,
			relatedFamilies: ["cloud-management" as const, "storage-databases" as const],
			tagline: "Dedicated hardware without a hypervisor",
			summary:
				"Single-tenant physical servers for workloads that need full hardware control.",
			description:
				"ZenthBareMetal provides dedicated physical machines. There is no hypervisor between the operating system and the hardware, so you control the kernel, the network stack and the firmware update policy. Company provides the machine, the network port and remote management; the operating system and everything above it remain yours.",
			availability: "limited" as const,
			deliveryModels: ["company_owned" as const, "partner_provided" as const],
			benefits: [
				"No noisy neighbours and no hypervisor overhead",
				"Full control of kernel, drivers and networking",
				"Predictable monthly capacity for steady workloads",
			],
			features: [
				"Remote hands and reinstallation",
				"IPv4 and IPv6 addressing",
				"Private network interconnection",
				"Hardware replacement under contract",
			],
			specs: [
				{
					title: "Hardware",
					rows: [
						{ label: "CPU", value: "Single- or dual-socket configurations" },
						{ label: "Memory", value: "Configured per server" },
						{ label: "Storage", value: "NVMe or SSD, RAID options per chassis" },
						{ label: "Network", value: "Redundant uplinks where contracted" },
					],
				},
				{
					title: "Operations",
					rows: [
						{ label: "Access", value: "SSH and out-of-band console" },
						{ label: "Reinstallation", value: "Automated or on request" },
						{ label: "Contract", value: "Monthly commitment, custom terms" },
					],
				},
			],
			availabilityByRegion: availabilityFor("bare-metal", [
				euEntry("contact_sales", "Hardware catalogue and facility are confirmed with sales.", "dedicated"),
				partnerEntry("partner_service", "Partner-operated hardware; the operator is named in the quote.", "dedicated"),
			]),
			related: ["private-cloud", "networking", "backup"],
			featured: true,
			tags: ["dedicated servers", "physical hardware"],
			docsPath: null,
			seo: {
				title: "ZenthBareMetal — Company",
				description:
					"Dedicated single-tenant servers with full hardware control, remote management and optional private networking.",
			},
		},
		{
			id: "gpu-instances",
			route: "/products/public-cloud/gpu",
			name: "ZenthGPU",
			family: "compute-infrastructure" as const,
			relatedFamilies: ["developer-platform" as const],
			tagline: "Accelerated computing for training and inference",
			summary:
				"Virtual machines with passthrough GPUs for model training, inference, rendering and scientific workloads.",
			description:
				"ZenthGPU provides dedicated accelerator cards attached to a virtual machine. It is intended for workloads that need predictable access to a GPU rather than a shared scheduling queue. Availability, card models and supported drivers are published only once a supplier has confirmed them, so the current page describes the offer structure without naming hardware that has not been contracted.",
			availability: "limited" as const,
			deliveryModels: ["company_operated" as const, "partner_provided" as const],
			benefits: [
				"Whole-GPU allocation with no time-slicing by default",
				"Standard images with CUDA-compatible drivers",
				"Attach block storage sized for datasets and checkpoints",
			],
			features: [
				"Passthrough GPU allocation",
				"Custom images and container-based workflows",
				"Private networking for multi-node jobs",
				"Snapshots for environment reproducibility",
			],
			specs: [
				{
					title: "Accelerator",
					rows: [
						{ label: "GPU model", value: "Published per contracted supplier" },
						{ label: "Allocation", value: "One or more whole GPUs per instance" },
						{ label: "Virtualisation", value: "Passthrough" },
					],
				},
				{
					title: "Workload fit",
					rows: [
						{ label: "Training", value: "Single or multi-node with private networking" },
						{ label: "Inference", value: "Long-running services or batch jobs" },
						{ label: "Storage", value: "Block volumes for datasets and checkpoints" },
					],
				},
			],
			availabilityByRegion: availabilityFor("gpu-instances", [
				euEntry("coming_soon", "GPU models and capacity are not yet published.", "dedicated"),
				partnerEntry("partner_service", "Partner-operated accelerators; model and country confirmed at order.", "dedicated"),
			]),
			related: ["compute-instances", "block-storage", "kubernetes"],
			featured: true,
			tags: ["gpu", "accelerators", "ai"],
			docsPath: "/resources/documentation",
			seo: {
				title: "ZenthGPU — Company",
				description:
					"Dedicated GPU virtual machines for training, inference and rendering. Hardware and capacity are published only once contracted.",
			},
		},
		{
			id: "zenth-containers",
			route: null,
			name: "ZenthContainers",
			family: "compute-infrastructure" as const,
			relatedFamilies: ["developer-platform" as const],
			tagline: "Container execution environments",
			summary: "Container execution environments for stateless workloads.",
			description:
				"Managed container runtime for stateless workloads. Planned; orchestration model, registry integration and limits are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["containers"],
		},
		{
			id: "kubernetes",
			route: "/products/public-cloud/kubernetes",
			name: "ZenthKubernetes",
			family: "compute-infrastructure" as const,
			relatedFamilies: ["developer-platform" as const],
			tagline: "A managed control plane for containers",
			summary:
				"Kubernetes clusters with a managed control plane and your worker nodes.",
			description:
				"ZenthKubernetes operates the cluster control plane and leaves worker capacity under your control. It suits teams already standardised on Kubernetes that do not want to run etcd or the API server. The page describes the responsibility split; version support, SLA and autoscaling behaviour are published only once verified.",
			availability: "limited" as const,
			deliveryModels: ["company_operated" as const, "partner_provided" as const],
			benefits: [
				"Managed control plane with upgrades",
				"Worker pools sized independently",
				"Integration with private networking and separate load balancing",
			],
			features: [
				"Managed API server and etcd",
				"Worker node pools",
				"kubectl and API access",
				"Private network attachment",
			],
			specs: [
				{
					title: "Cluster",
					rows: [
						{ label: "Control plane", value: "Managed by Company" },
						{ label: "Workers", value: "Customer-selected pools" },
						{ label: "Access", value: "kubectl and Kubernetes API" },
					],
				},
				{
					title: "Responsibility",
					rows: [
						{ label: "Control plane upgrades", value: "Managed" },
						{ label: "Workload configuration", value: "Customer" },
						{ label: "SLA", value: "Not published from this page" },
					],
				},
			],
			availabilityByRegion: availabilityFor("kubernetes", [
				euEntry("coming_soon", "Supported versions and SLA are not yet published."),
				partnerEntry("partner_service", "Partner-operated clusters; operator and versions confirmed at order."),
			]),
			related: ["compute-instances", "networking", "managed-services"],
			featured: true,
			tags: ["kubernetes", "containers", "orchestration"],
			docsPath: "/resources/documentation",
			seo: {
				title: "ZenthKubernetes — Company",
				description:
					"Kubernetes with a managed control plane and customer-controlled worker pools, integrated with private networking.",
			},
		},
		{
			id: "private-cloud",
			route: "/products/private-cloud",
			name: "ZenthPrivateCloud",
			family: "compute-infrastructure" as const,
			relatedFamilies: ["cloud-management" as const, "security-identity" as const],
			tagline: "A dedicated virtualisation estate",
			summary:
				"Reserved compute, storage and networking for organisations that need isolation.",
			description:
				"A ZenthPrivateCloud reserves a pool of compute and storage for one organisation. It is intended for workloads that cannot share a multi-tenant platform, or that need their own network boundaries and quota model. The estate can be operated by Company or handed to your team with Company support.",
			availability: "limited" as const,
			deliveryModels: ["company_operated" as const, "partner_provided" as const],
			benefits: [
				"Reserved capacity rather than shared tenancy",
				"Organisation-specific network and quota boundaries",
				"Migration path from individual instances",
			],
			features: [
				"Reserved compute pool",
				"Dedicated storage pool",
				"Private network segmentation",
				"Optional managed operations",
			],
			specs: [
				{
					title: "Estate",
					rows: [
						{ label: "Compute", value: "Reserved vCPU and memory pool" },
						{ label: "Storage", value: "Dedicated block pool" },
						{ label: "Network", value: "Isolated private network" },
						{ label: "Quotas", value: "Per-project limits" },
					],
				},
				{
					title: "Responsibility",
					rows: [
						{ label: "Platform operations", value: "Company or your team" },
						{ label: "Guest systems", value: "Always the customer" },
						{ label: "Contract", value: "Custom, capacity-based" },
					],
				},
			],
			availabilityByRegion: availabilityFor("private-cloud", [
				euEntry("contact_sales", "Capacity and isolation requirements are reviewed with sales.", "dedicated"),
				partnerEntry("partner_service", "Partner capacity; the operator is disclosed in the contract.", "dedicated"),
			]),
			related: ["bare-metal", "networking", "managed-services"],
			featured: false,
			tags: ["private cloud", "isolation"],
			docsPath: null,
			seo: {
				title: "ZenthPrivateCloud — Company",
				description:
					"Reserved compute, storage and networking for organisations that need isolation and their own quota model.",
			},
		},
		{
			id: "web-hosting",
			route: "/products/web-hosting",
			name: "ZenthWebHosting",
			family: "compute-infrastructure" as const,
			relatedFamilies: ["network-edge" as const],
			tagline: "Managed hosting for sites and applications",
			summary:
				"Managed runtime, TLS and updates for websites and small applications.",
			description:
				"ZenthWebHosting provides a managed runtime for websites and small applications, including TLS certificates and routine updates. It is designed for users who want a working site without administering a server. Resource limits per plan, supported runtimes and migration options are published with pricing.",
			availability: "limited" as const,
			deliveryModels: ["company_operated" as const, "partner_provided" as const],
			benefits: [
				"No server administration",
				"TLS certificates managed for you",
				"Upgrade path to ZenthCompute",
			],
			features: [
				"Managed runtime",
				"Automatic TLS",
				"Scheduled backups",
				"Upgrade path to ZenthCompute",
			],
			specs: [
				{
					title: "Runtime",
					rows: [
						{ label: "Web server", value: "Managed" },
						{ label: "TLS", value: "Automatically issued and renewed" },
						{ label: "Runtimes", value: "Published per plan" },
					],
				},
				{
					title: "Limits",
					rows: [
						{ label: "Storage", value: "Per plan" },
						{ label: "Traffic", value: "Per plan" },
						{ label: "Backups", value: "Scheduled; retention per plan" },
					],
				},
			],
			availabilityByRegion: availabilityFor("web-hosting", [
				euEntry("coming_soon", "Plan limits and supported runtimes are not yet published."),
				partnerEntry("partner_service", "Partner-operated hosting; provider is named at order."),
			]),
			related: ["domain-services", "compute-instances", "backup"],
			featured: false,
			tags: ["hosting", "websites"],
			docsPath: "/resources/tutorials",
			seo: {
				title: "ZenthWebHosting — Company",
				description:
					"Managed web hosting with automatic TLS, routine updates and a clear upgrade path to cloud compute.",
			},
		},

		/* ------------------------------------------------------------------ */
		/* Storage & Databases                                                */
		/* ------------------------------------------------------------------ */
		{
			id: "object-storage",
			route: "/products/public-cloud/object-storage",
			name: "ZenthObject",
			family: "storage-databases" as const,
			relatedFamilies: ["developer-platform" as const, "security-identity" as const],
			tagline: "Durable object storage over an HTTP API",
			summary:
				"Bucket-based storage for backups, media and application assets.",
			description:
				"ZenthObject stores immutable objects in buckets and exposes them through an HTTP API. S3 compatibility is not advertised until an interoperable endpoint has been verified and published, so this page describes the product model rather than claiming a specific API contract.",
			availability: "limited" as const,
			deliveryModels: ["company_operated" as const, "partner_provided" as const],
			benefits: [
				"Buckets with per-object metadata and lifecycle rules",
				"Access keys scoped per bucket or project",
				"Separate from block storage, sized for unstructured data",
			],
			features: [
				"Bucket policies and access keys",
				"Lifecycle and retention rules",
				"Server-side encryption",
				"Usage-based billing",
			],
			specs: [
				{
					title: "Storage model",
					rows: [
						{ label: "Unit", value: "Bucket and object" },
						{ label: "API", value: "HTTP API; S3 compatibility is not yet published" },
						{ label: "Metadata", value: "Per-object, user-defined" },
						{ label: "Durability", value: "Publication pending contractual verification" },
					],
				},
				{
					title: "Access",
					rows: [
						{ label: "Authentication", value: "Scoped access keys" },
						{ label: "Encryption", value: "Server-side, at rest" },
						{ label: "Lifecycle", value: "Retention and transition rules" },
					],
				},
			],
			availabilityByRegion: availabilityFor("object-storage", [
				euEntry("coming_soon", "Endpoint and S3 compatibility are not yet published."),
				partnerEntry("partner_service", "Delivered through a partner; API contract is confirmed at order."),
			]),
			related: ["backup", "block-storage", "zenth-secrets"],
			featured: true,
			tags: ["object storage", "buckets"],
			docsPath: "/resources/api",
			seo: {
				title: "ZenthObject — Company",
				description:
					"Bucket-based object storage for backups, media and application assets, with scoped access keys and lifecycle rules.",
			},
		},
		{
			id: "block-storage",
			route: "/products/public-cloud/block-storage",
			name: "ZenthBlock",
			family: "storage-databases" as const,
			relatedFamilies: ["compute-infrastructure" as const],
			tagline: "Attachable volumes for instances",
			summary:
				"Network-attached volumes that can be detached, snapshotted and reattached.",
			description:
				"ZenthBlock provides volumes that behave like local disks but persist independently of an instance. A volume can be detached from one instance and attached to another, and snapshotted before risky operations. Volumes are the right choice for databases, application state and anything that needs a filesystem.",
			availability: "limited" as const,
			deliveryModels: ["company_operated" as const, "partner_provided" as const],
			benefits: [
				"Independent lifecycle from the compute instance",
				"Snapshots before upgrades or migrations",
				"Move a volume between instances in the same region",
			],
			features: [
				"Attach and detach while stopped",
				"Snapshot and restore",
				"Per-volume encryption",
				"Size in GiB, billed monthly",
			],
			specs: [
				{
					title: "Volume",
					rows: [
						{ label: "Type", value: "Network-attached block device" },
						{ label: "Attachment", value: "One instance at a time" },
						{ label: "Encryption", value: "At rest" },
						{ label: "Snapshots", value: "Per volume" },
					],
				},
				{
					title: "Limits",
					rows: [
						{ label: "Region scope", value: "Attach only within the same region" },
						{ label: "Resize", value: "Grow only; shrinking is not supported" },
					],
				},
			],
			availabilityByRegion: availabilityFor("block-storage", [
				euEntry("coming_soon", "Volume classes and performance tiers are not yet published."),
				partnerEntry("contact_sales", "Partner capacity is quoted per project."),
			]),
			related: ["compute-instances", "backup", "object-storage"],
			featured: true,
			tags: ["block storage", "volumes"],
			docsPath: "/resources/documentation",
			seo: {
				title: "ZenthBlock — Company",
				description:
					"Network-attached volumes with snapshots and encryption, independent from the lifecycle of a compute instance.",
			},
		},
		{
			id: "backup",
			route: "/products/public-cloud/backup",
			name: "ZenthBackup",
			family: "storage-databases" as const,
			relatedFamilies: ["cloud-management" as const],
			tagline: "Recoverable copies of volumes and databases",
			summary:
				"Scheduled backups and on-demand snapshots with defined retention.",
			description:
				"ZenthBackup covers two related mechanisms: instance and volume snapshots for fast rollback, and scheduled backups with longer retention for recovery. Retention is a contractual setting, not a promise: the page states the mechanism and the configuration surface, and the exact retention offered per plan is published with pricing.",
			availability: "limited" as const,
			deliveryModels: ["company_operated" as const, "partner_provided" as const],
			benefits: [
				"Separate rollback (snapshots) and recovery (backups) paths",
				"Retention configured per policy",
				"Restore into a new volume or instance",
			],
			features: [
				"On-demand snapshots",
				"Scheduled backup policies",
				"Restore to a new resource",
				"Retention configuration",
			],
			specs: [
				{
					title: "Mechanisms",
					rows: [
						{ label: "Snapshot", value: "Point-in-time copy of a volume" },
						{ label: "Backup", value: "Scheduled copy with retention" },
						{ label: "Restore", value: "New volume or instance" },
					],
				},
				{
					title: "Policy",
					rows: [
						{ label: "Schedule", value: "Configurable per resource" },
						{ label: "Retention", value: "Published per plan" },
						{ label: "Encryption", value: "Inherited from the source volume" },
					],
				},
			],
			availabilityByRegion: availabilityFor("backup", [
				euEntry("coming_soon", "Retention periods and included capacity are not yet published."),
				partnerEntry("partner_service", "Partner-operated backup target; retention confirmed at order."),
			]),
			related: ["block-storage", "object-storage", "managed-services"],
			featured: true,
			tags: ["backup", "snapshots", "recovery"],
			docsPath: "/resources/documentation",
			seo: {
				title: "ZenthBackup — Company",
				description:
					"Snapshots for rollback and scheduled backups with configurable retention, restorable into new volumes or instances.",
			},
		},
		{
			id: "zenth-archive",
			route: null,
			name: "ZenthArchive",
			family: "storage-databases" as const,
			relatedFamilies: ["cloud-management" as const],
			tagline: "Long-term data retention",
			summary: "Long-term retention for data that must be kept but rarely read.",
			description:
				"Low-cost retention for data that must be kept but rarely read. Planned; storage classes, retrieval times and retention terms are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["archive", "retention"],
		},
		{
			id: "databases",
			route: "/products/public-cloud/databases",
			name: "ZenthDatabase",
			family: "storage-databases" as const,
			relatedFamilies: ["developer-platform" as const],
			tagline: "PostgreSQL, MySQL, MariaDB and Redis",
			summary:
				"Provisioned database engines with backups, updates and connection management.",
			description:
				"ZenthDatabase provisions a database engine, its storage and its backup policy, and keeps the engine patched. It removes day-two work such as version upgrades and backup verification, but it does not make an application highly available by itself: replica topology and failover behaviour are stated per plan, not assumed. Database engines are offers beneath ZenthDatabase rather than separate product families.",
			availability: "limited" as const,
			deliveryModels: ["company_operated" as const, "partner_provided" as const],
			benefits: [
				"Provisioning without operating the host",
				"Automated backups with restore",
				"Engine version upgrades handled for you",
			],
			features: [
				"PostgreSQL, MySQL, MariaDB and Redis",
				"Automated backups",
				"Private network-only access",
				"Connection pooling options",
			],
			specs: [
				{
					title: "Engines",
					rows: [
						{ label: "Relational", value: "PostgreSQL, MySQL, MariaDB" },
						{ label: "Key-value", value: "Redis" },
						{ label: "Access", value: "Private network by default" },
					],
				},
				{
					title: "Operations",
					rows: [
						{ label: "Backups", value: "Automated, restore to a new instance" },
						{ label: "Upgrades", value: "Minor versions managed" },
						{ label: "Topology", value: "Stated per plan; no implicit HA" },
					],
				},
			],
			availabilityByRegion: availabilityFor("databases", [
				euEntry("coming_soon", "Engine versions and plan topology are not yet published."),
				partnerEntry("partner_service", "Partner-operated databases; the operator is named in the quote."),
			]),
			related: ["compute-instances", "backup", "kubernetes"],
			featured: true,
			tags: ["postgresql", "mysql", "mariadb", "redis"],
			docsPath: "/resources/documentation",
			seo: {
				title: "ZenthDatabase — Company",
				description:
					"Provisioned PostgreSQL, MySQL, MariaDB and Redis with automated backups, patching and private network access.",
			},
		},

		/* ------------------------------------------------------------------ */
		/* Developer Platform                                                 */
		/* ------------------------------------------------------------------ */
		{
			id: "zenth-paas",
			route: null,
			name: "ZenthPaaS",
			family: "developer-platform" as const,
			relatedFamilies: ["compute-infrastructure" as const],
			tagline: "Application deployment and operations platform",
			summary: "A platform for building and operating applications on Company.",
			description:
				"A platform for building and operating applications on Company. In planning. The relationship between ZenthPaaS and Notploy is not established on this website, and neither product is presented as the other.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			featured: true,
			tags: ["paas", "deployment"],
		},
		{
			id: "zenth-registry",
			route: null,
			name: "ZenthRegistry",
			family: "developer-platform" as const,
			relatedFamilies: ["compute-infrastructure" as const, "security-identity" as const],
			tagline: "Container image and artifact registry",
			summary: "Container image and artifact registry.",
			description:
				"A registry for container images and build artifacts. Planned; supported formats, storage limits and access controls are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["registry", "containers", "artifacts"],
		},
		{
			id: "zenth-ci-cd",
			route: null,
			name: "ZenthCI/CD",
			family: "developer-platform" as const,
			relatedFamilies: ["compute-infrastructure" as const],
			tagline: "Continuous integration and delivery pipelines",
			summary: "Continuous integration and delivery pipelines.",
			description:
				"Pipelines that build, test and deploy applications on Company. Planned; supported runtimes and repository integrations are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			featured: true,
			tags: ["ci", "cd", "pipelines"],
		},
		{
			id: "zenth-functions",
			route: null,
			name: "ZenthFunctions",
			family: "developer-platform" as const,
			relatedFamilies: ["network-edge" as const],
			tagline: "Serverless function execution",
			summary: "Event-driven function execution without managing servers.",
			description:
				"Event-driven function execution without managing servers. Planned; supported runtimes, limits and triggers are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			featured: true,
			tags: ["serverless", "functions"],
		},
		{
			id: "zenth-build",
			route: null,
			name: "ZenthBuild",
			family: "developer-platform" as const,
			relatedFamilies: ["compute-infrastructure" as const],
			tagline: "Build pipelines and artifact construction",
			summary: "Build pipelines and artifact construction.",
			description:
				"Build pipelines that produce deployable artifacts and images. Planned; build environments, caching and limits are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["build", "artifacts"],
		},
		{
			id: "zenth-deploy",
			route: null,
			name: "ZenthDeploy",
			family: "developer-platform" as const,
			relatedFamilies: ["compute-infrastructure" as const, "cloud-management" as const],
			tagline: "Deployment lifecycle management",
			summary: "Deployment lifecycle management.",
			description:
				"Deployment lifecycle management across Company resources. Planned; supported strategies and rollback behaviour are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["deployment", "release"],
		},
		{
			id: "zenth-jobs",
			route: null,
			name: "ZenthJobs",
			family: "developer-platform" as const,
			relatedFamilies: ["cloud-management" as const],
			tagline: "Scheduled and one-off jobs",
			summary: "Scheduled and one-off jobs.",
			description:
				"Scheduled and one-off job execution. Planned; scheduling guarantees, retries and limits are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["jobs", "scheduling"],
		},
		{
			id: "zenth-observability",
			route: null,
			name: "ZenthObservability",
			family: "developer-platform" as const,
			relatedFamilies: ["cloud-management" as const, "network-edge" as const],
			tagline: "Metrics, logs, traces and monitoring",
			summary: "Metrics, logs, traces and monitoring.",
			description:
				"Metrics, logs, traces and alerting for Company resources. Planned; retention, instrumentation and alert-routing behaviour are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			featured: true,
			tags: ["observability", "metrics", "logs", "traces"],
		},
		{
			id: "zenth-secrets",
			route: null,
			name: "ZenthSecrets",
			family: "developer-platform" as const,
			relatedFamilies: ["security-identity" as const],
			tagline: "Application secret management",
			summary: "Application secret management.",
			description:
				"Storage and distribution of application secrets. Planned; encryption model, rotation and access policy are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["secrets", "configuration"],
		},

		/* ------------------------------------------------------------------ */
		/* Security & Identity                                                */
		/* ------------------------------------------------------------------ */
		{
			id: "zenth-iam",
			route: null,
			name: "ZenthIAM",
			family: "security-identity" as const,
			relatedFamilies: ["cloud-management" as const],
			tagline: "Identities, users, roles and permissions",
			summary: "Identities, users, roles and permissions.",
			description:
				"Identity, users, roles and permissions for Company organisations. Planned; supported identity sources, role model and policy behaviour are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			featured: true,
			tags: ["identity", "roles", "permissions"],
		},
		{
			id: "zenth-access",
			route: null,
			name: "ZenthAccess",
			family: "security-identity" as const,
			relatedFamilies: ["network-edge" as const],
			tagline: "Secure access to cloud resources",
			summary: "Secure access to cloud resources.",
			description:
				"Controlled access to Company resources and private services. Planned; supported authentication methods and access policies are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			featured: true,
			tags: ["access", "zero trust"],
		},
		{
			id: "zenth-firewall",
			route: null,
			name: "ZenthFirewall",
			family: "security-identity" as const,
			relatedFamilies: ["network-edge" as const],
			tagline: "Network traffic filtering and policy enforcement",
			summary: "Network traffic filtering and policy enforcement.",
			description:
				"Network traffic filtering and policy enforcement for Company projects. The capability is modelled as coming soon; rule syntax, logging and limits are not published.",
			availability: "coming_soon" as const,
			deliveryModels: ["company_operated" as const],
			featured: true,
			tags: ["firewall", "network security"],
		},
		{
			id: "zenth-audit",
			route: null,
			name: "ZenthAudit",
			family: "security-identity" as const,
			relatedFamilies: ["cloud-management" as const],
			tagline: "Audit trails and action traceability",
			summary: "Audit trails and action traceability.",
			description:
				"Audit trails for actions taken on Company resources. Planned; event coverage, retention and export formats are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["audit", "compliance"],
		},
		{
			id: "zenth-vault",
			route: null,
			name: "ZenthVault",
			family: "security-identity" as const,
			relatedFamilies: ["developer-platform" as const],
			tagline: "Secure storage and distribution of secrets",
			summary: "Secure storage and distribution of secrets.",
			description:
				"Secure storage and distribution of secrets for applications and operators. Planned; the encryption model and access policy are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			featured: true,
			tags: ["secrets", "vault"],
		},

		/* ------------------------------------------------------------------ */
		/* Cloud Management                                                   */
		/* ------------------------------------------------------------------ */
		{
			id: "managed-services",
			route: "/products/managed-services",
			name: "Managed Services",
			family: "cloud-management" as const,
			relatedFamilies: ["compute-infrastructure" as const, "security-identity" as const],
			tagline: "Operations delegated under a defined scope",
			summary:
				"Infrastructure operations, patching and monitoring delivered as a service.",
			description:
				"Managed Services transfers a defined set of operational tasks to Company: patching, monitoring, backup verification and incident response within an agreed scope. The scope is contractual and written down before the service starts; this page does not claim coverage or response times that are not in a signed agreement.",
			availability: "limited" as const,
			deliveryModels: ["managed_service" as const, "partner_provided" as const],
			benefits: [
				"Written responsibility matrix before onboarding",
				"Patching and backup verification handled",
				"Escalation path to the infrastructure team",
			],
			features: [
				"Operating system patching",
				"Monitoring and alert triage",
				"Backup verification",
				"Incident escalation",
			],
			specs: [
				{
					title: "Scope",
					rows: [
						{ label: "Included", value: "Defined per contract" },
						{ label: "Excluded", value: "Application code and customer data" },
						{ label: "Reporting", value: "Monthly operations report" },
					],
				},
				{
					title: "Contract",
					rows: [
						{ label: "Response times", value: "Only as agreed in writing" },
						{ label: "Coverage", value: "Business hours by default" },
					],
				},
			],
			availabilityByRegion: availabilityFor("managed-services", [
				euEntry("contact_sales", "Scope and response times are agreed per contract.", "managed"),
				partnerEntry("partner_service", "Partner delivery; the operating provider is disclosed.", "managed"),
			]),
			related: ["private-cloud", "kubernetes", "zenth-orchestrator"],
			featured: true,
			tags: ["managed operations", "support"],
			docsPath: null,
			seo: {
				title: "Managed Services — Company",
				description:
					"Infrastructure operations with a written responsibility matrix: patching, monitoring, backup verification and escalation.",
			},
		},
		{
			id: "zenth-orchestrator",
			route: null,
			name: "ZenthOrchestrator",
			family: "cloud-management" as const,
			relatedFamilies: ["compute-infrastructure" as const, "developer-platform" as const],
			tagline: "Infrastructure provisioning and orchestration",
			summary: "Infrastructure provisioning and orchestration.",
			description:
				"Infrastructure provisioning and orchestration across Company resources. Planned; supported resource types and orchestration behaviour are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["orchestration", "provisioning"],
		},
		{
			id: "zenth-billing",
			route: null,
			name: "ZenthBilling",
			family: "cloud-management" as const,
			relatedFamilies: ["storage-databases" as const],
			tagline: "Billing, usage and cost visibility",
			summary: "Billing, usage and cost visibility.",
			description:
				"Billing, usage and cost visibility for Company accounts. Planned; invoice formats, cost allocation and exports are not published.",
			availability: "planned" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["billing", "usage", "costs"],
		},
		{
			id: "zenth-support",
			route: null,
			name: "ZenthSupport",
			family: "cloud-management" as const,
			relatedFamilies: ["developer-platform" as const],
			tagline: "Customer support and service requests",
			summary: "Customer support and service requests.",
			description:
				"Customer support and service requests for Company accounts. Support routes are documented; response commitments exist only where a contract states them.",
			availability: "coming_soon" as const,
			deliveryModels: ["company_operated" as const],
			tags: ["support", "service requests"],
			docsPath: "/resources/support",
		},
	],
	plans: [
		{
			id: "compute-standard-hourly",
			productId: "compute-instances",
			name: "Standard instance",
			billingModel: "hourly" as const,
			currency: "EUR" as const,
			amountMinor: null,
			billingInterval: "hour" as const,
			unitLabel: "per instance",
			conditions: ["Price not published", "Billing stops when the instance is deleted"],
			status: "draft" as const,
		},
		{
			id: "compute-dedicated-monthly",
			productId: "compute-instances",
			name: "Dedicated vCPU instance",
			billingModel: "monthly" as const,
			currency: "EUR" as const,
			amountMinor: null,
			billingInterval: "month" as const,
			unitLabel: "per instance",
			conditions: ["Price not published", "Monthly commitment"],
			status: "draft" as const,
		},
		{
			id: "gpu-hourly",
			productId: "gpu-instances",
			name: "GPU instance",
			billingModel: "hourly" as const,
			currency: "EUR" as const,
			amountMinor: null,
			billingInterval: "hour" as const,
			unitLabel: "per GPU",
			conditions: ["Price not published", "Hardware model confirmed at order"],
			status: "draft" as const,
		},
		{
			id: "bare-metal-monthly",
			productId: "bare-metal",
			name: "Dedicated server",
			billingModel: "monthly" as const,
			currency: "EUR" as const,
			amountMinor: null,
			billingInterval: "month" as const,
			unitLabel: "per server",
			conditions: ["Price not published", "Configuration quoted individually"],
			status: "draft" as const,
		},
		{
			id: "private-cloud-custom",
			productId: "private-cloud",
			name: "Private estate",
			billingModel: "custom" as const,
			currency: "EUR" as const,
			amountMinor: null,
			billingInterval: "custom" as const,
			unitLabel: "per contract",
			conditions: ["Custom pricing", "Capacity-based contract"],
			status: "draft" as const,
		},
		{
			id: "object-storage-usage",
			productId: "object-storage",
			name: "Object storage",
			billingModel: "usage" as const,
			currency: "EUR" as const,
			amountMinor: null,
			billingInterval: "gb_month" as const,
			unitLabel: "per GB-month",
			conditions: ["Price not published", "Requests billed separately once published"],
			status: "draft" as const,
		},
		{
			id: "block-storage-monthly",
			productId: "block-storage",
			name: "Block volume",
			billingModel: "monthly" as const,
			currency: "EUR" as const,
			amountMinor: null,
			billingInterval: "gb_month" as const,
			unitLabel: "per GB-month",
			conditions: ["Price not published", "Billed while the volume exists"],
			status: "draft" as const,
		},
		{
			id: "backup-usage",
			productId: "backup",
			name: "Backup storage",
			billingModel: "usage" as const,
			currency: "EUR" as const,
			amountMinor: null,
			billingInterval: "gb_month" as const,
			unitLabel: "per GB-month",
			conditions: ["Price not published", "Retention defined per policy"],
			status: "draft" as const,
		},
		{
			id: "networking-usage",
			productId: "networking",
			name: "Private network",
			billingModel: "usage" as const,
			currency: "EUR" as const,
			amountMinor: null,
			billingInterval: "custom" as const,
			unitLabel: "per resource",
			conditions: ["Price not published", "Public addresses and load balancing are separate products"],
			status: "draft" as const,
		},
		{
			id: "databases-hourly",
			productId: "databases",
			name: "Managed database",
			billingModel: "hourly" as const,
			currency: "EUR" as const,
			amountMinor: null,
			billingInterval: "hour" as const,
			unitLabel: "per instance",
			conditions: ["Price not published", "Storage billed separately"],
			status: "draft" as const,
		},
		{
			id: "kubernetes-cluster-monthly",
			productId: "kubernetes",
			name: "Cluster control plane",
			billingModel: "monthly" as const,
			currency: "EUR" as const,
			amountMinor: null,
			billingInterval: "month" as const,
			unitLabel: "per cluster",
			conditions: ["Price not published", "Worker nodes billed separately"],
			status: "draft" as const,
		},
		{
			id: "managed-services-custom",
			productId: "managed-services",
			name: "Managed operations",
			billingModel: "custom" as const,
			currency: "EUR" as const,
			amountMinor: null,
			billingInterval: "custom" as const,
			unitLabel: "per contract",
			conditions: ["Custom pricing", "Scope agreed in writing"],
			status: "draft" as const,
		},
		{
			id: "web-hosting-monthly",
			productId: "web-hosting",
			name: "Hosting plan",
			billingModel: "monthly" as const,
			currency: "EUR" as const,
			amountMinor: null,
			billingInterval: "month" as const,
			unitLabel: "per site",
			conditions: ["Price not published", "Resource limits per plan"],
			status: "draft" as const,
		},
		{
			id: "domain-services-custom",
			productId: "domain-services",
			name: "Registration and DNS",
			billingModel: "custom" as const,
			currency: "EUR" as const,
			amountMinor: null,
			billingInterval: "custom" as const,
			unitLabel: "per domain",
			conditions: ["Registrar fees apply", "Price depends on the extension"],
			status: "draft" as const,
		},
	],
};

export const catalogue: Catalogue = CatalogueSchema.parse(catalogueData);
