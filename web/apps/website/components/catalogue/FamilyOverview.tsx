import Link from "next/link";
import { PageHeader } from "@/components/site/PageHeader";
import { CtaBand, Section } from "@/components/site/Sections";
import { Button } from "@/components/ui/button";
import { familyContent } from "@/lib/content/product-families";
import {
	FAMILIES,
	PRODUCT_AVAILABILITY_META,
	SITE_URL,
	getProductById,
	getProductsByFamily,
} from "@/lib/domain/queries";
import type { ProductFamily } from "@/lib/domain/schema";
import { ProductGrid } from "./CatalogueViews";

function countByAvailability(products: ReturnType<typeof getProductsByFamily>) {
	return {
		limited: products.filter(
			(product) =>
				product.availability === "available" ||
				product.availability === "limited" ||
				product.availability === "private_preview",
		).length,
		comingSoon: products.filter(
			(product) => product.availability === "coming_soon",
		).length,
		planned: products.filter((product) => product.availability === "planned")
			.length,
	};
}

/**
 * One family overview, shared by all six canonical routes.
 *
 * Product facts come from the catalogue; the editorial narrative comes from
 * `lib/content/product-families`. Nothing here invents availability, regional
 * coverage or commercial terms.
 */
export function FamilyOverview({ family }: { family: ProductFamily }) {
	const meta = FAMILIES[family];
	const content = familyContent[family];
	const products = getProductsByFamily(family);
	const counts = countByAvailability(products);
	const related = content.relatedProductIds
		.map((id) => getProductById(id))
		.filter((product): product is NonNullable<typeof product> => Boolean(product));

	const collectionSchema = {
		"@context": "https://schema.org",
		"@type": "CollectionPage",
		name: meta.name,
		description: content.metaDescription,
		url: `${SITE_URL}${meta.route}`,
		isPartOf: {
			"@type": "CollectionPage",
			name: "Astron Collection Products",
			url: `${SITE_URL}/products`,
		},
		hasPart: products.map((product) => ({
			"@type": "Service",
			name: product.name,
			description: product.summary,
			url: product.route ? `${SITE_URL}${product.route}` : undefined,
		})),
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
			/>

			<PageHeader
				eyebrow="Products"
				title={meta.name}
				description={content.heroDescription}
				breadcrumbs={[
					{ name: "Products", path: "/products" },
					{ name: meta.name, path: meta.route },
				]}
				actions={
					<>
						<Button asChild>
							<Link href="#services">Explore services</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/contact-sales">Contact sales</Link>
						</Button>
					</>
				}
				aside={
					<div className="border border-border p-5">
						<h2 className="text-sm font-semibold">Family at a glance</h2>
						<dl className="mt-3 space-y-2 text-sm">
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Services listed</dt>
								<dd className="font-medium">{products.length}</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Orderable or scoped</dt>
								<dd className="font-medium">{counts.limited}</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Coming soon</dt>
								<dd className="font-medium">{counts.comingSoon}</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Planned</dt>
								<dd className="font-medium">{counts.planned}</dd>
							</div>
						</dl>
						<p className="mt-3 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
							Each service carries its own status. Planned and coming-soon
							services cannot be ordered, and no launch date is implied.
						</p>
					</div>
				}
			/>

			<Section
				title={`What ${meta.name} covers`}
				description={meta.description}
			>
				<div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
					<div className="space-y-4 text-base leading-relaxed text-muted-foreground">
						{content.overview.map((paragraph) => (
							<p key={paragraph}>{paragraph}</p>
						))}
					</div>
					<div className="border border-border p-5">
						<h3 className="text-sm font-semibold">Who it is for</h3>
						<ul className="mt-3 space-y-3">
							{content.audience.map((item) => (
								<li key={item} className="flex gap-3 text-sm text-muted-foreground">
									<span
										className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
										aria-hidden="true"
									/>
									{item}
								</li>
							))}
						</ul>
					</div>
				</div>
			</Section>

			{content.capabilities && (
				<Section
					title="Platform capabilities"
					description="Native Control Plane capabilities, not separately purchasable products."
				>
					<ul className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
						{content.capabilities.map((capability) => (
							<li key={capability.title} className="bg-background p-5">
								<h3 className="text-sm font-semibold">{capability.title}</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{capability.description}
								</p>
							</li>
						))}
					</ul>
					{content.capabilitiesNote && (
						<p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted-foreground">
							{content.capabilitiesNote}
						</p>
					)}
				</Section>
			)}

			<Section
				id="services"
				title="Services in this family"
				description="Every entry below comes from the catalogue. Availability is the product-level state; regional commercial detail lives on each product page where one exists."
			>
				<ProductGrid products={products} />
			</Section>

			<Section
				title="Use cases"
				description="Workloads these services are designed to support. Combinations are illustrative, not pre-packaged offers."
			>
				<div className="grid gap-px border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
					{content.useCases.map((useCase) => (
						<article key={useCase.title} className="flex flex-col bg-background p-6">
							<h3 className="font-display text-lg tracking-tight">
								{useCase.title}
							</h3>
							<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
								{useCase.description}
							</p>
							<ul className="mt-5 flex flex-wrap gap-2 border-t border-border pt-4">
								{useCase.productIds.map((id) => {
									const product = getProductById(id);
									if (!product) return null;
									return (
										<li key={id}>
											<Link
												href={
													product.route ?? FAMILIES[product.family].route
												}
												className="inline-flex rounded-md border border-border px-2.5 py-1 text-xs font-medium text-foreground no-underline transition-colors hover:border-primary/40 hover:text-primary"
											>
												{product.name}
											</Link>
										</li>
									);
								})}
							</ul>
						</article>
					))}
				</div>
			</Section>

			<Section
				title="How it fits together"
				description="Where this family meets the rest of the catalogue."
			>
				<ul className="divide-y divide-border border-y border-border">
					{content.relationships.map((relationship) => {
						const relatedFamily = FAMILIES[relationship.family];
						return (
							<li key={relationship.family} className="py-5">
								<Link
									href={relatedFamily.route}
									className="text-sm font-medium text-foreground no-underline hover:text-primary"
								>
									{relatedFamily.name}
									<span aria-hidden="true"> →</span>
								</Link>
								<p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-muted-foreground">
									{relationship.description}
								</p>
							</li>
						);
					})}
				</ul>
			</Section>

			<Section
				title="Related services"
				description="Cross-family services commonly used with this one. Each keeps its primary family in the catalogue."
			>
				<ProductGrid products={related} />
			</Section>

			<Section
				title="Availability in this family"
				description="The product-level states used across the catalogue. Regional commercial states are shown on each product page."
			>
				<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{products.slice(0, 6).map((product) => (
						<li
							key={product.id}
							className="flex items-start justify-between gap-3 border border-border p-4"
						>
							<span className="text-sm font-medium">{product.name}</span>
							<span className="text-xs text-muted-foreground">
								{PRODUCT_AVAILABILITY_META[product.availability].label}
							</span>
						</li>
					))}
				</ul>
			</Section>

			<CtaBand
				title={`Talk to us about ${meta.name}`}
				description="Contact sales with the service, expected capacity and target region. Availability is confirmed in writing; no capacity is reserved by a website request."
				primary={{ href: "/contact-sales", label: "Contact sales" }}
				secondary={{ href: "/products", label: "All product families" }}
			/>
		</>
	);
}
