import { describe, expect, it } from "vitest";
import { catalogue } from "./catalogue";
import { CatalogueSchema, hasProductDetail } from "./schema";
import {
	FAMILIES,
	FAMILY_ORDER,
	getAllProducts,
	getCrossFamilyProducts,
	getDetailedProducts,
	getFeaturedProductsByFamily,
	getPlans,
	getProductById,
	getProductByRoute,
	getProductsByFamily,
	getProvider,
	getRegion,
} from "./queries";

describe("catalogue", () => {
	it("validates against the domain schema", () => {
		expect(() => CatalogueSchema.parse(catalogue)).not.toThrow();
	});

	it("uses exactly the six approved product families", () => {
		const used = new Set(getAllProducts().map((product) => product.family));
		expect([...used].sort()).toEqual([...FAMILY_ORDER].sort());
		expect(Object.keys(FAMILIES).sort()).toEqual([...FAMILY_ORDER].sort());

		for (const family of FAMILY_ORDER) {
			expect(getProductsByFamily(family).length, family).toBeGreaterThan(0);
		}
	});

	it("exposes unique routes and ids", () => {
		const routes = getAllProducts()
			.map((product) => product.route)
			.filter((route): route is string => route !== null);
		const ids = getAllProducts().map((product) => product.id);
		expect(new Set(routes).size).toBe(routes.length);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it("assigns one primary family and only secondary cross-links", () => {
		for (const product of getAllProducts()) {
			expect(FAMILY_ORDER).toContain(product.family);
			expect(product.relatedFamilies).not.toContain(product.family);
		}
	});

	it("gives a detail page only to complete products", () => {
		for (const product of getAllProducts()) {
			if (product.route) {
				expect(hasProductDetail(product), product.id).toBe(true);
				expect(product.seo, product.id).toBeDefined();
			}
		}
		expect(getDetailedProducts().length).toBeGreaterThan(0);
	});

	it("never presents planned services as available", () => {
		for (const product of getAllProducts()) {
			if (product.availability === "planned") {
				expect(product.route, product.id).toBeNull();
				expect(product.availabilityByRegion, product.id).toHaveLength(0);
			}
			if (!product.route) {
				expect(
					["available", "limited", "private_preview"],
					product.id,
				).not.toContain(product.availability);
				expect(product.availabilityByRegion, product.id).toHaveLength(0);
			}
		}
	});

	it("keeps product availability consistent with regional facts", () => {
		for (const product of getAllProducts()) {
			const statuses = product.availabilityByRegion.map(
				(entry) => entry.commercialStatus,
			);

			switch (product.availability) {
				case "available":
					expect(statuses, product.id).toContain("available");
					break;
				case "limited":
					expect(
						statuses.some(
							(status) =>
								status === "contact_sales" || status === "partner_service",
						),
						product.id,
					).toBe(true);
					break;
				case "coming_soon":
					expect(statuses, product.id).not.toContain("available");
					break;
				default:
					break;
			}
		}
	});

	it("resolves every availability reference", () => {
		for (const product of getAllProducts()) {
			for (const entry of product.availabilityByRegion) {
				expect(getProvider(entry.providerId), entry.providerId).toBeDefined();
				expect(getRegion(entry.regionId), entry.regionId).toBeDefined();
				expect(entry.productId).toBe(product.id);
			}
		}
	});

	it("never marks a product available in an unverified region", () => {
		for (const product of getAllProducts()) {
			for (const entry of product.availabilityByRegion) {
				const region = getRegion(entry.regionId);
				if (region?.verification === "pending") {
					expect(entry.commercialStatus).not.toBe("available");
				}
			}
		}
	});

	it("labels partner capacity as partner-delivered", () => {
		for (const product of getAllProducts()) {
			for (const entry of product.availabilityByRegion) {
				const provider = getProvider(entry.providerId);
				if (provider?.type === "partner") {
					expect(["partner_service", "contact_sales", "coming_soon"]).toContain(
						entry.commercialStatus,
					);
				}
			}
		}
	});

	it("does not publish a plan without an approved amount", () => {
		for (const plan of getPlans()) {
			if (plan.status === "published") {
				expect(plan.amountMinor).not.toBeNull();
			} else {
				expect(plan.amountMinor).toBeNull();
			}
			expect(Number.isInteger(plan.amountMinor ?? 0)).toBe(true);
		}
	});

	it("resolves products by public route", () => {
		const compute = getProductByRoute("/products/public-cloud/compute");
		expect(compute?.id).toBe("compute-instances");
		expect(compute?.availability).toBe("limited");

		const bareMetal = getProductByRoute("/products/bare-metal");
		expect(bareMetal?.name).toBe("ZenthBareMetal");
		expect(bareMetal?.availability).toBe("limited");
	});

	it("curates featured services for every family", () => {
		for (const family of FAMILY_ORDER) {
			const featured = getFeaturedProductsByFamily(family);
			expect(featured.length, family).toBeGreaterThan(0);
			expect(
				featured.every((product) => product.family === family),
				family,
			).toBe(true);
		}
	});

	it("exposes cross-family relationships without duplicate records", () => {
		const waf = getProductById("zenth-waf");
		expect(waf?.family).toBe("network-edge");
		expect(waf?.relatedFamilies).toContain("security-identity");
		expect(
			getCrossFamilyProducts("security-identity").some(
				(product) => product.id === "zenth-waf",
			),
		).toBe(true);

		const kubernetes = getProductById("kubernetes");
		expect(kubernetes?.family).toBe("compute-infrastructure");
		expect(kubernetes?.relatedFamilies).toContain("developer-platform");

		const observability = getProductById("zenth-observability");
		expect(observability?.family).toBe("developer-platform");
		expect(observability?.relatedFamilies).toContain("cloud-management");
	});
});
