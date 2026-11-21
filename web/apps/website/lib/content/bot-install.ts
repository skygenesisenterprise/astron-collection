/**
 * MANUAL CONFIGURATION — public Discord application (client) IDs.
 *
 * To add a bot's install button:
 * 1. Open https://discord.com/developers/applications.
 * 2. Select the bot's application.
 * 3. Copy its "Application ID" from General Information.
 * 4. Paste that numeric ID into the matching slot below.
 *
 * Only the ID is needed; the Discord OAuth install URL is generated from it.
 * Leave a slot as `null` while the ID is unknown — the install button stays
 * hidden for that bot instead of pointing at another application.
 * Do not paste the full OAuth URL.
 */

import type { BotId } from "./home-collection";

/**
 * One slot per bot, in the same order as the homepage selector.
 * Replace `null` with the public numeric Application ID when available.
 */
export const botInstallClientIds: Record<BotId, string | null> = {
	astron: "1371454013262004344", // ← paste Astron's Application ID here
	automations: "1541741674646999111", // ← paste Automations' Application ID here
	guild: "1567171603064819802", // ← paste Guild's Application ID here
	logger: "1371457373780054088",
	player: "1373996020022644846", // ← paste Player's Application ID here
	protect: "1371453692888481833", // ← paste Protect's Application ID here
};

const DISCORD_CLIENT_ID = /^\d{17,20}$/;

function buildInstallUrl(clientId: string) {
	if (!DISCORD_CLIENT_ID.test(clientId)) {
		throw new Error(
			`Invalid Discord Application ID "${clientId}". Paste the numeric Application ID, not the OAuth URL.`,
		);
	}

	return `https://discord.com/oauth2/authorize?client_id=${clientId}&scope=bot%20applications.commands&permissions=2048`;
}

/** The install route for the selected bot, or undefined until its id is known. */
export function getBotInstallUrl(botId: BotId): string | undefined {
	const clientId = botInstallClientIds[botId]?.trim();
	return clientId ? buildInstallUrl(clientId) : undefined;
}
