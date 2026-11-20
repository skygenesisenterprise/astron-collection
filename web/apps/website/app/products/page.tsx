import {
	AvailabilityLegend,
	ProductAvailabilityLegend,
	ProductGrid,
} from "@/components/catalogue/CatalogueViews";
import { CtaBand, Section } from "@/components/site/Sections";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import {
	FAMILIES,
	FAMILY_ORDER,
	getAllProducts,
	getProductsByFamily,
	getProviders,
	getRegions,
	pageMetadata,
} from "@/lib/domain/queries";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
	title: "Products",
	description:
		"Astron Collection products in six families: Network & Edge, Compute & Infrastructure, Storage & Databases, Developer Platform, Security & Identity and Cloud Management.",
	path: "/products",
});

const ORDERABLE = new Set(["available", "limited", "private_preview"]);

export default function ProductsPage() {
	const products = getAllProducts();
	const providers = getProviders();
	const regions = getRegions();
	const scoped = products.filter((product) => ORDERABLE.has(product.availability)).length;

	return (
		<>
			<PageHeader
				eyebrow="Catalogue"
				title="Six service families. One integrated cloud catalogue."
				description="Astron Collection products are organised by the job they do: connect and protect traffic, run workloads, keep data, build and deploy, secure access, and operate the estate. Every entry states its availability, and planned services are never presented as orderable."
				breadcrumbs={[{ name: "Products", path: "/products" }]}
				actions={
					<>
						<Button asChild>
							<Link href="/contact-sales">Contact sales</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/pricing">See pricing state</Link>
						</Button>
					</>
				}
				aside={
					<div className="border border-border p-5">
						<h2 className="text-sm font-semibold">Catalogue at a glance</h2>
						<dl className="mt-3 space-y-2 text-sm">
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Services listed</dt>
								<dd className="font-medium">{products.length}</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Families</dt>
								<dd className="font-medium">{FAMILY_ORDER.length}</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Orderable or scoped</dt>
								<dd className="font-medium">{scoped}</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Infrastructure sources</dt>
								<dd className="font-medium">{providers.length}</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Modelled regions</dt>
								<dd className="font-medium">{regions.length}</dd>
							</div>
						</dl>
						<p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
							Region entries are pending verification. No city or facility
							address is claimed.
						</p>
					</div>
				}
			/>

			<Section
				title="Product families"
				description="Each family has a dedicated overview page with services, use cases and cross-links to the rest of the catalogue."
			>
				<ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{FAMILY_ORDER.map((family) => {
						const meta = FAMILIES[family];
						const familyProducts = getProductsByFamily(family);
						const orderable = familyProducts.filter((product) =>
							ORDERABLE.has(product.availability),
						).length;

						return (
							<li key={family}>
								<Link
									href={meta.route}
									className="group flex h-full flex-col border border-border p-6 no-underline transition-colors hover:bg-muted/50"
								>
									<h2 className="font-display text-xl tracking-tight text-foreground group-hover:text-primary">
										{meta.name}
									</h2>
									<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
										{meta.valueProposition}
									</p>
									<p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground">
										{familyProducts.length} services · {orderable} orderable
										or scoped
									</p>
									<span className="mt-2 text-sm font-medium text-primary">
										Explore family →
									</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</Section>

			{FAMILY_ORDER.map((family) => {
				const meta = FAMILIES[family];
				return (
					<Section
						key={family}
						title={meta.name}
						description={meta.description}
						actions={
							<Button variant="outline" asChild>
								<Link href={meta.route}>Family overview</Link>
							</Button>
						}
					>
						<ProductGrid products={getProductsByFamily(family)} />
					</Section>
				);
			})}

			<Section
				title="How to read product availability"
				description="Product availability says whether a service can be consumed. It is separate from the delivery model and from the commercial state of each region."
			>
				<ProductAvailabilityLegend />
			</Section>

			<Section
				title="Regional commercial states"
				description="Where a detail page exists, its availability table breaks the same product down by region and provider."
			>
				<AvailabilityLegend />
			</Section>

			<CtaBand
				title="Need a scoped proposal?"
				description="Tell us the services, expected capacity and target region. Enterprise, dedicated and partner-delivered capacity are quoted individually."
				primary={{ href: "/contact-sales", label: "Contact sales" }}
				secondary={{ href: "/infrastructure", label: "Review the infrastructure" }}
			/>
		</>
	);
}
