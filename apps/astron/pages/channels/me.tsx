import type { Icon } from "@phosphor-icons/react";
import {
	ArrowRightIcon,
	BookmarkSimpleIcon,
	ClockCounterClockwiseIcon,
	DiscordLogoIcon,
	GearSixIcon,
	HouseIcon,
	MagnifyingGlassIcon,
	PlugsConnectedIcon,
	PlusIcon,
	ShieldCheckIcon,
	SquaresFourIcon,
	TrayIcon,
	UserCircleIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useState } from "react";
import {
	formatManagerDay,
	MANAGER_ACTIVITY,
	toManagerServer,
} from "@/components/manager/data/contracts";
import { ManagerShell } from "@/components/manager/layout/manager-shell";
import type { ManagerUser } from "@/components/manager/server";
import { personalSpacePageProps } from "@/components/manager/server";
import {
	ActionLink,
	EmptyState,
	ManagerAvatar,
	Panel,
	StatusPill,
} from "@/components/manager/shared/states";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";

const HOME_TABS: Array<{
	href: string;
	label: string;
	icon: Icon;
	active: boolean;
}> = [
	{ href: "/channels/me", label: "Overview", icon: HouseIcon, active: true },
	{
		href: "/channels/me/servers",
		label: "Servers",
		icon: SquaresFourIcon,
		active: false,
	},
	{ href: "/channels/me/inbox", label: "Inbox", icon: TrayIcon, active: false },
];

const QUICK_LINKS: Array<{
	href: string;
	label: string;
	description: string;
	icon: Icon;
}> = [
	{
		href: "/channels/me/servers",
		label: "My Servers",
		description: "Every server your account can reach.",
		icon: SquaresFourIcon,
	},
	{
		href: "/channels/me/apps",
		label: "Applications",
		description: "Integrations connected to your account.",
		icon: PlugsConnectedIcon,
	},
	{
		href: "/channels/me/connections",
		label: "Connections",
		description: "External identities linked to Astron.",
		icon: UserCircleIcon,
	},
	{
		href: "/channels/me/saved",
		label: "Saved",
		description: "Shortcuts and pages you kept.",
		icon: BookmarkSimpleIcon,
	},
	{
		href: "/channels/me/settings",
		label: "Account Settings",
		description: "Identity, email and sign-in details.",
		icon: GearSixIcon,
	},
];

/**
 * Personal Space home.
 *
 * Layout follows the reference application shell: pill tabs with the primary
 * action on their right, a full-width search field, a flat list of servers and
 * recent activity, and a persistent right column for the account. No server or
 * activity is invented when the backing directory is absent.
 */
export default function PersonalHomePage({ user }: { user: ManagerUser }) {
	const [query, setQuery] = useState("");
	const serversQuery = api.discord.guilds.list.useQuery(undefined, {
		staleTime: 30_000,
		refetchOnWindowFocus: true,
	});

	const needle = query.trim().toLowerCase();
	const searching = needle.length > 0;
	const allServers = (serversQuery.data?.servers ?? []).map(toManagerServer);
	const visibleServers = searching
		? allServers.filter((server) => server.name.toLowerCase().includes(needle))
		: allServers;
	const visibleLinks = searching
		? QUICK_LINKS.filter((link) =>
				`${link.label} ${link.description}`.toLowerCase().includes(needle),
			)
		: QUICK_LINKS;

	return (
		<ManagerShell user={user} title="Home">
			<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_25rem]">
				<div className="min-w-0">
					<div className="flex flex-wrap items-center justify-between gap-3 pb-4">
						<nav aria-label="Home sections" className="flex items-center gap-1">
							{HOME_TABS.map((tab) => (
								<Link
									key={tab.href}
									href={tab.href}
									aria-current={tab.active ? "page" : undefined}
									className={cn(
										"inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zenth-focus",
										tab.active
											? "bg-zenth-interact text-zenth-strong"
											: "text-zenth-subtle hover:bg-zenth-tint hover:text-zenth-default",
									)}
								>
									<tab.icon
										aria-hidden="true"
										className={cn(
											"size-4",
											tab.active ? "text-zenth-strong" : "text-zenth-subtle",
										)}
									/>
									{tab.label}
								</Link>
							))}
							<ActionLink
								href="/channels/me/servers"
								variant="primary"
								size="sm"
								className="ml-4 rounded-full"
							>
								<PlusIcon aria-hidden="true" className="size-4" />
								Add server
							</ActionLink>
						</nav>
					</div>

					<div className="relative mb-5">
						<MagnifyingGlassIcon
							aria-hidden="true"
							className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zenth-subtle"
						/>
						<input
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search"
							aria-label="Search the personal space"
							className="h-9 w-full rounded-md border border-zenth-line bg-zenth-control pr-3 pl-9 text-sm text-zenth-default outline-none placeholder:text-zenth-subtle focus-visible:ring-2 focus-visible:ring-zenth-focus"
						/>
					</div>

					<div className="space-y-6">
						<section aria-labelledby="home-servers-heading">
							<div className="mb-2 flex items-center justify-between gap-3">
								<h2
									id="home-servers-heading"
									className="text-base font-semibold text-zenth-strong"
								>
									{searching ? "Servers" : "Your servers"}
									{searching && visibleServers.length > 0 && (
										<span className="ml-1.5 font-normal text-zenth-subtle">
											— {visibleServers.length}
										</span>
									)}
								</h2>
							</div>

							{visibleServers.length > 0 ? (
								<ul className="divide-y divide-zenth-line overflow-hidden rounded-lg border border-zenth-line bg-zenth-tint/30">
									{visibleServers.map((server) => (
										<li key={server.id}>
											<Link
												href={`/channels/${server.id}`}
												className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-zenth-tint"
											>
												<span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-zenth-line bg-zenth-tint text-sm font-semibold">
													{server.name.slice(0, 2).toUpperCase()}
												</span>
												<span className="min-w-0 flex-1">
													<span className="block truncate text-sm font-medium text-zenth-default">
														{server.name}
													</span>
													<span className="mt-0.5 flex flex-wrap gap-1.5">
														<StatusPill>
															{server.installation === "installed"
																? "Astron installed"
																: "Installation unknown"}
														</StatusPill>
														<StatusPill>
															{server.workspace === "available"
																? "Workspace available"
																: "Workspace unavailable"}
														</StatusPill>
													</span>
												</span>
												<ArrowRightIcon
													aria-hidden="true"
													className="size-4 shrink-0 text-zenth-subtle"
												/>
											</Link>
										</li>
									))}
								</ul>
							) : (
								<EmptyState
									icon={DiscordLogoIcon}
									title={
										searching
											? "No server matches your search"
											: "No servers listed yet"
									}
									description={
										searching
											? `Nothing matches “${query.trim()}”. Clear the search to see everything.`
											: serversQuery.isPending
												? "Loading the servers you can manage from Discord…"
												: (serversQuery.data?.reason ??
													"You are not an owner or administrator of any of your Discord servers.")
									}
									action={
										<ActionLink href="/channels/me/servers" size="sm">
											Browse servers
										</ActionLink>
									}
								/>
							)}
						</section>

						<section aria-labelledby="home-activity-heading">
							<div className="mb-2 flex items-center justify-between gap-3">
								<h2
									id="home-activity-heading"
									className="text-base font-semibold text-zenth-strong"
								>
									Recent activity
								</h2>
								<Link
									href="/channels/me/activity"
									className="inline-flex items-center gap-1 text-xs font-medium text-zenth-link hover:underline"
								>
									Full history
									<ArrowRightIcon aria-hidden="true" className="size-4" />
								</Link>
							</div>

							{MANAGER_ACTIVITY.length > 0 ? (
								<ul className="divide-y divide-zenth-line overflow-hidden rounded-lg border border-zenth-line">
									{MANAGER_ACTIVITY.slice(0, 5).map((event) => (
										<li
											key={event.id}
											className="flex items-center gap-3 px-3 py-2.5 text-sm text-zenth-default"
										>
											<ClockCounterClockwiseIcon
												aria-hidden="true"
												className="size-4 shrink-0 text-zenth-subtle"
											/>
											<span className="min-w-0 flex-1 truncate">
												{event.description}
											</span>
											<span className="shrink-0 text-xs text-zenth-subtle">
												{formatManagerDay(event.occurredAt)}
											</span>
										</li>
									))}
								</ul>
							) : (
								<div className="flex items-center gap-3 rounded-lg border border-zenth-line bg-zenth-base/40 px-3 py-3">
									<ClockCounterClockwiseIcon
										aria-hidden="true"
										className="size-4 shrink-0 text-zenth-subtle"
									/>
									<p className="min-w-0 flex-1 text-sm text-zenth-subtle">
										No activity yet. Account actions will appear here once the
										feed exists.
									</p>
								</div>
							)}
						</section>
					</div>
				</div>

				<aside
					className="min-w-0 space-y-4 xl:pt-13"
					aria-label="Account and shortcuts"
				>
					<Panel
						title="Your account"
						bodyClassName="p-4"
						className="shadow-none ring-0"
					>
						<div className="flex items-center gap-3">
							<ManagerAvatar
								image={user.image}
								name={user.displayName}
								size="md"
							/>
							<div className="min-w-0">
								<p className="truncate text-sm font-semibold text-zenth-strong">
									{user.displayName}
								</p>
								<p className="truncate text-xs text-zenth-subtle">
									{user.email}
								</p>
							</div>
						</div>
						<div className="mt-3 flex flex-wrap gap-1.5">
							<StatusPill tone={user.emailVerified ? "success" : "warning"}>
								{user.emailVerified ? "Email verified" : "Email unverified"}
							</StatusPill>
							<StatusPill tone={user.twoFactorEnabled ? "success" : "neutral"}>
								{user.twoFactorEnabled ? "2FA enabled" : "2FA off"}
							</StatusPill>
						</div>
						<div className="mt-4 grid gap-2">
							<ActionLink
								href="/channels/me/security"
								size="sm"
								className="w-full"
							>
								<ShieldCheckIcon aria-hidden="true" className="size-4" />
								Security
							</ActionLink>
							<ActionLink
								href="/profile"
								size="sm"
								variant="ghost"
								className="w-full"
							>
								View profile
							</ActionLink>
						</div>
					</Panel>

					<Panel
						title="Shortcuts"
						bodyClassName="p-2"
						className="shadow-none ring-0"
					>
						{visibleLinks.length > 0 ? (
							<ul className="space-y-0.5">
								{visibleLinks.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className="group flex items-start gap-2.5 rounded-md px-2 py-2 transition-colors outline-none hover:bg-zenth-tint focus-visible:ring-2 focus-visible:ring-zenth-focus"
										>
											<link.icon
												aria-hidden="true"
												className="mt-0.5 size-4 shrink-0 text-zenth-subtle group-hover:text-zenth-default"
											/>
											<span className="min-w-0">
												<span className="block truncate text-sm font-medium text-zenth-default">
													{link.label}
												</span>
												<span className="mt-0.5 block text-xs leading-relaxed text-zenth-subtle">
													{link.description}
												</span>
											</span>
										</Link>
									</li>
								))}
							</ul>
						) : (
							<p className="px-2 py-3 text-xs leading-relaxed text-zenth-subtle">
								No destination matches “{query.trim()}”.
							</p>
						)}
					</Panel>
				</aside>
			</div>
		</ManagerShell>
	);
}

export const getServerSideProps = personalSpacePageProps;
