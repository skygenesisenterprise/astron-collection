import { PageHero } from "@/components/pages/PageHero";
import { EcosystemDiagram } from "@/components/platform/EcosystemDiagram";
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
import { platformFaqs } from "@/lib/content/faq";
import { links } from "@/lib/content/links";
import {
	framework,
	packages,
	services,
} from "@/lib/content/platform";
import { pageMetadata } from "@/lib/metadata";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = pageMetadata({
	title: "Platform",
	description:
		"How the applications, the shared Discord framework, the console, the API and the data layer fit together — and what each component is responsible for.",
	path: "/platform",
});

export default function PlatformPage() {
	return (
		<>
			<PageHero
				badge="Platform"
				facts={[
					{ value: "5", label: "Discord services" },
					{ value: "5", label: "Shared packages" },
					{ value: "4", label: "Layers" },
					{ value: "MIT", label: "Licence" },
				]}
				eyebrow="Platform"
				title={
					<>
						An ecosystem,{" "}
						<span className="text-primary">not a bundle</span>
					</>
				}
				description="The applications are separate deployments, but they are not unrelated software. One framework, one console, one API and one data model hold the collection together."
				actions={
					<>
						<Button size="lg" className="rounded-full" asChild>
							<Link href="/platform/self-hosted">Deployment options</Link>
						</Button>
						<Button size="lg" variant="secondary" className="rounded-full" asChild>
							<Link href="/developers">Developer surfaces</Link>
						</Button>
					</>
				}
			/>

			<Section labelledBy="map">
				<SectionHeader
					id="map"
					eyebrow="The map"
					title="Four layers, one direction"
					description="Discord at the top, the framework beneath it, the platform services beside it, and your data at the bottom. Each layer only talks to the one it needs."
				/>
				<div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
					<Reveal>
						<EcosystemDiagram />
					</Reveal>
					<div className="flex flex-col justify-center gap-6">
						<p className="text-base leading-relaxed text-muted-foreground">
							The framework is the reason the collection behaves consistently:
							every command is authorised the same way, every failure is
							contained the same way, and every log line has the same shape.
						</p>
						<Checklist
							items={[
								"Applications never import each other's commands",
								"Each distribution keeps its own catalogue, data volume and Redis prefix",
								"The console is a client of the API, not a second source of truth",
								"Workers and schedulers run outside the request path",
							]}
						/>
					</div>
				</div>
			</Section>

			<Section labelledBy="framework" className="border-t border-border/60">
				<SectionHeader
					id="framework"
					eyebrow="packages/discord-framework"
					title="What the shared layer guarantees"
					description="It contains no business logic — no command, no guild setting, no domain rule. Only the mechanisms that are dangerous to reimplement per bot."
				/>
				<div className="mt-10">
					<FeatureGrid items={framework} columns={3} />
				</div>
			</Section>

			<Section labelledBy="components" className="border-t border-border/60">
				<SectionHeader
					id="components"
					eyebrow="Components"
					title="Applications and shared packages"
					description="Verified against the workspace layout in the repository."
				/>
				<div className="mt-10 grid gap-10 lg:grid-cols-2 lg:gap-16">
					<div>
						<h3 className="font-mono text-xs uppercase tracking-[0.06em] text-subtle-foreground">
							Deployable services
						</h3>
						<div className="mt-4">
							<DefinitionList
								mono
								items={services.map((service) => ({
									term: `${service.name} (${service.path})`,
									description: service.role,
								}))}
							/>
						</div>
					</div>
					<div>
						<h3 className="font-mono text-xs uppercase tracking-[0.06em] text-subtle-foreground">
							Shared packages
						</h3>
						<div className="mt-4">
							<DefinitionList
								mono
								items={packages.map((entry) => ({
									term: `${entry.name} (${entry.path})`,
									description: entry.role,
								}))}
							/>
						</div>
					</div>
				</div>
			</Section>

			<Section labelledBy="data" className="border-t border-border/60">
				<div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
					<div>
						<SectionHeader
							id="data"
							eyebrow="Data"
							title="Where state lives"
							description="Each store has one owner. Nothing is duplicated between the browser, the API and the bots."
						/>
						<div className="mt-8">
							<DefinitionList
								items={[
									{
										term: "PostgreSQL",
										description:
											"Platform state: projects, services, deployments, users, roles, audit. Owned by the API, which also applies migrations.",
									},
									{
										term: "Redis",
										description:
											"Cache and queues. Optional for the bots, required by the platform stack.",
									},
									{
										term: "Object storage (S3)",
										description:
											"Backup destinations for databases and Docker named volumes. Test the destination before you need it.",
									},
									{
										term: "Bot data volumes",
										description:
											"Per-distribution state — settings, warnings, tickets, XP — in a named volume, with Redis as an optional cache.",
									},
								]}
							/>
						</div>
					</div>
					<div>
						<SectionHeader
							id="api"
							eyebrow="Contracts"
							title="Everything the interface can do, the API can do"
						/>
						<p className="mt-6 text-base leading-relaxed text-muted-foreground">
							The console is built on the API. That is why automation is not a
							second-class path: a deployment started from CI and one started
							from the interface are the same deployment, with the same
							permissions and the same audit entry.
						</p>
						<div className="mt-6">
							<Callout title="One contract, generated clients">
								An OpenAPI document is generated from the API, and the SDK and
								the MCP catalogue derive from that same document. A renamed field
								breaks the build instead of a customer's pipeline.
							</Callout>
						</div>
						<div className="mt-6 flex flex-wrap gap-3">
							<Button variant="secondary" className="rounded-full" asChild>
								<Link href="/developers">
									Developer surfaces
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</Link>
							</Button>
							<Button variant="ghost" className="rounded-full" asChild>
								<Link
									href={links.docs.architecture}
									target="_blank"
									rel="noreferrer"
								>
									Architecture reference
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</Section>

			<Section labelledBy="limits" className="border-t border-border/60">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
					<SectionHeader
						id="limits"
						eyebrow="Limits"
						title="What the platform does not do"
						description="Stated plainly, because a platform page that only lists strengths is not useful for a decision."
					/>
					<Checklist
						items={[
							"No Kubernetes requirement — Docker and Swarm are the supported model",
							"Multi-node distributes workloads; it is not automatic high availability",
							"Bind mounts are not covered by volume backups — only Docker named volumes are",
							"The console does not administer Discord guilds; bot configuration stays in Discord",
							"The hosted assistant cannot reach localhost or a private LAN address without a tunnel",
						]}
					/>
				</div>
			</Section>

			<FaqSection
				id="faq"
				eyebrow="Questions"
				title="Architecture questions people actually ask"
				description="Short answers, with the details linked where they exist."
				items={platformFaqs}
			/>

			<CtaBand
				title="Decide who operates it"
				description="The same platform, two operating models. Both pages state the responsibilities that come with the choice."
			>
				<Button className="rounded-full" asChild>
					<Link href="/platform/self-hosted">Self-hosted</Link>
				</Button>
				<Button variant="secondary" className="rounded-full" asChild>
					<Link href="/platform/cloud">Astron Collection Cloud</Link>
				</Button>
			</CtaBand>
		</>
	);
}