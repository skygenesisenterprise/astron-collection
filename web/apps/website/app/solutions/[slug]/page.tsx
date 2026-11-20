import { ProductGrid } from "@/components/catalogue/CatalogueViews";
import { CtaBand, LinkList, Section } from "@/components/site/Sections";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { solutionBySlug, solutions } from "@/lib/content/pages";
import { getProductById, pageMetadata } from "@/lib/domain/queries";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
	return solutions.map((solution) => ({ slug: solution.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const solution = solutionBySlug.get(slug);
	if (!solution) return { title: "Solution not found", robots: { index: false } };
	return pageMetadata({
		title: solution.title,
		description: solution.description,
		path: solution.path,
	});
}

export default async function SolutionPage({ params }: PageProps) {
	const { slug } = await params;
	const solution = solutionBySlug.get(slug);
	if (!solution) notFound();

	const products = solution.productIds
		.map((id) => getProductById(id))
		.filter((product): product is NonNullable<typeof product> => Boolean(product));

	return (
		<>
			<PageHeader
				eyebrow={solution.eyebrow}
				title={solution.title}
				description={solution.description}
				breadcrumbs={[
					{ name: "Solutions", path: "/solutions" },
					{ name: solution.title, path: solution.path },
				]}
				actions={
					<>
						<Button asChild>
							<Link href="/contact-sales">Contact sales</Link>
						</Button>
						<Button variant="outline" asChild>
							<Link href="/products">Browse products</Link>
						</Button>
					</>
				}
			/>

			<Section title="What this path is built around">
				<div className="grid gap-px border border-border bg-border sm:grid-cols-3">
					{solution.outcomes.map((outcome) => (
						<div key={outcome.title} className="bg-background p-6">
							<h3 className="font-display text-lg">{outcome.title}</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								{outcome.description}
							</p>
						</div>
					))}
				</div>
			</Section>

			<Section title="The context">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)]">
					<div className="space-y-8">
						<p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
							{solution.intro}
						</p>
						{solution.sections.map((section) => (
							<div key={section.heading}>
								<h3 className="font-display text-lg">{section.heading}</h3>
								<p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
									{section.body}
								</p>
								{section.bullets && (
									<ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
										{section.bullets.map((bullet) => (
											<li key={bullet}>{bullet}</li>
										))}
									</ul>
								)}
							</div>
						))}
					</div>
					<div className="space-y-6">
						<div className="border border-border p-5">
							<h3 className="text-sm font-semibold">A good fit for</h3>
							<ul className="mt-3 space-y-2 text-sm text-muted-foreground">
								{solution.fit.map((item) => (
									<li key={item} className="flex gap-2">
										<span aria-hidden="true">—</span>
										{item}
									</li>
								))}
							</ul>
						</div>
						{solution.related && solution.related.length > 0 && (
							<div>
								<h3 className="mb-3 text-sm font-semibold">Related</h3>
								<LinkList links={solution.related} />
							</div>
						)}
					</div>
				</div>
			</Section>

			<Section
				title="Products in this path"
				description="Availability, provider and pricing state are published on each product page."
			>
				<ProductGrid products={products} />
			</Section>

			<CtaBand
				title="Map this path to your workload"
				description="Share expected capacity, region and any isolation requirements. A reply is not a commercial offer."
				primary={{ href: "/contact-sales", label: "Contact sales" }}
				secondary={{ href: "/solutions", label: "Other solutions" }}
			/>
		</>
	);
}
