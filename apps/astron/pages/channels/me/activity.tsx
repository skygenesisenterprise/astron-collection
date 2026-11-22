import {
	ClockCounterClockwiseIcon,
	DiscordLogoIcon,
	PlugsConnectedIcon,
	ShieldCheckIcon,
	UserCircleIcon,
	UsersThreeIcon,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import type { ActivityCategory } from "@/components/manager/data/contracts";
import { MANAGER_ACTIVITY } from "@/components/manager/data/contracts";
import { ManagerShell } from "@/components/manager/layout/manager-shell";
import { PageHeader } from "@/components/manager/layout/page-header";
import type { ManagerUser } from "@/components/manager/server";
import { personalSpacePageProps } from "@/components/manager/server";
import {
	ActionLink,
	actionClass,
	EmptyState,
	Panel,
	StatusPill,
} from "@/components/manager/shared/states";
import { cn } from "@/lib/utils";

type ActivityFilter = "all" | ActivityCategory;

const FILTERS: Array<{ id: ActivityFilter; label: string }> = [
	{ id: "all", label: "All" },
	{ id: "account", label: "Account" },
	{ id: "security", label: "Security" },
	{ id: "discord", label: "Discord" },
	{ id: "workspace", label: "Workspaces" },
	{ id: "application", label: "Applications" },
];

const CATEGORY_ICONS: Record<ActivityCategory, typeof UserCircleIcon> = {
	account: UserCircleIcon,
	security: ShieldCheckIcon,
	discord: DiscordLogoIcon,
	workspace: UsersThreeIcon,
	application: PlugsConnectedIcon,
};

export default function RecentActivityPage({ user }: { user: ManagerUser }) {
	const [filter, setFilter] = useState<ActivityFilter>("all");
	const events = useMemo(
		() =>
			filter === "all"
				? MANAGER_ACTIVITY
				: MANAGER_ACTIVITY.filter((event) => event.category === filter),
		[filter],
	);

	return (
		<ManagerShell user={user} title="Recent Activity">
			<PageHeader
				title="Recent activity"
				description="A chronological record of actions taken with your Astron account."
				actions={
					<ActionLink href="/channels/me/security" variant="primary">
						Security
					</ActionLink>
				}
			/>

			<Panel
				title="Activity"
				description="Only events recorded for this account are shown."
				action={
					<div className="flex flex-wrap items-center gap-1">
						{FILTERS.map((entry) => (
							<button
								key={entry.id}
								type="button"
								onClick={() => setFilter(entry.id)}
								aria-pressed={filter === entry.id}
								className={cn(
									"rounded px-2 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zenth-focus",
									filter === entry.id
										? "bg-zenth-interact text-zenth-strong"
										: "text-zenth-subtle hover:text-zenth-default",
								)}
							>
								{entry.label}
							</button>
						))}
					</div>
				}
			>
				{events.length > 0 ? (
					<ol className="relative space-y-4 border-l border-zenth-line pl-4">
						{events.map((event) => {
							const Icon = CATEGORY_ICONS[event.category];
							return (
								<li key={event.id} className="relative">
									<span className="absolute top-2 -left-[25px] flex size-4 items-center justify-center rounded-full border border-zenth-line bg-zenth-elevated">
										<Icon
											aria-hidden="true"
											className="size-2.5 text-zenth-subtle"
										/>
									</span>
									<p className="text-sm text-zenth-default">
										{event.description}
									</p>
									<p className="mt-0.5 text-xs text-zenth-subtle">
										{event.occurredAt}
									</p>
								</li>
							);
						})}
					</ol>
				) : (
					<EmptyState
						icon={ClockCounterClockwiseIcon}
						title={
							filter === "all"
								? "No activity recorded"
								: `No ${filter} activity`
						}
						description="Personal activity is not recorded on this deployment yet. Account changes, connections, sign-ins and workspace access will be listed here once the feed exists."
						action={
							<ActionLink href="/channels/me/security" size="sm">
								Review sessions
							</ActionLink>
						}
						note="Session data on the Security page is real; this feed needs its own append-only event table, scoped to the account rather than to an organization."
					/>
				)}
			</Panel>

			<Panel className="mt-5" title="What will be tracked">
				<div className="flex flex-wrap gap-2">
					<StatusPill>Account changes</StatusPill>
					<StatusPill>Sign-ins & sessions</StatusPill>
					<StatusPill>Discord connections</StatusPill>
					<StatusPill>Workspace access</StatusPill>
					<StatusPill>Application authorizations</StatusPill>
				</div>
				<p className="mt-3 text-xs leading-relaxed text-zenth-subtle">
					Events will respect account privacy and access control. Organization
					audit logs stay in their workspace and are not merged into the
					personal feed.
				</p>
				<button
					type="button"
					disabled
					className={actionClass("ghost", "sm", "mt-3")}
				>
					Export history
				</button>
			</Panel>
		</ManagerShell>
	);
}

export const getServerSideProps = personalSpacePageProps;
