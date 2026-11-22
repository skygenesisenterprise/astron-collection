"use client";

import {
	CopyIcon,
	EnvelopeSimpleIcon,
	LifebuoyIcon,
	LockKeyIcon,
	UserCircleIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { formatManagerDay } from "@/components/manager/data/contracts";
import { ManagerShell } from "@/components/manager/layout/manager-shell";
import { PageHeader } from "@/components/manager/layout/page-header";
import type { ManagerUser } from "@/components/manager/server";
import { personalSpacePageProps } from "@/components/manager/server";
import {
	ActionLink,
	actionClass,
	ManagerAvatar,
	Panel,
	StatusPill,
} from "@/components/manager/shared/states";

export default function AccountSettingsPage({ user }: { user: ManagerUser }) {
	const copyAccountId = async () => {
		try {
			await navigator.clipboard.writeText(user.id);
			toast.success("Account ID copied");
		} catch {
			toast.error("Could not copy the account ID");
		}
	};

	return (
		<ManagerShell user={user} title="Account Settings">
			<PageHeader
				title="Account settings"
				description="The Astron account is the primary identity. Discord is an external connection, never the account itself."
				actions={
					<ActionLink href="/profile" variant="primary">
						View profile
					</ActionLink>
				}
			/>

			<Panel title="Account information">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center">
					<ManagerAvatar image={user.image} name={user.displayName} size="lg" />
					<div className="min-w-0">
						<p className="text-base font-semibold text-zenth-strong">
							{user.displayName}
						</p>
						<p className="text-sm text-zenth-subtle">{user.email}</p>
					</div>
				</div>

				<dl className="mt-5 grid gap-3 sm:grid-cols-2">
					<div className="rounded-lg border border-zenth-line bg-zenth-tint/60 px-3 py-2.5">
						<dt className="text-xs text-zenth-subtle">Display name</dt>
						<dd className="mt-0.5 truncate text-sm font-medium text-zenth-default">
							{user.displayName}
						</dd>
					</div>
					<div className="rounded-lg border border-zenth-line bg-zenth-tint/60 px-3 py-2.5">
						<dt className="text-xs text-zenth-subtle">Member since</dt>
						<dd className="mt-0.5 text-sm font-medium text-zenth-default">
							{formatManagerDay(user.createdAt)}
						</dd>
					</div>
					<div className="rounded-lg border border-zenth-line bg-zenth-tint/60 px-3 py-2.5 sm:col-span-2">
						<dt className="text-xs text-zenth-subtle">Account ID</dt>
						<dd className="mt-0.5 flex items-center gap-2">
							<code className="min-w-0 flex-1 truncate text-xs text-zenth-default">
								{user.id}
							</code>
							<button
								type="button"
								onClick={() => void copyAccountId()}
								className={actionClass("ghost", "sm", "shrink-0")}
							>
								<CopyIcon aria-hidden="true" className="size-4" />
								Copy
							</button>
						</dd>
					</div>
				</dl>
			</Panel>

			<div className="mt-5 grid gap-5 lg:grid-cols-2">
				<Panel title="Email address">
					<div className="flex items-start gap-3">
						<EnvelopeSimpleIcon
							aria-hidden="true"
							className="mt-0.5 size-4 shrink-0 text-zenth-subtle"
						/>
						<div className="min-w-0 flex-1">
							<p className="truncate text-sm font-medium text-zenth-default">
								{user.email}
							</p>
							<div className="mt-1.5">
								<StatusPill tone={user.emailVerified ? "success" : "warning"}>
									{user.emailVerified ? "Verified" : "Not verified"}
								</StatusPill>
							</div>
							<p className="mt-2 text-xs leading-relaxed text-zenth-subtle">
								Changing the address requires the email verification flow, which
								this deployment does not expose from the Personal Space yet.
							</p>
						</div>
					</div>
				</Panel>

				<Panel title="Password & sign-in">
					<div className="flex items-start gap-3">
						<LockKeyIcon
							aria-hidden="true"
							className="mt-0.5 size-4 shrink-0 text-zenth-subtle"
						/>
						<div className="min-w-0 flex-1">
							<p className="text-sm font-medium text-zenth-default">Password</p>
							<p className="mt-1 text-xs leading-relaxed text-zenth-subtle">
								Password changes go through the account recovery flow, which
								already exists and revokes other sessions after a reset.
							</p>
							<div className="mt-3 flex flex-wrap gap-2">
								<ActionLink href="/reset-password" size="sm">
									Reset password
								</ActionLink>
								<ActionLink
									href="/channels/me/security"
									size="sm"
									variant="ghost"
								>
									Active sessions
								</ActionLink>
							</div>
						</div>
					</div>
				</Panel>
			</div>

			<Panel
				className="mt-5"
				title="Identity"
				description="Account management and public representation are deliberately separate."
			>
				<div className="flex flex-wrap items-center gap-2">
					<ActionLink href="/profile" size="sm">
						<UserCircleIcon aria-hidden="true" className="size-4" />
						Public profile
					</ActionLink>
					<ActionLink href="/channels/me/connections" size="sm" variant="ghost">
						Connections
					</ActionLink>
					<ActionLink href="/channels/me/preferences" size="sm" variant="ghost">
						Preferences
					</ActionLink>
				</div>
			</Panel>

			<Panel
				className="mt-5 border-zenth-danger/30"
				title="Danger zone"
				description="Deleting an account is a destructive, irreversible operation."
			>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<p className="max-w-xl text-xs leading-relaxed text-zenth-subtle">
						Account deletion is not wired to the Personal Space on this
						deployment. Contact support so an operator can process it with the
						existing administrative tools.
					</p>
					<ActionLink
						href="https://astron-collection.com/community"
						external
						size="sm"
						variant="danger"
						className="shrink-0"
					>
						<LifebuoyIcon aria-hidden="true" className="size-4" />
						Contact support
					</ActionLink>
				</div>
			</Panel>
		</ManagerShell>
	);
}

export const getServerSideProps = personalSpacePageProps;
