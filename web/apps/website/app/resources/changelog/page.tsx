import { PageHero } from "@/components/pages/PageHero";
import { Callout, CtaBand, Section, SectionHeader } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { links } from "@/lib/content/links";
import { pageMetadata } from "@/lib/metadata";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata = pageMetadata({
	title: "Changelog",
	description:
		"Releases, fixes and breaking changes for Astron Collection. Published from the repository, not maintained twice.",
	path: "/resources/changelog",
});

export default function ChangelogPage() {
	return (
		<>
			<PageHero
				badge="Changelog"
				eyebrow="Resources / Changelog"
				title="Releases, from the source"
				description="Release notes are published with the tags in the repository. This page links to them rather than keeping a second, drifting copy."
				actions={
					<Button size="lg" className="rounded-full" asChild>
						<Link href={links.github.releases} target="_blank" rel="noreferrer">
							Open release notes
							<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
						</Link>
					</Button>
				}
			/>

			<Section labelledBy="how">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
					<SectionHeader
						id="how"
						eyebrow="How releases work"
						title="Tags, images and changesets"
					/>
					<div className="space-y-4">
						<p className="text-base leading-relaxed text-muted-foreground">
							User-facing changes are recorded with a changeset before merge, so
							the release notes describe what changed and why. Container images
							are published per distribution, so a fix in one bot does not
							require redeploying the others.
						</p>
						<Callout title="Breaking changes">
							When a release changes an environment variable, a route or a command
							contract, the note says so explicitly and names the migration step.
						</Callout>
					</div>
				</div>
			</Section>

			<CtaBand
				title="Follow the repository instead of a page"
				description="Watching releases on GitHub gives you the change at the moment it lands, with the diff attached."
			>
				<Button className="rounded-full" asChild>
					<Link href={links.github.releases} target="_blank" rel="noreferrer">
						Releases
						<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
					</Link>
				</Button>
				<Button variant="secondary" className="rounded-full" asChild>
					<Link href="/resources/status">Service status</Link>
				</Button>
			</CtaBand>
		</>
	);
}
