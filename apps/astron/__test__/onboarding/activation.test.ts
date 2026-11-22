import {
	isSessionExpired,
	readActiveOrganizationId,
} from "@/lib/onboarding-activation";
import { describe, expect, it } from "vitest";

const ORG_ID = "dbc7a507e8a140194d193445ecfdb7cf";

describe("readActiveOrganizationId", () => {
	it("returns the organization the session points at", () => {
		expect(readActiveOrganizationId({ activeOrganizationId: ORG_ID })).toBe(
			ORG_ID,
		);
	});

	it("reports nothing when the session has no active organization", () => {
		expect(readActiveOrganizationId(null)).toBe(null);
		expect(readActiveOrganizationId(undefined)).toBe(null);
		expect(readActiveOrganizationId({})).toBe(null);
		expect(readActiveOrganizationId({ activeOrganizationId: "" })).toBe(null);
		expect(readActiveOrganizationId({ activeOrganizationId: 42 })).toBe(null);
	});

	it("never returns another organization as the expected one", () => {
		expect(
			readActiveOrganizationId({ activeOrganizationId: "org_other" }),
		).not.toBe(ORG_ID);
	});
});

describe("isSessionExpired", () => {
	it("treats a 401 as an expired session", () => {
		expect(isSessionExpired({ status: 401 })).toBe(true);
	});

	it("keeps every other failure retryable", () => {
		expect(isSessionExpired(null)).toBe(false);
		expect(isSessionExpired({})).toBe(false);
		expect(isSessionExpired({ status: 500 })).toBe(false);
	});
});
