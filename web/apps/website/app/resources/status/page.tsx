import { PageHero } from "@/components/pages/PageHero";
import {
	Callout,
	CtaBand,
	Section,
	SectionHeader,
} from "@/components/Section";
import { Button } from "@/components/ui/button";
import { links } from "@/lib/content/links";
import { statusChecks } from "@/lib/content/resources";
import { pageMetadata } from "@/lib/metadata";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata = pageMetadata({
	title: "Service status",
	description:
		"Availability, incidents and maintenance windows for the hosted Astron Collection services.",
	path: "/resources/status",
});

export default function StatusPage() {
	return (
		<>
			<PageHero
				badge="Status"
				eyebrow="Resources / Status"
				title="What is running right now"
				description="The status page is its own application with its own data: incidents, maintenance windows and uptime are published there, not estimated here."
				actions={
					<Button size="lg" className="rounded-full" asChild>
						<Link href={links.status} target="_blank" rel="noreferrer">
							Open the status page
							<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
						</Link>
					</Button>
				}
			/>

			<Section labelledBy="what">
				<SectionHeader
					id="what"
					eyebrow="What is tracked"
					title="Components, not impressions"
					description="Each component is tracked separately, so a degraded API does not read as a total outage."
				/>
				<div className="mt-10 grid gap-4 sm:grid-cols-3">
					{statusChecks.map((check) => (
						<article
							key={check.title}
							className="rounded-lg border border-border bg-card p-6"
						>
							<h3 className="text-base font-semibold text-foreground">
								{check.title}
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								{check.description}
							</p>
						</article>
					))}
				</div>
				<div className="mt-8">
					<Callout title="Self-hosted is not covered">
						If you run the platform yourself, its availability is yours to
						monitor. The public status page covers the services SGE operates —
						the hosted console and documentation.
					</Callout>
				</div>
			</Section>

			<CtaBand
				title="See the live state"
				description="The authoritative answer to “is it up?” is the status page, not a marketing page."
			>
				<Button className="rounded-full" asChild>
					<Link href={links.status} target="_blank" rel="noreferrer">
						status.astron-collection.com
						<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
					</Link>
				</Button>
			</CtaBand>
		</>
	);
}
