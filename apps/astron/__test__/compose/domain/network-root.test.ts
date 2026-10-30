import { addAstronCollectionNetworkToRoot } from "@astron-collection/server";
import { describe, expect, it } from "vitest";

describe("addAstronCollectionNetworkToRoot", () => {
	it("should create network object if networks is undefined", () => {
		const result = addAstronCollectionNetworkToRoot(undefined);
		expect(result).toEqual({ "astron-collection-network": { external: true } });
	});

	it("should add network to an empty object", () => {
		const result = addAstronCollectionNetworkToRoot({});
		expect(result).toEqual({ "astron-collection-network": { external: true } });
	});

	it("should not modify existing network configuration", () => {
		const existing = { "astron-collection-network": { external: false } };
		const result = addAstronCollectionNetworkToRoot(existing);
		expect(result).toEqual({ "astron-collection-network": { external: true } });
	});

	it("should add network alongside existing networks", () => {
		const existing = { "other-network": { external: true } };
		const result = addAstronCollectionNetworkToRoot(existing);
		expect(result).toEqual({
			"other-network": { external: true },
			"astron-collection-network": { external: true },
		});
	});
});
