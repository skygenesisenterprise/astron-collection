"use client";

import {
	ClockCounterClockwiseIcon,
	DeviceMobileIcon,
	EnvelopeSimpleIcon,
	MonitorIcon,
	ShieldCheckIcon,
	SignOutIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { formatManagerDate } from "@/components/manager/data/contracts";
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

function describeDevice(userAgent?: string | null) {
	if (!userAgent) return { label: "Unknown device", mobile: false };
	if (/mobile|android|iphone|ipad/i.test(userAgent)) {
		return { label: "Mobile device", mobile: true };
	}
	return { label: "Desktop browser", mobile: false };
}

export default function SecurityPage({ user }: { user: ManagerUser }) {
	const utils = api.useUtils();
	const sessionsQuery = api.user.listSessions.useQuery(undefined, {
		retry: false,
	});
	const revokeSession = api.user.revokeSession.useMutation({
		onSuccess: async () => {
			toast.success("Session revoked");
			await utils.user.listSessions.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Could not revoke the session");
		},
	});

	const sessions = sessionsQuery.data ?? [];

	return (
		<ManagerShell user={user} title="Security">
			<PageHeader
				title="Security"
				description="How you sign in, which sessions are active and what protects this account."
				actions={
					<ActionLink href="/reset-password" variant="primary">
						Reset password
					</ActionLink>
				}
			/>

			<div className="grid gap-4 sm:grid-cols-3">
				<Panel bodyClassName="p-4">
					<div className="flex items-center gap-2 text-xs text-zenth-subtle">
						<EnvelopeSimpleIcon aria-hidden="true" className="size-4" />
						Email
					</div>
					<p className="mt-2 text-sm font-medium text-zenth-strong">
						{user.email}
					</p>
					<StatusPill
						tone={user.emailVerified ? "success" : "warning"}
						className="mt-2"
					>
						{user.emailVerified ? "Verified" : "Not verified"}
					</StatusPill>
				</Panel>

				<Panel bodyClassName="p-4">
					<div className="flex items-center gap-2 text-xs text-zenth-subtle">
						<ShieldCheckIcon aria-hidden="true" className="size-4" />
						Two-factor authentication
					</div>
					<p className="mt-2 text-sm font-medium text-zenth-strong">
						{user.twoFactorEnabled ? "Enabled" : "Not enabled"}
					</p>
					<StatusPill
						tone={user.twoFactorEnabled ? "success" : "warning"}
						className="mt-2"
					>
						{user.twoFactorEnabled ? "Protected" : "Adds protection"}
					</StatusPill>
				</Panel>

				<Panel bodyClassName="p-4">
					<div className="flex items-center gap-2 text-xs text-zenth-subtle">
						<MonitorIcon aria-hidden="true" className="size-4" />
						Active sessions
					</div>
					<p className="mt-2 text-sm font-medium text-zenth-strong">
						{sessionsQuery.isLoading
							? "Loading…"
							: sessionsQuery.isError
								? "Unavailable"
								: sessions.length}
					</p>
					<StatusPill className="mt-2">
						{sessions.length === 1 ? "1 device" : `${sessions.length} devices`}
					</StatusPill>
				</Panel>
			</div>

			<Panel
				className="mt-5"
				title="Active sessions"
				description="Sessions are read from the authentication service. Revoking one signs that device out."
			>
				{sessionsQuery.isLoading ? (
					<LoadingState label="Loading sessions…" />
				) : sessionsQuery.isError ? (
					<ErrorState
						title="Could not load sessions"
						description="The session list is unavailable for this account right now."
						onRetry={() => void sessionsQuery.refetch()}
					/>
				) : sessions.length === 0 ? (
					<EmptyState
						icon={MonitorIcon}
						title="No active sessions found"
						description="This account has no sessions recorded in the current workspace context."
					/>
				) : (
					<ul className="divide-y divide-zenth-line">
						{sessions.map((session) => {
							const device = describeDevice(session.userAgent);
							const DeviceIcon = device.mobile ? DeviceMobileIcon : MonitorIcon;
							return (
								<li
									key={session.id}
									className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
								>
									<div className="flex min-w-0 items-start gap-3">
										<span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-zenth-line bg-zenth-tint">
											<DeviceIcon
												aria-hidden="true"
												className="size-4 text-zenth-default"
											/>
										</span>
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2">
												<p className="text-sm font-medium text-zenth-default">
													{device.label}
												</p>
												{session.isCurrent && (
													<StatusPill tone="success">
														Current session
													</StatusPill>
												)}
											</div>
											<p className="mt-0.5 truncate text-xs text-zenth-subtle">
												{session.ipAddress || "IP unavailable"} · started{" "}
												{formatManagerDate(session.createdAt)} · last active{" "}
												{formatManagerDate(session.updatedAt)}
											</p>
										</div>
									</div>
									<button
										type="button"
										onClick={() =>
											revokeSession.mutate({ sessionId: session.id })
										}
										disabled={
											session.isCurrent ||
											(revokeSession.isPending &&
												revokeSession.variables?.sessionId === session.id)
										}
										title={
											session.isCurrent
												? "Use sign out to end the current session"
												: "Revoke this session"
										}
										className={actionClass(
											"danger",
											"sm",
											"self-start sm:self-auto",
										)}
									>
										<SignOutIcon aria-hidden="true" className="size-4" />
										{session.isCurrent ? "Current" : "Revoke"}
									</button>
								</li>
							);
						})}
					</ul>
				)}
			</Panel>

			<Panel
				className="mt-5"
				title="Security events"
				description="Notable account changes, shown chronologically."
			>
				<EmptyState
					icon={ClockCounterClockwiseIcon}
					title="No security events recorded"
					description="A personal security event log is not available on this deployment yet. Sessions above are read directly from the authentication service."
				/>
			</Panel>

			<div className="mt-5 flex flex-wrap items-center gap-2">
				<ActionLink href="/channels/me/preferences" size="sm">
					Preferences
				</ActionLink>
				<ActionLink href="/channels/me/settings" size="sm" variant="ghost">
					Account settings
				</ActionLink>
			</div>
		</ManagerShell>
	);
}

export const getServerSideProps = personalSpacePageProps;
