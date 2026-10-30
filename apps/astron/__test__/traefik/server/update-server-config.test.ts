import { fs, vol } from "memfs";

vi.mock("node:fs", () => ({
	...fs,
	default: fs,
}));

import type { FileConfig } from "@astron-collection/server";
import {
	createDefaultServerTraefikConfig,
	loadOrCreateConfig,
	updateServerTraefik,
} from "@astron-collection/server";
import type { webServerSettings } from "@astron-collection/server/db/schema";
import { beforeEach, expect, test, vi } from "vitest";

type WebServerSettings = typeof webServerSettings.$inferSelect;

const baseSettings: WebServerSettings = {
	id: "",
	https: false,
	certificateType: "none",
	customCertResolver: null,
	host: null,
	serverIp: null,
	letsEncryptEmail: null,
	sshPrivateKey: null,
	enableDockerCleanup: false,
	buildsConcurrency: 1,
	logCleanupCron: null,
	metricsConfig: {
		containers: {
			refreshRate: 20,
			services: {
				include: [],
				exclude: [],
			},
		},
		server: {
			type: "Astron Collection",
			cronJob: "",
			port: 4500,
			refreshRate: 20,
			retentionDays: 2,
			token: "",
			thresholds: {
				cpu: 0,
				memory: 0,
			},
			urlCallback: "",
		},
	},
	whitelabelingConfig: {
		appName: null,
		appDescription: null,
		logoUrl: null,
		faviconUrl: null,
		customCss: null,
		loginLogoUrl: null,
		supportUrl: null,
		docsUrl: null,
		errorPageTitle: null,
		errorPageDescription: null,
		ogImageUrl: null,
		footerText: null,
	},
	cleanupCacheApplications: false,
	cleanupCacheOnCompose: false,
	cleanupCacheOnPreviews: false,
	remoteServersOnly: false,
	enforceSSO: false,
	createdAt: null,
	updatedAt: new Date(),
};

beforeEach(() => {
	vol.reset();
	createDefaultServerTraefikConfig();
});

test("Should read the configuration file", () => {
	const config: FileConfig = loadOrCreateConfig("astron-collection");
	expect(config.http?.routers?.["astron-collection-router-app"]?.service).toBe(
		"astron-collection-service-app",
	);
});

test("Should apply redirect-to-https", () => {
	updateServerTraefik(
		{
			...baseSettings,
			https: true,
			certificateType: "letsencrypt",
		},
		"example.com",
	);

	const config: FileConfig = loadOrCreateConfig("astron-collection");

	expect(config.http?.routers?.["astron-collection-router-app"]?.middlewares).toContain(
		"redirect-to-https",
	);
});

test("Should change only host when no certificate", () => {
	updateServerTraefik(baseSettings, "example.com");

	const config: FileConfig = loadOrCreateConfig("astron-collection");

	expect(config.http?.routers?.["astron-collection-router-app-secure"]).toBeUndefined();
});

test("Should not touch config without host", () => {
	const originalConfig: FileConfig = loadOrCreateConfig("astron-collection");

	updateServerTraefik(baseSettings, null);

	const config: FileConfig = loadOrCreateConfig("astron-collection");

	expect(originalConfig).toEqual(config);
});

test("Should remove websecure if https rollback to http", () => {
	updateServerTraefik(
		{ ...baseSettings, certificateType: "letsencrypt" },
		"example.com",
	);

	updateServerTraefik(
		{ ...baseSettings, certificateType: "none" },
		"example.com",
	);

	const config: FileConfig = loadOrCreateConfig("astron-collection");

	expect(config.http?.routers?.["astron-collection-router-app-secure"]).toBeUndefined();
	expect(
		config.http?.routers?.["astron-collection-router-app"]?.middlewares,
	).not.toContain("redirect-to-https");
});
