import { Link } from "@astron-collection/react";
import { Container } from "@/components/Container";
import { domainsSection, productCategories } from "@/lib/content/ecosystem";
import { SectionIntro } from "./SectionIntro";
import { SocketMark } from "./marks";

/**
 * 02 — Technology domains. Six official categories as one centred grid of equal
 * cards: the domain, its scope, the real number of projects and their names.
 * The band is the only recessed surface on the page, so the cards lift off the
 * muted field instead of needing their own colour. Every count comes from the
 * catalogue records.
 */
export function DomainsSection() {
	return (
		<section
			aria-labelledby="domains-title"
			className="border-y border-border bg-muted py-24 sm:py-32"
		>
			<Container>
				<SectionIntro
					id="domains-title"
					title={domainsSection.title}
					description={domainsSection.description}
					align="center"
				/>
				<p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-6 text-muted-foreground">
					{domainsSection.note}
				</p>

				<ul
					data-reveal
					className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
				>
					{productCategories.map((category) => (
						<li
							key={category.id}
							className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-6"
						>
							<div className="flex items-baseline gap-3">
								<span className="font-mono text-xs tabular-nums text-muted-foreground">
									{category.number}
								</span>
								<h3 className="font-display text-lg font-medium text-foreground">
									{category.name}
								</h3>
							</div>
							<p className="mt-3 text-sm leading-6 text-muted-foreground">
								{category.description}
							</p>

							<p className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
								<SocketMark />
								{category.products.length === 1
									? "1 project"
									: `${category.products.length} projects`}
							</p>
							<ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5">
								{category.products.map((product) => (
									<li key={product.name} className="text-sm text-foreground">
										{product.name}
									</li>
								))}
							</ul>

							<Link
								href={category.href}
								variant="plain"
								className="mt-auto inline-flex w-fit items-center pt-6 text-sm font-medium text-primary no-underline hover:underline"
							>
								Explore domain
								<span className="sr-only">: {category.name}</span>
							</Link>
						</li>
					))}
				</ul>
			</Container>
		</section>
	);
}
