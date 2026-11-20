import { companyPages, infrastructurePages, resourcePages, solutions } from "@/lib/content/pages";
import { legalDocuments } from "@/lib/content/legal";
import { pricingCategories } from "@/lib/content/pricing";
import {
	FAMILIES,
	FAMILY_ORDER,
	SITE_URL,
	getDetailedProducts,
} from "@/lib/domain/queries";
import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date();
	const entry = (
		path: string,
		priority: number,
		changeFrequency: "weekly" | "monthly" | "yearly" = "monthly",
	) => ({
		url: `${SITE_URL}${path}`,
		lastModified: now,
		changeFrequency,
		priority,
	});

	return [
		entry("/", 1, "weekly"),
		entry("/products", 0.9, "weekly"),
		...FAMILY_ORDER.map((family) => entry(FAMILIES[family].route, 0.9)),
		entry("/products/public-cloud", 0.8),
		...getDetailedProducts().map((product) =>
			entry(product.route as string, 0.8, "weekly"),
		),
		entry("/solutions", 0.8),
		...solutions.map((solution) => entry(solution.path, 0.75)),
		entry("/pricing", 0.9),
		...pricingCategories.map((category) => entry(`/pricing/${category.slug}`, 0.8)),
		entry("/infrastructure", 0.8),
		...infrastructurePages.map((page) => entry(page.path, 0.75)),
		entry("/resources", 0.7),
		...resourcePages.map((page) => entry(page.path, 0.65)),
		entry("/company", 0.6),
		...companyPages.map((page) => entry(page.path, 0.55)),
		entry("/contact-sales", 0.7),
		entry("/legal/terms", 0.3, "yearly"),
		...legalDocuments.map((document) => entry(`/legal/${document.slug}`, 0.3, "yearly")),
	];
}
