import { Link } from "@company/react";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/Container";
import { newsDestinations, newsSection } from "@/lib/content/ecosystem";
import { SectionIntro } from "./SectionIntro";

/**
 * 08 — News and insights. Editorial destinations only. No announcement is
 * generated to fill the section: the state says there is nothing published here
 * yet, and the destinations that are actually maintained sit in one centred
 * column beneath it. Only the external destination keeps an icon, because
 * leaving the site is the one thing the row cannot say in words.
 */
export function NewsSection() {
	return (
		<section
			aria-labelledby="news-title"
			className="bg-background py-24 sm:py-32"
		>
			<Container>
				<SectionIntro
					id="news-title"
					title={newsSection.title}
					description={newsSection.description}
					align="center"
				/>

				<div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-border bg-muted px-6 py-4 text-center">
					<p className="text-sm font-medium text-foreground">Latest</p>
					<p className="mt-2 text-sm leading-6 text-muted-foreground">
						{newsSection.emptyState}
					</p>
				</div>

				<ul
					data-reveal
					className="mx-auto mt-16 max-w-3xl divide-y divide-border border-y border-border"
				>
					{newsDestinations.map((destination) => (
						<li key={destination.href}>
							<Link
								href={destination.href}
								variant="plain"
								target={destination.external ? "_blank" : undefined}
								rel={destination.external ? "noreferrer" : undefined}
								className="group flex min-w-0 items-start justify-between gap-4 py-5 no-underline"
							>
								<span className="min-w-0">
									<span className="flex items-center gap-1.5 text-sm font-medium text-foreground transition-colors group-hover:text-primary">
										{destination.label}
										{destination.external ? (
											<ArrowUpRight
												className="size-4 shrink-0 text-muted-foreground"
												aria-hidden="true"
											/>
										) : null}
									</span>
									<span className="mt-0.5 block text-sm leading-6 text-muted-foreground">
										{destination.description}
									</span>
								</span>
								{destination.external ? (
									<span className="sr-only"> (opens in a new tab)</span>
								) : null}
							</Link>
						</li>
					))}
				</ul>
			</Container>
		</section>
	);
}
