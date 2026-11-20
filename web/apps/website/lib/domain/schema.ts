import { z } from "zod";

/**
 * Domain schema for the public commercial catalogue.
 *
 * Everything the website renders about products, providers, regions and
 * prices is validated here at module load. Commercial status, operational
 * status and regional availability are deliberately separate concepts:
 * a product can be sold while one region is still being prepared, and a
 * region can be operational without the product being commercially open.
 *
 * Product availability (can this service be consumed?) is also separate from
 * its delivery model (who owns or operates the infrastructure?). A product
 * must never be presented as available merely because it appears here.
 */

export const ProductFamily = z.enum([
	"network-edge",
	"compute-infrastructure",
	"storage-databases",
	"developer-platform",
	"security-identity",
	"cloud-management",
]);
export type ProductFamily = z.infer<typeof ProductFamily>;

export const ProductAvailability = z.enum([
	"available",
	"limited",
	"private_preview",
	"coming_soon",
	"planned",
	"unavailable",
]);
export type ProductAvailability = z.infer<typeof ProductAvailability>;

export const ProductDeliveryModel = z.enum([
	"company_owned",
	"company_operated",
	"partner_provided",
	"managed_service",
	"software_service",
]);
export type ProductDeliveryModel = z.infer<typeof ProductDeliveryModel>;

export const CommercialStatus = z.enum([
	"available",
	"coming_soon",
	"contact_sales",
	"partner_service",
]);
export type CommercialStatus = z.infer<typeof CommercialStatus>;

export const OperationalStatus = z.enum([
	"operational",
	"degraded",
	"maintenance",
	"unknown",
]);
export type OperationalStatus = z.infer<typeof OperationalStatus>;

export const DeploymentModel = z.enum([
	"shared",
	"dedicated",
	"managed",
	"self_service",
]);
export type DeploymentModel = z.infer<typeof DeploymentModel>;

export const ProviderType = z.enum(["own", "partner"]);
export type ProviderType = z.infer<typeof ProviderType>;

export const RegionVerification = z.enum(["verified", "pending"]);
export type RegionVerification = z.infer<typeof RegionVerification>;

export const BillingModel = z.enum(["hourly", "monthly", "usage", "custom"]);
export type BillingModel = z.infer<typeof BillingModel>;

export const BillingUnit = z.enum([
	"hour",
	"month",
	"request",
	"gb_month",
	"custom",
]);
export type BillingUnit = z.infer<typeof BillingUnit>;

export const PricingStatus = z.enum(["published", "draft"]);
export type PricingStatus = z.infer<typeof PricingStatus>;

const slug = z
	.string()
	.min(1)
	.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slugs are lowercase kebab-case");

export const ProviderSchema = z.object({
	id: slug,
	name: z.string().min(1),
	type: ProviderType,
	website: z.string().url().nullable(),
	description: z.string().min(1),
	regions: z.array(slug),
});
export type Provider = z.infer<typeof ProviderSchema>;

export const RegionSchema = z.object({
	id: slug,
	name: z.string().min(1),
	country: z.string().min(1),
	location: z.string().min(1),
	/** Only `verified` regions may be presented as live locations. */
	verification: RegionVerification,
	notes: z.string().min(1),
});
export type Region = z.infer<typeof RegionSchema>;

export const AvailabilitySchema = z.object({
	productId: slug,
	providerId: slug,
	regionId: slug,
	deployment: DeploymentModel,
	commercialStatus: CommercialStatus,
	operationalStatus: OperationalStatus,
	/** Short, factual caveat shown next to the status. */
	note: z.string().min(1),
});
export type Availability = z.infer<typeof AvailabilitySchema>;

export const SpecRowSchema = z.object({
	label: z.string().min(1),
	value: z.string().min(1),
});

export const SpecGroupSchema = z.object({
	title: z.string().min(1),
	rows: z.array(SpecRowSchema).min(1),
});
export type SpecGroup = z.infer<typeof SpecGroupSchema>;

const ProductSeoSchema = z.object({
	title: z.string().min(1),
	description: z.string().min(1).max(200),
});
export type ProductSeo = z.infer<typeof ProductSeoSchema>;

/**
 * A catalogue entry. Services with a public detail page carry the editorial
 * fields below; services that are only discoverable in a family overview are
 * marked planned or coming soon and have no route.
 */
export const ProductSchema = z
	.object({
		id: slug,
		name: z.string().min(1),
		/** Every product has exactly one primary family. */
		family: ProductFamily,
		/** Optional secondary associations for cross-discovery. */
		relatedFamilies: z.array(ProductFamily).default([]),
		tagline: z.string().min(1),
		summary: z.string().min(1),
		description: z.string().min(1),
		/** Whether the service can actually be consumed or purchased. */
		availability: ProductAvailability,
		/** Who owns, operates or provides the underlying service. */
		deliveryModels: z.array(ProductDeliveryModel).default([]),
		/** Commercial facts per region. Empty for services without a page. */
		availabilityByRegion: z.array(AvailabilitySchema).default([]),
		/** Products referenced by id; resolved through the query layer. */
		related: z.array(slug).default([]),
		/** Curated selection for the Products mega menu. */
		featured: z.boolean().default(false),
		tags: z.array(z.string().min(1)).default([]),
		/** Public route. Null when no detail page exists yet. */
		route: z.string().startsWith("/products/").nullable(),
		docsPath: z.string().startsWith("/").nullable().default(null),
		pricingPath: z.string().startsWith("/").nullable().default(null),
		benefits: z.array(z.string().min(1)).default([]),
		features: z.array(z.string().min(1)).default([]),
		/** Specification groups differ per product type; no shared flat layout. */
		specs: z.array(SpecGroupSchema).default([]),
		seo: ProductSeoSchema.optional(),
	})
	.superRefine((product, ctx) => {
		if (product.relatedFamilies.includes(product.family)) {
			ctx.addIssue({
				code: "custom",
				message: `Secondary family duplicates the primary family on ${product.id}`,
			});
		}

		if (product.route) {
			if (product.benefits.length < 2) {
				ctx.addIssue({
					code: "custom",
					message: `Product ${product.id} has a detail page but fewer than two benefits`,
				});
			}
			if (product.features.length < 2) {
				ctx.addIssue({
					code: "custom",
					message: `Product ${product.id} has a detail page but fewer than two features`,
				});
			}
			if (product.specs.length < 1) {
				ctx.addIssue({
					code: "custom",
					message: `Product ${product.id} has a detail page but no specification groups`,
				});
			}
			if (!product.seo) {
				ctx.addIssue({
					code: "custom",
					message: `Product ${product.id} has a detail page but no SEO metadata`,
				});
			}
		} else {
			if (
				product.availability === "available" ||
				product.availability === "limited" ||
				product.availability === "private_preview"
			) {
				ctx.addIssue({
					code: "custom",
					message: `Product ${product.id} claims availability without a detail page`,
				});
			}
			if (product.availabilityByRegion.length > 0) {
				ctx.addIssue({
					code: "custom",
					message: `Product ${product.id} has no detail page but publishes regional availability`,
				});
			}
		}

		const statuses = product.availabilityByRegion.map(
			(entry) => entry.commercialStatus,
		);

		// The declared product availability must agree with the regional facts.
		if (product.availability === "available" && !statuses.includes("available")) {
			ctx.addIssue({
				code: "custom",
				message: `Product ${product.id} is marked available but no region is open`,
			});
		}
		if (
			product.availability === "limited" &&
			!statuses.some(
				(status) =>
					status === "contact_sales" || status === "partner_service",
			)
		) {
			ctx.addIssue({
				code: "custom",
				message: `Product ${product.id} is marked limited but has no scoped or partner availability`,
			});
		}
		if (
			product.availability === "coming_soon" &&
			statuses.some(
				(status) =>
					status === "available" ||
					status === "contact_sales" ||
					status === "partner_service",
			)
		) {
			ctx.addIssue({
				code: "custom",
				message: `Product ${product.id} is marked coming soon but a region is already open`,
			});
		}
	});
export type Product = z.infer<typeof ProductSchema>;

/** A product that can render a complete detail page. */
export type ProductDetail = Product & {
	route: string;
	benefits: string[];
	features: string[];
	specs: SpecGroup[];
	seo: ProductSeo;
};

export function hasProductDetail(product: Product): product is ProductDetail {
	return (
		product.route !== null &&
		product.benefits.length >= 2 &&
		product.features.length >= 2 &&
		product.specs.length >= 1 &&
		product.seo !== undefined
	);
}

export const PricingPlanSchema = z.object({
	id: slug,
	productId: slug,
	name: z.string().min(1),
	billingModel: BillingModel,
	currency: z.literal("EUR"),
	/** Integer minor units (cents). Never a float. Null until approved. */
	amountMinor: z.number().int().nonnegative().nullable(),
	billingInterval: BillingUnit,
	unitLabel: z.string().min(1),
	conditions: z.array(z.string().min(1)).min(1),
	status: PricingStatus,
});
export type PricingPlan = z.infer<typeof PricingPlanSchema>;

export const CatalogueSchema = z
	.object({
		providers: z.array(ProviderSchema).min(1),
		regions: z.array(RegionSchema).min(1),
		products: z.array(ProductSchema).min(1),
		plans: z.array(PricingPlanSchema).min(1),
	})
	.superRefine((catalogue, ctx) => {
		const providerIds = new Set(catalogue.providers.map((p) => p.id));
		const regionIds = new Set(catalogue.regions.map((r) => r.id));
		const productIds = new Set(catalogue.products.map((p) => p.id));
		const routes = new Set<string>();
		const planIds = new Set<string>();

		for (const product of catalogue.products) {
			if (product.route) {
				if (routes.has(product.route)) {
					ctx.addIssue({
						code: "custom",
						message: `Duplicate product route: ${product.route}`,
					});
				}
				routes.add(product.route);
			}

			for (const entry of product.availabilityByRegion) {
				if (entry.productId !== product.id) {
					ctx.addIssue({
						code: "custom",
						message: `Availability on ${product.id} points at ${entry.productId}`,
					});
				}
				if (!providerIds.has(entry.providerId)) {
					ctx.addIssue({
						code: "custom",
						message: `Unknown provider ${entry.providerId} on ${product.id}`,
					});
				}
				if (!regionIds.has(entry.regionId)) {
					ctx.addIssue({
						code: "custom",
						message: `Unknown region ${entry.regionId} on ${product.id}`,
					});
				}
				// A region that has not been verified can never be presented as
				// commercially available.
				const region = catalogue.regions.find(
					(r) => r.id === entry.regionId,
				);
				if (
					region?.verification === "pending" &&
					entry.commercialStatus === "available"
				) {
					ctx.addIssue({
						code: "custom",
						message: `Unverified region ${region.id} cannot be marked available (${product.id})`,
					});
				}
			}

			for (const related of product.related) {
				if (!productIds.has(related)) {
					ctx.addIssue({
						code: "custom",
						message: `Unknown related product ${related} on ${product.id}`,
					});
				}
			}
		}

		for (const plan of catalogue.plans) {
			if (!productIds.has(plan.productId)) {
				ctx.addIssue({
					code: "custom",
					message: `Plan ${plan.id} references unknown product ${plan.productId}`,
				});
			}
			if (planIds.has(plan.id)) {
				ctx.addIssue({
					code: "custom",
					message: `Duplicate plan id: ${plan.id}`,
				});
			}
			planIds.add(plan.id);
			if (plan.status === "published" && plan.amountMinor === null) {
				ctx.addIssue({
					code: "custom",
					message: `Published plan ${plan.id} must have a price`,
				});
			}
		}
	});

export type Catalogue = z.infer<typeof CatalogueSchema>;
