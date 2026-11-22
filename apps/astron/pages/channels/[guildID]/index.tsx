import type {
	DiscordConnectionStatus,
	DiscordServerItem,
} from "@astron-collection/server/services/discord-guild-directory/contracts";
import {
	ArrowRightIcon,
	DiscordLogoIcon,
	PlugsConnectedIcon,
	ShieldCheckIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import type { ManagerUser } from "@/components/manager/server";
import { formatManagerDay } from "@/components/manager/data/contracts";
import { guildWorkspacePageProps } from "@/components/manager/guild-server";
import { ManagerShell } from "@/components/manager/layout/manager-shell";
import { PageHeader } from "@/components/manager/layout/page-header";
import {
	ActionLink,
	EmptyState,
	Panel,
	StatusPill,
} from "@/components/manager/shared/states";

/**
 * General server workspace.
 *
 * Access is decided on the server from the authenticated user's active Discord
 * membership and management permissions. No Astron bot installation is needed
 * to open this page; installations only decide which product workspaces appear.
 */
export default function GuildWorkspacePage({
	user,
	guild,
	connection,
}: {
	user: ManagerUser;
	guild: DiscordServerItem;
	connection: DiscordConnectionStatus;
}) {
	return (
		<ManagerShell user={user} title={guild.name}>
			<PageHeader
				title={guild.name}
				description="General server workspace. Access comes from your Discord membership and management rights, independently of any Astron bot installation."
				actions={
					<ActionLink href="/channels/me/servers" size="sm">
						Server directory
					</ActionLink>
				}
			/>

			<Panel
				title="Server identity"
				description="Snowflake ids are kept as strings so Discord permissions and guild ids never lose precision."
			>
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
					<span className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zenth-line bg-zenth-tint text-base font-semibold">
						{guild.icon ? (
							// biome-ignore lint/performance/noImgElement: Discord CDN images cannot be optimised by next/image
							<img
								src={guild.icon}
								alt=""
								className="size-full object-cover"
							/>
						) : (
							guild.name.slice(0, 2).toUpperCase()
						)}
					</span>
					<div className="min-w-0 flex-1">
						<p className="text-sm font-medium text-zenth-strong">
							{guild.name}
						</p>
						<p className="mt-0.5 truncate font-mono text-xs text-zenth-subtle">
							Guild ID {guild.guildId}
						</p>
					</div>
					<div className="flex flex-wrap gap-2">
						<StatusPill tone="success">Workspace available</StatusPill>
						<StatusPill tone="info">
							{guild.permissions.isOwner
								? "Discord owner"
								: guild.authorization === "administrator"
									? "Administrator"
									: "Manage Server"}
						</StatusPill>
						<StatusPill>
							{guild.installation === "installed"
								? "Astron installed"
								: "No bot installed"}
						</StatusPill>
					</div>
				</div>
				<dl className="mt-5 grid gap-3 sm:grid-cols-3">
					<div className="rounded-lg border border-zenth-line bg-zenth-tint/60 px-3 py-2.5">
						<dt className="text-xs text-zenth-subtle">Discord membership</dt>
						<dd className="mt-0.5 text-sm font-medium text-zenth-default">
							Active member
						</dd>
					</div>
					<div className="rounded-lg border border-zenth-line bg-zenth-tint/60 px-3 py-2.5">
						<dt className="text-xs text-zenth-subtle">Permission bitfield</dt>
						<dd className="mt-0.5 truncate font-mono text-xs text-zenth-default">
							{guild.permissions.raw || "0"}
						</dd>
					</div>
					<div className="rounded-lg border border-zenth-line bg-zenth-tint/60 px-3 py-2.5">
						<dt className="text-xs text-zenth-subtle">Last Discord sync</dt>
						<dd className="mt-0.5 text-xs text-zenth-default">
							{formatManagerDay(connection.lastSuccessfulSyncAt)}
						</dd>
					</div>
				</dl>
			</Panel>

			<Panel
				className="mt-5"
				title="Product workspaces"
				description="A product module is available only when it is installed in this guild and your Astron account is authorized to manage it."
			>
				{guild.products.length === 0 ? (
					<EmptyState
						icon={PlugsConnectedIcon}
						title="No Astron products installed"
						description="The general workspace is still available. Install a bot in Discord to unlock its product workspace here."
						action={
							<ActionLink
								href="https://astron-collection.com/#products"
								size="sm"
								variant="ghost"
							>
								Explore Astron products
							</ActionLink>
						}
						note="Bot installation is a separate OAuth flow and is never required to list this server in the rail."
					/>
				) : (
					<ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
						{guild.products.map((product) => (
							<li
								key={product.id}
								className="rounded-lg border border-zenth-line bg-zenth-tint/50 p-4"
							>
								<div className="flex items-center gap-2">
									<ShieldCheckIcon
										aria-hidden="true"
										className="size-4 text-zenth-subtle"
									/>
									<span className="text-sm font-medium text-zenth-strong">
										{product.name}
									</span>
								</div>
								<p className="mt-1.5 text-xs text-zenth-subtle">
									{product.installed && product.enabled
										? `Installed · runtime ${product.runtimeState ?? "unknown"}`
										: "Installation is disabled in the registry."}
								</p>
								<Link
									href={`/channels/${guild.guildId}/${product.id}`}
									className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-zenth-link hover:underline"
								>
									Open workspace
									<ArrowRightIcon aria-hidden="true" className="size-3" />
								</Link>
							</li>
						))}
					</ul>
				)}
			</Panel>

			<p className="mt-4 flex items-center gap-2 text-xs text-zenth-subtle">
				<DiscordLogoIcon aria-hidden="true" className="size-4" />
				Authorization is rechecked for every server-scoped request. A
				disconnected Discord account cannot open this workspace.
			</p>
		</ManagerShell>
	);
}

export const getServerSideProps = guildWorkspacePageProps;
