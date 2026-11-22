"use client";

import { LinkButton, LinkProvider, Sidebar } from "@astron-collection/react";
import {
	GearSixIcon,
	QuestionIcon,
	TrayIcon,
	UserCircleIcon,
} from "@phosphor-icons/react";
import Head from "next/head";
import NextLink from "next/link";
import { useRouter } from "next/router";
import { forwardRef } from "react";
import { normalizeManagerPathname } from "../navigation";
import type { ManagerUser } from "../server";
import { ContextSidebar } from "./context-sidebar";
import { ServerRail } from "./server-rail";

/** Bridges the design system's links to the Next.js router. */
const ManagerLink = forwardRef<
	HTMLAnchorElement,
	React.AnchorHTMLAttributes<HTMLAnchorElement> & { to?: string }
>(({ href, to, ...rest }, ref) => (
	<NextLink ref={ref} href={href ?? to ?? "#"} {...rest} />
));
ManagerLink.displayName = "ManagerLink";

/**
 * Application shell of the Personal Space.
 *
 * The title bar spans the full window width, above the rail and the sidebar,
 * exactly like the reference application. Below it, the four areas sit side by
 * side: server rail, contextual sidebar, main column and the account panel
 * pinned to the bottom of the sidebar.
 *
 * The sidebar, its collapse behaviour, mobile sheet, scroll fades and tooltips
 * come from `@astron-collection/react`; the shell only composes them.
 */
export function ManagerShell({
	user,
	title,
	children,
}: {
	user: ManagerUser;
	title: string;
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = normalizeManagerPathname(router.asPath);

	return (
		<LinkProvider component={ManagerLink}>
			<div
				data-zenth-mode="dark"
				className="flex h-svh flex-col overflow-hidden bg-zenth-recessed text-zenth-default"
			>
				<Head>
					<title>{`${title} | Astron Collection`}</title>
					<meta name="robots" content="noindex" />
				</Head>

				<a
					href="#manager-content"
					className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-zenth-brand focus:px-3 focus:py-2 focus:text-sm focus:text-white"
				>
					Skip to content
				</a>

				{/* Full-width title bar. It belongs to the window, not to a
				    column, so it keeps the same alignment at every breakpoint. */}
				<header className="flex h-10 w-full shrink-0 items-center border-b border-zenth-line bg-zenth-canvas px-3">
					<div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
						<div className="flex min-w-0 items-center gap-2">
							{/* biome-ignore lint/performance/noImgElement: static brand asset */}
							<img
								src="/icon-dark.svg"
								alt=""
								className="size-4.5 shrink-0 object-contain"
							/>
						</div>

						<div className="flex min-w-0 items-center justify-center gap-2 justify-self-center">
							<span className="truncate text-sm font-semibold text-zenth-strong">
								{title}
							</span>
						</div>

						<div className="flex items-center justify-end gap-0.5">
							<LinkButton
								href="/channels/me/inbox"
								variant="ghost"
								shape="square"
								aria-label="Inbox"
								title="Inbox"
								icon={<TrayIcon aria-hidden="true" className="size-4" />}
							/>
							<LinkButton
								href="https://docs.astron-collection.com/docs/core"
								external
								variant="ghost"
								shape="square"
								aria-label="Documentation"
								title="Documentation"
								icon={<QuestionIcon aria-hidden="true" className="size-4" />}
							/>
							<LinkButton
								href="/channels/me/settings"
								variant="ghost"
								shape="square"
								aria-label="Account settings"
								title="Account settings"
								icon={<GearSixIcon aria-hidden="true" className="size-4" />}
							/>
							<LinkButton
								href="/profile"
								variant="ghost"
								shape="square"
								aria-label="Your profile"
								title="Your profile"
								icon={<UserCircleIcon aria-hidden="true" className="size-4" />}
							/>
						</div>
					</div>
				</header>

				<div className="relative flex min-h-0 flex-1 overflow-hidden">
					<Sidebar.Provider
						defaultOpen
						contained
						collapsible="icon"
						className="h-full min-h-0 overflow-hidden"
					>
						<ServerRail pathname={pathname} />

						<Sidebar
							aria-label="Personal space navigation"
							className="sticky top-0 h-full! self-start"
						>
							<ContextSidebar user={user} pathname={pathname} />
						</Sidebar>

						<main
							id="manager-content"
							tabIndex={-1}
							className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-zenth-elevated"
						>
							{/* Compact mobile bar: the sidebar sheet trigger only exists
							    inside the provider, so it lives with the content it opens
							    onto instead of the window title bar. */}
							<div className="flex h-9 shrink-0 items-center gap-2 border-b border-zenth-line px-3 md:hidden">
								<Sidebar.Trigger className="shrink-0" />
								<span className="truncate text-xs font-medium text-zenth-subtle">
									Personal space
								</span>
							</div>

							<div className="min-h-0 flex-1 overflow-y-auto">
								<div className="w-full px-4 py-4 sm:px-5">{children}</div>
							</div>
						</main>
					</Sidebar.Provider>
				</div>
			</div>
		</LinkProvider>
	);
}
