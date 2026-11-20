import { Container } from "@/components/Container";
import { engineeringSection, introduction } from "@/lib/content/ecosystem";
import { SectionIntro } from "./SectionIntro";

/**
 * 05 — Engineering principles. The published principles are the same records
 * the introduction relies on; this section exposes them one by one on a centred
 * column, with the constraint stated once in a quiet callout rather than behind
 * an accent bar. It says plainly that the principles are not a certification.
 */
export function EngineeringPrinciplesSection() {
	const principles = introduction.principles;

	return (
		<section
			aria-labelledby="principles-title"
			className="bg-background py-24 sm:py-32"
		>
			<Container>
				<SectionIntro
					id="principles-title"
					title={engineeringSection.title}
					description={engineeringSection.description}
					align="center"
				/>
				<p className="mx-auto mt-6 max-w-2xl rounded-2xl border border-border bg-muted px-6 py-4 text-center text-sm leading-6 text-muted-foreground">
					{engineeringSection.note}
				</p>

				<div data-reveal className="mx-auto mt-16 max-w-3xl">
					<p className="flex items-baseline justify-between gap-4 pb-3 text-xs text-muted-foreground">
						<span>Principle</span>
						<span className="font-mono tabular-nums">
							{principles.length} {engineeringSection.countLabel}
						</span>
					</p>

					<ol className="divide-y divide-border border-y border-border">
						{principles.map((principle, index) => (
							<li
								key={principle.title}
								className="grid gap-2 py-5 sm:grid-cols-[2.5rem_minmax(0,11rem)_minmax(0,1fr)] sm:gap-6"
							>
								<span className="font-mono text-xs tabular-nums text-muted-foreground">
									{String(index + 1).padStart(2, "0")}
								</span>
								<h3 className="text-base font-medium text-foreground">
									{principle.title}
								</h3>
								<p className="text-sm leading-6 text-muted-foreground">
									{principle.description}
								</p>
							</li>
						))}
					</ol>
				</div>
			</Container>
		</section>
	);
}
