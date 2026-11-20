import { Link } from "@company/react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { homeHero } from "@/lib/content/home";
import { Container } from "../Container";

/**
 * Homepage hero: one saturated brand panel inset into the white stage, a fine
 * dot field, an oversized centred headline and a single pill action. The panel
 * takes four fifths of the first screen below the 64px header and its 8px
 * inset, so it stays the dominant block while the top of the introduction is
 * already in view, and its edges line up with the column rules of the section
 * directly below, which is what gives the page its single continuous stage.
 */
export function SignalHero() {
	return (
		<section className="bg-background">
			<Container className="pt-2">
				<div className="relative overflow-hidden rounded-2xl bg-brand text-brand-foreground">
					<div
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_95%_85%_at_50%_45%,transparent_38%,rgba(0,0,0,0.16))]"
						aria-hidden="true"
					/>
					<div
						className="signal-dots absolute inset-0 opacity-80"
						aria-hidden="true"
					/>
					<div
						className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_75%_100%_at_50%_100%,rgba(255,255,255,0.55),transparent_72%)]"
						aria-hidden="true"
					/>

					<div className="hero-panel relative mx-auto flex max-w-5xl flex-col items-center justify-center px-6 py-20 text-center sm:py-24">
						<h1 className="max-w-5xl font-display text-5xl font-medium leading-[1.02] tracking-tight text-brand-foreground sm:text-6xl lg:text-7xl">
							{homeHero.title}
							<br className="hidden sm:block" />{" "}
							<span className="text-balance">{homeHero.highlight}</span>
						</h1>

						<p className="mt-8 max-w-2xl text-base leading-relaxed text-brand-foreground/95 sm:text-lg">
							{homeHero.description}
						</p>

						<Link
							href={homeHero.primaryCta.href}
							className="mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-brand-foreground px-8 text-base font-medium text-ink no-underline shadow-sm transition-colors hover:bg-brand-foreground/90"
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
