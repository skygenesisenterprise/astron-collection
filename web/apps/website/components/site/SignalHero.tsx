import { Link } from "@astron-collection/react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "../Container";
import { homeHero } from "@/lib/content/home";

/**
 * Homepage hero: one saturated brand panel inset into the white stage, a fine
 * dot field, an oversized centred headline and a single pill action. The panel
 * edges line up with the column rules of the section directly below, which is
 * what gives the page its single continuous stage.
 */
export function SignalHero() {
	return (
		<section className="bg-background">
			<Container className="pt-1.5 sm:pt-2">
				<div className="relative overflow-hidden rounded-2xl bg-brand text-brand-foreground">
					<div
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_95%_85%_at_50%_45%,transparent_38%,rgba(0,0,0,0.16))]"
						aria-hidden="true"
					/>
					<div className="signal-dots absolute inset-0 opacity-80" aria-hidden="true" />
					<div
						className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_75%_100%_at_50%_100%,rgba(255,255,255,0.55),transparent_72%)]"
						aria-hidden="true"
					/>

					<div className="relative mx-auto flex min-h-[calc(85svh_-_5.25rem)] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center sm:min-h-[calc(85svh_-_5.625rem)] lg:min-h-[calc(85svh_-_6rem)]">
						<h1 className="max-w-5xl font-display text-5xl font-medium leading-[1.04] tracking-tight text-brand-foreground sm:text-6xl lg:text-7xl">
							{homeHero.title}
							<br className="hidden sm:block" />{" "}
							<span className="text-balance">{homeHero.highlight}</span>
						</h1>

						<p className="mt-6 max-w-xl text-base leading-relaxed text-brand-foreground/95 sm:text-lg">
							{homeHero.description}
						</p>

						<Link
							href={homeHero.primaryCta.href}
							className="mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-brand-foreground px-7 text-base font-medium text-ink no-underline shadow-sm transition-colors hover:bg-brand-foreground/90"
						>
							{homeHero.primaryCta.label}
							<ArrowRight className="size-4" aria-hidden="true" />
						</Link>
					</div>
				</div>
			</Container>
		</section>
	);
}