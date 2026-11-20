import { CtaBand, Section } from "@/components/site/Sections";
import { PageHeader } from "@/components/site/PageHeader";
import { resourcePages } from "@/lib/content/pages";
import { pageMetadata } from "@/lib/domain/queries";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
	title: "Resources",
	description:
		"Company documentation, API reference, tutorials, blog, support routes and service status.",
	path: "/resources",
});

export default function ResourcesPage() {
	return (
		<>
			<PageHeader
				eyebrow="Resources"
				title="The technical entry points, kept in one place"
				description="Documentation and the API reference are hosted independently so they can be versioned with the platform. This hub links to them without duplicating their content."
				breadcrumbs={[{ name: "Resources", path: "/resources" }]}
			/>

			<Section title="Build and operate">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{resourcePages.map((page) => (
						<Link
							key={page.path}
							href={page.path}
							className="flex h-full flex-col border border-border p-6 hover:bg-muted/50"
						>
							<h2 className="font-display text-lg">{page.title}</h2>
							<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
								{page.description}
							</p>
							<span className="mt-4 text-sm font-medium text-primary">Open →</span>
						</Link>
					))}
				</div>
			</Section>

			<Section title="Support boundaries">
				<div className="grid gap-px border border-border bg-border sm:grid-cols-3">
					{[
						{
							title: "Documentation",
							body: "Answers product and API questions without an account. It is the first support route.",
						},
						{
							title: "Status page",
							body: "The authoritative operational state. The marketing site does not cache or restate it.",
						},
						{
							title: "Contracted support",
							body: "Response times apply only where an agreement states them. Nothing on this site implies one.",
						},
					].map((item) => (
						<div key={item.title} className="bg-background p-5">
							<h3 className="text-sm font-semibold">{item.title}</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								{item.body}
							</p>
						</div>
					))}
				</div>
			</Section>

			<CtaBand
				title="Cannot find an answer?"
				description="Send the product, region and a short description of the problem. Account-specific requests are handled through the support channel in your agreement."
				primary={{ href: "/company/contact", label: "Contact us" }}
				secondary={{ href: "/resources/support", label: "Support routes" }}
			/>
		</>
	);
}
