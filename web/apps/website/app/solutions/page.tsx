import { CtaBand, Section } from "@/components/site/Sections";
import { PageHeader } from "@/components/site/PageHeader";
import { solutions } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/domain/queries";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
	title: "Solutions",
	description:
		"Astron Collection for developers, startups, small businesses, enterprises, hosting providers and AI research teams.",
	path: "/solutions",
});

export default function SolutionsPage() {
	return (
		<>
			<PageHeader
				eyebrow="Solutions"
				title="Infrastructure viewed from the work it supports"
				description="The same catalogue, arranged by what a team is trying to do. Each path names the products involved and the constraints that come with them."
				breadcrumbs={[{ name: "Solutions", path: "/solutions" }]}
			/>

			<Section title="Choose a starting point">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{solutions.map((solution) => (
						<Link
							key={solution.slug}
							href={solution.path}
							className="flex h-full flex-col border border-border p-6 transition-colors hover:bg-muted/50"
						>
							<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
								{solution.eyebrow}
							</p>
							<h2 className="mt-3 font-display text-xl tracking-tight">
								{solution.title}
							</h2>
							<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
								{solution.description}
							</p>
							<span className="mt-5 text-sm font-medium text-primary">
								Explore this path →
							</span>
						</Link>
					))}
				</div>
			</Section>

			<Section
				title="A note on audience pages"
				description="These pages describe how the catalogue applies to a type of work. They do not claim customer outcomes, reference customers or certifications."
			>
				<p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
					If you are evaluating Astron Collection for a specific procurement process,
					start with the product pages and the infrastructure section. Those
					pages carry the availability, provider and pricing facts that an
					audience page deliberately avoids repeating.
				</p>
			</Section>

			<CtaBand
				title="Not sure which path fits?"
				description="Describe the workload, expected capacity and region. Sales can map it to specific products and their current state."
				primary={{ href: "/contact-sales", label: "Contact sales" }}
				secondary={{ href: "/products", label: "Browse the catalogue" }}
			/>
		</>
	);
}
