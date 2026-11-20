import {
	AvailabilityTable,
	DeliveryModels,
	PricingTable,
	RelatedProducts,
	SpecGroups,
} from "@/components/catalogue/CatalogueViews";
import { CtaBand, Section } from "@/components/site/Sections";
import { PageHeader } from "@/components/site/PageHeader";
import { AvailabilityBadge } from "@/components/site/StatusBadge";
import { Button } from "@/components/ui/button";
import {
	FAMILIES,
	SITE_URL,
	getDetailedProducts,
	getPlansForProduct,
	getProductByRoute,
	pageMetadata,
} from "@/lib/domain/queries";
import { hasProductDetail } from "@/lib/domain/schema";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
	return getDetailedProducts().flatMap((product) =>
		product.route
			? [{ slug: product.route.replace("/products/", "").split("/") }]
			: [],
	);
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const product = getProductByRoute(`/products/${slug.join("/")}`);
	if (!product || !hasProductDetail(product)) {
		return { title: "Product not found", robots: { index: false } };
	}
	return pageMetadata({
		title: product.seo.title,
		description: product.seo.description,
		path: product.route,
	});
}

export default async function ProductPage({ params }: PageProps) {
	const { slug } = await params;
	const product = getProductByRoute(`/products/${slug.join("/")}`);
	if (!product || !hasProductDetail(product)) notFound();

	const family = FAMILIES[product.family];
	const plans = getPlansForProduct(product.id);

	const breadcrumbs = [
		{ name: "Products", path: "/products" },
		{ name: family.name, path: family.route },
		{ name: product.name, path: product.route },
	];

	const serviceSchema = {
		"@context": "https://schema.org",
		"@type": "Service",
		name: product.name,
		description: product.summary,
		serviceType: family.name,
		url: `${SITE_URL}${product.route}`,
		provider: {
			"@type": "Organization",
			name: "Astron Collection",
			url: SITE_URL,
		},
	};

	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
			/>

			<PageHeader
				eyebrow={family.name}
				title={product.name}
				description={product.summary}
				breadcrumbs={breadcrumbs}
				actions={
					<>
						<Button asChild>
							<Link href="/contact-sales">Discuss this product</Link>
						</Button>
						{product.docsPath && (
							<Button variant="outline" asChild>
								<Link href={product.docsPath}>Documentation</Link>
							</Button>
						)}
					</>
				}
				aside={
					<div className="border border-border p-5">
						<AvailabilityBadge status={product.availability} showDescription />
						<dl className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Family</dt>
								<dd className="font-medium">
									<Link
										href={family.route}
										className="text-foreground underline-offset-4 hover:underline"
									>
										{family.name}
									</Link>
								</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Regions modelled</dt>
								<dd className="font-medium">
									{product.availabilityByRegion.length}
								</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Detail page</dt>
								<dd className="font-medium">Published</dd>
							</div>
						</dl>
						{product.deliveryModels.length > 0 && (
							<div className="mt-4 border-t border-border pt-4">
								<h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Delivery
								</h2>
								<div className="mt-2">
									<DeliveryModels product={product} />
								</div>
							</div>
						)}
						{product.tags.length > 0 && (
							<div className="mt-4 border-t border-border pt-4">
								<h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Tags
								</h2>
								<ul className="mt-2 flex flex-wrap gap-1.5">
									{product.tags.map((tag) => (
										<li
											key={tag}
											className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
										>
											{tag}
										</li>
									))}
								</ul>
							</div>
						)}
					</div>
				}
			/>

			<Section title="Overview">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
					<div className="space-y-4 text-base leading-relaxed text-muted-foreground">
						<p>{product.description}</p>
					</div>
					<div>
						<h3 className="text-sm font-semibold">Main benefits</h3>
						<ul className="mt-3 space-y-3">
							{product.benefits.map((benefit) => (
								<li key={benefit} className="flex gap-3 text-sm text-muted-foreground">
									<span
										className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
										aria-hidden="true"
									/>
									{benefit}
								</li>
							))}
						</ul>
					</div>
				</div>
			</Section>

			<Section title="Capabilities">
				<ul className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
					{product.features.map((feature) => (
						<li key={feature} className="bg-background p-4 text-sm text-muted-foreground">
							{feature}
						</li>
					))}
				</ul>
			</Section>

			<Section
				title="Technical specifications"
				description="Specification groups differ by product type; this layout is not shared with an unrelated product."
			>
				<SpecGroups product={product} />
			</Section>

			<Section
				id="availability"
				title="Availability"
				description="Product availability, regional commercial state and operational state are separate fields. The note explains what is not yet published."
				actions={
					<Button variant="outline" asChild>
						<Link href="/infrastructure/locations">Location details</Link>
					</Button>
				}
			>
				<AvailabilityTable product={product} />
			</Section>

			{plans.length > 0 && (
				<Section
					id="pricing"
					title="Pricing"
					description="Plans below are modelled with their billing model and conditions. Prices are not published until approved."
				>
					<PricingTable product={product} />
					<div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
						<Link
							href={product.pricingPath ?? "/pricing"}
							className="text-primary underline-offset-4 hover:underline"
						>
							Pricing overview
						</Link>
						<Link
							href="/contact-sales"
							className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
						>
							Request a quote
						</Link>
					</div>
				</Section>
			)}

			{product.related.length > 0 && (
				<Section
					title="Related services"
					description="Services commonly used with this product. Each keeps its own primary family."
				>
					<RelatedProducts product={product} />
				</Section>
			)}

			{product.relatedFamilies.length > 0 && (
				<Section
					title="Related families"
					description="Where else this service is relevant. These are cross-links, not duplicate product definitions."
				>
					<ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{product.relatedFamilies.map((relatedFamily) => {
							const meta = FAMILIES[relatedFamily];
							return (
								<li key={relatedFamily}>
									<Link
										href={meta.route}
										className="group flex h-full flex-col border border-border p-5 no-underline transition-colors hover:bg-muted/50"
									>
										<span className="text-sm font-semibold text-foreground group-hover:text-primary">
											{meta.name}
										</span>
										<span className="mt-2 text-sm leading-relaxed text-muted-foreground">
											{meta.valueProposition}
										</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</Section>
			)}

			<CtaBand
				title={`Discuss ${product.name}`}
				description="Sales can confirm capacity, the operating provider and any contractual terms. No capacity is reserved until a contract is signed."
				primary={{ href: "/contact-sales", label: "Contact sales" }}
				secondary={{ href: family.route, label: `All ${family.name} services` }}
			/>
		</>
	);
}
