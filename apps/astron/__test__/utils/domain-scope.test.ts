import { getDomainRequirements } from "@astron-collection/server";
import { describe, expect, it } from "vitest";

describe("getDomainRequirements", () => {
	it.each([
		["api.example.com", "public", true, true],
		["app.localhost", "localhost", false, false],
		["api.lan", "lan", false, false],
		["gitlab.astron-collection.local", "local", false, false],
		["astron-collection.local", "local", false, false],
		["app.home.arpa", "custom", false, false],
		["service.internal.example", "custom", false, false],
		["notlocalhost.com", "public", true, true],
		["local.example.com", "public", true, true],
	] as const)(
		"classifies %s",
		(host, scope, requiresPublicDns, allowsPublicAcme) => {
			expect(getDomainRequirements(host)).toEqual({
				scope,
				requiresPublicDns,
				allowsPublicAcme,
			});
		},
	);
});
