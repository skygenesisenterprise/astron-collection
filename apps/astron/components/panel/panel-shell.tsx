"use client";

import {
	CaretLeftIcon,
	CaretRightIcon,
	CaretUpDownIcon,
	MagnifyingGlassIcon,
} from "@phosphor-icons/react";
import { Button, DropdownMenu, LinkProvider, Sidebar } from "@astron-collection/react";
import { Check, X } from "lucide-react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { resolveAppEnvironment } from "@/lib/product";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import { useWorkspaceLicense } from "@/utils/hooks/use-workspace-license";
import {
	ACCOUNT_DESTINATIONS,
	isNavigationChildActive,
	isNavigationHrefActive,
	isNavigationItemActive,
	organizationPath,
	type PanelNavigationItem,
	resolveRecentNavigationPage,
	resolveWorkspaceNavigation,
} from "./navigation";
import { useOrganization } from "./organization-context";
import { PanelHeader, type PanelHeaderUser } from "./panel-header";
import { useRecentPages } from "./recent-pages";

/** Bridges the design system's links to the Next.js router. */
const PanelLink = forwardRef<
	HTMLAnchorElement,
	React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }
>(({ href, to, ...rest }, ref) => (
	<NextLink ref={ref} href={href ?? to ?? "#"} {...rest} />
));
PanelLink.displayName = "PanelLink";

/**
 * Rail shared by every sub-menu of the sidebar: the list draws its own left
 * border, indented with the entries, so the bar never crosses the labels. The
 * design system's absolute guide is hidden when it is present, which keeps the
 * markup identical across the bundled and source versions of the sidebar.
 */
const SUBMENU_CLASS =
	"ml-4 border-l border-zenth-line pl-4 [&>li[aria-hidden]]:hidden";
const SIDEBAR_ITEM_TEXT_CLASS =
	"text-sm font-normal text-[#3F3F46] data-[active=true]:text-[#18181B]";
const SIDEBAR_SECTION_TEXT_CLASS =
	"[&>div>div]:text-xs [&>div>div]:font-medium [&>div>div]:text-[#71717A]";

/** Support and legal links shared by every page of the panel. */
const PANEL_FOOTER_LINKS = [
	"Assistance",
	"État du système",
	"Carrières",
	"Conditions d’utilisation",
	"Signaler les problèmes de sécurité",
	"Politique de confidentialité",
] as const;

/**
 * Closing footer of the panel. It lives in the shell rather than in each page,
 * so every workspace page ends with the same support, legal and privacy
 * entries.
 */
function PanelFooter() {
	return (
		<footer className="flex min-h-12 shrink-0 flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-zenth-line bg-background px-4 py-2 text-xs text-muted-foreground sm:h-12 sm:flex-nowrap sm:py-0">
			{PANEL_FOOTER_LINKS.map((link, index) => (
				<span key={link} className="flex items-center gap-5">
					{index > 0 && <span aria-hidden className="h-4 w-px bg-border" />}
					<span>{link}</span>
				</span>
			))}
			<span aria-hidden className="h-4 w-px bg-border" />
			<button
				type="button"
				disabled
				aria-label="Préférences relatives aux cookies"
				className="flex cursor-default items-center gap-1.5"
			>
				<span className="flex items-center gap-0.5 rounded-full bg-blue-600 px-1 py-0.5">
					<span className="flex size-3.5 items-center justify-center rounded-full bg-white text-blue-600">
						<Check aria-hidden className="size-2.5" />
					</span>
					<X aria-hidden className="size-3 text-white" />
				</span>
				Préférences relatives aux cookies
			</button>
			<span>© 2026 Astron Collection, Inc.</span>
		</footer>
	);
}

/**
 * One row of the sidebar. Implemented destinations navigate; the others are
 * declared so the tree matches the product, but stay disabled instead of
 * pointing at a route that does not exist yet.
 */
function NavigationRow({
	item,
	pathname,
}: {
	item: PanelNavigationItem;
	pathname: string;
}) {
	// The row opens itself on the page it contains, and reopens whenever the
	// current page moves into its sub-menu, so the active entry stays visible.
	const hasActiveChild =
		item.children?.some((child) =>
			isNavigationChildActive(item, child, { pathname }),
		) ?? false;
	const [open, setOpen] = useState(
		item.children?.length ? hasActiveChild : false,
	);

	useEffect(() => {
		if (hasActiveChild) setOpen(true);
	}, [hasActiveChild]);

	const content = (
		<>
			<span className="min-w-0 flex-1 truncate">{item.label}</span>
			{item.badge && <Sidebar.MenuBadge>{item.badge}</Sidebar.MenuBadge>}
			{item.expandable && (
				<CaretRightIcon
					aria-hidden
					className="ml-auto size-3 shrink-0 text-zenth-subtle transition-transform group-data-[open]/menu-button:rotate-90 group-data-[state=collapsed]/sidebar:hidden"
				/>
			)}
		</>
	);

	// A destination that carries its own sub-menu stays interactive even when
	// its landing page is missing: clicking the row reveals the entries instead
	// of doing nothing.
	if (item.children && item.children.length > 0) {
		return (
			<Sidebar.MenuItem>
				<Sidebar.Collapsible open={open} onOpenChange={setOpen}>
					<Sidebar.CollapsibleTrigger
						render={
							<Sidebar.MenuButton
								icon={item.icon}
								tooltip={item.label}
								className={SIDEBAR_ITEM_TEXT_CLASS}
							>
								{content}
							</Sidebar.MenuButton>
						}
					/>
					<Sidebar.CollapsibleContent>
						{/* Open sub-menus are framed by a rail on the left, matching the
						    reference. It is drawn by the list itself and indented with
						    the entries, so the bar never crosses the labels. */}
						<Sidebar.MenuSub className={SUBMENU_CLASS}>
							{item.children.map((child) => {
								const childActive = isNavigationChildActive(item, child, {
									pathname,
								});
								return child.implemented ? (
									<Sidebar.MenuSubItem key={child.id}>
										<Sidebar.MenuSubButton
											href={child.href}
											active={childActive}
											aria-current={childActive ? "page" : undefined}
											className={SIDEBAR_ITEM_TEXT_CLASS}
										>
											{child.label}
										</Sidebar.MenuSubButton>
									</Sidebar.MenuSubItem>
								) : (
									<Sidebar.MenuSubItem key={child.id}>
										<Sidebar.MenuSubButton
											disabled
											title="Coming soon"
											className={`${SIDEBAR_ITEM_TEXT_CLASS} cursor-default`}
										>
											{child.label}
										</Sidebar.MenuSubButton>
									</Sidebar.MenuSubItem>
								);
							})}
						</Sidebar.MenuSub>
					</Sidebar.CollapsibleContent>
				</Sidebar.Collapsible>
			</Sidebar.MenuItem>
		);
	}

	if (!item.implemented) {
		return (
			<Sidebar.MenuItem>
				<Sidebar.MenuButton
					icon={item.icon}
					disabled
					tooltip={`${item.label} — coming soon`}
					aria-label={`${item.label} (coming soon)`}
					className={`${SIDEBAR_ITEM_TEXT_CLASS} cursor-not-allowed opacity-55`}
				>
					{content}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		);
	}

	// A row that owns a sub-menu is only highlighted on its own page: deeper
	// paths highlight the sub-entry instead, so two rows never look active.
	const isActive = item.children?.length
		? item.href === pathname.replace(/\/+$/, "")
		: isNavigationItemActive(item, { pathname });

	return (
		<Sidebar.MenuItem>
			<Sidebar.MenuButton
				href={item.href}
				icon={item.icon}
				active={isActive}
				tooltip={item.label}
				aria-current={isActive ? "page" : undefined}
				className={SIDEBAR_ITEM_TEXT_CLASS}
			>
				{content}
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
	);
}

/**
 * Shell of the `/{organizationId}` panel: the Astron Collection navigation on the
 * left, the workspace page on the right.
 *
 * It is built on the official `@astron-collection/react` Sidebar, so the collapse
 * behaviour, mobile sheet, tooltips and tokens are the design system's, not a
 * local reimplementation. The shell only decides which destinations exist for
 * this account (permissions, licence) and renders them.
 */
export function PanelShell({
	title,
	user,
	children,
	domainName,
	fullWidthContent = false,
}: {
	title: string;
	user: PanelHeaderUser;
	children: React.ReactNode;
	domainName?: string;
	fullWidthContent?: boolean;
}) {
	const router = useRouter();
	const { organization, activation, syncSession } = useOrganization();
	const { data: permissions } = api.user.getPermissions.useQuery();
	const { data: product } = api.settings.getProduct.useQuery();
	const { data: isCloud } = api.settings.isCloud.useQuery();
	const license = useWorkspaceLicense();
	const { data: organizations } = api.organization.all.useQuery();
	const [query, setQuery] = useState("");
	const searchRef = useRef<HTMLInputElement>(null);

	// Switching account moves the session too: panel APIs read
	// `activeOrganizationId`, and the target page's provider would only sync it
	// after loading. Doing it here keeps the session and the URL aligned.
	const switchOrganization = async (organizationId: string) => {
		if (organizationId === organization.id) return;
		await authClient.organization.setActive({ organizationId });
		await router.push(organizationPath(organizationId, "home"));
	};

	const environment =
		resolveAppEnvironment({ product, isCloud }) === "cloud" ? "cloud" : "self";

	// `asPath` is the URL the user is on; `pathname` is only the route pattern
	// (`/[organizationId]/home`), which never matches an absolute item href.
	const pathname = router.asPath.split(/[?#]/)[0] ?? router.asPath;
	const hasActiveAccountDestination = ACCOUNT_DESTINATIONS.some((entry) =>
		isNavigationHrefActive(organizationPath(organization.id, entry.path), {
			pathname,
		}),
	);
	const [accountOpen, setAccountOpen] = useState(hasActiveAccountDestination);
	useEffect(() => {
		if (hasActiveAccountDestination) setAccountOpen(true);
	}, [hasActiveAccountDestination]);
	const [recentPages, addRecentPage] = useRecentPages(
		organization.id,
		user.email,
	);

	// The resolver keeps the global tree and adds the sections of the
	// workspace the URL belongs to (infrastructure, product domain, resource).
	const navigation = resolveWorkspaceNavigation({
		organizationId: organization.id,
		environment,
		permissions,
		license,
		pathname,
		recentPages,
	});
	const currentRecentPage = resolveRecentNavigationPage(navigation, pathname);
	useEffect(() => {
		if (currentRecentPage) addRecentPage(currentRecentPage);
	}, [
		addRecentPage,
		currentRecentPage?.item,
		currentRecentPage?.path,
		currentRecentPage?.section,
	]);

	const sections = useMemo(() => {
		// An exclusive workspace owns the sidebar: its own destinations replace
		// the organization-wide tree instead of being appended below it.
		if (navigation.exclusive) return [];
		const needle = query.trim().toLowerCase();
		if (!needle) return navigation.sections;
		return navigation.sections
			.map((section) => ({
				...section,
				items: section.items.filter((item) =>
					item.label.toLowerCase().includes(needle),
				),
			}))
			.filter((section) => section.items.length > 0);
	}, [navigation.exclusive, navigation.sections, query]);

	const contextual = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return navigation.contextual;
		return navigation.contextual
			.map((section) => ({
				...section,
				items: section.items.filter((item) =>
					item.label.toLowerCase().includes(needle),
				),
			}))
			.filter((section) => section.items.length > 0);
	}, [navigation.contextual, query]);

	// Ctrl/⌘ K focuses the quick search, matching the rest of the product.
	useEffect(() => {
		const onKeyDown = (event: KeyboardEvent) => {
			if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== "k")
				return;
			event.preventDefault();
			searchRef.current?.focus();
		};
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	return (
		<LinkProvider component={PanelLink}>
			<Sidebar.Provider
				defaultOpen
				collapsible="icon"
				className="h-svh overflow-hidden"
			>
				{/* `h-svh` keeps the rail at viewport height while the page scrolls, so
				    the footer is always anchored to the bottom of the sidebar. */}
				<Sidebar
					aria-label={`Navigation for ${title}`}
					className="sticky top-0 h-svh! self-start"
				>
					<Sidebar.Header className="h-[58px] shrink-0 justify-center border-b border-zenth-line group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-0">
						{/* The workspace name opens the account switcher, as in the
						    reference: one row, one affordance. It ellipsizes when the rail
						    is narrow and disappears once the rail is collapsed to icons. */}
						<DropdownMenu>
							<DropdownMenu.Trigger>
								<Button
									variant="ghost"
									aria-label={`Switch account (${organization.name})`}
									className="min-h-9 w-full min-w-0 justify-start gap-2 px-1.5 py-1.5 text-sm font-normal group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-0"
								>
									{/* One line, like the reference header: the name never wraps
									    and ellipsizes when the rail is too narrow. The full value
									    stays available in the tooltip. */}
									<span
										title={organization.name}
										className="min-w-0 flex-1 overflow-hidden text-left text-sm leading-tight font-normal whitespace-nowrap group-data-[state=collapsed]/sidebar:hidden"
									>
										{organization.name}
									</span>
									<CaretUpDownIcon
										aria-hidden
										className="size-3.5 shrink-0 text-zenth-subtle group-data-[state=collapsed]/sidebar:hidden"
									/>
								</Button>
							</DropdownMenu.Trigger>
							<DropdownMenu.Content
								align="start"
								sideOffset={6}
								className="w-64 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
							>
								<DropdownMenu.Group>
									<DropdownMenu.Label className="text-[11px] font-semibold tracking-wider text-zenth-subtle uppercase">
										Accounts
									</DropdownMenu.Label>
									{organizations ? (
										organizations.map((account) => (
											<DropdownMenu.Item
												key={account.id}
												selected={account.id === organization.id}
												onClick={() => void switchOrganization(account.id)}
											>
												<span className="min-w-0 flex-1 truncate">
													{account.name}
												</span>
											</DropdownMenu.Item>
										))
									) : (
										<DropdownMenu.Item disabled>
											Loading accounts…
										</DropdownMenu.Item>
									)}
								</DropdownMenu.Group>
								<DropdownMenu.Separator />
								<DropdownMenu.Item
									onClick={() => void router.push("/create-account")}
								>
									Create Account
								</DropdownMenu.Item>
							</DropdownMenu.Content>
						</DropdownMenu>
					</Sidebar.Header>

					<Sidebar.Content>
						<div className="px-1 pb-2">
							<div className="flex items-center gap-2 rounded-lg border border-zenth-line bg-zenth-base px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-zenth-brand focus-within:ring-inset">
								<MagnifyingGlassIcon
									aria-hidden
									className="size-3.5 shrink-0 text-zenth-subtle"
								/>
								<input
									ref={searchRef}
									type="search"
									value={query}
									onChange={(event) => setQuery(event.target.value)}
									placeholder="Quick Search"
									aria-label="Search Navigation"
									className="min-w-0 flex-1 bg-transparent text-sm text-zenth-default outline-none placeholder:text-zenth-subtle"
								/>
								<kbd className="shrink-0 rounded border border-zenth-line px-1 text-xs text-[#71717A] group-data-[state=collapsed]/sidebar:hidden">
									Ctrl K
								</kbd>
							</div>
						</div>

						{sections.map((section) => (
							<Sidebar.Group key={section.id}>
								{section.label && (
									<Sidebar.GroupLabel className={SIDEBAR_SECTION_TEXT_CLASS}>
										{section.label}
									</Sidebar.GroupLabel>
								)}
								<Sidebar.Menu>
									{section.items.map((item) => (
										<NavigationRow
											key={item.id}
											item={item}
											pathname={pathname}
										/>
									))}
								</Sidebar.Menu>
							</Sidebar.Group>
						))}

						{navigation.workspace.parent && (
							<div className="group-data-[state=collapsed]/sidebar:hidden">
								<Sidebar.Menu>
									<Sidebar.MenuItem>
										<Sidebar.MenuButton
											href={navigation.workspace.parent.href}
											icon={CaretLeftIcon}
											tooltip={`Back to ${navigation.workspace.parent.label}`}
											className={`${SIDEBAR_ITEM_TEXT_CLASS} cursor-pointer`}
										>
											<span className="min-w-0 flex-1 truncate">
												Back to {navigation.workspace.parent.label}
											</span>
										</Sidebar.MenuButton>
									</Sidebar.MenuItem>
								</Sidebar.Menu>
							</div>
						)}

						{navigation.exclusive &&
							navigation.workspace.parent &&
							contextual.length > 0 && (
								<div className="mx-2 my-2 border-t border-zenth-line group-data-[state=collapsed]/sidebar:hidden" />
							)}

						{/* Contextual workspace: the URL decides which product surface is
						    active. It is appended below the global tree, or replaces it
						    when the workspace is exclusive (as for a domain page). */}
						{contextual.length > 0 && (
							<>
								{!navigation.exclusive && (
									<div className="mt-3 border-t border-zenth-line px-2 pt-3 pb-1 group-data-[state=collapsed]/sidebar:hidden">
										<p className="text-xs font-medium text-[#71717A]">
											Workspace
										</p>
										<p className="min-w-0 truncate text-sm font-medium text-zenth-default">
											{navigation.workspace.label}
										</p>
									</div>
								)}
								{contextual.map((section) => (
									<Sidebar.Group key={section.id}>
										{!navigation.exclusive && section.label && (
											<Sidebar.GroupLabel
												className={SIDEBAR_SECTION_TEXT_CLASS}
											>
												{section.label}
											</Sidebar.GroupLabel>
										)}
										<Sidebar.Menu>
											{section.items.map((item) => (
												<NavigationRow
													key={item.id}
													item={item}
													pathname={pathname}
												/>
											))}
										</Sidebar.Menu>
									</Sidebar.Group>
								))}
							</>
						)}

						{/* The account entry sits at the end of the tree, right after the
						    last section, the way the reference panel groups it. The
						    collapse control stays outside the scroll area, at the very
						    bottom of the rail. */}
						<Sidebar.Group className="mt-3 border-t border-zenth-line pt-2">
							<Sidebar.Menu>
								{navigation.footer.map((item) =>
									item.id === "account" ? (
										<Sidebar.MenuItem key={item.id}>
											<Sidebar.Collapsible
												open={accountOpen}
												onOpenChange={setAccountOpen}
											>
												<Sidebar.CollapsibleTrigger
													render={
														<Sidebar.MenuButton
															icon={item.icon}
															tooltip={item.label}
															className={SIDEBAR_ITEM_TEXT_CLASS}
														>
															<span className="min-w-0 flex-1 truncate">
																{item.label}
															</span>
															<CaretRightIcon
																aria-hidden
																className="ml-auto size-3 shrink-0 text-zenth-subtle group-data-[state=collapsed]/sidebar:hidden"
															/>
														</Sidebar.MenuButton>
													}
												/>
												<Sidebar.CollapsibleContent>
													{/* The sub-menu's indent guide is a drawn vertical rule; the
													    panel already has enough rail lines, so drop it. */}
													<Sidebar.MenuSub className={SUBMENU_CLASS}>
														{ACCOUNT_DESTINATIONS.map((entry) => {
															const href = organizationPath(
																organization.id,
																entry.path,
															);
															const active =
																entry.implemented &&
																isNavigationHrefActive(href, { pathname });
															return (
																<Sidebar.MenuSubItem key={entry.path}>
																	{entry.implemented ? (
																		<Sidebar.MenuSubButton
																			href={href}
																			active={active}
																			aria-current={active ? "page" : undefined}
																			className={SIDEBAR_ITEM_TEXT_CLASS}
																		>
																			{entry.label}
																		</Sidebar.MenuSubButton>
																	) : (
																		<Sidebar.MenuSubButton
																			disabled
																			title="Coming soon"
																			className={`${SIDEBAR_ITEM_TEXT_CLASS} cursor-not-allowed opacity-55`}
																		>
																			{entry.label}
																		</Sidebar.MenuSubButton>
																	)}
																</Sidebar.MenuSubItem>
															);
														})}
													</Sidebar.MenuSub>
												</Sidebar.CollapsibleContent>
											</Sidebar.Collapsible>
										</Sidebar.MenuItem>
									) : (
										<NavigationRow
											key={item.id}
											item={item}
											pathname={pathname}
										/>
									),
								)}
							</Sidebar.Menu>
						</Sidebar.Group>

						{query.trim() &&
							sections.length === 0 &&
							contextual.length === 0 && (
								<p className="px-3 py-4 text-xs text-zenth-subtle">
									No navigation items match "{query.trim()}".
								</p>
							)}
					</Sidebar.Content>

					{/* Only the collapse control lives below the scroll area: the account
					    entry is rendered once, at the end of the navigation tree above,
					    while this strip stays flush with the bottom edge of the rail. */}
					<Sidebar.Footer
						style={{ height: "auto" }}
						className="mt-auto flex-col items-stretch gap-0 p-0!"
					>
						<div className="flex h-12 items-center border-t border-zenth-line px-[11px] group-not-data-[state=collapsed]/sidebar:px-3.5">
							{/* The design system's own collapse glyph, unframed: no border and
							    no background, only the row the trigger already styles. */}
							<Sidebar.Trigger />
						</div>
					</Sidebar.Footer>
				</Sidebar>

				<main
					className={cn(
						// The panel owns the viewport height: the header, the scroll
						// area and the footer are three rows of one fixed column, so
						// only the page content ever scrolls.
						"flex h-svh min-w-0 flex-1 flex-col overflow-hidden",
						"bg-zenth-base text-zenth-default",
					)}
				>
					<PanelHeader user={user} domainName={domainName} />

					{activation === "error" && (
						<div className="flex items-center gap-3 border-b border-zenth-line px-4 py-2 text-xs text-zenth-subtle">
							<span>
								La session n&apos;est pas encore rattachée à cet espace de
								travail.
							</span>
							<Button variant="ghost" size="sm" onClick={syncSession}>
								Réessayer
							</Button>
						</div>
					)}

					{/* Flex column so short pages still reach the footer: the content
					    grows to fill the viewport and the footer closes the page at the
					    bottom edge, while long pages scroll it into view normally. */}
					<div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
						<div
							className={cn(
								"mx-auto w-full flex-1",
								fullWidthContent
									? "max-w-none p-0"
									: "max-w-6xl px-4 py-8 sm:px-8",
							)}
						>
							{children}
						</div>
						{/* The footer closes the page, in the flow of the scroll area: it
						    is only reached once the content ends, never pinned over it. */}
						<PanelFooter />
					</div>
				</main>
			</Sidebar.Provider>
		</LinkProvider>
	);
}
