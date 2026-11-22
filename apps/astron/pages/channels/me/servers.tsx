import {
	DiscordLogoIcon,
	PlugsConnectedIcon,
	ShieldCheckIcon,
	UsersThreeIcon,
} from "@phosphor-icons/react";
import { MANAGER_SERVERS } from "@/components/manager/data/contracts";
import { ManagerShell } from "@/components/manager/layout/manager-shell";
import { PageHeader } from "@/components/manager/layout/page-header";
import type { ManagerUser } from "@/components/manager/server";
import { personalSpacePageProps } from "@/components/manager/server";
import {
	ActionLink,
	EmptyState,
	Panel,
	StatusPill,
} from "@/components/manager/shared/states";

const SERVER_STATES = [
	{
		label: "Discord membership",
		detail: "Resolved from the guild list of the connected Discord identity.",
		state: "Not connected",
		tone: "neutral" as const,
	},
	{
		label: "Astron installation",
		detail: "Whether one of the Astron bots is present in the server.",
		state: "Unknown",
		tone: "neutral" as const,
	},
	{
		label: "Workspace availability",
		detail: "Whether Astron Manager exposes a workspace for this server.",
		state: "Unavailable",
		tone: "warning" as const,
	},
	{
		label: "Workspace authorization",
		detail: "Resolved server-side from the account and its role in the server.",
		state: "Unknown",
		tone: "neutral" as const,
	},
];

export default function MyServersPage({ user }: { user: ManagerUser }) {
	return (
		<ManagerShell user={user} title="My Servers">
			<PageHeader
				title="My servers"
				description="Discord servers your Astron account can reach. Membership, bot installation, workspace availability and authorization are checked separately."
				actions={
					<ActionLink href="/channels/me/connections" variant="primary">
						Manage Discord connection
					</ActionLink>
				}
			/>

			<Panel
				title="Server directory"
				description="Every server is listed with its own state, never with a single combined status."
			>
				<EmptyState
					icon={DiscordLogoIcon}
					title={
						MANAGER_SERVERS.status === "unavailable"
							? "No server directory connected"
							: "No servers found"
					}
					description={
						MANAGER_SERVERS.reason ??
						"Servers you can access on Discord will be listed here."
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
			</Panel>

			<div className="mt-5 grid gap-5 lg:grid-cols-3">
				<Panel className="lg:col-span-2" title="What each state means">
					<dl className="space-y-3">
						{SERVER_STATES.map((entry) => (
							<div
								key={entry.label}
								className="flex flex-col gap-2 rounded-lg border border-zenth-line bg-zenth-tint/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="min-w-0">
									<dt className="text-sm font-medium text-zenth-default">
										{entry.label}
									</dt>
									<dd className="mt-0.5 text-xs leading-relaxed text-zenth-subtle">
										{entry.detail}
									</dd>
								</div>
								<StatusPill
									tone={entry.tone}
									className="self-start sm:self-center"
								>
									{entry.state}
								</StatusPill>
							</div>
						))}
					</dl>
				</Panel>

				<Panel title="Missing backend capability">
					<div className="space-y-3 text-sm leading-relaxed text-zenth-subtle">
						<p>
							Listing servers requires a guild directory resolved from the
							Discord OAuth scopes, a bot registry and a workspace authorization
							rule.
						</p>
						<p>
							This deployment exposes the account and session APIs only, so the
							directory stays empty rather than showing invented servers.
						</p>
					</div>
					<ul className="mt-4 space-y-2 text-xs text-zenth-subtle">
						<li className="flex items-center gap-2">
							<UsersThreeIcon aria-hidden="true" className="size-4" />
							Guild membership from OAuth
						</li>
						<li className="flex items-center gap-2">
							<PlugsConnectedIcon aria-hidden="true" className="size-4" />
							Bot installation registry
						</li>
						<li className="flex items-center gap-2">
							<ShieldCheckIcon aria-hidden="true" className="size-4" />
							Workspace authorization policy
						</li>
					</ul>
				</Panel>
			</div>
		</ManagerShell>
	);
}

export const getServerSideProps = personalSpacePageProps;
