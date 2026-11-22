"use client";

import {
	ArrowsClockwiseIcon,
	DiscordLogoIcon,
	PlugsConnectedIcon,
	ShieldCheckIcon,
	UsersThreeIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { toManagerServer, formatManagerDay } from "@/components/manager/data/contracts";
import { ManagerShell } from "@/components/manager/layout/manager-shell";
import { PageHeader } from "@/components/manager/layout/page-header";
import type { ManagerUser } from "@/components/manager/server";
import { personalSpacePageProps } from "@/components/manager/server";
import {
	ActionLink,
	actionClass,
	EmptyState,
	ErrorState,
	LoadingState,
	Panel,
	StatusPill,
} from "@/components/manager/shared/states";
import { api } from "@/utils/api";

const SERVER_STATES = [
	{
		label: "Discord membership",
		detail: "Resolved from the guild list of the connected Discord identity.",
	},
	{
		label: "Discord permissions",
		detail: "Owner, Administrator or Manage Server is required for a workspace.",
	},
	{
		label: "Astron installation",
		detail: "Enrichment from the installation registry; never a listing filter.",
	},
	{
		label: "Workspace authorization",
		detail: "Rechecked server-side for every server-scoped operation.",
	},
];

export default function MyServersPage({ user }: { user: ManagerUser }) {
	const utils = api.useUtils();
	const query = api.discord.guilds.list.useQuery(undefined, {
		refetchOnWindowFocus: true,
		staleTime: 30_000,
	});
	const sync = api.discord.guilds.sync.useMutation({
		onSuccess: async () => {
			await utils.discord.guilds.list.invalidate();
			await utils.discord.guilds.syncStatus.invalidate();
		},
	});
	const servers = (query.data?.servers ?? []).map(toManagerServer);
	const connection = query.data?.connection;
	const lastSync = formatManagerDay(
		connection?.lastSuccessfulSyncAt ?? null,
	);

	return (
		<ManagerShell user={user} title="My Servers">
			<PageHeader
				title="My servers"
				description="Discord servers your Astron account can manage. Membership, permissions, bot installation and authorization stay separate."
				actions={
					<ActionLink href="/channels/me/connections" variant="primary">
						Manage Discord connection
					</ActionLink>
				}
			/>

			<Panel
				title="Connection & synchronization"
				description="Guilds are read with your OAuth guilds scope. OAuth tokens never leave the server."
				action={
					<button
						type="button"
						onClick={() => sync.mutate()}
						disabled={sync.isPending || !connection?.linked}
						className={actionClass("secondary", "sm")}
					>
						<ArrowsClockwiseIcon
							aria-hidden="true"
							className={sync.isPending ? "animate-spin" : undefined}
						/>
						{sync.isPending ? "Syncing…" : "Sync now"}
					</button>
				}
			>
				{query.isPending ? (
					<LoadingState label="Loading your Discord connection…" />
				) : (
					<div className="flex flex-wrap items-center gap-3">
						<StatusPill tone={connection?.linked ? "success" : "neutral"}>
							{connection?.linked ? "Discord connected" : "Discord not connected"}
						</StatusPill>
						<StatusPill
							tone={
								connection?.status === "error"
									? "danger"
									: connection?.status === "syncing"
										? "info"
										: "neutral"
							}
						>
							{connection?.status ?? "unknown"}
						</StatusPill>
						<span className="text-xs text-zenth-subtle">
							{connection?.linked
								? `Last successful sync: ${lastSync}`
								: "Link Discord to populate the server rail."}
						</span>
						{connection?.linkedAt && (
							<span className="text-xs text-zenth-subtle">
								Linked {formatManagerDay(connection.linkedAt)}
							</span>
						)}
					</div>
				)}
				{sync.isError && (
					<p role="alert" className="mt-3 text-xs text-zenth-danger">
						{sync.error.message}
					</p>
				)}
			</Panel>

			<Panel
				className="mt-5"
				title="Server directory"
				description="Every manageable Discord server appears here, with or without an Astron bot."
			>
				{query.isPending ? (
					<LoadingState label="Loading servers…" />
				) : query.isError ? (
					<ErrorState
						title="Could not load servers"
						description={query.error.message}
						onRetry={() => void query.refetch()}
					/>
				) : servers.length === 0 ? (
					<EmptyState
						icon={DiscordLogoIcon}
						title={connection?.linked ? "No manageable servers" : "No Discord connection"}
						description={
							query.data?.reason ??
							"You are not an owner or administrator of any of your Discord servers."
						}
						action={
							<>
								<ActionLink href="/channels/me/connections" size="sm">
									Connection settings
								</ActionLink>
								<ActionLink href="/channels/me/apps" size="sm" variant="ghost">
									Applications
								</ActionLink>
							</>
						}
						note="Being a member of a Discord server does not grant Astron administration rights, and an OAuth connection does not prove that a bot is installed."
					/>
				) : (
					<ul className="divide-y divide-zenth-line">
						{servers.map((server) => (
							<li
								key={server.guildId}
								className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="flex min-w-0 items-center gap-3">
									<span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zenth-line bg-zenth-tint text-sm font-semibold">
										{server.iconUrl ? (
											// biome-ignore lint/performance/noImgElement: Discord CDN images cannot be optimised by next/image
											<img
												src={server.iconUrl}
												alt=""
												className="size-full object-cover"
											/>
										) : (
											server.name.slice(0, 2).toUpperCase()
										)}
									</span>
									<div className="min-w-0">
										<Link
											href={`/channels/${server.guildId}`}
											className="truncate text-sm font-medium text-zenth-strong hover:underline"
										>
											{server.name}
										</Link>
										<p className="mt-0.5 text-xs text-zenth-subtle">
											{server.permissions.isOwner
												? "Owner"
												: server.authorization === "administrator"
													? "Administrator"
													: "Manage Server"}
											{server.products.length > 0
												? ` · ${server.products.filter((product) => product.installed).length} product(s) installed`
												: " · no Astron products installed"}
										</p>
									</div>
								</div>
								<div className="flex shrink-0 flex-wrap items-center gap-2">
									<StatusPill tone={server.workspaceAccessible ? "success" : "warning"}>
										{server.workspaceAccessible
											? "Workspace available"
											: "Workspace unavailable"}
									</StatusPill>
									<StatusPill
										tone={
											server.installation === "installed" ? "info" : "neutral"
										}
									>
										{server.installation === "installed"
											? "Astron installed"
											: "No bot installed"}
									</StatusPill>
									<ActionLink
										href={`/channels/${server.guildId}`}
										size="sm"
										variant="ghost"
									>
										Open
									</ActionLink>
								</div>
							</li>
						))}
					</ul>
				)}
			</Panel>

			<div className="mt-5 grid gap-5 lg:grid-cols-3">
				<Panel className="lg:col-span-2" title="What each state means">
					<dl className="space-y-3">
						{SERVER_STATES.map((entry) => (
							<div
								key={entry.label}
								className="rounded-lg border border-zenth-line bg-zenth-tint/60 px-3 py-2.5"
							>
								<dt className="text-sm font-medium text-zenth-default">
									{entry.label}
								</dt>
								<dd className="mt-0.5 text-xs leading-relaxed text-zenth-subtle">
									{entry.detail}
								</dd>
							</div>
						))}
					</dl>
				</Panel>

				<Panel title="Four independent questions">
					<ul className="space-y-3 text-xs leading-relaxed text-zenth-subtle">
						<li className="flex items-center gap-2">
							<UsersThreeIcon aria-hidden="true" className="size-4" />
							Are you still a member of this Discord server?
						</li>
						<li className="flex items-center gap-2">
							<ShieldCheckIcon aria-hidden="true" className="size-4" />
							Do you own it or hold a management permission?
						</li>
						<li className="flex items-center gap-2">
							<PlugsConnectedIcon aria-hidden="true" className="size-4" />
							Which products are installed (registry only)?
						</li>
						<li className="flex items-center gap-2">
							<DiscordLogoIcon aria-hidden="true" className="size-4" />
							Is the workspace allowed for this account?
						</li>
					</ul>
				</Panel>
			</div>
		</ManagerShell>
	);
}

export const getServerSideProps = personalSpacePageProps;
