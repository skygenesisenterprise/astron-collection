import { Link } from "@astron-collection/react";
import { ArrowUpRight, Plus } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/Container";
import { getBotInstallUrl } from "@/lib/content/bot-install";
import {
	botsSection,
	homeBots,
	homeDestinations,
} from "@/lib/content/home-collection";
import { SectionIntro } from "./SectionIntro";

/**
 * 02 — The six bots. A native radio group drives a single detail panel, so the
 * selector is keyboard navigable and works without JavaScript. Capabilities are
 * read from the navigation records, not copied into a second catalogue. The
 * panel is explicitly an editorial schematic, not a fabricated screenshot.
 */
export function BotsSection() {
	return (
		<section
			id="bots"
			aria-labelledby="bots-title"
			className="scroll-mt-24 border-y border-border bg-muted py-24 sm:py-32"
		>
			<Container>
				<div className="mx-auto max-w-5xl">
					<SectionIntro
						id="bots-title"
						index={botsSection.index}
						eyebrow={botsSection.eyebrow}
						title={botsSection.title}
						description={botsSection.description}
					/>

					<fieldset className="bot-selector mt-12 min-w-0">
						<legend className="sr-only">
							Choose one of the six Astron Collection bots
						</legend>

						<div className="grid gap-0 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)]">
							<ul className="border-t border-border">
								{homeBots.map((bot, index) => {
									const inputId = `home-bot-${bot.id}`;
									return (
										<li
											key={bot.id}
											className="bot-item border-b border-border"
										>
											<input
												id={inputId}
												type="radio"
												name="home-bot"
												defaultChecked={index === 0}
												className="sr-only"
											/>
											<label
												htmlFor={inputId}
												className="bot-trigger flex cursor-pointer items-start gap-4 px-4 py-5 transition-colors duration-150 sm:px-5 lg:px-6"
											>
												<span className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">
													{String(index + 1).padStart(2, "0")}
												</span>
												<span className="min-w-0 flex-1">
													<span className="bot-name block font-display text-xl font-medium text-foreground transition-colors duration-150">
														{bot.label}
													</span>
													<span className="mt-1 block text-xs leading-5 text-muted-foreground">
														{bot.description}
													</span>
												</span>
												<Plus
													className="bot-marker mt-1 size-4 shrink-0 text-muted-foreground transition-[color,transform] duration-200"
													aria-hidden="true"
												/>
											</label>
										</li>
									);
								})}
							</ul>

							<div className="min-w-0">
								{homeBots.map((bot, index) => {
									const installUrl = getBotInstallUrl(bot.id);

									return (
										<div
											key={bot.id}
											id={`home-bot-panel-${bot.id}`}
											className="bot-panel-item h-full"
										>
											<div className="relative h-full overflow-hidden border-t border-border bg-ink p-5 text-ink-foreground sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
												<div>
													<div className="flex items-center justify-between gap-4 font-mono text-xs text-white/45">
														<span>
															bot {String(index + 1).padStart(2, "0")} / 06
														</span>
														<span>published scope</span>
													</div>

													<h3 className="mt-6 font-display text-4xl font-medium leading-none tracking-tight text-white sm:text-5xl">
														{bot.label}
													</h3>
													<p className="mt-3 max-w-lg text-sm leading-6 text-white/70">
														{bot.description}
													</p>

													<p className="mt-7 font-mono text-xs text-white/45">
														Capabilities
													</p>
													<dl className="mt-3 grid gap-px overflow-hidden border border-white/10 bg-white/10 sm:grid-cols-2">
														{bot.capabilities.map(
															(capability, capabilityIndex) => (
																<div
																	key={capability.id}
																	className="min-w-0 bg-ink p-4"
																>
																	<dt className="flex items-baseline gap-2 text-sm font-medium text-white">
																		<span className="font-mono text-xs tabular-nums text-white/40">
																			{String(capabilityIndex + 1).padStart(
																				2,
																				"0",
																			)}
																		</span>
																		{capability.label}
																	</dt>
																	<dd className="mt-1.5 text-xs leading-5 text-white/60">
																		{capability.description}
																	</dd>
																</div>
															),
														)}
													</dl>

													<div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
														{installUrl ? (
															<Link
																href={installUrl}
																variant="plain"
																target="_blank"
																rel="noreferrer"
																className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground no-underline transition-colors duration-150 hover:bg-primary/90"
															>
																Install on Discord
																<ArrowUpRight
																	className="size-4"
																	aria-hidden="true"
																/>
																<span className="sr-only">
																	{" "}
																	for {bot.label} (opens in a new tab)
																</span>
															</Link>
														) : null}
														<Link
															href={homeDestinations.documentation}
															variant="plain"
															target="_blank"
															rel="noreferrer"
															className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-white no-underline underline-offset-4 hover:underline"
														>
															Read the documentation
															<ArrowUpRight
																className="size-4"
																aria-hidden="true"
															/>
															<span className="sr-only">
																{" "}
																(opens in a new tab)
															</span>
														</Link>
														<Link
															href={homeDestinations.dashboard}
															variant="plain"
															target="_blank"
															rel="noreferrer"
															className="inline-flex min-h-10 items-center gap-1.5 text-sm font-medium text-white/65 no-underline underline-offset-4 hover:text-white hover:underline"
														>
															Open the dashboard
															<ArrowUpRight
																className="size-4"
																aria-hidden="true"
															/>
															<span className="sr-only">
																{" "}
																(opens in a new tab)
															</span>
														</Link>
													</div>

													<p className="mt-4 font-mono text-xs leading-5 text-white/40">
														Schematic of the published scope, not a live
														interface.
													</p>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					</fieldset>
				</div>
			</Container>
		</section>
	);
}
