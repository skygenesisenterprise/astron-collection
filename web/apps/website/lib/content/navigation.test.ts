import { describe, expect, it } from "vitest";
import {
	mainNav,
	type NavLink,
	type NavSection,
	productCategories,
	productMenuFamilies,
	utilityNav,
} from "./navigation";

const PRIMARY_LABELS = [
	"Products",
	"Solutions",
	"Developers",
	"Resources",
	"Astron Collection",
	"Pricing",
];

const CATEGORY_IDS = [
	"cloud-infrastructure",
	"developer-platform",
	"security-identity",
	"business-productivity",
	"communication-experiences",
	"financial-platforms",
];

function sectionLinks(section: NavSection): NavLink[] {
	return [
		...section.columns.flatMap((column) => column.links),
		...section.footerLinks,
		...(section.columns
			.map((column) => column.href)
			.filter((href): href is string => Boolean(href))
			.map((href) => ({ href, label: href })) ?? []),
	];
}

const allSectionLinks = mainNav.flatMap(sectionLinks);

describe("primary navigation", () => {
	it("contains exactly the six institutional entries in order", () => {
		expect(mainNav.map((section) => section.label)).toEqual(PRIMARY_LABELS);
	});

	it("keeps Pricing as a direct link after Astron Collection", () => {
		const pricing = mainNav.find((section) => section.id === "pricing");
		expect(pricing?.href).toBe("/pricing");
		expect(pricing?.columns).toHaveLength(0);
		expect(mainNav.at(-2)?.id).toBe("company");
		expect(mainNav.at(-1)?.id).toBe("pricing");
	});

	it("gives every entry its own destination or menu", () => {
		for (const section of mainNav) {
			const hasMenu =
				section.columns.length > 0 || Boolean(section.categories?.length);
			expect(hasMenu || Boolean(section.href)).toBe(true);
		}
	});

	it("gives every menu entry four groups of four links", () => {
		const excluded = new Set(["products", "pricing"]);
		for (const section of mainNav.filter((entry) => !excluded.has(entry.id))) {
			expect(section.columns).toHaveLength(4);
			for (const column of section.columns) {
				expect(column.links).toHaveLength(4);
			}
		}
	});
});

describe("product categories", () => {
	it("defines the six official categories in a stable order", () => {
		expect(productCategories.map((category) => category.id)).toEqual(
			CATEGORY_IDS,
		);
		expect(
			mainNav.find((section) => section.id === "products")?.categories,
		).toBe(productCategories);
	});

	it("keeps every category populated and described", () => {
		for (const category of productCategories) {
			expect(category.products.length).toBeGreaterThan(0);
			expect(category.description.length).toBeGreaterThan(0);
			expect(category.href.startsWith("/")).toBe(true);
		}
	});

	it("defines six product families with six capabilities each", () => {
		expect(productMenuFamilies).toHaveLength(6);
		for (const family of productMenuFamilies) {
			expect(family.capabilities).toHaveLength(6);
			expect(family.href).toMatch(/^\/products\/[a-z-]+$/);
			for (const capability of family.capabilities) {
				expect(capability.href).toBe(`${family.href}/${capability.id}`);
			}
		}
	});

	it("treats Aether as a transversal family rather than a category", () => {
		const categoriesWithAether = productCategories.filter((category) =>
			category.products.some((product) => product.family === "Aether"),
		);
		expect(categoriesWithAether.map((category) => category.id)).toEqual([
			"security-identity",
			"business-productivity",
		]);
		expect(
			productCategories.some((category) => category.name === "Aether"),
		).toBe(false);
	});

	it("does not list a product twice", () => {
		const names = productCategories.flatMap((category) =>
			category.products.map((product) => product.name),
		);
		expect(new Set(names).size).toBe(names.length);
	});

	it("only claims maturity for entries that declare it", () => {
		const allowed = new Set([
			"available",
			"preview",
			"active-development",
			"research",
		]);
		for (const category of productCategories) {
			for (const product of category.products) {
				if (product.maturity) expect(allowed.has(product.maturity)).toBe(true);
			}
		}
	});
});

describe("destinations", () => {
	it("never uses placeholder destinations", () => {
		for (const link of [...allSectionLinks, ...utilityNav]) {
			expect(link.href).not.toBe("#");
			expect(link.href.trim()).not.toBe("");
			expect(link.href.toLowerCase()).not.toContain("todo");
			expect(link.href.toLowerCase()).not.toContain("example.com");
		}
	});

	it("marks external links and keeps them absolute", () => {
		for (const link of [...allSectionLinks, ...utilityNav]) {
			if (link.external) {
				expect(link.href).toMatch(/^https:\/\//);
			} else {
				expect(link.href.startsWith("/")).toBe(true);
			}
		}
	});

	it("does not send primary product entries to pricing", () => {
		for (const category of productCategories) {
			for (const product of category.products) {
				expect(product.href ?? category.href).not.toBe("/pricing");
			}
		}
	});

	it("resolves every product without a page to its category overview", () => {
		for (const category of productCategories) {
			for (const product of category.products) {
				const destination = product.href ?? category.href;
				expect(destination.startsWith("/")).toBe(true);
			}
		}
	});
});
