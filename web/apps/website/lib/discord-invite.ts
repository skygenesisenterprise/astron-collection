/**
 * Bot invitation links.
 *
 * Discord does not publish invite URLs: an invite is an OAuth2 authorisation
 * URL built from the application's client ID. The repository has no public
 * client IDs (WEBSITE_AUDIT.md, V-07), so each application reads its own value
 * from the environment, at build time for a static export:
 *
 *   NEXT_PUBLIC_DISCORD_CLIENT_ID_ASTRON=123456789012345678
 *   NEXT_PUBLIC_DISCORD_INVITE_ASTRON=https://discord.com/oauth2/authorize?...
 *
 * A full invite URL takes precedence over a client ID, for installations that
 * already publish one. Without either, the UI falls back to the community
 * Discord instead of pointing at a link that would fail.
 */

/** Scopes required for slash commands plus the bot user itself. */
const SCOPES = "bot%20applications.commands";

/**
 * Permissions the bots actually use, mirroring `bot/README.md`:
 * Kick (1<<1), Ban (1<<2), Manage Channels (1<<4), Add Reactions (1<<6),
 * View Channels (1<<10), Send Messages (1<<11), Manage Messages (1<<13),
 * Embed Links (1<<14), Read History (1<<16), Connect (1<<20),
 * Manage Roles (1<<28), Moderate Members (1<<40).
 *
 * Written as the resolved decimal because bit 40 exceeds 32-bit bitwise ops and
 * the project targets a pre-ES2020 lib, where BigInt literals do not compile.
 */
const PERMISSIONS = "1099781205078";

const CLIENT_IDS: Record<string, string | undefined> = {
	astron: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID_ASTRON,
	guild: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID_GUILD,
	logger: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID_LOGGER,
	protect: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID_PROTECT,
	player: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID_PLAYER,
};

const INVITE_URLS: Record<string, string | undefined> = {
	astron: process.env.NEXT_PUBLIC_DISCORD_INVITE_ASTRON,
	guild: process.env.NEXT_PUBLIC_DISCORD_INVITE_GUILD,
	logger: process.env.NEXT_PUBLIC_DISCORD_INVITE_LOGGER,
	protect: process.env.NEXT_PUBLIC_DISCORD_INVITE_PROTECT,
	player: process.env.NEXT_PUBLIC_DISCORD_INVITE_PLAYER,
};

/** Discord snowflakes are 17–20 digits; anything else is a configuration typo. */
function isSnowflake(value: string): boolean {
	return /^\d{17,20}$/.test(value);
}

export function buildInviteUrl(clientId: string): string {
	const params = [
		`client_id=${clientId}`,
		`scope=${SCOPES}`,
		`permissions=${PERMISSIONS}`,
	];
	return `https://discord.com/oauth2/authorize?${params.join("&")}`;
}

/**
 * Returns the invitation URL for an application, or `null` when no client ID
 * and no explicit invite URL are configured.
 */
export function getInviteUrl(slug: string): string | null {
	const explicit = INVITE_URLS[slug]?.trim();
	if (explicit && /^https:\/\/discord\.com\/oauth2\/authorize\?/.test(explicit)) {
		return explicit;
	}

	const clientId = CLIENT_IDS[slug]?.trim();
	if (clientId && isSnowflake(clientId)) {
		return buildInviteUrl(clientId);
	}

	return null;
}
