import {
	KeyIcon,
	PlugsConnectedIcon,
	PuzzlePieceIcon,
	ShieldCheckIcon,
} from "@phosphor-icons/react";
import { ManagerShell } from "@/components/manager/layout/manager-shell";
import { PageHeader } from "@/components/manager/layout/page-header";
import type { ManagerUser } from "@/components/manager/server";
import { personalSpacePageProps } from "@/components/manager/server";
import {
	ActionLink,
	EmptyState,
	Panel,
} from "@/components/manager/shared/states";

const INTEGRATION_RULES = [
	{
		icon: PuzzlePieceIcon,
		title: "Controlled manifests",
		detail:
			"An application declares its identity, requested scopes and destinations in a manifest. The Manager never executes application-supplied markup or scripts.",
	},
	{
		icon: KeyIcon,
		title: "Explicit authorizations",
		detail:
			"Granted permissions are per application and per account. Authorizing an application never grants server administration on its own.",
	},
	{
		icon: ShieldCheckIcon,
		title: "Independent from installations",
		detail:
			"An account-level application authorization is not a bot installation in a server, and the two are listed separately.",
	},
];

export default function ApplicationsPage({ user }: { user: ManagerUser }) {
	return (
		<ManagerShell user={user} title="Applications">
			<PageHeader
				title="Applications"
				description="Applications and integrations connected to your Astron account, separate from server-specific bot installations."
				actions={
					<ActionLink href="/channels/me/connections" variant="primary">
						Manage connections
					</ActionLink>
				}
			/>

			<Panel
				title="Connected applications"
				description="Authorizations owned by your account."
			>
				<EmptyState
					icon={PlugsConnectedIcon}
					title="No applications connected"
					description="No application has been authorized for this account. Astron products and third-party integrations will be listed here with their granted scopes."
					action={
						<ActionLink href="/channels/me/connections" size="sm">
							Review connections
						</ActionLink>
					}
					note="Application authorization is not available on this deployment yet: the account API exposes sign-in identities and sessions, not OAuth client grants."
				/>
			</Panel>

			<Panel
				className="mt-5"
				title="How integrations stay scoped"
				description="The architecture behind the application list."
			>
				<ul className="grid gap-3 sm:grid-cols-3">
					{INTEGRATION_RULES.map((rule) => (
						<li
							key={rule.title}
							className="rounded-lg border border-zenth-line bg-zenth-tint/60 p-3"
						>
							<rule.icon
								aria-hidden="true"
								className="size-4 text-zenth-subtle"
							/>
							<p className="mt-2 text-sm font-medium text-zenth-default">
								{rule.title}
							</p>
							<p className="mt-1 text-xs leading-relaxed text-zenth-subtle">
								{rule.detail}
							</p>
						</li>
					))}
				</ul>
			</Panel>
		</ManagerShell>
	);
}

export const getServerSideProps = personalSpacePageProps;
