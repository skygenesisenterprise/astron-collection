import { describe, expect, it } from "vitest";
import {
	mainNav,
	productCategories,
	utilityNav,
	type NavLink,
	type NavSection,
} from "./navigation";

const PRIMARY_LABELS = [
	"Products",
	"Solutions",
	"Developers",
	"Resources",
	"Company",
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
	it("contains exactly the five institutional entries in order", () => {
		expect(mainNav.map((section) => section.label)).toEqual(PRIMARY_LABELS);
	});

	it("does not expose pricing as a primary entry", () => {
		expect(mainNav.some((section) => section.label.toLowerCase() === "pricing")).toBe(
			false,
		);
		// Pricing may exist as a contextual footer link in the Products menu.
		const primaryDestinations = mainNav
			.map((section) => section.href)
			.filter(Boolean);
		expect(primaryDestinations).not.toContain("/pricing");
	});

	it("gives every entry its own destination or menu", () => {
		for (const section of mainNav) {
			const hasMenu = section.columns.length > 0 || Boolean(section.categories?.length);
			expect(hasMenu || Boolean(section.href)).toBe(true);
		}
	});
});

describe("product categories", () => {
	it("defines the six official categories in a stable order", () => {
		expect(productCategories.map((category) => category.id)).toEqual(CATEGORY_IDS);
		expect(mainNav.find((section) => section.id === "products")?.categories).toBe(
			productCategories,
		);
	});

	it("keeps every category populated and described", () => {
		for (const category of productCategories) {
			expect(category.products.length).toBeGreaterThan(0);
			expect(category.description.length).toBeGreaterThan(0);
			expect(category.href.startsWith("/")).toBe(true);
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
		expect(productCategories.some((category) => category.name === "Aether")).toBe(false);
	});

	it("does not list a product twice", () => {
		const names = productCategories.flatMap((category) =>
			category.products.map((product) => product.name),
		);
		expect(new Set(names).size).toBe(names.length);
	});

	it("only claims maturity for entries that declare it", () => {
		const allowed = new Set(["available", "preview", "active-development", "research"]);
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
