import {
	ArrowRightIcon,
	ClockCounterClockwiseIcon,
	GearSixIcon,
	GlobeSimpleIcon,
	LinkSimpleIcon,
	ShieldCheckIcon,
	UserCircleIcon,
} from "@phosphor-icons/react";
import { formatManagerDay } from "@/components/manager/data/contracts";
import { ManagerShell } from "@/components/manager/layout/manager-shell";
import { PageHeader } from "@/components/manager/layout/page-header";
import type { ManagerUser } from "@/components/manager/server";
import { personalSpacePageProps } from "@/components/manager/server";
import {
	ActionLink,
	EmptyState,
	ManagerAvatar,
	Panel,
	StatusPill,
} from "@/components/manager/shared/states";

/**
 * The user's identity inside the Astron ecosystem.
 *
 * This page is intentionally separate from `/channels/me`: it shows the public
 * representation of the account, not account administration. Nothing private
 * beyond the signed-in user's own view is exposed, and no public profile route
 * exists yet.
 */
export default function ProfilePage({ user }: { user: ManagerUser }) {
	const accountName = user.email.split("@")[0] || user.id;

	return (
		<ManagerShell user={user} title="Profile">
			<PageHeader
				title="Your profile"
				description="How you appear in the Astron ecosystem. Account management stays in your Personal Space."
				actions={
					<ActionLink href="/channels/me/settings" variant="primary">
						<GearSixIcon aria-hidden="true" className="size-4" />
						Account settings
					</ActionLink>
				}
			/>

			<div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_19rem]">
				<div className="min-w-0 space-y-5">
					<Panel bodyClassName="p-0">
						<div className="h-24 rounded-t-xl bg-[radial-gradient(120%_140%_at_20%_0%,#1d3352_0%,#16233a_55%,#1b1e25_100%)]" />
						<div className="px-5 pb-5">
							<div className="-mt-8 flex flex-wrap items-end justify-between gap-3">
								<ManagerAvatar
									image={user.image}
									name={user.displayName}
									size="lg"
									className="ring-4 ring-zenth-elevated"
								/>
								<div className="mb-1 flex flex-wrap gap-1.5">
									<StatusPill tone={user.emailVerified ? "success" : "warning"}>
										{user.emailVerified ? "Verified account" : "Unverified"}
									</StatusPill>
									{user.twoFactorEnabled && (
										<StatusPill tone="success">2FA enabled</StatusPill>
									)}
								</div>
							</div>
							<h2 className="mt-3 text-lg font-semibold text-zenth-strong">
								{user.displayName}
							</h2>
							<p className="text-sm text-zenth-subtle">@{accountName}</p>
							<p className="mt-3 max-w-xl text-sm leading-relaxed text-zenth-subtle">
								Member since {formatManagerDay(user.createdAt)}. This profile is
								private: it is visible only to you until a public profile
								surface exists.
							</p>
						</div>
					</Panel>

					<Panel title="About" description="Biography and public links.">
						<EmptyState
							icon={GlobeSimpleIcon}
							title="No biography yet"
							description="A public biography, links and badges will appear here once profile editing is supported."
							action={
								<ActionLink href="/channels/me/settings" size="sm">
									Review account details
								</ActionLink>
							}
							note="Profile editing needs its own endpoint. The email address is kept in Account settings and is never part of the public profile."
						/>
					</Panel>
				</div>

				<aside className="min-w-0 space-y-4" aria-label="Profile details">
					<Panel title="Identity" bodyClassName="p-4">
						<ul className="space-y-3 text-sm">
							<li className="flex items-start gap-2.5">
								<UserCircleIcon
									aria-hidden="true"
									className="mt-0.5 size-4 shrink-0 text-zenth-subtle"
								/>
								<div className="min-w-0">
									<p className="text-xs text-zenth-subtle">Display name</p>
									<p className="truncate font-medium text-zenth-default">
										{user.displayName}
									</p>
								</div>
							</li>
							<li className="flex items-start gap-2.5">
								<LinkSimpleIcon
									aria-hidden="true"
									className="mt-0.5 size-4 shrink-0 text-zenth-subtle"
								/>
								<div className="min-w-0">
									<p className="text-xs text-zenth-subtle">Username</p>
									<p className="truncate font-medium text-zenth-default">
										@{accountName}
									</p>
								</div>
							</li>
							<li className="flex items-start gap-2.5">
								<ClockCounterClockwiseIcon
									aria-hidden="true"
									className="mt-0.5 size-4 shrink-0 text-zenth-subtle"
								/>
								<div>
									<p className="text-xs text-zenth-subtle">Member since</p>
									<p className="font-medium text-zenth-default">
										{formatManagerDay(user.createdAt)}
									</p>
								</div>
							</li>
							<li className="flex items-start gap-2.5">
								<ShieldCheckIcon
									aria-hidden="true"
									className="mt-0.5 size-4 shrink-0 text-zenth-subtle"
								/>
								<div>
									<p className="text-xs text-zenth-subtle">Visibility</p>
									<p className="font-medium text-zenth-default">Private</p>
								</div>
							</li>
						</ul>
					</Panel>

					<Panel title="Account" bodyClassName="p-2">
						<ul className="space-y-0.5">
							<li>
								<ActionLink
									href="/channels/me/settings"
									size="sm"
									variant="ghost"
									className="w-full justify-between"
								>
									Account settings
									<ArrowRightIcon aria-hidden="true" className="size-3.5" />
								</ActionLink>
							</li>
							<li>
								<ActionLink
									href="/channels/me/security"
									size="sm"
									variant="ghost"
									className="w-full justify-between"
								>
									Security
									<ArrowRightIcon aria-hidden="true" className="size-3.5" />
								</ActionLink>
							</li>
							<li>
								<ActionLink
									href="/channels/me/connections"
									size="sm"
									variant="ghost"
									className="w-full justify-between"
								>
									Connections
									<ArrowRightIcon aria-hidden="true" className="size-3.5" />
								</ActionLink>
							</li>
						</ul>
					</Panel>
				</aside>
			</div>
		</ManagerShell>
	);
}

export const getServerSideProps = personalSpacePageProps;
