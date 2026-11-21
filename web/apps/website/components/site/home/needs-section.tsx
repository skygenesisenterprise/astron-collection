import { Link } from "@astron-collection/react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/Container";
import {
	getHomeBot,
	getPublishedCapabilities,
	homeNeeds,
	needsSection,
} from "@/lib/content/home-collection";
import { SectionIntro } from "./SectionIntro";

/**
 * 03 — By need. A ledger of jobs, not a second card grid. Each row resolves its
 * bot through the shared record and prints the capability labels that answer
 * the need, so the index stays tied to the published scope.
 */
export function NeedsSection() {
	return (
		<section
			id="needs"
			aria-labelledby="needs-title"
			className="scroll-mt-24 bg-background py-24 sm:py-32"
		>
			<Container>
				<div className="grid gap-12 lg:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] lg:gap-16">
					<div className="lg:sticky lg:top-24 lg:self-start">
						<SectionIntro
							id="needs-title"
							index={needsSection.index}
							eyebrow={needsSection.eyebrow}
							title={needsSection.title}
							description={needsSection.description}
						/>
						<p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
							{needsSection.note}
						</p>
						<Link
							href="#bots"
							variant="plain"
							className="mt-6 inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-primary no-underline hover:underline"
						>
							Open the bot selector
							<ArrowRight className="size-4" aria-hidden="true" />
						</Link>
					</div>

					<ol className="border-t border-border">
						{homeNeeds.map((need) => {
							const bot = getHomeBot(need.botId);
							const capabilities = getPublishedCapabilities(
								need.botId,
								need.capabilityIds,
							);

							return (
								<li
									key={need.id}
									className="grid gap-5 border-b border-border py-6 sm:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] sm:gap-8"
								>
									<div className="flex min-w-0 gap-4">
										<span className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
											{need.number}
										</span>
										<h3 className="font-display text-xl font-medium leading-snug text-foreground sm:text-2xl">
											{need.title}
										</h3>
									</div>

									<div className="min-w-0">
										<p className="max-w-lg text-sm leading-6 text-muted-foreground">
											{need.description}
										</p>

										<div className="mt-4 flex flex-wrap items-baseline gap-x-2 gap-y-1">
											<span className="font-mono text-[11px] text-muted-foreground">
												Covered by
											</span>
											<Link
												href="#bots"
												variant="plain"
												className="text-sm font-medium text-primary no-underline underline-offset-4 hover:underline"
											>
												{bot.label}
												<span className="sr-only">
													{" "}
													in the six-bot selector
												</span>
											</Link>
										</div>

										<p className="mt-3 font-mono text-[11px] leading-5 text-muted-foreground">
											{capabilities
												.map((capability) => capability.label)
												.join(" · ")}
										</p>
									</div>
								</li>
							);
						})}
					</ol>
				</div>
			</Container>
		</section>
	);
}
