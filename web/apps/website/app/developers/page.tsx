import { CodeBlock } from "@/components/CodeBlock";
import { PageHero } from "@/components/pages/PageHero";
import {
	Callout,
	CtaBand,
	DefinitionList,
	FaqSection,
	Section,
	SectionHeader,
} from "@/components/Section";
import { Button } from "@/components/ui/button";
import { developerFaqs } from "@/lib/content/faq";
import { links } from "@/lib/content/links";
import {
	apiFacts,
	codeSample,
	developerSurfaces,
	mcpCapabilities,
	mcpGuards,
	quickStart,
} from "@/lib/content/developers";
import { pageMetadata } from "@/lib/metadata";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata = pageMetadata({
	title: "Developers",
	description:
		"API, OpenAPI document, CLI, TypeScript SDK, VS Code extension and MCP server: integrate Astron Collection into your repositories, pipelines and assistants.",
	path: "/developers",
});

export default function DevelopersPage() {
	return (
		<>
			<PageHero
				badge="Developers"
				eyebrow="Developers"
				title={
					<>
						The console is a client.{" "}
						<span className="text-primary">So can you be.</span>
					</>
				}
				description="Every management operation is exposed through the API and documented in an OpenAPI document generated from the same contract. The CLI, SDK and MCP server are built on it — not around it."
				actions={
					<>
						<Button size="lg" className="rounded-full" asChild>
							<Link href={links.docs.api} target="_blank" rel="noreferrer">
								API reference
								<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
							</Link>
						</Button>
						<Button size="lg" variant="secondary" className="rounded-full" asChild>
							<Link href={links.openapi} target="_blank" rel="noreferrer">
								openapi.json
							</Link>
						</Button>
					</>
				}
				facts={apiFacts}
			/>

			<Section labelledBy="surfaces">
				<SectionHeader
					id="surfaces"
					eyebrow="Surfaces"
					title="Pick the interface that fits your workflow"
					description="All of them talk to the same API with the same permissions. None of them can do more than your credential allows."
				/>
				<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{developerSurfaces.map((surface) => (
						<article
							key={surface.name}
							className="flex h-full flex-col rounded-lg border border-border bg-card p-6"
						>
							<span className="flex h-8 w-8 items-center justify-center rounded-xs border border-border bg-subtle font-mono text-[0.6875rem] text-primary">
								{surface.mono}
							</span>
							<h3 className="mt-4 text-lg font-semibold text-foreground">
								{surface.name}
							</h3>
							<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
								{surface.description}
							</p>
							<Link
								href={surface.href}
								target="_blank"
								rel="noreferrer"
								className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
							>
								{surface.linkLabel}
								<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
							</Link>
						</article>
					))}
				</div>
			</Section>

			<Section labelledBy="start" className="border-t border-border/60">
				<div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
					<div>
						<SectionHeader
							id="start"
							eyebrow="Quick start"
							title="Verify the target before you change anything"
							description="The first MCP call resolves the instance, the identity and the effective permissions. Everything after it is audited against that identity."
						/>
						<div className="mt-6">
							<Callout title="Credentials inherit their owner">
								An API key holds the permissions of the account that created it.
								Create keys under an account with only the access the automation
								needs, and delete them when they are no longer used.
							</Callout>
						</div>
					</div>
					<div className="space-y-4">
						<CodeBlock code={quickStart} label="shell · MCP client" />
						<CodeBlock code={codeSample} label="shell · HTTP API" />
					</div>
				</div>
			</Section>

			<Section labelledBy="mcp" className="border-t border-border/60">
				<SectionHeader
					id="mcp"
					eyebrow="MCP"
					title="Workflow capabilities, not 724 loose endpoints"
					description="The default catalogue is deliberately small and oriented around real tasks: discover, diagnose, deploy, verify. The generated catalogue is available in an opt-in advanced mode."
				/>
				<div className="mt-10 overflow-x-auto">
					<table className="w-full min-w-[720px] border-collapse text-left text-sm">
						<thead>
							<tr className="border-b border-border">
								<th className="py-3 pr-4 font-mono text-xs uppercase tracking-[0.06em] text-subtle-foreground">
									Tool
								</th>
								<th className="py-3 pr-4 font-mono text-xs uppercase tracking-[0.06em] text-subtle-foreground">
									Category
								</th>
								<th className="py-3 pr-4 font-mono text-xs uppercase tracking-[0.06em] text-subtle-foreground">
									Risk
								</th>
								<th className="py-3 font-mono text-xs uppercase tracking-[0.06em] text-subtle-foreground">
									Purpose
								</th>
							</tr>
						</thead>
						<tbody>
							{mcpCapabilities.map((capability) => (
								<tr
									key={capability.tool}
									className="border-b border-border/60 align-top"
								>
									<td className="py-3 pr-4 font-mono text-[0.8125rem] text-primary">
										{capability.tool}
									</td>
									<td className="py-3 pr-4 text-muted-foreground">
										{capability.category}
									</td>
									<td className="py-3 pr-4">
										<span
											className={
												capability.risk === "read"
													? "text-success"
													: capability.risk === "write"
														? "text-warning"
														: "text-danger"
											}
										>
											{capability.risk}
										</span>
									</td>
									<td className="py-3 text-muted-foreground">
										{capability.purpose}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				<p className="mt-4 text-sm text-muted-foreground">
					Four of the nineteen capabilities are shown with the full catalogue:
					discovery, diagnostics, deployment and operations.{" "}
					<Link
						href={links.docs.mcp}
						target="_blank"
						rel="noreferrer"
						className="text-primary underline-offset-4 hover:underline"
					>
						Read the complete reference
					</Link>
					.
				</p>
			</Section>

			<Section labelledBy="guards" className="border-t border-border/60">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
					<SectionHeader
						id="guards"
						eyebrow="Guard rails"
						title="What stops an assistant from doing damage"
						description="Risk levels and catalogue filters are usability aids. Authorisation happens at execution, on the server."
					/>
					<DefinitionList
						items={mcpGuards.map((guard) => ({
							term: guard.title,
							description: guard.description,
						}))}
					/>
				</div>
			</Section>

			<FaqSection
				id="faq"
				eyebrow="Questions"
				title="Integrating safely"
				description="Authorisation, limits and where the specification lives."
				items={developerFaqs}
			/>

			<CtaBand
				title="Start from the contract"
				description="The OpenAPI document, the MCP catalogue and the CLI reference are generated from the same source, so they never drift apart."
			>
				<Button className="rounded-full" asChild>
					<Link href={links.docs.develop} target="_blank" rel="noreferrer">
						Developer guides
						<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
					</Link>
				</Button>
				<Button variant="secondary" className="rounded-full" asChild>
					<Link href={links.github.repo} target="_blank" rel="noreferrer">
						Source code
					</Link>
				</Button>
			</CtaBand>
		</>
	);
}
