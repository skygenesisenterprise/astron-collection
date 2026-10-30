import {
	buildGatewayErrorsEnv,
	getGatewayErrorsImage,
} from "@astron-collection/server";
import { describe, expect, test } from "vitest";

const dockerWithImage = (image: string) =>
	({
		getContainer: () => ({
			inspect: async () => ({ Config: { Image: image } }),
		}),
	}) as unknown as Parameters<typeof getGatewayErrorsImage>[0];

describe("buildGatewayErrorsEnv", () => {
	test("passes the validated page configuration to the sidecar", () => {
		const env = buildGatewayErrorsEnv({
			ASTRON_COLLECTION_GATEWAY_BRAND_NAME: "Acme",
			ASTRON_COLLECTION_GATEWAY_DOCS_URL: "https://docs.example.com",
			ASTRON_COLLECTION_GATEWAY_STATUS_URL: "https://status.example.com",
			ASTRON_COLLECTION_GATEWAY_SUPPORT_URL: "javascript:alert(1)",
			ASTRON_COLLECTION_GATEWAY_LOCALE: "fr",
			IS_CLOUD: "true",
		});

		expect(env).toContain("ASTRON_COLLECTION_GATEWAY_BRAND_NAME=Acme");
		expect(env).toContain(
			"ASTRON_COLLECTION_GATEWAY_DOCS_URL=https://docs.example.com/",
		);
		expect(env).toContain(
			"ASTRON_COLLECTION_GATEWAY_STATUS_URL=https://status.example.com/",
		);
		expect(env).toContain("ASTRON_COLLECTION_GATEWAY_LOCALE=fr");
		expect(env).toContain("ASTRON_COLLECTION_GATEWAY_PORT=8080");
		expect(env).toContain("IS_CLOUD=true");
		expect(env.some((value) => value.startsWith("ASTRON_COLLECTION_GATEWAY_SUPPORT_URL="))).toBe(
			false,
		);
	});

	test("uses safe defaults when no overrides are present", () => {
		const env = buildGatewayErrorsEnv({});
		expect(env).toContain("ASTRON_COLLECTION_GATEWAY_BRAND_NAME=Astron Collection");
		expect(env).toContain("ASTRON_COLLECTION_GATEWAY_LOCALE=en");
		expect(env).toContain("IS_CLOUD=false");
	});
});

describe("getGatewayErrorsImage", () => {
	test("prefers the explicit sidecar image", async () => {
		const image = await getGatewayErrorsImage(
			dockerWithImage("ignored:latest"),
			undefined,
			{ ASTRON_COLLECTION_GATEWAY_ERRORS_IMAGE: "node:24-alpine" },
		);
		expect(image).toBe("node:24-alpine");
	});

	test("reuses the running control-plane image", async () => {
		const image = await getGatewayErrorsImage(
			dockerWithImage("astron-collection:local"),
			undefined,
			{},
		);
		expect(image).toBe("astron-collection:local");
	});

	test("builds the image from ASTRON_COLLECTION_IMAGE and ASTRON_COLLECTION_VERSION", async () => {
		const image = await getGatewayErrorsImage(
			dockerWithImage("astron-collection:local"),
			"server-1",
			{
				ASTRON_COLLECTION_IMAGE: "ghcr.io/example/astron-collection",
				ASTRON_COLLECTION_VERSION: "v1.2.3",
			},
		);
		expect(image).toBe("ghcr.io/example/astron-collection:v1.2.3");
	});

	test("does not append a tag to an image that already has one", async () => {
		const image = await getGatewayErrorsImage(
			dockerWithImage("astron-collection:local"),
			"server-1",
			{ ASTRON_COLLECTION_IMAGE: "ghcr.io/example/astron-collection:canary" },
		);
		expect(image).toBe("ghcr.io/example/astron-collection:canary");
	});
});
