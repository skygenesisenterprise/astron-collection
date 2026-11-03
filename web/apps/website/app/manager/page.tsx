import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/Reveal";
import {
	Callout,
	Checklist,
	CtaBand,
	DefinitionList,
	FaqSection,
	FeatureGrid,
	Section,
	SectionHeader,
} from "@/components/Section";
import { Button } from "@/components/ui/button";
import { links } from "@/lib/content/links";
import {
	deploymentModels,
	managerSections,
	services,
} from "@/lib/content/platform";
import { managerFaqs } from "@/lib/content/faq";
import { cta, site } from "@/lib/content/site";
import { pageMetadata, softwareJsonLd } from "@/lib/metadata";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata = pageMetadata({
	title: "Astron Manager",
	description:
		"The console behind the collection: servers, applications, databases, domains, backups, access and audit — with the same operations available through the API.",
	path: "/manager",
});

export default function ManagerPage() {
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(
						softwareJsonLd({
							name: "Astron Manager",
							description:
								"The console for the Astron Collection platform: servers, applications, databases, access and audit.",
							path: "/manager",
						}),
					),
				}}
			/>

			<PageHero
				badge="Astron Manager"
				facts={[
					{ value: "6", label: "Management areas" },
					{ value: "3", label: "Product flavours" },
					{ value: "724", label: "API operations" },
					{ value: "2", label: "Deployment models" },
				]}
				eyebrow="Astron Manager"
				title={
					<>
						The console the{" "}
						<span className="text-primary">collection runs on</span>
					</>
				}
				description="Astron Manager is the management interface of the platform: where servers, applications, databases and access are operated. It is not a statistics dashboard, and it is not a Discord guild panel."
				actions={
					<>
						<Button size="lg" className="rounded-full" asChild>
							<Link href={cta.console.href} target="_blank" rel="noreferrer">
								{cta.console.label}
								<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
							</Link>
						</Button>
						<Button size="lg" variant="secondary" className="rounded-full" asChild>
							<Link href="/platform">See the architecture</Link>
						</Button>
					</>
				}
				meta={
					<p className="font-mono text-xs text-subtle-foreground">
						Three product flavours: {site.name} · Astron Collection Cloud ·
						Astron Collection Console
					</p>
				}
			/>

			<Section labelledBy="boundary">
				<div className="grid gap-6 lg:grid-cols-2">
					<Callout title="What the Manager is">
						The operational surface for the platform: infrastructure,
						deployments, data, networking and access. A deployment triggered
						here, by the CLI or by CI is the same deployment.
					</Callout>
					<Callout title="What the Manager is not" tone="warning">
						A Discord administration panel. Bot behaviour lives in Discord
						through <code className="font-mono text-xs">/config</code>; the
						console appears on Discord only as a notification channel (webhook).
					</Callout>
				</div>

				<div className="mt-12">
					<SectionHeader
						id="sections"
						eyebrow="Scope"
						title="What you manage"
						description="Six areas, each mapping to routers and screens that exist in the application today."
					/>
					<div className="mt-10 grid gap-4 md:grid-cols-2">
						{managerSections.map((section, index) => (
							<Reveal key={section.title} delay={index * 0.03}>
								<article className="h-full rounded-lg border border-border bg-card p-6">
									<h3 className="text-lg font-semibold text-foreground">
										{section.title}
									</h3>
									<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
										{section.description}
									</p>
									<ul className="mt-4 space-y-2">
										{section.items.map((item) => (
											<li
												key={item}
												className="flex gap-2 text-sm text-muted-foreground"
											>
												<span
													aria-hidden="true"
													className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-primary/70"
												/>
												{item}
											</li>
										))}
									</ul>
								</article>
							</Reveal>
						))}
					</div>
				</div>
			</Section>

			<Section labelledBy="interface" className="border-t border-border/60">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
					<SectionHeader
						id="interface"
						eyebrow="The interface"
						title="One surface, consistent verbs"
						description="Projects contain environments; environments contain services; services get domains, variables, deployments and backups. The navigation follows that model instead of grouping by database table."
					/>
					<div>
						<DefinitionList
							items={[
								{
									term: "Projects",
									description:
										"Group services and environments. The first thing you create, and the scope most operations start from.",
								},
								{
									term: "Services",
									description:
										"Applications, Compose projects and databases. Each has a deployment history and a set of settings.",
								},
								{
									term: "Servers",
									description:
										"The local server, remote servers over SSH, and Swarm nodes. Placement is chosen per service.",
								},
								{
									term: "Access",
									description:
										"Organisations, custom roles, SSO, API keys and sessions. Enforced by the API, not by hidden buttons.",
								},
								{
									term: "Operations",
									description:
										"Audit log, metrics, notifications and the status page. The record of what happened and the alert when it does.",
								},
							]}
						/>
						<Callout title="About screenshots">
							Interface screenshots are captured from a running instance and are
							not published as mock-ups. Until they are added, the console link
							above is the honest way to see the interface.
						</Callout>
					</div>
				</div>
			</Section>

			<Section labelledBy="architecture" className="border-t border-border/60">
				<SectionHeader
					id="architecture"
					eyebrow="How it works"
					title="Separate planes, separate credentials"
					description="The client serves the interface and proxies API calls; only the API holds the database and Redis credentials and applies migrations. Neither container mounts the host Docker socket."
				/>
				<div className="mt-10">
					<FeatureGrid
						items={[
							{
								title: "Control plane",
								description:
									"Console and API: projects, deployments, access, audit. It can be replaced, restored or upgraded without touching your running services.",
							},
							{
								title: "Data plane",
								description:
									"The servers your workloads run on — local, remote over SSH, or a Swarm cluster. They keep running if the control plane is down.",
							},
							{
								title: "Workers",
								description:
									"Background work and scheduled jobs run outside the request path, so a long build never blocks the interface.",
							},
							{
								title: "Status page",
								description:
									"A separate application with its own package: incidents, maintenance windows and uptime are published there, not inside the console.",
							},
						]}
						columns={2}
					/>
				</div>
				<div className="mt-8">
					<DefinitionList
						items={services.map((service) => ({
							term: `${service.name} — ${service.path}`,
							description: service.role,
						}))}
					/>
				</div>
			</Section>

			<Section labelledBy="deployment" className="border-t border-border/60">
				<SectionHeader
					id="deployment"
					eyebrow="Deployment"
					title="You can run the console yourself"
					description="The Manager is not a hosted-only product. Self-hosted installs the same console, API, database and Redis."
				/>
				<div className="mt-10 grid gap-4 md:grid-cols-2">
					{deploymentModels.map((model) => (
						<div
							key={model.key}
							className="rounded-lg border border-border bg-card p-6"
						>
							<h3 className="text-lg font-semibold text-foreground">
								{model.name}
							</h3>
							<p className="mt-1 font-mono text-xs text-subtle-foreground">
								{model.operator}
							</p>
							<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
								{model.summary}
							</p>
							<Link
								href={model.href}
								className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
							>
								Details
								<ArrowRight className="h-4 w-4" aria-hidden="true" />
							</Link>
						</div>
					))}
				</div>
			</Section>

			<Section labelledBy="discord" className="border-t border-border/60">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
					<SectionHeader
						id="discord"
						eyebrow="Discord, precisely"
						title="Where the bots and the console meet"
						description="Two surfaces, two responsibilities. Keeping them apart is what makes the platform predictable."
					/>
					<div className="grid gap-4">
						<div className="rounded-md border border-border bg-subtle p-5">
							<p className="font-mono text-xs uppercase tracking-[0.06em] text-muted-foreground">
								In Discord
							</p>
							<Checklist
								items={[
									"Command catalogue and per-guild configuration",
									"Welcome, levels, polls and moderation",
									"AutoMod rules and enforcement",
									"Voice presence and session leases",
								]}
							/>
						</div>
						<div className="rounded-md border border-primary/40 bg-primary/5 p-5">
							<p className="font-mono text-xs uppercase tracking-[0.06em] text-primary">
								In the console
							</p>
							<Checklist
								items={[
									"The servers and services the collection runs on",
									"Deployments, rollbacks and domains",
									"Databases, backups and restores",
									"Roles, API keys, audit log and notifications",
								]}
							/>
						</div>
					</div>
				</div>
			</Section>

			<FaqSection
				id="faq"
				eyebrow="Questions"
				title="What the console does, and does not do"
				description="The boundary between Discord and the platform, stated plainly."
				items={managerFaqs}
			/>

			<CtaBand
				title="Open the console, or run your own"
				description="The hosted console and a self-hosted install are the same product, with different operators."
			>
				<Button className="rounded-full" asChild>
					<Link href={cta.console.href} target="_blank" rel="noreferrer">
						{cta.console.label}
						<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
					</Link>
				</Button>
				<Button variant="secondary" className="rounded-full" asChild>
					<Link href={links.docs.home} target="_blank" rel="noreferrer">
						Documentation
					</Link>
				</Button>
			</CtaBand>
		</>
	);
}
