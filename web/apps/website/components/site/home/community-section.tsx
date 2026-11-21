import { Link } from "@astron-collection/react";
import { ArrowUpRight, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/Container";
import { communitySection } from "@/lib/content/home-collection";
import { SocketMark } from "./marks";

/**
 * 07 — Community. One panel, one verified invite. No member counts, response
 * promises or social proof are invented to fill the surface.
 */
export function CommunitySection() {
	return (
		<section
			id="community"
			aria-labelledby="community-title"
			className="scroll-mt-24 bg-background py-24 sm:py-32"
		>
			<Container>
				<div className="mx-auto max-w-5xl">
					<div className="overflow-hidden rounded-2xl border border-border bg-card">
						<div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
							<div className="min-w-0 p-7 sm:p-10 lg:p-12">
								<p className="flex items-center gap-2 text-sm text-muted-foreground">
									<SocketMark />
									<span className="font-mono text-xs tabular-nums text-foreground">
										{communitySection.index}
									</span>
									<span>{communitySection.eyebrow}</span>
								</p>
								<h2
									id="community-title"
									className="mt-4 max-w-xl font-display text-4xl font-medium leading-[1.04] tracking-tight text-foreground sm:text-5xl"
								>
									{communitySection.title}
								</h2>
								<p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
									{communitySection.description}
								</p>

								<div className="mt-8 flex flex-wrap items-center gap-3">
									<Link
										href={communitySection.primary.href}
										variant="plain"
										target="_blank"
										rel="noreferrer"
										className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground no-underline transition-colors duration-150 hover:bg-primary/90"
									>
										{communitySection.primary.label}
										<ArrowUpRight className="size-4" aria-hidden="true" />
										<span className="sr-only"> (opens in a new tab)</span>
									</Link>
									<Link
										href={communitySection.secondary.href}
										variant="plain"
										target="_blank"
										rel="noreferrer"
										className="inline-flex h-11 items-center gap-2 rounded-lg border border-border px-5 text-sm font-medium text-foreground no-underline transition-colors duration-150 hover:bg-muted"
									>
										{communitySection.secondary.label}
										<ArrowUpRight className="size-4" aria-hidden="true" />
										<span className="sr-only"> (opens in a new tab)</span>
									</Link>
								</div>
							</div>

							<div className="relative flex min-h-64 flex-col justify-between overflow-hidden border-t border-border bg-ink p-7 text-ink-foreground sm:p-10 lg:border-l lg:border-t-0 lg:p-12">
								<UsersThree
									className="relative size-8 text-white/70"
									aria-hidden="true"
								/>
								<div className="relative mt-16">
									<p className="max-w-sm font-display text-2xl font-medium leading-snug text-white sm:text-3xl">
										Questions, support and conversation
									</p>
									<p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
										The same invite is published in the repository and the
										documentation.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}
