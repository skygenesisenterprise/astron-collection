import { CtaBand, Section } from "@/components/site/Sections";
import { PageHeader } from "@/components/site/PageHeader";
import { companyPages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/domain/queries";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
	title: "Astron Collection",
	description:
		"About Astron Collection and Sky Genesis Enterprise: company information, careers, partners, contact and newsroom.",
	path: "/company",
});

export default function CompanyPage() {
	return (
		<>
			<PageHeader
				eyebrow="Astron Collection"
				title="Astron Collection, built by Sky Genesis Enterprise"
				description="A cloud infrastructure brand with European roots and global ambitions. This section covers the company, the partnership model and how to reach the right team."
				breadcrumbs={[{ name: "Astron Collection", path: "/company" }]}
			/>

			<Section title="Astron Collection information">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{companyPages.map((page) => (
						<Link
							key={page.path}
							href={page.path}
							className="flex h-full flex-col border border-border p-6 hover:bg-muted/50"
						>
							<h2 className="font-display text-lg">{page.title}</h2>
							<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
								{page.description}
							</p>
							<span className="mt-4 text-sm font-medium text-primary">Read →</span>
						</Link>
					))}
				</div>
			</Section>

			<Section title="What we publish, and what we do not">
				<div className="grid gap-8 lg:grid-cols-2">
					<div className="border border-border p-6">
						<h3 className="font-display text-lg">Published</h3>
						<ul className="mt-3 space-y-2 text-sm text-muted-foreground">
							<li>The legal entity behind the brand.</li>
							<li>The distinction between owned and partner infrastructure.</li>
							<li>Product availability, per region, from data.</li>
							<li>The pricing publication state.</li>
						</ul>
					</div>
					<div className="border border-border p-6">
						<h3 className="font-display text-lg">Not claimed</h3>
						<ul className="mt-3 space-y-2 text-sm text-muted-foreground">
							<li>Certifications or audit results.</li>
							<li>Uptime percentages or SLA terms outside a contract.</li>
							<li>Named customer outcomes.</li>
							<li>Facility addresses before verification.</li>
						</ul>
					</div>
				</div>
			</Section>

			<CtaBand
				title="Talk to the right team"
				description="Commercial, technical and partnership requests take different routes. Choose the one that matches your question."
				primary={{ href: "/contact-sales", label: "Contact sales" }}
				secondary={{ href: "/company/contact", label: "All contact routes" }}
			/>
		</>
	);
}
