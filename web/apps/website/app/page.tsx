import { AppCard } from "@/components/applications/AppCard";
import { Container } from "@/components/Container";
import { Faq } from "@/components/Faq";
import { HeroPreview } from "@/components/marketing/HeroPreview";
import { EcosystemDiagram } from "@/components/platform/EcosystemDiagram";
import { Reveal } from "@/components/Reveal";
import {
	Callout,
	Checklist,
	CtaBand,
	FeatureGrid,
	Section,
	SectionHeader,
	StatStrip,
} from "@/components/Section";
import { CodeBlock } from "@/components/CodeBlock";
import { Button } from "@/components/ui/button";
import { applications } from "@/lib/content/applications";
import { quickStart } from "@/lib/content/developers";
import {
	capabilities,
	faqs,
	steps,
	trustFacts,
	type CapabilityIcon,
} from "@/lib/content/home";
import { deploymentModels, framework } from "@/lib/content/platform";
import { cta, site } from "@/lib/content/site";
import {
	organisationJsonLd,
	pageMetadata,
	softwareJsonLd,
} from "@/lib/metadata";
import {
	ArrowRight,
	ArrowUpRight,
	Cloud,
	Hash,
	ScrollText,
	Server,
	Settings2,
	Shield,
	ShieldAlert,
	Terminal,
	Users,
	Volume2,
} from "lucide-react";
import Link from "next/link";

export const metadata = pageMetadata({
	title: `${site.name} — ${site.tagline}`,
	description: site.description,
	path: "",
});

const icons: Record<CapabilityIcon, typeof Users> = {
	community: Users,
	moderation: Shield,
	automod: ShieldAlert,
	audit: ScrollText,
	config: Settings2,
	voice: Volume2,
	developers: Terminal,
	deployment: Server,
};

export default function Home() {
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify([
						organisationJsonLd,
						softwareJsonLd({
							name: site.name,
							description: site.description,
							path: "",
						}),
					]),
				}}
			/>

			{/* 1 — Hero: centered claim, two actions, product in context */}
			<section className="relative overflow-hidden border-b border-border">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0"
					style={{
						background:
							"radial-gradient(55% 45% at 50% 0%, oklch(var(--primary) / 0.10), transparent 70%)",
					}}
				/>
				<Container className="relative">
					<div className="flex flex-col items-center py-16 text-center sm:py-24">
						<p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground">
							<span
								aria-hidden="true"
								className="h-1.5 w-1.5 rounded-full bg-primary"
							/>
							Open source · MIT · Self-hosted or Cloud
						</p>

						<h1 className="mt-8 max-w-3xl text-4xl text-foreground sm:text-5xl">
							Everything your Discord community needs.
							<br />
							<span className="text-muted-foreground">
								Nothing you have to host alone.
							</span>
						</h1>

						<p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
							Astron Collection is a suite of focused Discord applications —
							community, logging, protection, voice — sharing one framework and
							one console. Invite one, or run the whole stack on your own
							infrastructure.
						</p>

						<div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
							<Button size="lg" className="rounded-full" asChild>
								<Link href={cta.invite.href}>
									{cta.invite.label}
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</Link>
							</Button>
							<Button size="lg" variant="secondary" className="rounded-full" asChild>
								<Link href={cta.console.href} target="_blank" rel="noreferrer">
									{cta.console.label}
									<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
								</Link>
							</Button>
						</div>

						<div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm">
							<Link
								href="/applications"
								className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
							>
								Compare the five applications
							</Link>
							<Link
								href={cta.docs.href}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
							>
								Documentation
								<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
							</Link>
							<Link
								href={cta.github.href}
								target="_blank"
								rel="noreferrer"
								className="inline-flex items-center gap-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
							>
								Source code
								<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
							</Link>
						</div>

						<div className="mt-12 w-full">
							<Reveal>
								<HeroPreview />
							</Reveal>
						</div>
					</div>
				</Container>
			</section>

			{/* 2 — Trust strip: facts, not logos */}
			<StatStrip facts={trustFacts} />

			{/* 3 — Applications */}
			<Section labelledBy="applications">
				<div className="flex flex-wrap items-end justify-between gap-6">
					<SectionHeader
						id="applications"
						eyebrow="The collection"
						title="One app per job, published status included"
						description="Five are deployable today. Player is in development and Automation is planned — the status on each card is what the code supports, not a roadmap."
					/>
					<Button variant="secondary" className="rounded-full" asChild>
						<Link href="/applications">
							All applications
							<ArrowRight className="h-4 w-4" aria-hidden="true" />
						</Link>
					</Button>
				</div>

				<ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{applications.map((application, index) => (
						<Reveal key={application.slug} delay={index * 0.03}>
							<li className="h-full">
								<AppCard application={application} />
							</li>
						</Reveal>
					))}
				</ul>
			</Section>

			{/* 4 — Capabilities */}
			<Section labelledBy="capabilities" className="border-t border-border bg-muted/30">
				<SectionHeader
					id="capabilities"
					eyebrow="What you get"
					title="The parts of a server that take work"
					description="Every item below is implemented in the shared catalogue or the framework. Links go to the distribution that owns it."
				/>
				<ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{capabilities.map((capability) => {
						const Icon = icons[capability.icon];
						return (
							<li key={capability.title}>
								<Link
									href={capability.href}
									className="group flex h-full flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-border-strong"
								>
									<span className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-muted text-foreground">
										<Icon className="h-4 w-4" aria-hidden="true" />
									</span>
									<h3 className="mt-4 text-base font-semibold text-foreground">
										{capability.title}
									</h3>
									<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
										{capability.description}
									</p>
									<span className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground group-hover:text-foreground">
										{capability.linkLabel}
										<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
									</span>
								</Link>
							</li>
						);
					})}
				</ul>
			</Section>

			{/* 5 — How it works */}
			<Section labelledBy="how">
				<SectionHeader
					id="how"
					eyebrow="How it works"
					title="From invite to running, in three moves"
					description="The bot does its work in Discord. The console exists for everything around it."
				/>
				<ol className="mt-12 grid gap-6 lg:grid-cols-3">
					{steps.map((step, index) => (
						<Reveal key={step.title} delay={index * 0.04}>
							<li className="flex h-full flex-col rounded-lg border border-border bg-card p-6">
								<span className="font-mono text-sm text-muted-foreground">
									0{index + 1}
								</span>
								<h3 className="mt-3 text-lg font-semibold text-foreground">
									{step.title}
								</h3>
								<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
									{step.description}
								</p>
								<Link
									href={step.href}
									className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-muted-foreground"
								>
									{step.linkLabel}
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</Link>
							</li>
						</Reveal>
					))}
				</ol>
			</Section>

			{/* 6 — Manager */}
			<Section labelledBy="manager" className="border-t border-border bg-muted/30">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center lg:gap-16">
					<div>
						<SectionHeader
							id="manager"
							eyebrow="Astron Manager"
							title="One console for everything behind the bots"
							description="Not a statistics dashboard: the interface where servers, applications, databases and access are actually operated — with the same API available to your pipelines."
						/>
						<Checklist
							items={[
								"Servers locally, remotely over SSH, and Swarm clusters",
								"Applications from Git, image or Compose, with history and rollback",
								"Provisioned databases with scheduled backups and S3 destinations",
								"Roles, SSO, API keys and an audit log across the organisation",
							]}
						/>
						<div className="mt-8 flex flex-wrap gap-3">
							<Button className="rounded-full" asChild>
								<Link href="/manager">
									Open the overview
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</Link>
							</Button>
							<Button variant="secondary" className="rounded-full" asChild>
								<Link href={cta.console.href} target="_blank" rel="noreferrer">
									{cta.console.label}
								</Link>
							</Button>
						</div>
					</div>
					<Callout title="Discord and the console">
						Bot behaviour is configured where the bot lives — in Discord, with{" "}
						<code className="font-mono text-xs">/config</code> and the command
						set. The console manages the platform around them: infrastructure,
						deployments, data and access. Discord appears in the console as a
						notification channel, not as a guild administration panel.
					</Callout>
				</div>
			</Section>

			{/* 7 — Platform */}
			<Section labelledBy="platform" className="border-t border-border">
				<SectionHeader
					id="platform"
					eyebrow="Platform"
					title="An ecosystem, not five bots stapled together"
					description="The applications sit on a shared framework; the console and its services sit beside them. Each layer has one responsibility and a public contract."
				/>
				<div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
					<Reveal>
						<EcosystemDiagram />
					</Reveal>
					<div className="flex flex-col justify-center">
						<FeatureGrid items={framework.slice(0, 4)} columns={2} />
						<Link
							href="/platform"
							className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-muted-foreground"
						>
							Read the architecture
							<ArrowRight className="h-4 w-4" aria-hidden="true" />
						</Link>
					</div>
				</div>
			</Section>

			{/* 8 — Editions */}
			<Section labelledBy="deployment" className="border-t border-border bg-muted/30">
				<SectionHeader
					id="deployment"
					eyebrow="Deployment"
					title="Run it yourself, or let SGE run the control plane"
					description="Same product, different operating model. The difference is who owns upgrades, monitoring and the database — not which features exist."
				/>
				<div className="mt-12 grid gap-4 md:grid-cols-2">
					{deploymentModels.map((model) => (
						<Reveal key={model.key}>
							<div className="flex h-full flex-col rounded-lg border border-border bg-card p-6">
								<p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
									{model.operator}
								</p>
								<h3 className="mt-3 text-xl font-semibold text-foreground">
									{model.name}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{model.summary}
								</p>
								<ul className="mt-5 space-y-2">
									{model.points.map((point) => (
										<li
											key={point}
											className="flex gap-2 text-sm text-muted-foreground"
										>
											<span
												aria-hidden="true"
												className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-foreground/50"
											/>
											{point}
										</li>
									))}
								</ul>
								<div className="mt-6 flex-1" />
								<Link
									href={model.href}
									className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-muted-foreground"
								>
									{model.key === "self"
										? "Self-hosted deployment"
										: "Managed platform"}
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</Link>
							</div>
						</Reveal>
					))}
				</div>
			</Section>

			{/* 9 — Developers */}
			<Section labelledBy="developers" className="border-t border-border">
				<div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
					<div>
						<SectionHeader
							id="developers"
							eyebrow="Developers"
							title="Everything the console does, available to automation"
							description="An OpenAPI document generated from the API, a CLI, a typed SDK, and an MCP server that lets an assistant work inside the same permission model."
						/>
						<dl className="mt-8 grid grid-cols-2 gap-4">
							{[
								{ label: "API operations", value: "724" },
								{ label: "MCP capabilities", value: "19" },
								{ label: "OpenAPI", value: "1.0.0" },
								{ label: "Licence", value: "MIT" },
							].map((fact) => (
								<div
									key={fact.label}
									className="rounded-md border border-border bg-card p-4"
								>
									<dt className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
										{fact.label}
									</dt>
									<dd className="mt-1 text-2xl font-semibold text-foreground">
										{fact.value}
									</dd>
								</div>
							))}
						</dl>
						<Link
							href="/developers"
							className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:text-muted-foreground"
						>
							Developer surfaces
							<ArrowRight className="h-4 w-4" aria-hidden="true" />
						</Link>
					</div>
					<div>
						<CodeBlock code={quickStart} label="shell · MCP client" />
					</div>
				</div>
			</Section>

			{/* 10 — FAQ */}
			<Section labelledBy="faq" className="border-t border-border bg-muted/30">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
					<div>
						<SectionHeader
							id="faq"
							eyebrow="Questions"
							title="The things people ask before inviting a bot"
							description="Answered from the repository, including the parts that are not finished."
						/>
						<div className="mt-6 flex items-center gap-2 font-mono text-xs text-muted-foreground">
							<Hash className="h-3.5 w-3.5" aria-hidden="true" />
							Still unsure? Ask in the Discord.
						</div>
					</div>
					<Faq items={faqs} />
				</div>
			</Section>

			{/* 11 — Closing CTA */}
			<CtaBand
				title="Start with one application. Add the rest when you need them."
				description="Every application is deployed on its own, with its own credentials and data volume. Nothing forces you to adopt the whole collection at once."
			>
				<Button className="rounded-full" asChild>
					<Link href="/applications">
						{cta.invite.label}
						<ArrowRight className="h-4 w-4" aria-hidden="true" />
					</Link>
				</Button>
				<Button variant="secondary" className="rounded-full" asChild>
					<Link href="/platform/self-hosted">
						Self-host it
						<Cloud className="h-4 w-4" aria-hidden="true" />
					</Link>
				</Button>
			</CtaBand>
		</>
	);
}
