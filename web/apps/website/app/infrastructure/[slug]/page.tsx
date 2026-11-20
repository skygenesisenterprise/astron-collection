import { CtaBand, LinkList, Section } from "@/components/site/Sections";
import { PageHeader } from "@/components/site/PageHeader";
import { infrastructureBySlug, infrastructurePages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/domain/queries";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
	return infrastructurePages.map((page) => ({
		slug: page.path.split("/").pop() ?? "",
	}));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const page = infrastructureBySlug.get(slug);
	if (!page) return { title: "Page not found", robots: { index: false } };
	return pageMetadata({
		title: page.title,
		description: page.description,
		path: page.path,
	});
}

export default async function InfrastructureDetailPage({ params }: PageProps) {
	const { slug } = await params;
	const page = infrastructureBySlug.get(slug);
	if (!page) notFound();

	return (
		<>
			<PageHeader
				eyebrow={page.eyebrow}
				title={page.title}
				description={page.description}
				breadcrumbs={[
					{ name: "Infrastructure", path: "/infrastructure" },
					{ name: page.title, path: page.path },
				]}
			/>

			<Section>
				<div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.7fr)]">
					<div className="space-y-8">
						<p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
							{page.intro}
						</p>
						{page.sections.map((section) => (
							<div key={section.heading}>
								<h2 className="font-display text-xl tracking-tight">
									{section.heading}
								</h2>
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
						{page.related && page.related.length > 0 && (
							<div>
								<h2 className="mb-3 text-sm font-semibold">Related</h2>
								<LinkList links={page.related} />
							</div>
						)}
						<div className="border border-border p-5">
							<h2 className="text-sm font-semibold">Open a question</h2>
							<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
								Location, provider and capacity commitments are confirmed per
								contract. Sales can state what is verified today.
							</p>
							<Link
								href="/contact-sales"
								className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
							>
								Contact sales
							</Link>
						</div>
					</div>
				</div>
			</Section>

			<CtaBand
				title="Review the catalogue with this in mind"
				description="Product pages show which provider and region each availability entry refers to."
				primary={{ href: "/products", label: "Browse products" }}
				secondary={{ href: "/infrastructure", label: "Infrastructure overview" }}
			/>
		</>
	);
}
