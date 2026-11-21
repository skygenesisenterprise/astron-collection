import { describe, expect, it } from "vitest";
import { botInstallClientIds, getBotInstallUrl } from "./bot-install";
import {
	BOT_IDS,
	collectionSection,
	communitySection,
	dashboardSection,
	developerLinks,
	developersSection,
	ecosystemSection,
	ecosystemStages,
	getHomeBot,
	getPublishedCapabilities,
	homeBots,
	homeCta,
	homeDestinations,
	homeNeeds,
	homeSeo,
	needsSection,
} from "./home-collection";
import { productMenuFamilies } from "./navigation";

function destinations(entries: { href: string; external?: boolean }[]) {
	for (const entry of entries) {
		if (entry.external) {
			expect(entry.href).toMatch(/^https:\/\//);
		} else {
			expect(entry.href).toMatch(/^(#|\/)/);
		}
	}
}

describe("homepage collection data", () => {
	it("publishes exactly the six official bots in the navigation order", () => {
		expect(homeBots.map((bot) => bot.id)).toEqual([...BOT_IDS]);
		expect(homeBots.map((bot) => bot.id)).toEqual(
			productMenuFamilies.map((family) => family.id),
		);
	});

	it("builds each install URL from that bot's own public client id", () => {
		for (const bot of homeBots) {
			const clientId = botInstallClientIds[bot.id];
			const url = getBotInstallUrl(bot.id);

			if (!clientId) {
				expect(url).toBeUndefined();
				continue;
			}

			expect(clientId).toMatch(/^\d{17,20}$/);
			expect(url).toContain(`client_id=${clientId}`);
			expect(url).toContain("scope=bot%20applications.commands");
		}

		expect(getBotInstallUrl("logger")).toContain(
			"client_id=1371457373780054088",
		);
	});

	it("reuses the published capability records instead of redeclaring them", () => {
		for (const bot of homeBots) {
			const published = productMenuFamilies.find(
				(family) => family.id === bot.id,
			);
			expect(published).toBeDefined();
			expect(bot.label).toBe(published?.label);
			expect(bot.capabilities).toBe(published?.capabilities);
		}
	});

	it("resolves every need to a real bot and capability", () => {
		for (const need of homeNeeds) {
			const bot = getHomeBot(need.botId);
			const capabilities = getPublishedCapabilities(
				need.botId,
				need.capabilityIds,
			);
			expect(capabilities).toHaveLength(need.capabilityIds.length);
			for (const capability of capabilities) {
				expect(bot.capabilities).toContain(capability);
			}
		}
	});

	it("resolves every server surface to a real bot and capability", () => {
		for (const stage of ecosystemStages) {
			const bot = getHomeBot(stage.botId);
			const capabilities = getPublishedCapabilities(
				stage.botId,
				stage.capabilityIds,
			);
			expect(capabilities).toHaveLength(stage.capabilityIds.length);
			for (const capability of capabilities) {
				expect(bot.capabilities).toContain(capability);
			}
		}
	});

	it("keeps every route internal, absolute and published", () => {
		destinations([
			collectionSection.primary,
			collectionSection.secondary,
			dashboardSection.cta,
			...developerLinks,
			communitySection.primary,
			communitySection.secondary,
			...homeCta.pathways,
		]);
		expect(homeDestinations.documentation).toMatch(/^https:\/\//);
		expect(homeDestinations.discord).toMatch(/^https:\/\//);
	});

	it("does not bring back the wider group or its other projects", () => {
		const serialized = JSON.stringify({
			collectionSection,
			homeBots,
			needsSection,
			homeNeeds,
			ecosystemSection,
			ecosystemStages,
			dashboardSection,
			developersSection,
			developerLinks,
			communitySection,
			homeCta,
			homeSeo,
		});

		expect(serialized).not.toMatch(
			/Sky Genesis|\bSGE\b|Notploy|Aether|Giteria|VaelixBank|Kami-Sama|Guilderia/,
		);
	});

	it("does not attach maturity, price or news entries to a bot", () => {
		for (const bot of homeBots) {
			expect(bot).not.toHaveProperty("maturity");
			expect(bot).not.toHaveProperty("price");
			expect(bot).not.toHaveProperty("availability");
		}
		expect(homeSeo.description.length).toBeGreaterThan(0);
	});
});
