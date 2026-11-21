import { Link } from "@astron-collection/react";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { homeHero } from "@/lib/content/home";
import { homeBots } from "@/lib/content/home-collection";
import { Container } from "../Container";

/**
 * Homepage hero: one saturated brand panel inset into the page, a fine dot
 * field, an oversized centred statement and one primary install route. The six
 * bot names form a quiet index along the bottom edge, so the collection is
 * visible before the first scroll and the panel hands directly into the
 * selector below.
 */
export function SignalHero() {
	return (
		<section className="bg-background">
			<Container className="pt-2">
				<div className="relative overflow-hidden rounded-2xl bg-brand text-brand-foreground">
					<div className="relative mx-auto flex min-h-[calc(85svh_-_5.25rem)] max-w-5xl flex-col px-6 pb-6 pt-16 sm:min-h-[calc(85svh_-_5.625rem)] lg:min-h-[calc(85svh_-_6rem)]">
						<div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
							<p className="mb-6 flex items-center gap-2 text-sm text-brand-foreground/80">
								<span
									className="size-1.5 shrink-0 bg-current"
									aria-hidden="true"
								/>
								{homeHero.eyebrow}
							</p>

							<h1 className="max-w-5xl font-display text-5xl font-medium leading-[1.04] tracking-tight text-brand-foreground sm:text-6xl lg:text-7xl">
								{homeHero.title}
								<br className="hidden sm:block" />{" "}
								<span className="text-balance">{homeHero.highlight}</span>
							</h1>

							<p className="mt-6 max-w-xl text-base leading-relaxed text-brand-foreground/95 sm:text-lg">
								{homeHero.description}
							</p>

							<div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
								<Link
									href={homeHero.primaryCta.href}
									className="inline-flex h-12 items-center gap-2 rounded-lg bg-brand-foreground px-7 text-base font-medium text-ink no-underline shadow-sm transition-colors hover:bg-brand-foreground/90"
								>
									{homeHero.primaryCta.label}
									<ArrowRight className="size-4" aria-hidden="true" />
								</Link>

								<Link
									href={homeHero.secondaryCta.href}
									target={homeHero.secondaryCta.external ? "_blank" : undefined}
									rel={
										homeHero.secondaryCta.external ? "noreferrer" : undefined
									}
									className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-foreground/90 no-underline underline-offset-4 transition-colors hover:text-brand-foreground hover:underline"
								>
									{homeHero.secondaryCta.label}
									{homeHero.secondaryCta.external ? (
										<ArrowUpRight className="size-4" aria-hidden="true" />
									) : (
										<ArrowRight className="size-4" aria-hidden="true" />
									)}
									{homeHero.secondaryCta.external ? (
										<span className="sr-only"> (opens in a new tab)</span>
									) : null}
								</Link>
							</div>
						</div>

						<div className="w-full border-t border-brand-foreground/20 pt-5">
							<ul className="grid grid-cols-3 gap-x-4 gap-y-4 sm:grid-cols-6">
								{homeBots.map((bot, index) => (
									<li key={bot.id} className="min-w-0 text-center sm:text-left">
										<span className="font-mono text-xs tabular-nums text-brand-foreground/50">
											{String(index + 1).padStart(2, "0")}
										</span>
										<span className="mt-1 block truncate text-sm font-medium text-brand-foreground">
											{bot.label}
										</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}
