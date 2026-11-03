import { PageHero } from "@/components/pages/PageHero";
import {
	Callout,
	Checklist,
	CtaBand,
	DefinitionList,
	Section,
	SectionHeader,
} from "@/components/Section";
import { Button } from "@/components/ui/button";
import { links } from "@/lib/content/links";
import { repositoryLayout } from "@/lib/content/resources";
import { site } from "@/lib/content/site";
import { pageMetadata } from "@/lib/metadata";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata = pageMetadata({
	title: "Open source",
	description:
		"Astron Collection is MIT licensed: the bots, the framework, the console, the API and the tooling are public and self-hostable.",
	path: "/resources/open-source",
});

export default function OpenSourcePage() {
	return (
		<>
			<PageHero
				badge="Open source"
				facts={[
					{ value: "MIT", label: "Licence" },
					{ value: "5", label: "Discord distributions" },
					{ value: "5", label: "Shared packages" },
					{ value: "1", label: "Repository" },
				]}
				eyebrow="Resources / Open source"
				title={
					<>
						MIT, end to end{" "}
					</>
				}
				description="The bots, the shared framework, the console, the API and the developer tooling live in one public repository. Self-hosting is not a trial edition of a paid product."
				actions={
					<>
						<Button size="lg" className="rounded-full" asChild>
							<Link href={links.github.repo} target="_blank" rel="noreferrer">
								View the repository
								<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
							</Link>
						</Button>
						<Button size="lg" variant="secondary" className="rounded-full" asChild>
							<Link href={links.github.license} target="_blank" rel="noreferrer">
								Read the licence
							</Link>
						</Button>
					</>
				}
				meta={
					<p className="font-mono text-xs text-subtle-foreground">
						{site.license} · maintained by {site.company}
					</p>
				}
			/>

			<Section labelledBy="what">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
					<SectionHeader
						id="what"
						eyebrow="What is public"
						title="Everything needed to run it"
						description="A repository that publishes the marketing site but not the runtime is not open source in any useful sense."
					/>
					<div>
						<Checklist
							items={[
								"The five Discord distributions and their command catalogues",
								"The shared framework with its tests",
								"The console, the API and the background services",
								"The status page and the status engine",
								"The MCP server, the OpenAPI document and the CLI documentation",
								"The Docker images, Compose stacks and Makefile targets",
							]}
						/>
						<div className="mt-6">
							<Callout title="Some components may carry their own terms">
							The root project is MIT. Separately published packages or included
							components may have their own licence file — check it before
							redistributing one of them.
							</Callout>
						</div>
					</div>
				</div>
			</Section>

			<Section labelledBy="layout" className="border-t border-border/60">
				<SectionHeader
					id="layout"
					eyebrow="Layout"
					title="How the repository is organised"
					description="A pnpm monorepo with one lockfile. The website and the documentation are their own workspace under web/."
				/>
				<div className="mt-10">
					<DefinitionList
						mono
						items={repositoryLayout.map((entry) => ({
							term: entry.path,
							description: entry.role,
						}))}
					/>
				</div>
			</Section>

			<Section labelledBy="extend" className="border-t border-border/60">
				<div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
					<div>
						<SectionHeader
							id="extend"
							eyebrow="Extend"
							title="Add a command without forking a bot"
							description="Command files are loaded dynamically from the distribution's own commands/ directory. A new command is a file, not a patch to a runner."
						/>
						<p className="mt-6 text-base leading-relaxed text-muted-foreground">
							Business logic belongs in <code className="font-mono text-xs">services/</code>;
							a service must not import the Discord client. The framework supplies
							the contract, routing, permissions and error handling around it.
						</p>
					</div>
					<div>
						<SectionHeader
							id="reuse"
							eyebrow="Rules"
							title="What the project asks of contributions"
						/>
						<div className="mt-6">
							<Checklist
								items={[
									"Conventional Commits for pull request titles",
									"A changeset for every user-facing change",
									"Tests for framework changes, not just for commands",
									"Never commit tokens, credentials or secrets",
									"A bot never imports another bot's commands or events",
								]}
							/>
						</div>
					</div>
				</div>
			</Section>

			<CtaBand
				title="Read the code before you trust the page"
				description="That is the point of publishing it. The repository is the reference for anything stated here."
			>
				<Button className="rounded-full" asChild>
					<Link href={links.github.repo} target="_blank" rel="noreferrer">
						GitHub repository
						<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
					</Link>
				</Button>
				<Button variant="secondary" className="rounded-full" asChild>
					<Link href="/resources/community">How to contribute</Link>
				</Button>
			</CtaBand>
		</>
	);
}
