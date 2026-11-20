import { CtaBand, LinkList, Section } from "@/components/site/Sections";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { resourceBySlug, resourcePages } from "@/lib/content/pages";
import { links } from "@/lib/content/site";
import { pageMetadata } from "@/lib/domain/queries";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

const EXTERNAL_ENTRY: Record<string, { href: string; label: string }> = {
	documentation: { href: links.docs.home, label: "Open documentation" },
	api: { href: links.docs.api, label: "Open API reference" },
	tutorials: { href: links.docs.tutorials, label: "Browse tutorials" },
	blog: { href: links.blog, label: "Read the blog" },
	support: { href: links.docs.support, label: "Open support portal" },
	status: { href: links.status, label: "Open status page" },
};

export function generateStaticParams() {
	return resourcePages.map((page) => ({
		slug: page.path.split("/").pop() ?? "",
	}));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const page = resourceBySlug.get(slug);
	if (!page) return { title: "Page not found", robots: { index: false } };
	return pageMetadata({
		title: page.title,
		description: page.description,
		path: page.path,
	});
}

export default async function ResourceDetailPage({ params }: PageProps) {
	const { slug } = await params;
	const page = resourceBySlug.get(slug);
	if (!page) notFound();
	const external = EXTERNAL_ENTRY[slug];

	return (
		<>
			<PageHeader
				eyebrow={page.eyebrow}
				title={page.title}
				description={page.description}
				breadcrumbs={[
					{ name: "Resources", path: "/resources" },
					{ name: page.title, path: page.path },
				]}
				actions={
					external && (
						<Button asChild>
							<a href={external.href} target="_blank" rel="noreferrer">
								{external.label}
							</a>
						</Button>
					)
				}
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
							</div>
						))}
					</div>
					<div className="space-y-6">
						{external && (
							<div className="border border-border p-5">
								<h2 className="text-sm font-semibold">Canonical source</h2>
								<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
									{page.title} is maintained outside this marketing site. The
									external page is the authoritative version.
								</p>
								<a
									href={external.href}
									target="_blank"
									rel="noreferrer"
									className="mt-3 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
								>
									{external.label}
								</a>
							</div>
						)}
						{page.related && page.related.length > 0 && (
							<div>
								<h2 className="mb-3 text-sm font-semibold">Related</h2>
								<LinkList links={page.related} />
							</div>
						)}
					</div>
				</div>
			</Section>

			<CtaBand
				title="Still stuck?"
				description="Product, region and a short description help route the question. Security reports follow the disclosure process."
				primary={{ href: "/company/contact", label: "Contact" }}
				secondary={{ href: "/resources", label: "All resources" }}
			/>
		</>
	);
}
