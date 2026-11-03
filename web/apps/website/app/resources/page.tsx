import { PageHero } from "@/components/pages/PageHero";
import { CtaBand, Section } from "@/components/Section";
import { Button } from "@/components/ui/button";
import { resourcePages } from "@/lib/content/resources";
import { links } from "@/lib/content/links";
import { pageMetadata } from "@/lib/metadata";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = pageMetadata({
	title: "Resources",
	description:
		"Community, open source, changelog, service status and contact — the operational pages of the Astron Collection project.",
	path: "/resources",
});

export default function ResourcesPage() {
	return (
		<>
			<PageHero
				badge="Resources"
				eyebrow="Resources"
				title="Where to go next"
				description="Five pages that answer the questions the product pages do not: who is behind the project, where releases are published, what is currently degraded, and how to reach us."
			/>

			<Section labelledBy="pages">
				<h2 id="pages" className="sr-only">
					Resource pages
				</h2>
				<ul className="hairline-grid grid border-l border-t border-border/60 sm:grid-cols-2">
					{resourcePages.map((page) => (
						<li key={page.href} className="bg-background">
							<Link
								href={page.href}
								className="group flex h-full flex-col px-6 py-8 transition-colors hover:bg-card"
							>
								<span className="text-xl font-semibold text-foreground">
									{page.title}
								</span>
								<span className="mt-2 flex-1 text-base leading-relaxed text-muted-foreground">
									{page.description}
								</span>
								<span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
									Open
									<ArrowRight
										className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
										aria-hidden="true"
									/>
								</span>
							</Link>
						</li>
					))}
				</ul>
			</Section>

			<CtaBand
				title="Looking for documentation instead?"
				description="Installation, architecture, the CLI and the API reference live on the documentation site."
			>
				<Button className="rounded-full" asChild>
					<Link href={links.docs.home} target="_blank" rel="noreferrer">
						Documentation
					</Link>
				</Button>
			</CtaBand>
		</>
	);
}
