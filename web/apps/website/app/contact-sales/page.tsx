import { ContactSalesForm } from "@/components/forms/ContactSalesForm";
import { Section } from "@/components/site/Sections";
import { PageHeader } from "@/components/site/PageHeader";
import { pageMetadata } from "@/lib/domain/queries";
import { links } from "@/lib/content/site";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
	title: "Contact sales",
	description:
		"Discuss capacity, private infrastructure, enterprise terms or partner-delivered services with the Astron Collection sales team.",
	path: "/contact-sales",
});

export default function ContactSalesPage() {
	return (
		<>
			<PageHeader
				eyebrow="Contact sales"
				title="Scope a requirement with the team"
				description="Sales can confirm capacity, the operating provider and contractual terms. Include the product, expected capacity and target region so the request can be routed."
				breadcrumbs={[{ name: "Contact sales", path: "/contact-sales" }]}
			/>

			<Section>
				<div className="grid gap-10 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.65fr)]">
					<ContactSalesForm />

					<aside className="space-y-6">
						<div className="border border-border p-5">
							<h2 className="text-sm font-semibold">What we can confirm</h2>
							<ul className="mt-3 space-y-2 text-sm text-muted-foreground">
								<li>Which products are open, in preparation or partner-delivered.</li>
								<li>The modelled region for the requested capacity.</li>
								<li>The billing model and the state of its pricing.</li>
								<li>Whether an SLA or certification applies to the contract.</li>
							</ul>
						</div>
						<div className="border border-border p-5">
							<h2 className="text-sm font-semibold">What it does not do</h2>
							<ul className="mt-3 space-y-2 text-sm text-muted-foreground">
								<li>Create an account or reserve capacity.</li>
								<li>Constitute a commercial offer.</li>
								<li>Subscribe you to marketing.</li>
							</ul>
						</div>
						<div className="border border-border p-5 text-sm">
							<h2 className="font-semibold">Direct email</h2>
							<p className="mt-2 text-muted-foreground">
								If the form is unavailable in this deployment, write to{" "}
								<a
									href="mailto:sales@astron-collection.com"
									className="text-foreground underline underline-offset-4"
								>
									sales@astron-collection.com
								</a>
								.
							</p>
						</div>
						<div className="border border-border p-5 text-sm">
							<h2 className="font-semibold">Other routes</h2>
							<ul className="mt-2 space-y-1.5 text-muted-foreground">
								<li>
									<Link href="/company/contact" className="underline underline-offset-4 hover:text-foreground">
										All contact routes
									</Link>
								</li>
								<li>
									<a
										href={links.docs.home}
										target="_blank"
										rel="noreferrer"
										className="underline underline-offset-4 hover:text-foreground"
									>
										Documentation
									</a>
								</li>
								<li>
									<a
										href={links.status}
										target="_blank"
										rel="noreferrer"
										className="underline underline-offset-4 hover:text-foreground"
									>
										Service status
									</a>
								</li>
							</ul>
						</div>
					</aside>
				</div>
			</Section>
		</>
	);
}
