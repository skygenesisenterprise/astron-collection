import { PlusIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MANAGER_SERVERS } from "../data/contracts";

/**
 * Persistent server rail.
 *
 * The Personal Space entry is always present. Server entries come exclusively
 * from the guild directory contract; because this deployment has no directory
 * yet, the rail renders the empty state affordance instead of placeholder
 * servers. Adding a real source only means filling `MANAGER_SERVERS.servers`.
 */
export function ServerRail({ pathname }: { pathname: string }) {
	const personalActive =
		pathname === "/channels/me" || pathname.startsWith("/channels/me/");

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

			{MANAGER_SERVERS.servers.map((server) => {
				const href = `/channels/${server.id}`;
				const active = pathname === href || pathname.startsWith(`${href}/`);
				return (
					<Link
						key={server.id}
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

			<Link
				href="/channels/me/servers"
				aria-label="Add or browse Discord servers"
				title="Add or browse servers"
				className="flex size-12 items-center justify-center rounded-2xl border border-dashed border-zenth-line text-zenth-subtle transition-colors outline-none hover:border-zenth-strong/40 hover:text-zenth-strong focus-visible:ring-2 focus-visible:ring-zenth-focus"
			>
				<PlusIcon aria-hidden="true" className="size-5" />
			</Link>
		</nav>
	);
}
