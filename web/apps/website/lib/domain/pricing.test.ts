import { describe, expect, it } from "vitest";
import { billingModelLabel, formatMinorUnits, formatPlanPrice, lineTotalMinor } from "./pricing";
import { catalogue } from "./catalogue";

const plan = catalogue.plans[0];

describe("money formatting", () => {
	it("formats integer minor units without floating point drift", () => {
		expect(formatMinorUnits(12345)).toContain("123.45");
		expect(formatMinorUnits(1)).toContain("0.01");
	});

	it("rejects fractional minor units", () => {
		expect(() => formatMinorUnits(12.5)).toThrow(/integer minor units/);
	});

	it("refuses unsupported currencies instead of guessing", () => {
		expect(() => formatMinorUnits(100, "USD")).toThrow(/Unsupported currency/);
	});
});

describe("plans", () => {
	it("shows an explicit unpublished state for draft plans", () => {
		expect(plan.status).toBe("draft");
		expect(formatPlanPrice(plan)).toBe("Price not published");
	});

	it("computes line totals with integer arithmetic", () => {
		expect(lineTotalMinor({ amountMinor: 250 }, 3)).toBe(750);
		expect(lineTotalMinor({ amountMinor: 1 }, 0.5)).toBe(1);
	});

	it("returns null rather than zero when a price is missing", () => {
		expect(lineTotalMinor({ amountMinor: null }, 10)).toBeNull();
	});

	it("rejects negative quantities", () => {
		expect(() => lineTotalMinor({ amountMinor: 100 }, -1)).toThrow(/non-negative/);
	});

	it("exposes a human billing label for every plan", () => {
		for (const entry of catalogue.plans) {
			expect(billingModelLabel(entry).length).toBeGreaterThan(0);
		}
	});
});
