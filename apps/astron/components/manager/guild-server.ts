import {
	authorizeGuildWorkspace,
	authorizeProductWorkspace,
} from "@astron-collection/server/services/discord-guild-directory";
import type {
	DiscordConnectionStatus,
	DiscordServerItem,
	DiscordServerProduct,
} from "@astron-collection/server/services/discord-guild-directory/contracts";
import { LOGIN_PATH } from "@astron-collection/server/services/onboarding-paths";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { type ManagerUser, resolveManagerSession } from "./server";

/**
 * Server-side authorization for `/channels/{guildId}`.
 *
 * Unauthenticated visitors keep the existing 307 to `/login`. A signed-in user
 * who is not allowed to administer the guild receives a 404, so a guild id is
 * never confirmed to exist for a different Astron account.
 */
export async function guildWorkspacePageProps(
	context: GetServerSidePropsContext,
): Promise<
	GetServerSidePropsResult<{
		user: ManagerUser;
		guild: DiscordServerItem;
		connection: DiscordConnectionStatus;
	}>
> {
	const user = await resolveManagerSession(context);
	if (!user) {
		return { redirect: { destination: LOGIN_PATH, permanent: false } };
	}

	const rawGuildId = context.params?.guildID;
	const guildId = Array.isArray(rawGuildId)
		? (rawGuildId[0] ?? "")
		: (rawGuildId ?? "");
	const { guild, connection } = await authorizeGuildWorkspace(user.id, guildId);
	if (!guild) return { notFound: true };

	return { props: { user, guild, connection } };
}

/** Server-side authorization for `/channels/{guildId}/{product}`. */
export async function productWorkspacePageProps(
	context: GetServerSidePropsContext,
): Promise<
	GetServerSidePropsResult<{
		user: ManagerUser;
		guild: DiscordServerItem;
		product: DiscordServerProduct;
		connection: DiscordConnectionStatus;
	}>
> {
	const user = await resolveManagerSession(context);
	if (!user) {
		return { redirect: { destination: LOGIN_PATH, permanent: false } };
	}

	const rawGuildId = context.params?.guildID;
	const rawProductId = context.params?.product;
	const guildId = Array.isArray(rawGuildId)
		? (rawGuildId[0] ?? "")
		: (rawGuildId ?? "");
	const productId = Array.isArray(rawProductId)
		? (rawProductId[0] ?? "")
		: (rawProductId ?? "");
	const result = await authorizeProductWorkspace(user.id, guildId, productId);
	if (!result.guild || !result.product) return { notFound: true };

	return {
		props: {
			user,
			guild: result.guild,
			product: result.product,
			connection: result.connection,
		},
	};
}
