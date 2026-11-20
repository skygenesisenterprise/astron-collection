import { AvailabilityLegend, ProductGrid } from "@/components/catalogue/CatalogueViews";
import { CtaBand, Section } from "@/components/site/Sections";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { getAllProducts, pageMetadata } from "@/lib/domain/queries";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
	title: "Public Cloud",
	description:
		"Astron Collection Public Cloud: compute instances, GPU, object and block storage, managed databases, Kubernetes and backups.",
	path: "/products/public-cloud",
});

export default function PublicCloudPage() {
	const products = getAllProducts().filter((product) =>
		product.route?.startsWith("/products/public-cloud/"),
	);

	return (
		<>
			<PageHeader
				eyebrow="Public Cloud"
				title="Elastic infrastructure, ordered one resource at a time"
				description="Public Cloud groups the resources most workloads start with: instances, storage, databases, Kubernetes and backups. Each resource has its own lifecycle, limits and pricing model."
				breadcrumbs={[
					{ name: "Products", path: "/products" },
					{ name: "Public Cloud", path: "/products/public-cloud" },
				]}
				actions={
					<>
						<Button asChild>
							<Link href="/contact-sales">Request access</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/pricing/compute">Compute pricing</Link>
						</Button>
					</>
				}
			/>

			<Section
				title="Public Cloud products"
				description="Every product below is modelled in the catalogue. Commercial availability is stated per region on the product page."
			>
				<ProductGrid products={products} />
			</Section>

			<Section
				title="What Public Cloud is not"
				description="A shared platform has boundaries. These are stated rather than discovered later."
			>
				<ul className="grid gap-3 sm:grid-cols-2">
					{[
						"A single instance is not highly available. Redundancy is a topology you design.",
						"Object storage does not advertise S3 compatibility until an endpoint is verified.",
						"Managed databases do not imply automatic failover; topology is stated per plan.",
						"Cross-region networking is not offered until it has been verified.",
					].map((item) => (
						<li key={item} className="border border-border p-4 text-sm text-muted-foreground">
							{item}
						</li>
					))}
				</ul>
			</Section>

			<Section title="Availability states" description="The same four states apply across the catalogue.">
				<AvailabilityLegend />
			</Section>

			<CtaBand
				title="Public Cloud is opening progressively"
				description="If a product you need is marked coming soon, contact sales to discuss timing and partner-delivered capacity."
				primary={{ href: "/contact-sales", label: "Contact sales" }}
				secondary={{ href: "/products", label: "Back to the catalogue" }}
			/>
		</>
	);
}
