import { Link } from "@astron-collection/react";
import { ArrowRight, ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/Container";
import { homeCta } from "@/lib/content/home-collection";

/**
 * 08 — Closing panel. The hero's saturated surface and dot field return with a
 * different composition: the statement on the left and one clear install route
 * above three quieter ones on the right. The vertical hierarchy replaces the
 * previous four equal tiles.
 */
export function BuildSection() {
	return (
		<section
			id="start"
			aria-labelledby="start-heading"
			className="scroll-mt-24 bg-background pb-24 pt-4 sm:pb-32"
		>
			<Container>
				<div className="relative overflow-hidden rounded-2xl bg-brand text-brand-foreground">
					<div
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_95%_85%_at_50%_45%,transparent_38%,rgba(0,0,0,0.18))]"
						aria-hidden="true"
					/>
					<div
						className="signal-dots absolute inset-0 opacity-80"
						aria-hidden="true"
					/>
					<div
						className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_75%_100%_at_50%_100%,rgba(255,255,255,0.45),transparent_72%)]"
						aria-hidden="true"
					/>

					<div className="relative grid gap-12 px-6 py-14 sm:px-10 sm:py-16 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,0.45fr)] lg:items-center lg:gap-16 lg:px-12 lg:py-20">
						<div className="min-w-0">
							<p className="text-sm text-brand-foreground/85">
								<span className="font-mono text-xs tabular-nums">
									{homeCta.index}
								</span>{" "}
								· {homeCta.eyebrow}
							</p>
							<h2
								id="start-heading"
								className="mt-4 max-w-xl font-display text-4xl font-medium leading-[1.04] tracking-tight text-brand-foreground sm:text-5xl"
							>
								{homeCta.title}
							</h2>
							<p className="mt-5 max-w-lg text-base leading-7 text-brand-foreground/90">
								{homeCta.description}
							</p>
						</div>

						<ul
							data-reveal
							className="overflow-hidden rounded-xl border border-brand-foreground/20 bg-brand/70"
						>
							{homeCta.pathways.map((pathway, index) => {
								const primary = index === 0;
								return (
									<li key={pathway.label} className="min-w-0">
										<Link
											href={pathway.href}
											variant="plain"
											target={pathway.external ? "_blank" : undefined}
											rel={pathway.external ? "noreferrer" : undefined}
											className={
												primary
													? "group flex min-h-36 flex-col justify-between gap-8 bg-brand-foreground p-6 text-ink no-underline transition-colors duration-150 hover:bg-brand-foreground/90"
													: "group flex min-w-0 items-center justify-between gap-4 border-t border-brand-foreground/20 px-5 py-4 text-brand-foreground no-underline transition-colors duration-150 hover:bg-brand/60"
											}
										>
											{primary ? (
												<>																	<span className="flex items-start justify-between gap-4">
																		<span className="text-base font-medium">
																			{pathway.label}
																		</span>
																		{pathway.external ? (
																			<ArrowUpRight
																				className="size-4 shrink-0 opacity-70"
																				aria-hidden="true"
																			/>
																		) : (
																			<ArrowRight
																				className="size-4 shrink-0 opacity-70 transition-transform duration-150 group-hover:translate-x-0.5"
																				aria-hidden="true"
																			/>
																		)}
																		{pathway.external ? (
																			<span className="sr-only">
																				{" "}
																				(opens in a new tab)
																			</span>
																		) : null}
																	</span>
													<span className="text-sm leading-5 text-ink/70">
														{pathway.description}
													</span>
												</>
											) : (
												<>
													<span className="min-w-0">
														<span className="block text-sm font-medium">
															{pathway.label}
														</span>
														<span className="mt-0.5 block text-xs leading-5 text-brand-foreground/70">
															{pathway.description}
														</span>
													</span>
													{pathway.external ? (
														<ArrowUpRight
															className="size-4 shrink-0 opacity-70"
															aria-hidden="true"
														/>
													) : (
														<ArrowRight
															className="size-4 shrink-0 opacity-70 transition-transform duration-150 group-hover:translate-x-0.5"
															aria-hidden="true"
														/>
													)}
													{pathway.external ? (
														<span className="sr-only">
															{" "}
															(opens in a new tab)
														</span>
													) : null}
												</>
											)}
										</Link>
									</li>
								);
							})}
						</ul>
					</div>
				</div>

				<p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-6 text-muted-foreground">
					{homeCta.note}
				</p>
			</Container>
		</section>
	);
}
