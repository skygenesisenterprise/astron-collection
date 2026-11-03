import { PageHero } from "@/components/pages/PageHero";
import { Callout, CtaBand, Section, SectionHeader } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { links } from "@/lib/content/links";
import {
	communityChannels,
	contributionPaths,
} from "@/lib/content/resources";
import { pageMetadata } from "@/lib/metadata";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata = pageMetadata({
	title: "Community",
	description:
		"Join the Astron Collection Discord, open a discussion or an issue, and contribute through code, documentation or testing.",
	path: "/resources/community",
});

export default function CommunityPage() {
	return (
		<>
			<PageHero
				badge="Community"
				eyebrow="Resources / Community"
				title="Built in the open"
				description="Questions get answered in Discord; decisions that outlive a chat thread belong in Discussions; bugs belong in Issues. Nothing security-related belongs in a public thread."
				actions={
					<Button size="lg" className="rounded-full" asChild>
						<Link href={links.community.discord} target="_blank" rel="noreferrer">
							Join the Discord
							<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
						</Link>
					</Button>
				}
			/>

			<Section labelledBy="channels">
				<SectionHeader
					id="channels"
					eyebrow="Where to talk"
					title="Three channels, three purposes"
					description="Using the right one is the difference between an answer in an hour and a thread nobody finds later."
				/>
				<div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{communityChannels.map((channel) => (
						<article
							key={channel.title}
							className="flex h-full flex-col rounded-lg border border-border bg-card p-6"
						>
							<h3 className="text-lg font-semibold text-foreground">
								{channel.title}
							</h3>
							<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
								{channel.description}
							</p>
							<Link
								href={channel.href}
								target="_blank"
								rel="noreferrer"
								className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
							>
								{channel.label}
								<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
							</Link>
						</article>
					))}
				</div>
			</Section>

			<Section labelledBy="contribute" className="border-t border-border/60">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
					<div>
						<SectionHeader
							id="contribute"
							eyebrow="Contribute"
							title="Not only code"
							description="The project benefits as much from a corrected step in the documentation as from a new command."
						/>
						<div className="mt-6">
							<Callout title="Before your first pull request">
								Read the contribution guide, keep PR titles in Conventional
								Commits format, and add a changeset with{" "}
								<code className="font-mono text-xs">pnpm changeset</code> when the
								change is user-facing.
							</Callout>
						</div>
					</div>
					<ul className="grid gap-4 sm:grid-cols-2">
						{contributionPaths.map((path) => (
							<li
								key={path.title}
								className="rounded-md border border-border bg-card p-5"
							>
								<h3 className="text-base font-semibold text-foreground">
									{path.title}
								</h3>
								<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
									{path.description}
								</p>
							</li>
						))}
					</ul>
				</div>
			</Section>

			<Section labelledBy="conduct" className="border-t border-border/60">
				<div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
					<div>
						<SectionHeader
							id="conduct"
							eyebrow="Conduct"
							title="A code of conduct, not a suggestion"
							description="The repository ships a Code of Conduct. It applies to issues, discussions and Discord alike."
						/>
					</div>
					<div className="space-y-4">
						<Callout title="Security" tone="warning">
							Never report a vulnerability in a public issue. Write to{" "}
							<a
								href={`mailto:${links.email.security}`}
								className="underline underline-offset-4"
							>
								{links.email.security}
							</a>{" "}
							with reproduction steps.
						</Callout>
						<Callout title="Governance">
							Ownership, review expectations and the release process are described
							in the repository's governance and contribution documents.
						</Callout>
					</div>
				</div>
			</Section>

			<CtaBand
				title="Read the contribution guide"
				description="Setup, conventions and review expectations, in the repository where they are maintained."
			>
				<Button className="rounded-full" asChild>
					<Link href={links.github.contributing} target="_blank" rel="noreferrer">
						Contribution guide
						<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
					</Link>
				</Button>
				<Button variant="secondary" className="rounded-full" asChild>
					<Link href={links.github.discussions} target="_blank" rel="noreferrer">
						Discussions
					</Link>
				</Button>
			</CtaBand>
		</>
	);
}
