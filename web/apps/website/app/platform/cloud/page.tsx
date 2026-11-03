import { PageHero } from "@/components/pages/PageHero";
import {
	Callout,
	Checklist,
	CtaBand,
	DefinitionList,
	FaqSection,
	Section,
	SectionHeader,
} from "@/components/Section";
import { Button } from "@/components/ui/button";
import { cloudFaqs } from "@/lib/content/faq";
import { links } from "@/lib/content/links";
import { pageMetadata } from "@/lib/metadata";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata = pageMetadata({
	title: "Astron Collection Cloud",
	description:
		"The managed platform: SGE operates the control plane, while your workloads keep running on the servers you connect. Same console and API as a self-hosted install.",
	path: "/platform/cloud",
});

export default function CloudPage() {
	return (
		<>
			<PageHero
				badge="Cloud"
				facts={[
					{ value: "1", label: "Control plane, managed" },
					{ value: "0", label: "Install steps" },
					{ value: "724", label: "API operations" },
					{ value: "MIT", label: "Client licence" },
				]}
				eyebrow="Deployment / Cloud"
				title={
					<>
						Managed control plane,{" "}
						<span className="text-primary">your servers</span>
					</>
				}
				description="Astron Collection Cloud is the same platform, operated by Sky Genesis Enterprise. Nothing to install to get started, and your applications and data stay on the infrastructure you connect."
				actions={
					<>
						<Button size="lg" className="rounded-full" asChild>
							<Link href={links.console} target="_blank" rel="noreferrer">
								Open the console
								<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
							</Link>
						</Button>
						<Button size="lg" variant="secondary" className="rounded-full" asChild>
							<Link href="/resources/contact">Talk to us</Link>
						</Button>
					</>
				}
			/>

			<Section labelledBy="model">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
					<SectionHeader
						id="model"
						eyebrow="The model"
						title="Who does what"
						description="A managed platform is only understandable if the split is explicit. This is ours."
					/>
					<div className="grid gap-4">
						<div className="rounded-md border border-primary/40 bg-primary/5 p-5">
							<p className="font-mono text-xs uppercase tracking-[0.06em] text-primary">
								SGE operates
							</p>
							<Checklist
								items={[
									"The console and its API",
									"Availability, monitoring and upgrades of the control plane",
									"Account, workspace and environment provisioning",
									"Support for the platform itself",
								]}
							/>
						</div>
						<div className="rounded-md border border-border bg-subtle p-5">
							<p className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
								You keep
							</p>
							<Checklist
								items={[
									"The servers your workloads run on",
									"Your application data and your databases",
									"The secrets and credentials you connect",
									"Responsibility for the workloads you deploy",
								]}
							/>
						</div>
					</div>
				</div>
			</Section>

			<Section labelledBy="same" className="border-t border-border/60">
				<SectionHeader
					id="same"
					eyebrow="Parity"
					title="What is identical to self-hosting"
					description="Cloud is not a different product line. The differences are operational, not functional."
				/>
				<div className="mt-10">
					<DefinitionList
						items={[
							{
								term: "Console and API",
								description:
									"The same interface and the same OpenAPI document, including the CLI, SDK and MCP server.",
							},
							{
								term: "Discord applications",
								description:
									"The same bot images. Only the injected variables and secrets differ per instance.",
							},
							{
								term: "Permission model",
								description:
									"Organisations, custom roles, SSO and audit behave the same way; the API enforces them.",
							},
							{
								term: "Feature set",
								description:
									"Deployments, databases, backups, domains and monitoring are the same capabilities.",
							},
						]}
					/>
				</div>
				<div className="mt-8">
					<Callout title="What is not published here" tone="warning">
						Plan names, prices and limits are deliberately absent from this page:
						they are commercial terms that must come from SGE, not from a design
						document. Until they are published, contact is the honest next step.
					</Callout>
				</div>
			</Section>

			<Section labelledBy="start" className="border-t border-border/60">
				<div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
					<div>
						<SectionHeader
							id="start"
							eyebrow="Start"
							title="Three steps to a first deployment"
						/>
						<ol className="mt-8 space-y-6">
							{[
								{
									title: "Create your workspace",
									description:
										"Open the console. The first account owns the organisation; add the rest through invitations or SSO.",
								},
								{
									title: "Connect a server",
									description:
										"Add the host your services will run on, or start with the platform's own server for a first test.",
								},
								{
									title: "Deploy something small",
									description:
										"A single application from Git or an image, with a domain and a certificate. Then add a database and a backup destination.",
								},
							].map((step, index) => (
								<li key={step.title} className="flex gap-4">
									<span className="font-mono text-sm text-primary">
										0{index + 1}
									</span>
									<div>
										<p className="text-base font-medium text-foreground">
											{step.title}
										</p>
										<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
											{step.description}
										</p>
									</div>
								</li>
							))}
						</ol>
					</div>
					<div>
						<SectionHeader
							id="compare"
							eyebrow="Choose"
							title="When self-hosting is the better answer"
						/>
						<Checklist
							items={[
								"You need every byte of data inside your own boundary",
								"You already run PostgreSQL and Redis and want to keep them",
								"You need to work air-gapped or on a private network",
								"You want to read and modify the source of the control plane",
							]}
						/>
						<div className="mt-6 flex flex-wrap gap-3">
							<Button variant="secondary" className="rounded-full" asChild>
								<Link href="/platform/self-hosted">
									Self-hosted details
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</Section>

			<FaqSection
				id="faq"
				eyebrow="Questions"
				title="Cloud, without the fog"
				description="What SGE operates, what stays yours, and what is not published here."
				items={cloudFaqs}
			/>

			<CtaBand
				title="See the console before you decide"
				description="The hosted console is the same interface you can install yourself — comparing them is a fair test."
			>
				<Button className="rounded-full" asChild>
					<Link href={links.console} target="_blank" rel="noreferrer">
						Open the console
						<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
					</Link>
				</Button>
				<Button variant="secondary" className="rounded-full" asChild>
					<Link href="/resources/contact">Contact</Link>
				</Button>
			</CtaBand>
		</>
	);
}
