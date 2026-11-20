import { Link } from "@astron-collection/react";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/Container";
import { homeCta } from "@/lib/content/ecosystem";

/**
 * Closing bookend to the hero: the same saturated brand panel inset into the
 * white stage, the same fine dot field, an oversized centred headline and one
 * pill action. Reusing the hero's panel verbatim — its container edges, its
 * texture, its control shape — is what makes the page open and close on one
 * continuous stage. The closing panel is shorter, keeps a single primary
 * action, and carries the published-state note on the white stage below so the
 * panel itself stays as clean as the hero.
 */
export function BuildSection() {
	return (
		<section
			id="build"
			aria-labelledby="build-heading"
			className="bg-background pb-24 pt-2 sm:pb-32"
		>
			<Container>
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

					<div className="relative mx-auto flex min-h-[60svh] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center">
						<p className="text-sm text-brand-foreground/90">
							{homeCta.eyebrow}
						</p>
						<h2
							id="build-heading"
							className="mt-4 max-w-3xl font-display text-5xl font-medium leading-[1.04] tracking-tight text-brand-foreground sm:text-6xl"
						>
							{homeCta.title}
						</h2>
						<p className="mt-6 max-w-xl text-base leading-relaxed text-brand-foreground/95 sm:text-lg">
							{homeCta.description}
						</p>

						<Link
							href={homeCta.primary.href}
							className="mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-brand-foreground px-7 text-base font-medium text-ink no-underline shadow-sm transition-[background-color,transform] duration-150 hover:bg-brand-foreground/90 active:scale-[0.98]"
						>
							{homeCta.primary.label}
							<ArrowRight className="size-4" aria-hidden="true" />
						</Link>

						<div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
							<Link
								href={homeCta.secondary.href}
								variant="plain"
								className="inline-flex min-h-10 items-center text-sm font-medium text-brand-foreground no-underline underline-offset-4 hover:underline"
							>
								{homeCta.secondary.label}
							</Link>
							<span
								className="h-3 w-px bg-brand-foreground/40"
								aria-hidden="true"
							/>
							<Link
								href={homeCta.tertiary.href}
								variant="plain"
								target="_blank"
								rel="noreferrer"
								className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-brand-foreground no-underline underline-offset-4 hover:underline"
							>
								{homeCta.tertiary.label}
								<ArrowUpRight className="size-4" aria-hidden="true" />
								<span className="sr-only"> (opens in a new tab)</span>
							</Link>
						</div>
					</div>
				</div>

				<p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-6 text-muted-foreground">
					{homeCta.note}
				</p>
			</Container>
		</section>
	);
}
