"use client";

import { Button, DropdownMenu, Link, LinkButton } from "@company/react";
import {
	ArrowRight,
	CaretDown,
	CaretUpDown,
	List,
	X,
} from "@phosphor-icons/react";
import { usePathname, useRouter } from "next/navigation";
import * as React from "react";
import {
	mainNav,
	utilityNav,
	type NavLink,
	type NavSection,
	type NavSectionId,
} from "@/lib/content/navigation";
import { searchIndex } from "@/lib/content/search-index";
import { cta } from "@/lib/content/site";
import { cn } from "@/lib/utils";
import { Container } from "../Container";
import { LanguageSelector } from "./LanguageSelector";
import { SiteSearch } from "./SiteSearch";

/** A section is current when the visitor is on its landing page or below it. */
function isActive(pathname: string, href: string) {
	if (href === "/") return pathname === "/";
	return pathname === href || pathname.startsWith(`${href}/`);
}

/** Every section must sit on one row, so the grid is sized to the column
 * count. Static strings keep Tailwind's scanner able to see each class. */
const COLUMN_GRID_CLASS: Record<number, string> = {
	1: "lg:grid-cols-1",
	2: "lg:grid-cols-2",
	3: "lg:grid-cols-3",
	4: "lg:grid-cols-4",
	5: "lg:grid-cols-5",
	6: "lg:grid-cols-6",
	7: "lg:grid-cols-7",
	8: "lg:grid-cols-8",
};

function columnGridClass(count: number) {
	return COLUMN_GRID_CLASS[Math.min(Math.max(count, 1), 8)] ?? "lg:grid-cols-4";
}

/** A panel only takes the width its columns need, capped by the viewport. */
const COLUMN_WIDTH_CLASS: Record<number, string> = {
	1: "w-[min(380px,calc(100vw-2rem))]",
	2: "w-[min(560px,calc(100vw-2rem))]",
	3: "w-[min(780px,calc(100vw-2rem))]",
	4: "w-[min(960px,calc(100vw-2rem))]",
	5: "w-[min(1120px,calc(100vw-2rem))]",
	6: "w-[min(1240px,calc(100vw-2rem))]",
	7: "w-[min(1360px,calc(100vw-2rem))]",
	8: "w-[min(1360px,calc(100vw-2rem))]",
};

function columnWidthClass(count: number) {
	return (
		COLUMN_WIDTH_CLASS[Math.min(Math.max(count, 1), 8)] ??
		"w-[min(780px,calc(100vw-2rem))]"
	);
}

/**
 * The panel is made of columns. Products carries the six formal categories, so
 * they are mapped onto the same column shape instead of a bespoke mega panel:
 * one column per category, its projects listed below.
 */
interface PanelColumn {
	title: string;
	href?: string;
	links: NavLink[];
}

function panelColumns(section: NavSection): PanelColumn[] {
	if (section.categories?.length) {
		return section.categories.map((category) => ({
			title: category.name,
			href: category.href,
			links: category.products.map((product) => ({
				href: product.href ?? category.href,
				label: product.name,
				description: product.description,
				external: product.external,
			})),
		}));
	}
	return section.columns;
}

/** Utility action rendered as one of the outlined pills in the right cluster. */
function HeaderPill({
	href,
	label,
	external,
}: {
	href: string;
	label: string;
	external?: boolean;
}) {
	return (
		<LinkButton
			href={href}
			variant="outline"
			size="sm"
			external={external}
			className="h-9 rounded-full border-border bg-transparent px-4 text-[15px] font-medium text-foreground ring-0 hover:border-foreground/30 hover:bg-muted hover:text-foreground"
		>
			{label}
		</LinkButton>
	);
}

/**
 * Desktop navigation, built on the official `DropdownMenu` compound component:
 * one root per group, the trigger renders the library `Button`, and the panel
 * is the library popup (portal, positioner and surface handled for us).
 */
function DesktopNavItem({
	section,
	pathname,
	open,
	onOpen,
	onClose,
	onScheduleClose,
}: {
	section: NavSection;
	pathname: string;
	open: boolean;
	onOpen: (id: NavSectionId) => void;
	onClose: () => void;
	onScheduleClose: () => void;
}) {
	const active = section.href ? isActive(pathname, section.href) : false;
	const columns = panelColumns(section);
	const triggerRef = React.useRef<HTMLSpanElement>(null);
	const router = useRouter();
	// The panel is anchored to the page centre, not to its trigger, so every
	// panel opens in the same place. Measured on open and on resize, from the
	// DOM node rather than from an event that Base UI's render prop can drop.
	const [alignOffset, setAlignOffset] = React.useState(0);

	React.useEffect(() => {
		if (!open) return;
		const element = triggerRef.current;
		if (!element) return;

		const update = () => {
			const rect = element.getBoundingClientRect();
			setAlignOffset(
				Math.round(window.innerWidth / 2 - (rect.left + rect.width / 2)),
			);
		};

		update();
		window.addEventListener("resize", update);
		return () => window.removeEventListener("resize", update);
	}, [open]);

	if (columns.length === 0) {
		return (
			<Link
				href={section.href ?? "/"}
				variant="plain"
				aria-current={active ? "page" : undefined}
				onPointerEnter={onClose}
				className={cn(
					"inline-flex h-8 items-center text-[15px] font-medium no-underline! transition-colors",
					active
						? "text-foreground"
						: "text-foreground/90 hover:text-foreground",
				)}
			>
				{section.label}
			</Link>
		);
	}

	return (
		<div
			onPointerEnter={() => onOpen(section.id)}
			// Hover opens the panel, but a click on the label goes to the group's
			// landing page. Only clicks coming from the trigger are intercepted;
			// links rendered inside the panel keep working.
			onClickCapture={(event) => {
				const trigger = triggerRef.current;
				if (!trigger || !(event.target instanceof Node)) return;
				if (!trigger.contains(event.target)) return;
				event.stopPropagation();
				onClose();
				router.push(section.href ?? "/");
			}}
		>
			<DropdownMenu
				open={open}
				onOpenChange={(next) =>
					next ? onOpen(section.id) : onScheduleClose()
				}
			>
				<span
					ref={triggerRef}
					className="inline-flex"
					onPointerEnter={() => onOpen(section.id)}
				>
					<DropdownMenu.Trigger>
						<Button
							variant="ghost"
							size="sm"
							className={cn(
								"group h-8 gap-1.5 bg-transparent px-0 text-[15px] font-medium shadow-none hover:bg-transparent",
								active
									? "text-foreground"
									: "text-foreground/90 hover:text-foreground",
							)}
						>
							{section.label}
							<CaretUpDown
								className="size-3 text-foreground/60"
								aria-hidden="true"
							/>
						</Button>
					</DropdownMenu.Trigger>
				</span>
				<DropdownMenu.Content
					onPointerEnter={() => onOpen(section.id)}
					onPointerLeave={onScheduleClose}
					align="center"
					alignOffset={alignOffset}
					sideOffset={14}
					collisionPadding={16}
					className={cn(
						"border border-border bg-popover p-2 text-popover-foreground shadow-lg",
						columnWidthClass(columns.length),
					)}
				>
					<nav aria-label={`${section.label} menu`}>
						<div
							className={cn(
								"grid divide-y divide-border overflow-hidden rounded-md border border-border lg:divide-x lg:divide-y-0",
								columnGridClass(columns.length),
							)}
						>
							{columns.map((column, index) => (
								<DropdownMenu.Group
									key={column.title || `column-${index}`}
									className="min-w-0 p-3 xl:p-4"
								>
									{column.title ? (
										<div className="mb-3">
											{column.href ? (
												<Link
													href={column.href}
													variant="plain"
													className="text-[13px] font-medium text-foreground no-underline! hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
												>
													{column.title}
												</Link>
											) : (
												<p className="text-[13px] font-medium text-muted-foreground">
													{column.title}
												</p>
											)}
										</div>
									) : null}
									{column.links.map((item) => (
										<DropdownMenu.LinkItem
											key={`${column.title}-${item.label}-${item.href}`}
											href={item.href}
											target={item.external ? "_blank" : undefined}
											rel={item.external ? "noreferrer" : undefined}
											className="flex-col items-start gap-0.5 rounded-md px-2 py-2 text-foreground focus-visible:ring-2 focus-visible:ring-ring"
										>
											<span className="text-sm font-medium leading-snug">
												{item.label}
											</span>
											{item.description && (
												<span className="text-xs leading-snug text-muted-foreground">
													{item.description}
												</span>
											)}
										</DropdownMenu.LinkItem>
									))}
								</DropdownMenu.Group>
							))}
						</div>
					</nav>

					<div className="mt-2 flex flex-col gap-3 border-t border-border px-3 py-4 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-wrap items-center gap-2">
							{section.href && (
								<LinkButton
									href={section.href}
									variant="ghost"
									size="sm"
									className="text-primary"
								>
									See all {section.label.toLowerCase()}
									<ArrowRight className="size-3.5" aria-hidden="true" />
								</LinkButton>
							)}
						</div>
						<ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground">
							{section.footerLinks.map((item) => (
								<li key={`${item.label}-${item.href}`}>
									<Link
										href={item.href}
										variant="plain"
										target={item.external ? "_blank" : undefined}
										rel={item.external ? "noreferrer" : undefined}
										className="text-muted-foreground no-underline! transition-colors hover:text-foreground"
									>
										{item.label}
										{item.external ? (
											<span className="sr-only"> (opens in a new tab)</span>
										) : null}
									</Link>
								</li>
							))}
						</ul>
					</div>
				</DropdownMenu.Content>
			</DropdownMenu>
		</div>
	);
}

/**
 * Mobile navigation. The primary entries are a list; a section with a panel
 * expands in place, keeping the six product categories readable on a narrow
 * screen without shrinking the desktop panel.
 */
function MobileMenu({
	open,
	onClose,
	pathname,
}: {
	open: boolean;
	onClose: () => void;
	pathname: string;
}) {
	React.useEffect(() => {
		if (!open) return;
		const previous = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => {
			document.body.style.overflow = previous;
			window.removeEventListener("keydown", onKeyDown);
		};
	}, [open, onClose]);

	if (!open) return null;

	return (
		<div className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto border-t border-border bg-popover text-popover-foreground lg:hidden">
			<Container className="py-6">
				<nav aria-label="Mobile">
					<ul className="space-y-1">
						{mainNav.map((section) => {
							const columns = panelColumns(section);
							const active = section.href
								? isActive(pathname, section.href)
								: false;

							return (
								<li key={section.id}>
									{columns.length === 0 ? (
										<Link
											href={section.href ?? "/"}
											variant="current"
											onClick={onClose}
											aria-current={active ? "page" : undefined}
											className="block rounded-md px-2 py-3 text-base font-medium no-underline hover:bg-foreground/[0.06]"
										>
											{section.label}
										</Link>
									) : (
										<details className="group rounded-md">
											<summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-md px-2 py-3 text-base font-medium hover:bg-foreground/[0.06] [&::-webkit-details-marker]:hidden">
												<Link
													href={section.href ?? "/"}
													variant="plain"
													onClick={onClose}
													className="flex-1 text-base font-medium text-foreground no-underline!"
												>
													{section.label}
												</Link>
												<CaretDown
													className="size-4 text-muted-foreground transition-transform group-open:rotate-180"
													aria-hidden="true"
												/>
											</summary>
											<div className="pb-2 pl-2">
												{columns.map((column, index) => (
													<div
														key={column.title || `column-${index}`}
														className="mb-2"
													>
														{column.title ? (
															<div className="px-2 py-1">
																{column.href ? (
																	<Link
																		href={column.href}
																		variant="plain"
																		onClick={onClose}
																		className="text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground no-underline!"
																	>
																		{column.title}
																	</Link>
																) : (
																	<p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
																		{column.title}
																	</p>
																)}
															</div>
														) : null}
														<ul>
															{column.links.map((item) => (
																<li key={`${column.title}-${item.label}-${item.href}`}>
																	<Link
																		href={item.href}
																		variant="current"
																		target={
																			item.external ? "_blank" : undefined
																		}
																		rel={
																			item.external ? "noreferrer" : undefined
																		}
																		onClick={onClose}
																		className="block rounded-md px-2 py-2 text-sm text-muted-foreground no-underline hover:bg-foreground/[0.06] hover:text-foreground"
																	>
																		{item.label}
																		{item.external ? (
																			<span className="sr-only">
																				{" "}
																				(opens in a new tab)
																			</span>
																		) : null}
																	</Link>
																</li>
															))}
														</ul>
													</div>
												))}
												<LinkButton
													href={section.href ?? "/"}
													variant="ghost"
													size="sm"
													onClick={onClose}
													className="px-2 text-primary"
												>
													View all {section.label.toLowerCase()}
												</LinkButton>
											</div>
										</details>
									)}
								</li>
							);
						})}
					</ul>
				</nav>

				<div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
					{utilityNav.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							variant="current"
							target={item.external ? "_blank" : undefined}
							rel={item.external ? "noreferrer" : undefined}
							className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground no-underline hover:border-foreground/30 hover:text-foreground"
						>
							{item.label}
						</Link>
					))}
					<div className="ml-auto flex items-center gap-1">
						<LanguageSelector variant="ghost" />
					</div>
				</div>

				<div className="mt-4 grid gap-2 border-t border-border pt-4">
					<LinkButton
						href={cta.primary.href}
						variant="primary"
						onClick={onClose}
						className="w-full justify-center"
					>
						{cta.primary.label}
					</LinkButton>
					<LinkButton
						href={cta.signIn.href}
						variant="secondary"
						external
						onClick={onClose}
						className="w-full justify-center"
					>
						{cta.signIn.label}
					</LinkButton>
				</div>
			</Container>
		</div>
	);
}

export function SiteHeader() {
	const pathname = usePathname();
	const [mobileOpen, setMobileOpen] = React.useState(false);
	// One shared menu state: hovering any item switches the open panel, so no
	// item can be left in a stale "open" state that never re-opens.
	const [openSection, setOpenSection] = React.useState<NavSectionId | null>(null);
	const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

	const cancelClose = React.useCallback(() => {
		if (closeTimer.current) {
			clearTimeout(closeTimer.current);
			closeTimer.current = null;
		}
	}, []);

	const openMenu = React.useCallback(
		(id: NavSectionId) => {
			cancelClose();
			setOpenSection(id);
		},
		[cancelClose],
	);

	const scheduleClose = React.useCallback(() => {
		cancelClose();
		closeTimer.current = setTimeout(() => setOpenSection(null), 300);
	}, [cancelClose]);

	const closeMenu = React.useCallback(() => {
		cancelClose();
		setOpenSection(null);
	}, [cancelClose]);

	React.useEffect(() => cancelClose, [cancelClose]);

	React.useEffect(() => {
		setMobileOpen(false);
		setOpenSection(null);
	}, [pathname]);

	return (
		<header className="relative z-50 border-b border-border bg-background text-foreground">
			<Container>
				<div className="grid h-16 grid-cols-[1fr_auto_1fr] items-center gap-4 xl:gap-6">
					<Link
						href="/"
						variant="plain"
						aria-label="Sky Genesis Enterprise home"
						className="flex shrink-0 items-center justify-self-start no-underline!"
					>
						<span className="whitespace-nowrap font-display text-[11px] font-bold uppercase tracking-[0.12em] text-foreground sm:text-[12px] xl:text-[14px] xl:tracking-[0.14em]">
							Sky Genesis Enterprise
						</span>
					</Link>

					<div className="hidden justify-center lg:flex">
						<nav
							aria-label="Main"
							onPointerEnter={cancelClose}
							onPointerLeave={scheduleClose}
						>
							<ul className="flex items-center gap-5 xl:gap-7">
								{mainNav.map((section) => (
									<li key={section.id}>
										<DesktopNavItem
											section={section}
											pathname={pathname}
											open={openSection === section.id}
											onOpen={openMenu}
											onClose={closeMenu}
											onScheduleClose={scheduleClose}
										/>
									</li>
								))}
							</ul>
						</nav>
					</div>

					<div className="flex items-center gap-2.5 justify-self-end">
						<nav aria-label="Utility" className="hidden items-center gap-2 md:flex">
							<HeaderPill
								href={cta.signIn.href}
								label={cta.signIn.label}
								external
							/>
							<HeaderPill href={cta.secondary.href} label={cta.secondary.label} />
						</nav>
						<SiteSearch
							entries={searchIndex}
							variant="icon"
							className="text-muted-foreground hover:bg-muted hover:text-foreground"
						/>
						<Button
							variant="ghost"
							shape="square"
							size="sm"
							onClick={() => setMobileOpen((value) => !value)}
							aria-expanded={mobileOpen}
							aria-controls="mobile-navigation"
							aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
							className="h-9 w-9 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden"
						>
							{mobileOpen ? (
								<X className="size-5" aria-hidden="true" />
							) : (
								<List className="size-5" aria-hidden="true" />
							)}
						</Button>
					</div>
				</div>
			</Container>

			<MobileMenu
				open={mobileOpen}
				onClose={() => setMobileOpen(false)}
				pathname={pathname}
			/>
		</header>
	);
}
