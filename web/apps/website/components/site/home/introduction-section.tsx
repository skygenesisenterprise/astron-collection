import { Link } from "@astron-collection/react";
import { Container } from "@/components/Container";
import { deploymentModels, introduction } from "@/lib/content/ecosystem";
import { SectionIntro } from "./SectionIntro";

/** The three ways the group's software can run, in the same order as
 * `deploymentModels`. Only the headline framing is editorial. */
const runHeadlines = [
	"Run self-hosted",
	"Run hybrid",
	"Run cloud-operated",
] as const;

/**
 * 01 — Institutional introduction. The statement opens on the page's centre
 * line through the same `SectionIntro` geometry as every later section, so the
 * heading and lead share one axis and one type scale. The supporting
 * prose is set in two even columns on that axis, and the three operational
 * models close the section as a row of equal cards on the page grid.
 */
export function IntroductionSection() {
	const [lead, ...supporting] = introduction.paragraphs;

	return (
		<section
			aria-labelledby="introduction-title"
			className="bg-background py-24 sm:py-32"
		>
			<Container>
				<SectionIntro
					id="introduction-title"
					title={introduction.title}
					description={lead}
					align="center"
				/>

				<div
					data-reveal
					className="mx-auto mt-16 grid max-w-3xl gap-x-12 gap-y-6 sm:grid-cols-2"
				>
					{supporting.map((paragraph) => (
						<p
							key={paragraph}
							className="text-sm leading-6 text-muted-foreground"
						>
							{paragraph}
						</p>
					))}
				</div>

				<ul
					data-reveal
					className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2"
				>
					{introduction.links.map((item) => (
						<li key={item.href}>
							<Link
								href={item.href}
								variant="plain"
								className="inline-flex min-h-10 items-center text-sm font-medium text-primary no-underline hover:underline"
							>
								{item.label}
							</Link>
						</li>
					))}
				</ul>

				<div
					data-reveal
					className="mx-auto mt-16 grid max-w-6xl gap-6 md:grid-cols-3"
				>
					{deploymentModels.map((model, index) => (
						<div
							key={model.name}
							className="rounded-2xl border border-border bg-card p-6"
						>
							<p className="font-mono text-xs text-muted-foreground">
								{model.name}
							</p>
							<h3 className="mt-3 font-display text-lg font-medium text-foreground">
								{runHeadlines[index]}
							</h3>
							<p className="mt-3 text-sm leading-6 text-muted-foreground">
								{model.description}
							</p>
						</div>
					))}
				</div>
			</Container>
		</section>
	);
}
