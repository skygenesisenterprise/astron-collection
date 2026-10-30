import { addAstronCollectionNetworkToService } from "@astron-collection/server";
import { describe, expect, it } from "vitest";

describe("addAstronCollectionNetworkToService", () => {
	it("should add network to an empty array", () => {
		const result = addAstronCollectionNetworkToService([]);
		expect(result).toEqual(["astron-collection-network", "default"]);
	});

	it("should not add duplicate network to an array", () => {
		const result = addAstronCollectionNetworkToService(["astron-collection-network"]);
		expect(result).toEqual(["astron-collection-network", "default"]);
	});

	it("should add network to an existing array with other networks", () => {
		const result = addAstronCollectionNetworkToService(["other-network"]);
		expect(result).toEqual(["other-network", "astron-collection-network", "default"]);
	});

	it("should add network to an object if networks is an object", () => {
		const result = addAstronCollectionNetworkToService({ "other-network": {} });
		expect(result).toEqual({
			"other-network": {},
			"astron-collection-network": {},
			default: {},
		});
	});

	it("should not duplicate default network when already present", () => {
		const result = addAstronCollectionNetworkToService(["default", "astron-collection-network"]);
		expect(result).toEqual(["default", "astron-collection-network"]);
	});
});
