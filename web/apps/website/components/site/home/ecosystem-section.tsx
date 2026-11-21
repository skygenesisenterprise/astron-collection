import { Container } from "@/components/Container";
import {
	ecosystemSection,
	ecosystemStages,
	getHomeBot,
	getPublishedCapabilities,
} from "@/lib/content/home-collection";
import { SectionIntro } from "./SectionIntro";

/**
 * 04 — One server, six surfaces. A dark editorial ledger instead of six equal
 * cards: the statement stays in a sticky column while each stage occupies one
 * row, with its bot and the published capability labels. No second taxonomy and
 * no implied data flow.
 */
export function EcosystemSection() {
	return (
		<section
			id="surfaces"
			aria-labelledby="surfaces-title"
			className="relative scroll-mt-24 overflow-hidden bg-ink py-24 text-ink-foreground sm:py-32"
		>
			<div
				className="signal-dots absolute inset-0 opacity-15"
				aria-hidden="true"
			/>
			<Container className="relative">
				<div className="grid gap-12 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] lg:gap-20">
					<div className="lg:sticky lg:top-24 lg:self-start">
						<SectionIntro
							id="surfaces-title"
							index={ecosystemSection.index}
							eyebrow={ecosystemSection.eyebrow}
							title={ecosystemSection.title}
							description={ecosystemSection.description}
							tone="inverse"
						/>
						<p className="mt-6 max-w-md text-sm leading-6 text-white/50">
							{ecosystemSection.note}
						</p>
					</div>

					<ol className="border-t border-white/10">
						{ecosystemStages.map((stage, index) => {
							const bot = getHomeBot(stage.botId);
							const capabilities = getPublishedCapabilities(
								stage.botId,
								stage.capabilityIds,
							);

							return (
								<li
									key={stage.id}
									className="grid gap-4 border-b border-white/10 py-6 sm:grid-cols-[minmax(0,0.4fr)_minmax(0,0.6fr)] sm:gap-8"
								>
									<div className="min-w-0">
										<div className="flex items-baseline gap-3">
											<span className="font-mono text-[11px] tabular-nums text-white/40">
												{String(index + 1).padStart(2, "0")}
											</span>
											<span className="font-mono text-[11px] text-white/45">
												{stage.label}
											</span>
										</div>
										<h3 className="mt-2 font-display text-2xl font-medium tracking-tight text-white">
											{bot.label}
										</h3>
									</div>

									<div className="min-w-0">
										<p className="text-sm leading-6 text-white/70">
											{stage.detail}
										</p>
										<p className="mt-2 font-mono text-[11px] leading-5 text-white/40">
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
