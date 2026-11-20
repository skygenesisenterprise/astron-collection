import { describe, expect, it } from "vitest";
import {
	featuredProjectNames,
	getFamilies,
	getFeaturedProjects,
	homeCta,
	newsDestinations,
	openSourceGroups,
	productCategories,
	solutionPatterns,
	solutionsSection,
} from "./ecosystem";

const allProducts = productCategories.flatMap((category) =>
	category.products.map((product) => product.name),
);

describe("ecosystem categories", () => {
	it("lists each project exactly once", () => {
		expect(new Set(allProducts).size).toBe(allProducts.length);
	});

	it("gives each category a scope and a real destination", () => {
		for (const category of productCategories) {
			expect(category.scope.length).toBeGreaterThan(0);
			expect(category.href.startsWith("/")).toBe(true);
		}
	});

	it("treats Aether as a cross-category family", () => {
		const categories = productCategories.filter((category) =>
			category.products.some((product) => product.family === "Aether"),
		);
		expect(categories.map((category) => category.id)).toEqual([
			"security-identity",
			"business-productivity",
		]);
	});
});

describe("ecosystem families", () => {
	it("derives families from the catalogue records", () => {
		const families = getFamilies();
		expect(families.map((family) => family.name).sort()).toEqual([
			"Aether",
			"Zenth",
		]);

		const aether = families.find((family) => family.name === "Aether");
		expect(aether?.categories.map((category) => category.id)).toEqual([
			"security-identity",
			"business-productivity",
		]);

		const zenth = families.find((family) => family.name === "Zenth");
		expect(zenth?.categories.map((category) => category.id)).toEqual([
			"cloud-infrastructure",
		]);
	});

	it("never lists a family project twice", () => {
		for (const family of getFamilies()) {
			expect(new Set(family.projects).size).toBe(family.projects.length);
			for (const project of family.projects) {
				expect(allProducts).toContain(project);
			}
		}
	});
});

describe("homepage projects", () => {
	it("resolves every featured project to its catalogue record", () => {
		const featured = getFeaturedProjects();
		expect(featured.map((entry) => entry.product.name)).toEqual([
			...featuredProjectNames,
		]);
		for (const entry of featured) {
			expect(entry.category.products).toContain(entry.product);
		}
	});

	it("only links a project to a destination that is declared", () => {
		for (const category of productCategories) {
			for (const product of category.products) {
				const href = product.href ?? category.href;
				expect(href.startsWith("/")).toBe(true);
				expect(href).not.toBe("/pricing");
			}
		}
	});
});

describe("homepage editorial content", () => {
	it("names only projects that exist in the ecosystem", () => {
		for (const pattern of solutionPatterns) {
			for (const name of pattern.productNames) {
				expect(allProducts).toContain(name);
			}
			expect(pattern.href.startsWith("/")).toBe(true);
		}
	});

	it("labels solution patterns honestly", () => {
		for (const pattern of solutionPatterns) {
			expect([
				"Conceptual combination",
				"Documented solution path",
			]).toContain(pattern.relationship);
		}
		expect(solutionsSection.note).toContain("Integration");
	});

	it("keeps open-source groups typed and non-empty", () => {
		for (const group of openSourceGroups) {
			expect(group.items.length).toBeGreaterThan(0);
			for (const item of group.items) {
				expect(item.name.length).toBeGreaterThan(0);
				expect(item.detail.length).toBeGreaterThan(0);
			}
		}
	});

	it("does not invent news entries", () => {
		// Destinations only: no titles, dates, authors or article bodies.
		for (const destination of newsDestinations) {
			expect(destination).not.toHaveProperty("date");
			expect(destination).not.toHaveProperty("title");
		}
	});

	it("keeps every call to action on a valid internal or absolute URL", () => {
		for (const action of [homeCta.primary, homeCta.secondary]) {
			expect(action.href.startsWith("/")).toBe(true);
		}
		expect(homeCta.tertiary.href).toMatch(/^https:\/\//);
	});
});
