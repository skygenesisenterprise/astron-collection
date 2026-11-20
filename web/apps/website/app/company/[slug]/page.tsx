import { ContactSalesForm } from "@/components/forms/ContactSalesForm";
import { CtaBand, LinkList, Section } from "@/components/site/Sections";
import { PageHeader } from "@/components/site/PageHeader";
import { Button } from "@/components/ui/button";
import { companyBySlug, companyPages } from "@/lib/content/pages";
import { links } from "@/lib/content/site";
import { pageMetadata } from "@/lib/domain/queries";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
	return companyPages.map((page) => ({
		slug: page.path.split("/").pop() ?? "",
	}));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const page = companyBySlug.get(slug);
	if (!page) return { title: "Page not found", robots: { index: false } };
	return pageMetadata({
		title: page.title,
		description: page.description,
		path: page.path,
	});
}

export default async function CompanyDetailPage({ params }: PageProps) {
	const { slug } = await params;
	const page = companyBySlug.get(slug);
	if (!page) notFound();

	return (
		<>
			<PageHeader
				eyebrow={page.eyebrow}
				title={page.title}
				description={page.description}
				breadcrumbs={[
					{ name: "Astron Collection", path: "/company" },
					{ name: page.title, path: page.path },
				]}
				actions={
					<Button asChild>
						<Link href="/contact-sales">Contact sales</Link>
					</Button>
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
						{page.related && page.related.length > 0 && (
							<div>
								<h2 className="mb-3 text-sm font-semibold">Related</h2>
								<LinkList links={page.related} />
							</div>
						)}
						<div className="border border-border p-5">
							<h2 className="text-sm font-semibold">Direct channels</h2>
							<ul className="mt-3 space-y-2 text-sm text-muted-foreground">
								<li>
									Sales:{" "}
									<a href="mailto:sales@astron-collection.com" className="text-foreground underline underline-offset-4">
										sales@astron-collection.com
									</a>
								</li>
								<li>
									Status:{" "}
									<a
										href={links.status}
										target="_blank"
										rel="noreferrer"
										className="text-foreground underline underline-offset-4"
									>
										status.astron-collection.com
									</a>
								</li>
								<li>
									Docs:{" "}
									<a
										href={links.docs.home}
										target="_blank"
										rel="noreferrer"
										className="text-foreground underline underline-offset-4"
									>
										docs.astron-collection.com
									</a>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</Section>

			{slug === "contact" && (
				<Section
					id="contact-form"
					title="Send a message"
					description="The form validates on the server and is rate-limited. If mail delivery is not configured for a deployment, it says so instead of pretending to send."
				>
					<div className="grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
						<ContactSalesForm />
						<div className="space-y-4 border border-border p-5 text-sm text-muted-foreground">
							<h3 className="font-semibold text-foreground">What happens next</h3>
							<p>
								Your message is delivered to the sales team. You will not be
								added to a marketing list.
							</p>
							<p>
								A reply is not a commercial offer. Capacity, provider and
								contract terms are confirmed separately in writing.
							</p>
							<p>
								Do not include credentials, private keys or personal data that is
								not needed to answer your request.
							</p>
						</div>
					</div>
				</Section>
			)}

			<CtaBand
				title="Commercial question?"
				description="Use the sales route for new capacity, partnerships and enterprise procurement."
				primary={{ href: "/contact-sales", label: "Contact sales" }}
				secondary={{ href: "/company", label: "Astron Collection overview" }}
			/>
		</>
	);
}
