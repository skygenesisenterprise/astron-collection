import { LOGIN_PATH } from "@astron-collection/server/services/onboarding-paths";
import { ArrowLeftIcon, DiscordLogoIcon } from "@phosphor-icons/react";
import type { GetServerSidePropsContext } from "next";
import Head from "next/head";
import type { ManagerUser } from "@/components/manager/server";
import { resolveManagerSession } from "@/components/manager/server";
import { ActionLink, StatusPill } from "@/components/manager/shared/states";

/**
 * Server workspace entry point.
 *
 * The route exists so the rail and every server link have a destination, but
 * no guild directory, bot registry or workspace authorization model exists in
 * this deployment. Rather than rendering a fake administration interface, the
 * page states exactly what is missing and sends the user back to the Personal
 * Space.
 */
export default function GuildWorkspacePage({
	user,
	guildId,
}: {
	user: ManagerUser;
	guildId: string;
}) {
	return (
		<main
			data-zenth-mode="dark"
			className="flex min-h-svh items-center justify-center bg-zenth-base px-4 py-16 text-zenth-default"
		>
			<Head>
				<title>Server workspace | Astron Collection</title>
				<meta name="robots" content="noindex" />
			</Head>

			<div className="w-full max-w-lg rounded-xl border border-zenth-line bg-zenth-elevated p-6">
				<div className="flex items-center gap-3">
					<span className="flex size-11 items-center justify-center rounded-lg border border-zenth-line bg-zenth-tint">
						<DiscordLogoIcon
							aria-hidden="true"
							className="size-5 text-zenth-subtle"
						/>
					</span>
					<div className="min-w-0">
						<h1 className="text-base font-semibold text-zenth-strong">
							Server workspace
						</h1>
						<p className="truncate text-xs text-zenth-subtle">
							Guild ID {guildId || "unknown"}
						</p>
					</div>
					<StatusPill tone="warning" className="ml-auto shrink-0">
						Unavailable
					</StatusPill>
				</div>

				<p className="mt-4 text-sm leading-relaxed text-zenth-subtle">
					This deployment cannot open a workspace for this server yet. Astron
					Manager needs a Discord guild directory, a bot installation registry
					and an authorization rule for this account before it can expose server
					modules.
				</p>

				<p className="mt-3 text-xs leading-relaxed text-zenth-subtle">
					Signed in as {user.displayName}. Nothing is assumed about your
					membership, installation or administration rights from the URL alone.
				</p>

				<div className="mt-5">
					<ActionLink href="/channels/me" variant="primary" size="sm">
						<ArrowLeftIcon aria-hidden="true" className="size-4" />
						Back to personal space
					</ActionLink>
				</div>
			</div>
		</main>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const user = await resolveManagerSession(context);
	if (!user) {
		return { redirect: { destination: LOGIN_PATH, permanent: false } };
	}

	const rawGuildId = context.params?.guildID;
	const guildId = Array.isArray(rawGuildId)
		? rawGuildId[0]
		: (rawGuildId ?? "");

	return { props: { user, guildId } };
}
