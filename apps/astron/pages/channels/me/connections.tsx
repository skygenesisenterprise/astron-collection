"use client";

import type { Icon } from "@phosphor-icons/react";
import {
	DiscordLogoIcon,
	GithubLogoIcon,
	GoogleLogoIcon,
	PlugsConnectedIcon,
	ShieldCheckIcon,
	UsersThreeIcon,
} from "@phosphor-icons/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { formatManagerDay } from "@/components/manager/data/contracts";
import { ManagerShell } from "@/components/manager/layout/manager-shell";
import { PageHeader } from "@/components/manager/layout/page-header";
import {
	type ManagerUser,
	personalSpacePageProps,
} from "@/components/manager/server";
import {
	ActionLink,
	actionClass,
	EmptyState,
	ErrorState,
	LoadingState,
	Panel,
	StatusPill,
} from "@/components/manager/shared/states";
import { authClient } from "@/lib/auth-client";

const CALLBACK_URL = "/channels/me/connections";

const PROVIDERS: Array<{
	id: "discord" | "github" | "google";
	label: string;
	description: string;
	icon: Icon;
}> = [
	{
		id: "discord",
		label: "Discord",
		description:
			"External identity used to resolve which Discord servers you belong to. Linking it does not install an Astron bot or grant workspace rights.",
		icon: DiscordLogoIcon,
	},
	{
		id: "github",
		label: "GitHub",
		description: "Sign-in identity for repository access.",
		icon: GithubLogoIcon,
	},
	{
		id: "google",
		label: "Google",
		description: "Sign-in identity for Google accounts.",
		icon: GoogleLogoIcon,
	},
];

interface LinkedAccount {
	providerId: string;
	accountId?: string;
	createdAt?: string | Date | null;
}

function normalizeAccounts(data: unknown): LinkedAccount[] {
	const list = Array.isArray(data)
		? data
		: ((data && typeof data === "object" && "accounts" in data
				? (data as { accounts?: unknown }).accounts
				: null) ?? []);
	if (!Array.isArray(list)) return [];
	return list
		.filter(
			(entry): entry is LinkedAccount =>
				!!entry &&
				typeof entry === "object" &&
				typeof (entry as { providerId?: unknown }).providerId === "string",
		)
		.map((entry) => ({
			providerId: entry.providerId,
			accountId:
				typeof entry.accountId === "string" ? entry.accountId : undefined,
			createdAt: entry.createdAt ?? null,
		}));
}

export default function ConnectionsPage({ user }: { user: ManagerUser }) {
	const [accounts, setAccounts] = useState<LinkedAccount[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [busyProvider, setBusyProvider] = useState<string | null>(null);

	const loadAccounts = useCallback(async () => {
		setError(null);
		try {
			const { data, error: listError } = await authClient.listAccounts();
			if (listError) {
				setError(listError.message ?? "Could not load linked accounts.");
				setAccounts([]);
				return;
			}
			setAccounts(normalizeAccounts(data));
		} catch {
			setError("Could not load linked accounts.");
			setAccounts([]);
		}
	}, []);

	useEffect(() => {
		void loadAccounts();
	}, [loadAccounts]);

	const linkProvider = async (providerId: string) => {
		setBusyProvider(providerId);
		try {
			const { error: linkError } = await authClient.linkSocial({
				provider: providerId,
				callbackURL: CALLBACK_URL,
			});
			if (linkError) {
				toast.error(
					linkError.message ??
						`Could not start the ${providerId} connection. It may not be configured on this deployment.`,
				);
				return;
			}
		} catch (caught) {
			toast.error(
				caught instanceof Error
					? caught.message
					: `Could not start the ${providerId} connection.`,
			);
		} finally {
			setBusyProvider(null);
		}
	};

	const unlinkAccount = async (account: LinkedAccount) => {
		setBusyProvider(account.providerId);
		try {
			const { error: unlinkError } = await authClient.unlinkAccount({
				providerId: account.providerId,
				...(account.accountId ? { accountId: account.accountId } : {}),
			});
			if (unlinkError) {
				toast.error(unlinkError.message ?? "Could not unlink the account.");
				return;
			}
			toast.success("Connection removed");
			await loadAccounts();
		} catch {
			toast.error("Could not unlink the account.");
		} finally {
			setBusyProvider(null);
		}
	};

	const linked = accounts ?? [];
	const canUnlink = accounts !== null && linked.length > 1;

	return (
		<ManagerShell user={user} title="Connections">
			<PageHeader
				title="Connections"
				description="External identities linked to your Astron account, starting with Discord."
				actions={
					<ActionLink href="/channels/me/security" variant="primary">
						Security
					</ActionLink>
				}
			/>

			<Panel
				title="Linked identities"
				description="Only provider names and link dates are read; OAuth tokens never reach the browser."
			>
				{accounts === null ? (
					<LoadingState label="Loading connections…" />
				) : error ? (
					<ErrorState
						title="Could not load connections"
						description={error}
						onRetry={() => void loadAccounts()}
					/>
				) : (
					<ul className="divide-y divide-zenth-line">
						{PROVIDERS.map((provider) => {
							const account = linked.find(
								(entry) => entry.providerId === provider.id,
							);
							const isConnected = Boolean(account);
							const isBusy = busyProvider === provider.id;
							return (
								<li
									key={provider.id}
									className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between"
								>
									<div className="flex min-w-0 items-start gap-3">
										<span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-zenth-line bg-zenth-tint">
											<provider.icon
												aria-hidden="true"
												className="size-5 text-zenth-default"
											/>
										</span>
										<div className="min-w-0">
											<div className="flex flex-wrap items-center gap-2">
												<p className="text-sm font-medium text-zenth-strong">
													{provider.label}
												</p>
												<StatusPill tone={isConnected ? "success" : "neutral"}>
													{isConnected ? "Connected" : "Not connected"}
												</StatusPill>
											</div>
											<p className="mt-1 max-w-xl text-xs leading-relaxed text-zenth-subtle">
												{provider.description}
											</p>
											{account && (
												<p className="mt-1 text-xs text-zenth-subtle">
													{account.accountId
														? `Provider account ${account.accountId}`
														: "Provider account linked"}
													{account.createdAt
														? ` · linked ${formatManagerDay(account.createdAt)}`
														: ""}
												</p>
											)}
										</div>
									</div>

									<div className="flex shrink-0 items-center gap-2 sm:pt-1">
										{isConnected ? (
											<button
												type="button"
												onClick={() => {
													if (account) void unlinkAccount(account);
												}}
												disabled={isBusy || !canUnlink}
												title={
													canUnlink
														? undefined
														: "Keep at least one sign-in method linked"
												}
												className={actionClass("danger", "sm")}
											>
												{isBusy ? "Removing…" : "Unlink"}
											</button>
										) : (
											<button
												type="button"
												onClick={() => void linkProvider(provider.id)}
												disabled={isBusy}
												className={actionClass("secondary", "sm")}
											>
												{isBusy ? "Connecting…" : "Connect"}
											</button>
										)}
									</div>
								</li>
							);
						})}
					</ul>
				)}
			</Panel>

			{accounts !== null && linked.length === 0 && !error && (
				<Panel className="mt-5">
					<EmptyState
						icon={PlugsConnectedIcon}
						title="No external identity linked"
						description="You sign in with your credentials. Linking Discord adds an external identity; it does not change your server memberships or Astron authorizations by itself."
					/>
				</Panel>
			)}

			<Panel
				className="mt-5"
				title="What a connection is not"
				description="Three separate concepts that must not be merged."
			>
				<dl className="grid gap-3 sm:grid-cols-3">
					<div className="rounded-lg border border-zenth-line bg-zenth-tint/60 p-3">
						<dt className="flex items-center gap-2 text-sm font-medium text-zenth-default">
							<ShieldCheckIcon aria-hidden="true" className="size-4" />
							Astron identity
						</dt>
						<dd className="mt-1 text-xs leading-relaxed text-zenth-subtle">
							Your primary account. It exists without Discord.
						</dd>
					</div>
					<div className="rounded-lg border border-zenth-line bg-zenth-tint/60 p-3">
						<dt className="flex items-center gap-2 text-sm font-medium text-zenth-default">
							<DiscordLogoIcon aria-hidden="true" className="size-4" />
							Discord connection
						</dt>
						<dd className="mt-1 text-xs leading-relaxed text-zenth-subtle">
							An external identity. It does not prove bot installation.
						</dd>
					</div>
					<div className="rounded-lg border border-zenth-line bg-zenth-tint/60 p-3">
						<dt className="flex items-center gap-2 text-sm font-medium text-zenth-default">
							<UsersThreeIcon aria-hidden="true" className="size-4" />
							Server access
						</dt>
						<dd className="mt-1 text-xs leading-relaxed text-zenth-subtle">
							Evaluated per server, with its own authorization rules.
						</dd>
					</div>
				</dl>
			</Panel>
		</ManagerShell>
	);
}

export const getServerSideProps = personalSpacePageProps;
