import { Link } from "@astron-collection/react";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/Container";
import { collectionSection, homeBots } from "@/lib/content/home-collection";
import { SocketMark } from "./marks";

/**
 * 01 — The collection. The post-hero opening states the proposition once,
 * then lays the six bots out as an index rail. It is deliberately not another
 * card grid: the rail is a table of contents for the selector below.
 */
export function CollectionSection() {
	return (
		<section
			id="collection"
			aria-labelledby="collection-title"
			className="scroll-mt-24 bg-background pb-16 pt-20 sm:pb-24 sm:pt-28"
		>
			<Container>
				<div className="grid gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.75fr)] lg:gap-20">
					<div data-reveal className="min-w-0">
						<p className="flex items-center gap-2.5 text-sm text-muted-foreground">
							<SocketMark />
							<span className="font-mono text-xs tabular-nums text-foreground">
								{collectionSection.index}
							</span>
							<span>{collectionSection.eyebrow}</span>
						</p>
						<h2
							id="collection-title"
							className="mt-5 max-w-2xl font-display text-5xl font-medium leading-[1.02] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
						>
							{collectionSection.title}
							<br />
							<span className="text-primary">{collectionSection.highlight}</span>
						</h2>
					</div>

					<div data-reveal className="min-w-0 lg:pt-16">
						<p className="max-w-lg text-lg leading-8 text-foreground">
							{collectionSection.description}
						</p>
						<p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground">
							{collectionSection.body}
						</p>

						<div className="mt-8 flex flex-wrap items-center gap-3">
							<Link
								href={collectionSection.primary.href}
								variant="plain"
								target={
									collectionSection.primary.external ? "_blank" : undefined
								}
								rel={
									collectionSection.primary.external
										? "noreferrer"
										: undefined
								}
								className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground no-underline transition-colors duration-150 hover:bg-primary/90"
							>
								{collectionSection.primary.label}
								{collectionSection.primary.external ? (
									<ArrowUpRight
										className="size-4"
										aria-hidden="true"
									/>
								) : (
									<ArrowRight
										className="size-4"
										aria-hidden="true"
									/>
								)}
								{collectionSection.primary.external ? (
									<span className="sr-only"> (opens in a new tab)</span>
								) : null}
							</Link>
							<Link
								href={collectionSection.secondary.href}
								variant="plain"
								target={
									collectionSection.secondary.external ? "_blank" : undefined
								}
								rel={
									collectionSection.secondary.external
										? "noreferrer"
										: undefined
								}
								className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-5 text-sm font-medium text-foreground no-underline transition-colors duration-150 hover:bg-muted"
							>
								{collectionSection.secondary.label}
								{collectionSection.secondary.external ? (
									<ArrowUpRight
										className="size-4"
										aria-hidden="true"
									/>
								) : (
									<ArrowRight
										className="size-4"
										aria-hidden="true"
									/>
								)}
								{collectionSection.secondary.external ? (
									<span className="sr-only"> (opens in a new tab)</span>
								) : null}
							</Link>
						</div>

						<p className="mt-6 max-w-lg text-xs leading-5 text-muted-foreground">
							{collectionSection.note}
						</p>
					</div>
				</div>

				<div className="mt-14 border-y border-border">
					<ul className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 lg:grid-cols-6">
						{homeBots.map((bot, index) => (
							<li key={bot.id} className="min-w-0 bg-background px-3 py-5 sm:px-4">
								<div className="flex items-baseline justify-between gap-2">
									<span className="font-mono text-[11px] tabular-nums text-muted-foreground">
										{String(index + 1).padStart(2, "0")}
									</span>
									<SocketMark className="text-muted-foreground" />
								</div>
								<p className="mt-6 font-display text-lg font-medium text-foreground">
									{bot.label}
								</p>
								<p className="mt-1 text-xs leading-5 text-muted-foreground">
									{bot.description}
								</p>
							</li>
						))}
					</ul>
				</div>
			</Container>
		</section>
	);
}
