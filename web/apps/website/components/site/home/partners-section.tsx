import { Link } from "@company/react";
import { Container } from "@/components/Container";
import { partnershipsSection } from "@/lib/content/ecosystem";
import { SectionIntro } from "./SectionIntro";
import { SocketMark } from "./marks";

/**
 * 06 — Partners and ecosystem. Every relationship category is a card with its
 * published state beside it, so an empty category is visible as empty rather
 * than implied by the layout. No partner is claimed without a confirmed record,
 * and no state is filled because none has been confirmed.
 */
export function PartnersSection() {
	return (
		<section
			aria-labelledby="partners-title"
			className="border-y border-border bg-muted py-24 sm:py-32"
		>
			<Container>
				<SectionIntro
					id="partners-title"
					title={partnershipsSection.title}
					description={partnershipsSection.description}
					align="center"
				/>

				<p className="mx-auto mt-6 max-w-2xl rounded-2xl border border-border bg-background px-6 py-4 text-center text-sm leading-6 text-muted-foreground">
					{partnershipsSection.emptyState}
				</p>

				<ul
					data-reveal
					className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2"
				>
					{partnershipsSection.links.map((item) => (
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

				<dl
					data-reveal
					className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
				>
					{partnershipsSection.relationshipTypes.map((type) => (
						<div
							key={type.title}
							className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-6"
						>
							<dt className="font-display text-lg font-medium text-foreground">
								{type.title}
							</dt>
							<dd className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
								<SocketMark />
								{type.state}
							</dd>
							<dd className="mt-3 text-sm leading-6 text-muted-foreground">
								{type.description}
							</dd>
						</div>
					))}
				</dl>

				<p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-muted-foreground">
					{partnershipsSection.stateLegend}
				</p>
			</Container>
		</section>
	);
}
