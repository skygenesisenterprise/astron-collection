import { CtaBand, Section } from "@/components/site/Sections";
import { PageHeader } from "@/components/site/PageHeader";
import { legalBySlug, legalDocuments } from "@/lib/content/legal";
import { pageMetadata } from "@/lib/domain/queries";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
	return legalDocuments.map((document) => ({ slug: document.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const document = legalBySlug.get(slug);
	if (!document) return { title: "Document not found", robots: { index: false } };
	return pageMetadata({
		title: document.title,
		description: document.description,
		path: `/legal/${document.slug}`,
	});
}

export default async function LegalPage({ params }: PageProps) {
	const { slug } = await params;
	const document = legalBySlug.get(slug);
	if (!document) notFound();

	return (
		<>
			<PageHeader
				eyebrow="Legal"
				title={document.title}
				description={document.description}
				breadcrumbs={[
					{ name: "Legal", path: "/legal/terms" },
					{ name: document.title, path: `/legal/${document.slug}` },
				]}
				aside={
					<div className="border border-warning/40 bg-warning/5 p-5 text-sm">
						<h2 className="font-semibold">Document state</h2>
						<dl className="mt-3 space-y-2">
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Last updated</dt>
								<dd>{document.updated}</dd>
							</div>
							<div className="flex justify-between gap-3">
								<dt className="text-muted-foreground">Status</dt>
								<dd className="text-warning">
									{document.status === "current" ? "Current" : "Under legal review"}
								</dd>
							</div>
						</dl>
						<p className="mt-3 border-t border-warning/30 pt-3 text-xs leading-relaxed text-muted-foreground">
							This page is a site-level summary. The executed agreement and the
							applicable order documents prevail over it.
						</p>
					</div>
				}
			/>

			<Section>
				<div className="grid gap-10 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,0.6fr)]">
					<article className="space-y-8">
						{document.sections.map((section) => (
							<section key={section.heading} aria-labelledby={section.heading}>
								<h2
									id={section.heading}
									className="font-display text-xl tracking-tight"
								>
									{section.heading}
								</h2>
								{section.paragraphs.map((paragraph) => (
									<p
										key={paragraph}
										className="mt-3 text-sm leading-relaxed text-muted-foreground"
									>
										{paragraph}
									</p>
								))}
								{section.bullets && (
									<ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
										{section.bullets.map((bullet) => (
											<li key={bullet}>{bullet}</li>
										))}
									</ul>
								)}
							</section>
						))}
					</article>
					<nav aria-label="Legal documents" className="h-fit border border-border p-5">
						<h2 className="text-sm font-semibold">Legal documents</h2>
						<ul className="mt-3 space-y-2">
							{legalDocuments.map((entry) => (
								<li key={entry.slug}>
									<Link
										href={`/legal/${entry.slug}`}
										aria-current={entry.slug === document.slug ? "page" : undefined}
										className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline aria-[current=page]:font-medium aria-[current=page]:text-foreground"
									>
										{entry.title}
									</Link>
								</li>
							))}
						</ul>
					</nav>
				</div>
			</Section>

			<CtaBand
				title="Need a signed agreement?"
				description="Contract, data-processing and procurement documents are provided by the sales team."
				primary={{ href: "/contact-sales", label: "Contact sales" }}
				secondary={{ href: "/company/contact", label: "Contact routes" }}
			/>
		</>
	);
}
