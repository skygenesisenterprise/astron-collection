import type { ProductFamily } from "@/lib/domain/schema";

export type PricingCategory = {
	slug: string;
	title: string;
	description: string;
	intro: string;
	families: ProductFamily[];
	productIds?: string[];
	notes: string[];
};

export const pricingCategories: PricingCategory[] = [
	{
		slug: "compute",
		title: "Compute pricing",
		description:
			"Instance, GPU, bare metal and private cloud plans. Prices are not published yet.",
		intro:
			"Compute is billed either hourly for elastic workloads or monthly for reserved capacity. Every plan below is modelled in the catalogue with its billing model and conditions; none has an approved price, so the interface shows “Price not published” rather than a number.",
		families: ["compute-infrastructure"],
		notes: [
			"Hourly plans are intended to stop billing when the resource is deleted.",
			"Monthly plans are reservations and are not pro-rated unless the contract says so.",
			"Private Cloud and bare metal are quoted per configuration.",
		],
	},
	{
		slug: "storage",
		title: "Storage pricing",
		description:
			"Object, block and backup storage, billed by capacity and retention.",
		intro:
			"Storage plans are usage-based or monthly, measured in GB-month. Request charges for object storage will be published separately once the endpoint is verified. Backup retention is a policy setting, and its price depends on the retained volume.",
		families: ["storage-databases"],
		notes: [
			"Block volumes bill while they exist, whether or not they are attached.",
			"Object storage request pricing is not published.",
			"Snapshots and backups are billed as retained capacity.",
		],
	},
	{
		slug: "networking",
		title: "Networking pricing",
		description:
			"Public addresses, private networks, load balancers and connectivity.",
		intro:
			"Networking is billed per resource or per usage depending on the service. Bandwidth allowances are published per product and region; cross-region options are not offered until they have been verified.",
		families: ["network-edge"],
		notes: [
			"Public IPv4 addresses are typically billed per address and month.",
			"Load balancers are billed per instance, not per request.",
			"Ingress and egress allowances are not claimed globally.",
		],
	},
	{
		slug: "hosting",
		title: "Hosting pricing",
		description:
			"Web hosting, domains, email and managed platform plans.",
		intro:
			"Hosting plans are monthly and include their stated resource limits. Domain registration is priced by the accredited registrar and depends on the extension. Mailbox plans are billed per mailbox.",
		families: ["compute-infrastructure", "developer-platform"],
		notes: [
			"Domain prices are set by the registrar and vary by extension.",
			"Hosting plan limits are published with the plan, not inferred.",
			"Managed Kubernetes does not include worker node cost.",
		],
	},
	{
		slug: "enterprise",
		title: "Enterprise pricing",
		description:
			"Private estates, dedicated hardware and managed operations under contract.",
		intro:
			"Enterprise services are quoted individually. The scope — capacity, isolation, network, support and any SLA — is written into the contract before work starts. There is no public list price for these services.",
		families: ["compute-infrastructure", "cloud-management", "security-identity"],
		productIds: ["private-cloud", "bare-metal", "managed-services"],
		notes: [
			"Quotes are valid for the period stated in the quote.",
			"An SLA exists only where the contract includes one.",
			"Certifications are listed only when independently verified.",
		],
	},
];

export const pricingBySlug = new Map(
	pricingCategories.map((category) => [category.slug, category]),
);
