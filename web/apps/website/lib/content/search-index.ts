import {
	FAMILIES,
	FAMILY_ORDER,
	getAllProducts,
} from "@/lib/domain/queries";
import { companyPages, infrastructurePages, resourcePages, solutions } from "./pages";

export type SearchEntry = {
	title: string;
	href: string;
	description: string;
	group: "Products" | "Solutions" | "Pricing" | "Infrastructure" | "Resources" | "Company";
};

const products: SearchEntry[] = getAllProducts().map((product) => ({
	title: product.name,
	href: product.route ?? FAMILIES[product.family].route,
	description: product.tagline,
	group: "Products",
}));

const familyEntries: SearchEntry[] = FAMILY_ORDER.map((family) => ({
	title: FAMILIES[family].name,
	href: FAMILIES[family].route,
	description: FAMILIES[family].description,
	group: "Products",
}));

const solutionEntries: SearchEntry[] = solutions.map((solution) => ({
	title: solution.title,
	href: solution.path,
	description: solution.description,
	group: "Solutions",
}));

const pricingEntries: SearchEntry[] = [
	{ title: "Pricing overview", href: "/pricing", description: "Billing models and publication state", group: "Pricing" },
	{ title: "Compute pricing", href: "/pricing/compute", description: "Instances, GPU and dedicated capacity", group: "Pricing" },
	{ title: "Storage pricing", href: "/pricing/storage", description: "Object, block and backup storage", group: "Pricing" },
	{ title: "Networking pricing", href: "/pricing/networking", description: "Addresses, networks and load balancing", group: "Pricing" },
	{ title: "Hosting pricing", href: "/pricing/hosting", description: "Web, domains, email and platform", group: "Pricing" },
	{ title: "Enterprise pricing", href: "/pricing/enterprise", description: "Private estates and managed operations", group: "Pricing" },
];

const infrastructureEntries: SearchEntry[] = infrastructurePages.map((page) => ({
	title: page.title,
	href: page.path,
	description: page.description,
	group: "Infrastructure",
}));

const resourceEntries: SearchEntry[] = resourcePages.map((page) => ({
	title: page.title,
	href: page.path,
	description: page.description,
	group: "Resources",
}));

const companyEntries: SearchEntry[] = companyPages.map((page) => ({
	title: page.title,
	href: page.path,
	description: page.description,
	group: "Company",
}));

export const searchIndex: SearchEntry[] = [
	...products,
	...familyEntries,
	...solutionEntries,
	...pricingEntries,
	...infrastructureEntries,
	...resourceEntries,
	...companyEntries,
];
