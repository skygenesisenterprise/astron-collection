import { Container } from "@/components/Container";
import { Logo } from "@/components/shared/Logo";
import { cta, footerSections, site } from "@/lib/content/site";
import Link from "next/link";

export function Footer() {
	return (
		<footer className="border-t border-border/60 bg-background">
			<Container>
				<div className="grid gap-10 py-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
					<div>
						<Link
							href="/"
							className="inline-flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<Logo className="h-7 w-7 text-primary" />
							<span className="text-base font-semibold text-foreground">
								{site.name}
							</span>
						</Link>
						<p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
							{site.tagline} Open source under {site.license}, maintained by{" "}
							{site.company}.
						</p>
						<div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
							<Link
								href={cta.discord.href}
								target="_blank"
								rel="noreferrer"
								className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
							>
								Discord
							</Link>
							<Link
								href={cta.github.href}
								target="_blank"
								rel="noreferrer"
								className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
							>
								GitHub
							</Link>
							<Link
								href={cta.docs.href}
								target="_blank"
								rel="noreferrer"
								className="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
							>
								Documentation
							</Link>
						</div>
					</div>

					<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
						{footerSections.map((section) => (
							<nav key={section.title} aria-label={section.title}>
								<h2 className="font-mono text-xs uppercase tracking-[0.06em] text-subtle-foreground">
									{section.title}
								</h2>
								<ul className="mt-4 space-y-2.5">
									{section.links.map((link) => (
										<li key={`${section.title}-${link.href}-${link.label}`}>
											<Link
												href={link.href}
												{...(link.external
													? { target: "_blank", rel: "noreferrer" }
													: {})}
												className="text-sm text-muted-foreground transition-colors hover:text-foreground"
											>
												{link.label}
											</Link>
										</li>
									))}
								</ul>
							</nav>
						))}
					</div>
				</div>

				<div className="flex flex-col gap-3 border-t border-border py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
					<p>
						© {new Date().getFullYear()} {site.company}. {site.name} is open
						source under the {site.license} licence.
					</p>
					<p className="font-mono text-xs text-subtle-foreground">
						Discord is a trademark of Discord Inc. Not affiliated.
					</p>
				</div>
			</Container>
		</footer>
	);
}
