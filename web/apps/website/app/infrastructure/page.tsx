import { CtaBand, Section } from "@/components/site/Sections";
import { PageHeader } from "@/components/site/PageHeader";
import { infrastructurePages } from "@/lib/content/pages";
import { getProviders, getRegions, pageMetadata } from "@/lib/domain/queries";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = pageMetadata({
	title: "Infrastructure",
	description:
		"Company's hybrid infrastructure model: owned and partner capacity, network services, regions with a published verification state.",
	path: "/infrastructure",
});

export default function InfrastructurePage() {
	const providers = getProviders();
	const regions = getRegions();

	return (
		<>
			<PageHeader
				eyebrow="Infrastructure"
				title="Owned and partner infrastructure, stated plainly"
				description="Company runs a hybrid model. Owned capacity is operated directly; partner capacity is supplied by external providers and integrated into the same catalogue. The interface keeps the two distinct."
				breadcrumbs={[{ name: "Infrastructure", path: "/infrastructure" }]}
			/>

			<Section
				title="Infrastructure sources"
				description="Provider type is a field in the catalogue, not a footnote."
			>
				<div className="grid gap-4 sm:grid-cols-2">
					{providers.map((provider) => (
						<div key={provider.id} className="border border-border p-6">
							<div className="flex items-center justify-between gap-3">
								<h3 className="font-display text-lg">{provider.name}</h3>
								<span className="border border-border px-2 py-0.5 text-xs text-muted-foreground">
									{provider.type === "own" ? "Owned" : "Partner"}
								</span>
							</div>
							<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
								{provider.description}
							</p>
						</div>
					))}
				</div>
			</Section>

			<Section
				title="Regions and verification"
				description="A region is only presented as live when its facility, operating entity and terms are confirmed."
			>
				<div className="grid gap-4 sm:grid-cols-2">
					{regions.map((region) => (
						<div key={region.id} className="border border-border p-6">
							<div className="flex items-center justify-between gap-3">
								<h3 className="font-display text-lg">{region.name}</h3>
								<span className="border border-warning/40 bg-warning/10 px-2 py-0.5 text-xs text-warning">
									{region.verification === "verified" ? "Verified" : "Pending"}
								</span>
							</div>
							<p className="mt-2 text-sm text-muted-foreground">
								{region.country} · {region.location}
							</p>
							<p className="mt-3 text-xs leading-relaxed text-muted-foreground">
								{region.notes}
							</p>
						</div>
					))}
				</div>
			</Section>

			<Section title="Infrastructure documentation">
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{infrastructurePages.map((page) => (
						<Link
							key={page.path}
							href={page.path}
							className="flex h-full flex-col border border-border p-6 hover:bg-muted/50"
						>
							<h3 className="font-display text-lg">{page.title}</h3>
							<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
								{page.description}
							</p>
							<span className="mt-4 text-sm font-medium text-primary">Read →</span>
						</Link>
					))}
				</div>
			</Section>

			<CtaBand
				title="Need a specific location or provider?"
				description="Location and provider commitments are confirmed per contract. Sales can explain what is verified for your target region."
				primary={{ href: "/contact-sales", label: "Contact sales" }}
				secondary={{ href: "/products", label: "Browse products" }}
			/>
		</>
	);
}
