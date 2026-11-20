import { Link } from "@company/react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/Container";
import {
	getFeaturedProjects,
	productsSection,
	projectState,
} from "@/lib/content/ecosystem";
import { SectionIntro } from "./SectionIntro";
import { SocketMark } from "./marks";

/** Published kind, or the neutral label when a project declares none. */
function kindLabel(kind?: "product" | "component" | "integration") {
	return projectState.kind[kind ?? "product"];
}

/**
 * 04 — Featured projects. One project opens the section on the centre line with
 * its metadata on a quiet rule beneath it and a single pill action; the
 * remaining five sit in one grid of equal cards. Each entry states its domain,
 * its published state and the destination that actually exists for it, so the
 * page never implies an availability it cannot verify. The state is carried by
 * a hollow socket: nothing on this page is verified yet, so nothing is filled.
 */
export function FeaturedProjectsSection() {
	const projects = getFeaturedProjects();
	const [lead, ...rest] = projects;
	if (!lead) return null;

	const leadDestination = lead.product.href ?? lead.category.href;

	return (
		<section
			aria-labelledby="featured-projects-title"
			className="bg-background py-24 sm:py-32"
		>
			<Container>
				<SectionIntro
					id="featured-projects-title"
					title={productsSection.title}
					description={productsSection.description}
					align="center"
				/>

				<article data-reveal className="mx-auto mt-16 max-w-3xl">
					<p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
						<SocketMark />
						<span className="font-mono text-xs tabular-nums">
							{lead.category.number}
						</span>
						<span>{lead.category.name}</span>
					</p>
					<h3 className="mt-4 text-center font-display text-3xl font-medium leading-[1.08] tracking-tight text-foreground sm:text-4xl">
						{lead.product.name}
					</h3>
					<p className="mx-auto mt-4 max-w-xl text-center text-base leading-7 text-muted-foreground">
						{lead.product.description}
					</p>

					<dl className="mx-auto mt-10 flex max-w-xl flex-wrap items-start justify-center gap-x-16 gap-y-4 border-y border-border py-6 text-center">
						<div className="min-w-0">
							<dt className="text-xs text-muted-foreground">Type</dt>
							<dd className="mt-1 text-sm text-foreground">
								{kindLabel(lead.product.kind)}
							</dd>
						</div>
						<div className="min-w-0">
							<dt className="text-xs text-muted-foreground">State</dt>
							<dd className="mt-1 flex items-center justify-center gap-2 text-sm text-foreground">
								<SocketMark />
								{projectState.unverified}
							</dd>
						</div>
						{lead.product.family ? (
							<div className="min-w-0">
								<dt className="text-xs text-muted-foreground">Family</dt>
								<dd className="mt-1 text-sm text-foreground">
									{lead.product.family}
								</dd>
							</div>
						) : null}
					</dl>

					<div className="mt-10 flex justify-center">
						<Link
							href={leadDestination}
							variant="plain"
							className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground no-underline transition-[background-color,transform] duration-150 hover:bg-primary/90 active:scale-[0.98]"
						>
							{lead.product.href ? "View project" : "Open the domain overview"}
							<span className="sr-only">
								: {lead.product.name}, {lead.category.name}
							</span>
							<ArrowRight className="size-4" aria-hidden="true" />
						</Link>
					</div>
				</article>

				<ul
					data-reveal
					className="mx-auto mt-16 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3"
				>
					{rest.map(({ product, category }, index) => (
						<li
							key={product.name}
							className="flex h-full min-w-0 flex-col rounded-2xl border border-border bg-card p-6"
						>
							<div className="flex items-baseline justify-between gap-4">
								<p className="text-xs text-muted-foreground">{category.name}</p>
								<span className="font-mono text-xs tabular-nums text-muted-foreground">
									{String(index + 2).padStart(2, "0")}
								</span>
							</div>
							<h3 className="mt-2 font-display text-lg font-medium text-foreground">
								{product.name}
							</h3>
							<p className="mt-2 text-sm leading-6 text-muted-foreground">
								{product.description}
							</p>
							<div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-6">
								<span className="flex items-center gap-2 text-xs text-muted-foreground">
									<SocketMark />
									{kindLabel(product.kind)} · {projectState.unverified}
								</span>
								<Link
									href={product.href ?? category.href}
									variant="plain"
									className="text-sm font-medium text-primary no-underline hover:underline"
								>
									{product.href ? "Open" : "Open domain"}
									<span className="sr-only">: {product.name}</span>
								</Link>
							</div>
						</li>
					))}
				</ul>

				<p className="mx-auto mt-8 max-w-2xl text-center text-sm leading-6 text-muted-foreground">
					{productsSection.note}
				</p>
			</Container>
		</section>
	);
}
