import {
	BellIcon,
	CheckIcon,
	DiscordLogoIcon,
	LockKeyIcon,
	ShieldCheckIcon,
	UsersThreeIcon,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { MANAGER_NOTIFICATIONS } from "@/components/manager/data/contracts";
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

type InboxFilter = "all" | "unread";

const FILTERS: Array<{ id: InboxFilter; label: string }> = [
	{ id: "all", label: "All" },
	{ id: "unread", label: "Unread" },
];

const CATEGORIES = [
	{
		icon: BellIcon,
		label: "Platform",
		detail: "Astron Collection announcements.",
	},
	{
		icon: ShieldCheckIcon,
		label: "Account security",
		detail: "Sign-ins, session changes and recovery.",
	},
	{
		icon: LockKeyIcon,
		label: "Sign-in methods",
		detail: "Changes to external identities.",
	},
	{
		icon: DiscordLogoIcon,
		label: "Discord connection",
		detail: "Link and unlink events for Discord.",
	},
	{
		icon: UsersThreeIcon,
		label: "Servers & products",
		detail: "Server events and product updates.",
	},
];

export default function InboxPage({ user }: { user: ManagerUser }) {
	const [filter, setFilter] = useState<InboxFilter>("all");
	const notifications = useMemo(
		() =>
			filter === "unread"
				? MANAGER_NOTIFICATIONS.filter((notification) => !notification.read)
				: MANAGER_NOTIFICATIONS,
		[filter],
	);

	return (
		<ManagerShell user={user} title="Inbox">
			<PageHeader
				title="Inbox"
				description="Platform, account and server notifications, in one place."
				actions={
					<button
						type="button"
						disabled
						title="No notification service is connected"
						className={actionClass("secondary", "sm")}
					>
						<CheckIcon aria-hidden="true" className="size-4" />
						Mark all as read
					</button>
				}
			/>

			<Panel
				title="Notifications"
				description="Read state, category and timestamps come from the notification store."
				action={
					<div className="flex items-center gap-1 rounded-md border border-zenth-line bg-zenth-base p-0.5">
						{FILTERS.map((entry) => (
							<button
								key={entry.id}
								type="button"
								onClick={() => setFilter(entry.id)}
								aria-pressed={filter === entry.id}
								className={cn(
									"rounded px-2.5 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zenth-focus",
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
				{notifications.length > 0 ? (
					<ul className="divide-y divide-zenth-line">
						{notifications.map((notification) => (
							<li key={notification.id} className="py-3">
								<div className="flex items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="text-sm font-medium text-zenth-default">
											{notification.title}
										</p>
										<p className="mt-0.5 text-xs leading-relaxed text-zenth-subtle">
											{notification.body}
										</p>
									</div>
									{!notification.read && (
										<StatusPill tone="info">Unread</StatusPill>
									)}
								</div>
							</li>
						))}
					</ul>
				) : (
					<EmptyState
						icon={BellIcon}
						title={
							filter === "unread"
								? "No unread notifications"
								: "Your inbox is empty"
						}
						description="Notifications are not available on this deployment yet: there is no user-addressed notification store, so none are created or displayed."
						action={
							<ActionLink href="/channels/me/preferences" size="sm">
								Notification preferences
							</ActionLink>
						}
						note="The interface already handles read/unread state, categories, filtering and destinations; it will populate as soon as the store and its mark-as-read mutations exist."
					/>
				)}
			</Panel>

			<Panel
				className="mt-5"
				title="Notification categories"
				description="Categories the inbox is designed to separate."
			>
				<ul className="grid gap-3 sm:grid-cols-2">
					{CATEGORIES.map((category) => (
						<li
							key={category.label}
							className="flex items-start gap-3 rounded-lg border border-zenth-line bg-zenth-tint/60 p-3"
						>
							<category.icon
								aria-hidden="true"
								className="mt-0.5 size-4 shrink-0 text-zenth-subtle"
							/>
							<div>
								<p className="text-sm font-medium text-zenth-default">
									{category.label}
								</p>
								<p className="mt-0.5 text-xs leading-relaxed text-zenth-subtle">
									{category.detail}
								</p>
							</div>
						</li>
					))}
				</ul>
			</Panel>
		</ManagerShell>
	);
}

export const getServerSideProps = personalSpacePageProps;
