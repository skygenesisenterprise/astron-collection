import { Link } from "@astron-collection/react";
import { ArrowUpRight, SquaresFour } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/Container";
import {
	dashboardSection,
	homeBots,
	homeDestinations,
} from "@/lib/content/home-collection";
import { SectionIntro } from "./SectionIntro";
import { SocketMark } from "./marks";

/**
 * 05 — Central management. The dashboard is a separate authenticated service;
 * the panel below is an editorial schematic of the boundary, never a fabricated
 * console screenshot. The only interactive element is the real dashboard link.
 */
export function DashboardSection() {
	return (
		<section
			id="dashboard"
			aria-labelledby="dashboard-title"
			className="scroll-mt-24 bg-background py-24 sm:py-32"
		>
			<Container>
				<div className="grid gap-12 lg:grid-cols-[minmax(0,0.44fr)_minmax(0,0.56fr)] lg:items-center lg:gap-16">
					<div className="min-w-0">
						<SectionIntro
							id="dashboard-title"
							index={dashboardSection.index}
							eyebrow={dashboardSection.eyebrow}
							title={dashboardSection.title}
							description={dashboardSection.description}
						/>

						<ul className="mt-8 space-y-4 border-t border-border pt-6">
							{dashboardSection.points.map((point) => (
								<li key={point.title} className="flex gap-3">
									<SocketMark live className="mt-1.5 text-primary" />
									<div className="min-w-0">
										<h3 className="text-sm font-medium text-foreground">
											{point.title}
										</h3>
										<p className="mt-1 text-sm leading-6 text-muted-foreground">
											{point.body}
										</p>
									</div>
								</li>
							))}
						</ul>

						<Link
							href={dashboardSection.cta.href}
							variant="plain"
							target="_blank"
							rel="noreferrer"
							className="mt-8 inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground no-underline transition-colors duration-150 hover:bg-primary/90"
						>
							{dashboardSection.cta.label}
							<ArrowUpRight className="size-4" aria-hidden="true" />
							<span className="sr-only"> (opens in a new tab)</span>
						</Link>

						<p className="mt-4 max-w-md text-xs leading-5 text-muted-foreground">
							{dashboardSection.note}
						</p>
					</div>

					<div className="min-w-0">
						<div className="overflow-hidden rounded-2xl border border-white/10 bg-ink text-ink-foreground shadow-2xl">
							<div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 font-mono text-[11px] text-white/45">
								<span className="flex gap-1.5" aria-hidden="true">
									<span className="size-1.5 rounded-full bg-white/25" />
									<span className="size-1.5 rounded-full bg-white/25" />
									<span className="size-1.5 rounded-full bg-white/25" />
								</span>
								<span className="ml-2 truncate">
									dash.astron-collection.com
								</span>
								<span className="ml-auto hidden sm:inline">account access</span>
							</div>

							<div className="relative p-5 sm:p-7">
								<div
									className="signal-dots absolute inset-0 opacity-20"
									aria-hidden="true"
								/>
								<div className="relative">
									<div className="flex items-center justify-between gap-4">
										<span className="font-mono text-[11px] text-white/45">
											signed-in surface
										</span>
										<SquaresFour
											className="size-4 text-white/40"
											aria-hidden="true"
										/>
									</div>

									<p className="mt-10 font-display text-4xl font-medium leading-[1.04] tracking-tight text-white">
										One collection
										<br />
										One place to sign in
									</p>
									<p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
										Authentication and account access are handled by the
										dashboard service.
									</p>

									<Link
										href={homeDestinations.dashboard}
										variant="plain"
										target="_blank"
										rel="noreferrer"
										className="mt-7 flex h-11 items-center justify-between rounded-lg border border-white/15 bg-white/[0.04] px-4 text-sm text-white no-underline transition-colors duration-150 hover:bg-white/[0.08]"
									>
										<span>Open the dashboard</span>
										<ArrowUpRight className="size-4" aria-hidden="true" />
										<span className="sr-only"> (opens in a new tab)</span>
									</Link>

									<p className="mt-8 font-mono text-[11px] leading-6 text-white/40">
										{homeBots.map((bot) => bot.label).join(" · ")}
									</p>
								</div>
							</div>

							<p className="border-t border-white/10 px-4 py-3 font-mono text-[11px] text-white/40">
								Schematic — not a screenshot of the dashboard
							</p>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}
