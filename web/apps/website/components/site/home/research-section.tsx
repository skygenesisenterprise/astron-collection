import { Container } from "@/components/Container";
import { researchAreas, researchSection } from "@/lib/content/ecosystem";
import { SectionIntro } from "./SectionIntro";

/**
 * 07 — Research and innovation. Themes are listed as themes. No output is
 * claimed: the section states in one quiet callout that nothing has been
 * published yet, rather than filling the space with fabricated papers or
 * results, and the six areas sit as equal cards on the centre line.
 */
export function ResearchSection() {
	return (
		<section
			aria-labelledby="research-title"
			className="bg-background py-24 sm:py-32"
		>
			<Container>
				<SectionIntro
					id="research-title"
					title={researchSection.title}
					description={researchSection.description}
					align="center"
				/>
				<p className="mx-auto mt-6 max-w-2xl rounded-2xl border border-border bg-muted px-6 py-4 text-center text-sm leading-6 text-muted-foreground">
					{researchSection.note}
				</p>

				<dl
					data-reveal
					className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
				>
					{researchAreas.map((area) => (
						<div
							key={area.title}
							className="h-full min-w-0 rounded-2xl border border-border bg-card p-6"
						>
							<dt className="font-display text-lg font-medium text-foreground">
								{area.title}
							</dt>
							<dd className="mt-2 text-sm leading-6 text-muted-foreground">
								{area.description}
							</dd>
						</div>
					))}
				</dl>
			</Container>
		</section>
	);
}
