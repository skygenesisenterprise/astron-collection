import { Link } from "@astron-collection/react";
import { ArrowUpRight, Code } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/Container";
import {
	developerLinks,
	developersSection,
} from "@/lib/content/home-collection";
import { SectionIntro } from "./SectionIntro";

/**
 * 06 — Developers and contributors. The section names only the surfaces that
 * exist: documentation, the public repository, the organisation and Discord.
 * It does not invent an API reference, SDK or support plan for the bots.
 */
export function DevelopersSection() {
	return (
		<section
			id="developers"
			aria-labelledby="developers-title"
			className="scroll-mt-24 border-y border-border bg-muted py-24 sm:py-32"
		>
			<Container>
				<div className="grid gap-12 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] lg:gap-16">
					<div className="lg:sticky lg:top-24 lg:self-start">
						<SectionIntro
							id="developers-title"
							index={developersSection.index}
							eyebrow={developersSection.eyebrow}
							title={developersSection.title}
							description={developersSection.description}
						/>
						<p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
							{developersSection.note}
						</p>
					</div>

					<div className="min-w-0">
						<ul className="border-t border-border">
							{developerLinks.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										variant="plain"
										target="_blank"
										rel="noreferrer"
										className="group flex min-w-0 items-center justify-between gap-4 border-b border-border py-5 no-underline"
									>
										<span className="min-w-0">
											<span className="block text-sm font-medium text-foreground transition-colors group-hover:text-primary">
												{link.label}
											</span>
											<span className="mt-1 block text-sm leading-6 text-muted-foreground">
												{link.description}
											</span>
										</span>
										<ArrowUpRight
											className="size-4 shrink-0 text-muted-foreground"
											aria-hidden="true"
										/>
										<span className="sr-only"> (opens in a new tab)</span>
									</Link>
								</li>
							))}
						</ul>

						<div className="mt-8 grid gap-4 rounded-xl border border-border bg-background p-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
							<span className="flex size-10 items-center justify-center rounded-lg border border-border text-foreground">
								<Code className="size-5" aria-hidden="true" />
							</span>
							<div className="min-w-0">
								<p className="text-sm font-medium text-foreground">
									Public repository
								</p>
								<p className="mt-1 text-sm leading-6 text-muted-foreground">
									Source, issues and release history are the maintained
									record. A public repository is not a support contract.
								</p>
							</div>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}
