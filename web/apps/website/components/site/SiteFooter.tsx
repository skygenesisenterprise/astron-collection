import { Link } from "@company/react";
import { footerSections, links, organisation } from "@/lib/content/site";
import { Container } from "../Container";
import { Logo } from "../shared/Logo";

const legalLinks = [
	{ href: "/legal/terms", label: "Terms of service" },
	{ href: "/legal/privacy", label: "Privacy policy" },
	{ href: "/legal/cookies", label: "Cookie policy" },
	{ href: "/legal/acceptable-use", label: "Acceptable use" },
] as const;

/**
 * Footer layout mirrors the editorial reference: the wordmark sits in a left
 * rail, seven link groups fill a four-column grid across two rows (the last
 * cell stays empty), and the legal row closes the page.
 */
export function SiteFooter() {
	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-border bg-background text-foreground">
			<Container>
				<div className="grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)] lg:gap-16 lg:py-16">
					<div>
						<Link
							href="/"
							variant="plain"
							aria-label="Sky Genesis Enterprise"
							className="inline-flex items-center gap-2 no-underline!"
						>
							<span className="whitespace-nowrap font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-foreground">
								Sky Genesis Enterprise
							</span>
						</Link>
					</div>

					<nav
						aria-label="Footer"
						className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4"
					>
						{footerSections.map((section) => (
							<div key={section.title} className="min-w-0">
								<h2 className="text-sm font-medium text-muted-foreground">
									{section.title}
								</h2>
								<ul className="mt-4 space-y-3">
									{section.links.map((item) => (
										<li key={`${section.title}-${item.href}-${item.label}`}>
											<Link
												href={item.href}
												variant="plain"
												target={item.external ? "_blank" : undefined}
												rel={item.external ? "noreferrer" : undefined}
												className="text-sm text-foreground no-underline! transition-colors hover:text-primary"
											>
												{item.label}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</nav>
				</div>

				<div className="flex flex-col gap-4 border-t border-border py-6 md:flex-row md:items-center md:justify-between">
					<p className="flex flex-wrap items-center gap-x-1.5 text-xs leading-relaxed text-muted-foreground">
						<span>								© {year} Sky Genesis Enterprise. All rights reserved.
						</span>		
					</p>
					<ul className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
						{legalLinks.map((item, index) => (
							<li key={item.href} className="flex items-center gap-3">
								{index > 0 ? (
									<span aria-hidden="true" className="text-border">
										|
									</span>
								) : null}
								<Link
									href={item.href}
									variant="plain"
									className="text-muted-foreground no-underline! transition-colors hover:text-foreground"
								>
									{item.label}
								</Link>
							</li>
						))}
						<li className="flex items-center gap-3">
							<span aria-hidden="true" className="text-border">
								|
							</span>
							<span aria-label="Language">English (EN)</span>
						</li>
					</ul>
				</div>
			</Container>
		</footer>
	);
}
