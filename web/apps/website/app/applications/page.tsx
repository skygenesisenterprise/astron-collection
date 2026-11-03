import { AppCard } from "@/components/applications/AppCard";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/Reveal";
import {
	Callout,
	CtaBand,
	FaqSection,
	Section,
	SectionHeader,
} from "@/components/Section";
import { Button } from "@/components/ui/button";
import { applications, sharedCommands } from "@/lib/content/applications";
import { applicationsFaqs } from "@/lib/content/faq";
import { cta } from "@/lib/content/site";
import { pageMetadata } from "@/lib/metadata";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = pageMetadata({
	title: "Applications",
	description:
		"Astron, Guild, Logger, Protect, Player and Automation: what each Discord application does, what is available today, and how they share one platform.",
	path: "/applications",
});

export default function ApplicationsPage() {
	const available = applications.filter((app) => app.status === "available");
	const other = applications.filter((app) => app.status !== "available");

	return (
		<>
			<PageHero
				badge="Applications"
				facts={[
					{ value: "5", label: "Available distributions" },
					{ value: "20", label: "Shared commands" },
					{ value: "1", label: "Shared framework" },
					{ value: "MIT", label: "Licence" },
				]}
				eyebrow="The collection"
				title="Applications"
				description="Six distributions, each with one responsibility. Five are available today; Player is in development and Automation is planned. The status reflects the code, not the roadmap."
				actions={
					<Button size="lg" className="rounded-full" asChild>
						<Link href={cta.invite.href}>
							{cta.invite.label}
							<ArrowRight className="h-4 w-4" aria-hidden="true" />
						</Link>
					</Button>
				}
			/>

			<Section labelledBy="available">
				<SectionHeader
					id="available"
					eyebrow="Available"
					title="Deployable today"
					description="Each of these has its own token, data directory, image and Redis key prefix, so they run side by side without colliding."
				/>
				<ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{available.map((application, index) => (
						<Reveal key={application.slug} delay={index * 0.03}>
							<li className="h-full">
								<AppCard application={application} />
							</li>
						</Reveal>
					))}
				</ul>
			</Section>

			<Section labelledBy="upcoming" className="border-t border-border/60">
				<SectionHeader
					id="upcoming"
					eyebrow="Not shipped"
					title="In development and planned"
					description="Published with their real status and without a feature list: a page that promises playback commands or automation triggers would be describing software that does not exist yet."
				/>
				<ul className="mt-12 grid gap-4 sm:grid-cols-2">
					{other.map((application) => (
						<li key={application.slug} className="h-full">
							<AppCard application={application} />
						</li>
					))}
				</ul>
			</Section>

			<Section labelledBy="catalogue" className="border-t border-border/60">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
					<div>
						<SectionHeader
							id="catalogue"
							eyebrow="Shared catalogue"
							title="One command set, today"
							description="The five distributions ship the same 20 commands. They differ by deployment intent — what they are meant to own — not by a different feature list."
						/>
						<Callout title="Why publish this">
							Hide the overlap and every application page would need invented
							differences. The catalogue is shared on purpose: it is the same
							tested code, deployed where it makes sense.
						</Callout>
					</div>

					<div className="hairline-grid grid grid-cols-1 border-l border-t border-border/60 sm:grid-cols-2">
						{sharedCommands.map((item) => (
							<div key={item.command} className="bg-background px-4 py-3">
								<code className="font-mono text-sm text-primary">
									{item.command}
								</code>
								<p className="mt-1 text-sm text-muted-foreground">
									{item.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</Section>

			<FaqSection
				id="faq"
				eyebrow="Questions"
				title="Choosing between the distributions"
				description="The practical differences, including the ones that are deliberately shared."
				items={applicationsFaqs}
			/>

			<CtaBand
				title="Not sure which one to start with?"
				description="Astron covers the common surface in a single process. Split into dedicated distributions only when you have a reason to restart one without the others."
			>
				<Button className="rounded-full" asChild>
					<Link href="/applications/astron">
						Read the Astron page
						<ArrowRight className="h-4 w-4" aria-hidden="true" />
					</Link>
				</Button>
				<Button variant="secondary" className="rounded-full" asChild>
					<Link href="/platform">How it all fits together</Link>
				</Button>
			</CtaBand>
		</>
	);
}
