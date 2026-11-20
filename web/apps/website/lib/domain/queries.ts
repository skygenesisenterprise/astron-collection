import type { Metadata } from "next";
import { catalogue } from "./catalogue";
import type {
	Availability,
	CommercialStatus,
	Product,
	ProductAvailability,
	ProductDeliveryModel,
	ProductFamily,
	Provider,
	Region,
} from "./schema";

/**
 * Read-only access layer for the catalogue.
 *
 * Pages must import from here rather than reaching into `catalogue` directly,
 * so the data source can move behind a public API without touching templates.
 */

export const SITE_URL = "https://company.com";
export const SITE_NAME = "Company";

export const FAMILIES: Record<
	ProductFamily,
	{ name: string; valueProposition: string; description: string; route: string }
> = {
	"network-edge": {
		name: "Network & Edge",
		valueProposition:
			"Connect, route, distribute and protect the traffic that reaches your applications.",
		description:
			"DNS, private networking, reverse proxying, content delivery, load balancing and protection for the entry points to your services.",
		route: "/products/network-edge",
	},
	"compute-infrastructure": {
		name: "Compute & Infrastructure",
		valueProposition:
			"Physical and virtual capacity for applications, workloads and private estates.",
		description:
			"Virtual private servers, configurable instances, dedicated hardware, GPU capacity, containers, Kubernetes and managed hosting.",
		route: "/products/compute-infrastructure",
	},
	"storage-databases": {
		name: "Storage & Databases",
		valueProposition:
			"Store, protect, retain and operate the data your applications depend on.",
		description:
			"Object and block storage, backups, long-term retention and managed database engines beneath one catalogue.",
		route: "/products/storage-databases",
	},
	"developer-platform": {
		name: "Developer Platform",
		valueProposition:
			"Build, deploy and operate applications on Company without running the tooling yourself.",
		description:
			"Deployment, registries, pipelines, functions, jobs, secrets and observability for engineering teams.",
		route: "/products/developer-platform",
	},
	"security-identity": {
		name: "Security & Identity",
		valueProposition:
			"Protect resources, applications, identities and every path into your estate.",
		description:
			"Identity, access control, network firewalling, audit trails and secret management, with network protection cross-linked from Network & Edge.",
		route: "/products/security-identity",
	},
	"cloud-management": {
		name: "Cloud Management",
		valueProposition:
			"Organise, control, provision and monitor your cloud environment from one place.",
		description:
			"Projects and resources, orchestration, billing and support, plus the Control Plane capabilities they build on.",
		route: "/products/cloud-management",
	},
};

export const FAMILY_ORDER: ProductFamily[] = [
	"network-edge",
	"compute-infrastructure",
	"storage-databases",
	"developer-platform",
	"security-identity",
	"cloud-management",
];

export const COMMERCIAL_STATUS_META: Record<
	CommercialStatus,
	{ label: string; description: string; tone: "positive" | "neutral" | "info" | "muted" }
> = {
	available: {
		label: "Available",
		description: "Can be ordered and provisioned in this region.",
		tone: "positive",
	},
	coming_soon: {
		label: "Coming soon",
		description: "Designed and announced, not yet open for orders.",
		tone: "neutral",
	},
	contact_sales: {
		label: "Contact sales",
		description: "Offered through a scoped commercial agreement.",
		tone: "info",
	},
	partner_service: {
		label: "Partner service",
		description: "Delivered on external infrastructure integrated into the catalogue.",
		tone: "muted",
	},
};

export const PRODUCT_AVAILABILITY_META: Record<
	ProductAvailability,
	{
		label: string;
		description: string;
		tone: "positive" | "neutral" | "info" | "warning" | "muted";
	}
> = {
	available: {
		label: "Available",
		description: "The service can be ordered and provisioned where the catalogue says so.",
		tone: "positive",
	},
	limited: {
		label: "Limited",
		description:
			"Available in a restricted scope: partner capacity or an agreement scoped with sales.",
		tone: "info",
	},
	private_preview: {
		label: "Private preview",
		description: "Accessible to selected customers and not generally available.",
		tone: "warning",
	},
	coming_soon: {
		label: "Coming soon",
		description: "Designed and announced, but not open for orders.",
		tone: "neutral",
	},
	planned: {
		label: "Planned",
		description:
			"In the catalogue for discovery. It cannot be purchased and no launch date is committed.",
		tone: "muted",
	},
	unavailable: {
		label: "Unavailable",
		description: "Not offered at present.",
		tone: "muted",
	},
};

export const AVAILABILITY_ORDER: ProductAvailability[] = [
	"available",
	"limited",
	"private_preview",
	"coming_soon",
	"planned",
	"unavailable",
];

export const DELIVERY_MODEL_META: Record<ProductDeliveryModel, string> = {
	company_owned: "Company-owned infrastructure",
	company_operated: "Operated by Company",
	partner_provided: "Partner-provided infrastructure",
	managed_service: "Managed service",
	software_service: "Software service",
};

export function getAllProducts(): readonly Product[] {
	return catalogue.products;
}

/** Products that expose a public detail page. */
export function getDetailedProducts(): Product[] {
	return catalogue.products.filter((product) => product.route !== null);
}

export function getProductByRoute(route: string): Product | undefined {
	return catalogue.products.find((product) => product.route === route);
}

export function getProductById(id: string): Product | undefined {
	return catalogue.products.find((product) => product.id === id);
}

function availabilityRank(product: Product): number {
	return AVAILABILITY_ORDER.indexOf(product.availability);
}

/** Products in a family, most available first, then alphabetically. */
export function getProductsByFamily(family: ProductFamily): Product[] {
	return catalogue.products
		.filter((product) => product.family === family)
		.sort(
			(a, b) =>
				availabilityRank(a) - availabilityRank(b) ||
				a.name.localeCompare(b.name),
		);
}

/** Curated services for the Products mega menu. */
export function getFeaturedProductsByFamily(family: ProductFamily): Product[] {
	return getProductsByFamily(family).filter((product) => product.featured);
}

/**
 * Products in other families that name this family as a secondary context.
 * Used for cross-discovery without duplicating catalogue records.
 */
export function getCrossFamilyProducts(family: ProductFamily): Product[] {
	return catalogue.products
		.filter(
			(product) =>
				product.family !== family &&
				product.relatedFamilies.includes(family),
		)
		.sort(
			(a, b) =>
				availabilityRank(a) - availabilityRank(b) ||
				a.name.localeCompare(b.name),
		);
}

export function getRelatedProducts(product: Product): Product[] {
	return product.related
		.map((id) => getProductById(id))
		.filter((candidate): candidate is Product => Boolean(candidate));
}

export function getProvider(id: string): Provider | undefined {
	return catalogue.providers.find((provider) => provider.id === id);
}

export function getRegion(id: string): Region | undefined {
	return catalogue.regions.find((region) => region.id === id);
}

export function getProviders(): readonly Provider[] {
	return catalogue.providers;
}

export function getRegions(): readonly Region[] {
	return catalogue.regions;
}

export function getAvailability(product: Product): Availability[] {
	return product.availabilityByRegion;
}

export function getProductsForProvider(providerId: string): Product[] {
	return catalogue.products.filter((product) =>
		product.availabilityByRegion.some(
			(entry) => entry.providerId === providerId,
		),
	);
}

export function getProductsForRegion(regionId: string): Product[] {
	return catalogue.products.filter((product) =>
		product.availabilityByRegion.some((entry) => entry.regionId === regionId),
	);
}

export function getPlansForProduct(productId: string) {
	return catalogue.plans.filter((plan) => plan.productId === productId);
}

export function getPlansForFamily(family: ProductFamily) {
	const ids = new Set(
		catalogue.products
			.filter((product) => product.family === family)
			.map((product) => product.id),
	);
	return catalogue.plans.filter((plan) => ids.has(plan.productId));
}

export function getPlans() {
	return catalogue.plans;
}

export function pageMetadata({
	title,
	description,
	path,
	noIndex = false,
}: {
	title: string;
	description: string;
	path: string;
	noIndex?: boolean;
}): Metadata {
	const url = `${SITE_URL}${path}`;
	return {
		title,
		description,
		alternates: { canonical: url },
		openGraph: {
			title,
			description,
			url,
			siteName: SITE_NAME,
			locale: "en_GB",
			type: "website",
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: ["/og.png"],
		},
		...(noIndex ? { robots: { index: false, follow: false } } : {}),
	};
}

export function breadcrumbJsonLd(
	items: { name: string; path: string }[],
): Record<string, unknown> {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: `${SITE_URL}${item.path}`,
		})),
	};
}
