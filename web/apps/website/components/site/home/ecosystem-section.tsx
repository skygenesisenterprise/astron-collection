import { Link } from "@company/react";
import { Container } from "@/components/Container";
import {
	ecosystemSection,
	getFamilies,
	solutionPatterns,
} from "@/lib/content/ecosystem";
import { SectionIntro } from "./SectionIntro";
import { SocketMark } from "./marks";

/**
 * 03 — Our ecosystem. Families are derived from the catalogue; the combination
 * patterns keep their published relationship label, which is what separates a
 * documented path from a conceptual one. Both groups sit on the centre line as
 * equal cards, and the relationship label carries the socket mark instead of a
 * badge, so the two kinds of path are told apart without a second colour.
 */
export function EcosystemSection() {
	const families = getFamilies();

	return (
		<section
			aria-labelledby="ecosystem-title"
			className="bg-background py-24 sm:py-32"
		>
			<Container>
				<SectionIntro
					id="ecosystem-title"
					title={ecosystemSection.title}
					description={ecosystemSection.description}
					align="center"
				/>

				<dl
					data-reveal
					className="mx-auto mt-16 grid max-w-4xl gap-6 sm:grid-cols-2"
				>
					{families.map((family) => (
						<div
							key={family.name}
							className="rounded-2xl border border-border bg-card p-6"
						>
							<dt className="font-display text-lg font-medium text-foreground">
								{family.name}
							</dt>
							<dd className="mt-2 text-sm leading-6 text-muted-foreground">
								{family.categories
									.map((category) => category.name)
									.join(" · ")}
								<span className="mt-2 block text-xs leading-5 text-muted-foreground">
									{family.projects.join(", ")}
								</span>
							</dd>
						</div>
					))}
				</dl>

				<p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-6 text-muted-foreground">
					{ecosystemSection.note}
				</p>

				<div data-reveal className="mt-16">
					<div className="mx-auto max-w-2xl text-center">
						<h3 className="font-display text-2xl font-medium text-foreground">
							How the initiatives are combined
						</h3>
						<p className="mt-2 text-sm text-muted-foreground">
							Two labels: a documented path, or a conceptual combination
						</p>
					</div>

					<ul className="mx-auto mt-8 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{solutionPatterns.map((pattern) => (
							<li
								key={pattern.id}
								className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-6"
							>
								<h4 className="font-display text-lg font-medium text-foreground">
									{pattern.title}
								</h4>
								<p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
									<SocketMark />
									{pattern.relationship}
								</p>
								<p className="mt-3 text-sm leading-6 text-muted-foreground">
									{pattern.productNames.join(" · ")}
								</p>
								<Link
									href={pattern.href}
									variant="plain"
									className="mt-auto inline-flex w-fit items-center pt-6 text-sm font-medium text-primary no-underline hover:underline"
								>
									Open this path
									<span className="sr-only">: {pattern.title}</span>
								</Link>
							</li>
						))}
					</ul>
				</div>
			</Container>
		</section>
	);
}
