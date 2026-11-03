"use client";

import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";
import { applicationNav, cta, nav } from "@/lib/content/site";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Site header: translucent material, five destinations, two global actions.
 *
 * The applications disclosure and the mobile panel are the only interactive
 * parts; both close on Escape and the panel returns focus to its trigger.
 */
export function Header() {
	const pathname = usePathname();
	const [appsOpen, setAppsOpen] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const appsRef = useRef<HTMLDivElement>(null);
	const mobileButtonRef = useRef<HTMLButtonElement>(null);

	useEffect(() => {
		setAppsOpen(false);
		setMobileOpen(false);
	}, [pathname]);

	useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if (event.key !== "Escape") return;
			if (mobileOpen) {
				setMobileOpen(false);
				mobileButtonRef.current?.focus();
			}
			setAppsOpen(false);
		}
		function onClick(event: MouseEvent) {
			if (!appsRef.current?.contains(event.target as Node)) {
				setAppsOpen(false);
			}
		}
		document.addEventListener("keydown", onKeyDown);
		document.addEventListener("mousedown", onClick);
		return () => {
			document.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("mousedown", onClick);
		};
	}, [mobileOpen]);

	useEffect(() => {
		document.body.style.overflow = mobileOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileOpen]);

	const isActive = (href: string) =>
		href === "/" ? pathname === "/" : pathname.startsWith(href);

	return (
		<header className="site-header sticky top-0 z-50 border-b border-border/70 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
			<Container>
				<nav
					aria-label="Main"
					className="flex h-16 items-center justify-between gap-4"
				>
					<Link
						href="/"
						aria-label="Astron Collection home"
						className="flex shrink-0 items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<span className="text-base font-semibold tracking-tight text-foreground">
							Astron Collection
						</span>
					</Link>

					<div className="hidden items-center gap-1 lg:flex">
						<div className="relative" ref={appsRef}>
							<button
								type="button"
								onClick={() => setAppsOpen((open) => !open)}
								aria-expanded={appsOpen}
								className={cn(
									"inline-flex h-9 items-center gap-1 rounded-full px-3 text-sm transition-colors",
									isActive("/applications")
										? "text-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								Applications
								<ChevronDown
									className={cn(
										"h-3.5 w-3.5 transition-transform duration-150",
										appsOpen && "rotate-180",
									)}
									aria-hidden="true"
								/>
							</button>
							{appsOpen && (
								<div
									className="absolute left-0 top-full mt-2 w-[340px] rounded-md border border-border bg-popover p-2 shadow-float"
									style={{ transformOrigin: "top left" }}
								>
									<ul>
										{applicationNav.map((item) => (
											<li key={item.href}>
												<Link
													href={item.href}
													className="block rounded-sm px-3 py-2 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
												>
													<span className="block text-sm font-medium text-foreground">
														{item.label}
													</span>
													{item.description && (
														<span className="mt-0.5 block text-xs text-muted-foreground">
															{item.description}
														</span>
													)}
												</Link>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>

						{nav
							.filter((item) => item.href !== "/applications")
							.map((item) => (
								<Link
									key={item.href}
									href={item.href}
									aria-current={isActive(item.href) ? "page" : undefined}
									className={cn(
										"inline-flex h-9 items-center rounded-full px-3 text-sm transition-colors",
										isActive(item.href)
											? "text-foreground"
											: "text-muted-foreground hover:text-foreground",
									)}
								>
									{item.label}
								</Link>
							))}
					</div>

					<div className="flex items-center gap-2">
						<ThemeToggle />
						<Button
							variant="ghost"
							className="hidden rounded-full md:inline-flex"
							asChild
						>
							<Link
								href={cta.console.href}
								target="_blank"
								rel="noreferrer"
							>
								Console
								<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
							</Link>
						</Button>
						<Button className="hidden rounded-full sm:inline-flex" asChild>
							<Link href={cta.invite.href}>{cta.invite.label}</Link>
						</Button>
						<button
							ref={mobileButtonRef}
							type="button"
							onClick={() => setMobileOpen((open) => !open)}
							aria-expanded={mobileOpen}
							aria-controls="mobile-nav"
							aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
							className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground lg:hidden"
						>
							{mobileOpen ? (
								<X className="h-4 w-4" aria-hidden="true" />
							) : (
								<Menu className="h-4 w-4" aria-hidden="true" />
							)}
						</button>
					</div>
				</nav>

				{mobileOpen && (
					<div
						id="mobile-nav"
						className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-border pb-6 pt-4 lg:hidden"
					>
						<p className="eyebrow px-1">Applications</p>
						<ul className="mt-2">
							{applicationNav.map((item) => (
								<li key={item.href}>
									<Link
										href={item.href}
										className="block rounded-sm px-1 py-2.5 text-base text-foreground"
									>
										{item.label}
										{item.description && (
											<span className="mt-0.5 block text-xs text-muted-foreground">
												{item.description}
											</span>
										)}
									</Link>
								</li>
							))}
						</ul>

						<p className="eyebrow mt-6 px-1">Sections</p>
						<ul className="mt-2">
							{nav
								.filter((item) => item.href !== "/applications")
								.map((item) => (
									<li key={item.href}>
										<Link
											href={item.href}
											className="block rounded-sm px-1 py-2.5 text-base text-foreground"
										>
											{item.label}
										</Link>
									</li>
								))}
						</ul>

						<div className="mt-6 grid gap-2 border-t border-border pt-4">
							<Button className="w-full rounded-full" asChild>
								<Link href={cta.invite.href}>{cta.invite.label}</Link>
							</Button>
							<Button variant="secondary" className="w-full rounded-full" asChild>
								<Link href={cta.console.href} target="_blank" rel="noreferrer">
									{cta.console.label}
								</Link>
							</Button>
						</div>
					</div>
				)}
			</Container>
		</header>
	);
}
