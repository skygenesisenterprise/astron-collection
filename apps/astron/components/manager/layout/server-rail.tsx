"use client";

import { ArrowsClockwiseIcon, PlusIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { api } from "@/utils/api";
import {
	type ManagerServersSnapshot,
	toManagerServer,
} from "../data/contracts";

/**
 * Persistent server rail.
 *
 * Every entry comes from the authenticated guild directory. Bot installations
 * are only enrichment and never decide which servers are listed. The query is
 * shared with the personal home and the server directory, so a refresh or a
 * permission change updates every surface.
 */
export function ServerRail({
	pathname,
	initialServers,
}: {
	pathname: string;
	initialServers?: ManagerServersSnapshot;
}) {
	const utils = api.useUtils();
	const query = api.discord.guilds.list.useQuery(undefined, {
		initialData: initialServers,
		refetchOnWindowFocus: true,
		staleTime: 30_000,
		retry: 1,
	});
	const sync = api.discord.guilds.sync.useMutation({
		onSuccess: async () => {
			await utils.discord.guilds.list.invalidate();
		},
	});

	const personalActive =
		pathname === "/channels/me" || pathname.startsWith("/channels/me/");
	const servers = (query.data?.servers ?? []).map(toManagerServer);
	const disconnected = query.data?.connection.linked === false;
	const loading = query.isPending && !query.data;
	const hasError = query.isError;

	return (
		<nav
			aria-label="Personal space and servers"
			className="hidden w-[92px] shrink-0 flex-col items-center gap-2 overflow-y-auto border-r border-zenth-line bg-zenth-canvas pt-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:flex"
		>
			<Link
				href="/channels/me"
				aria-label="Astron personal space"
				aria-current={personalActive ? "page" : undefined}
				title="Personal space"
				className={cn(
					"relative flex size-12 items-center justify-center rounded-2xl border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zenth-focus",
					personalActive
						? "border-zenth-line bg-zenth-interact"
						: "border-transparent bg-zenth-tint hover:bg-zenth-interact",
				)}
			>
				{personalActive && (
					<span
						aria-hidden="true"
						className="absolute top-1/2 -left-3 h-6 w-1 -translate-y-1/2 rounded-r-full bg-zenth-strong"
					/>
				)}
				{/* biome-ignore lint/performance/noImgElement: static brand asset, no optimisation needed */}
				<img src="/icon-dark.svg" alt="" className="size-7 object-contain" />
			</Link>

			<span aria-hidden="true" className="my-1 h-px w-8 bg-zenth-line" />

			{servers.map((server) => {
				const href = `/channels/${server.guildId}`;
				const active = pathname === href || pathname.startsWith(`${href}/`);
				return (
					<Link
						key={server.guildId}
						href={href}
						aria-label={`Open the ${server.name} workspace`}
						aria-current={active ? "page" : undefined}
						title={
							server.workspace === "available"
								? server.name
								: `${server.name} — workspace unavailable`
						}
						className={cn(
							"relative flex size-12 items-center justify-center overflow-hidden rounded-2xl border text-sm font-semibold transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zenth-focus",
							active
								? "border-zenth-line bg-zenth-interact text-zenth-strong"
								: "border-transparent bg-zenth-tint text-zenth-subtle hover:bg-zenth-interact hover:text-zenth-strong",
						)}
					>
						{active && (
							<span
								aria-hidden="true"
								className="absolute top-1/2 -left-3 h-6 w-1 -translate-y-1/2 rounded-r-full bg-zenth-strong"
							/>
						)}
						{server.iconUrl ? (
							// biome-ignore lint/performance/noImgElement: server icons come from Discord's CDN, next/image cannot optimise them
							<img
								src={server.iconUrl}
								alt=""
								className="size-full object-cover"
							/>
						) : (
							server.name.slice(0, 2).toUpperCase()
						)}
					</Link>
				);
			})}

			{loading && (
				<div
					role="status"
					aria-label="Loading servers"
					className="size-12 animate-pulse rounded-2xl bg-zenth-tint"
				/>
			)}

			{hasError && (
				<Link
					href="/channels/me/servers"
					title="Could not load servers — open the server directory to retry"
					aria-label="Could not load servers"
					className="flex size-12 items-center justify-center rounded-2xl border border-dashed border-zenth-danger/40 text-xs text-zenth-danger"
				>
					!
				</Link>
			)}

			<Link
				href="/channels/me/servers"
				aria-label={
					disconnected ? "Connect Discord to list servers" : "Add or browse Discord servers"
				}
				title={disconnected ? "Connect Discord" : "Add or browse servers"}
				className="flex size-12 items-center justify-center rounded-2xl border border-dashed border-zenth-line text-zenth-subtle transition-colors outline-none hover:border-zenth-strong/40 hover:text-zenth-strong focus-visible:ring-2 focus-visible:ring-zenth-focus"
			>
				<PlusIcon aria-hidden="true" className="size-5" />
			</Link>

			{query.data?.connection.linked && (
				<button
					type="button"
					onClick={() => sync.mutate()}
					disabled={sync.isPending}
					aria-label="Refresh server list"
					title={sync.isPending ? "Refreshing…" : "Refresh server list"}
					className="flex size-9 items-center justify-center rounded-xl text-zenth-subtle transition-colors outline-none hover:bg-zenth-tint hover:text-zenth-strong focus-visible:ring-2 focus-visible:ring-zenth-focus disabled:opacity-50"
				>
					<ArrowsClockwiseIcon
						aria-hidden="true"
						className={cn("size-4", sync.isPending && "animate-spin")}
					/>
				</button>
			)}

			{!loading && servers.length === 0 && (
				<p className="px-1 text-center text-[10px] leading-tight text-zenth-subtle">
					{disconnected ? "Connect Discord" : "No manageable servers"}
				</p>
			)}
		</nav>
	);
}
