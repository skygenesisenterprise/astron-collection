import type { BillingUnit, PricingPlan } from "./schema";

/**
 * Money is stored in integer minor units and only converted at the edge.
 * No financial calculation ever goes through a float.
 */

const euroFormatter = new Intl.NumberFormat("en-GB", {
	style: "currency",
	currency: "EUR",
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

export function formatMinorUnits(amountMinor: number, currency = "EUR"): string {
	if (!Number.isInteger(amountMinor)) {
		throw new Error("Monetary amounts must be integer minor units");
	}
	if (currency !== "EUR") {
		throw new Error(`Unsupported currency: ${currency}`);
	}
	return euroFormatter.format(amountMinor / 100);
}

const UNIT_SUFFIX: Record<BillingUnit, string> = {
	hour: "/ hour",
	month: "/ month",
	request: "/ request",
	gb_month: "/ GB-month",
	custom: "",
};

export function formatPlanPrice(plan: PricingPlan): string {
	if (plan.amountMinor === null) return "Price not published";
	return `${formatMinorUnits(plan.amountMinor, plan.currency)} ${
		UNIT_SUFFIX[plan.billingInterval]
	}`.trim();
}

export function billingModelLabel(plan: PricingPlan): string {
	switch (plan.billingModel) {
		case "hourly":
			return "Hourly";
		case "monthly":
			return "Monthly";
		case "usage":
			return "Usage-based";
		case "custom":
			return "Custom contract";
	}
}

/** Total for `quantity` units, in minor units, using integer arithmetic only. */
export function lineTotalMinor(
	plan: Pick<PricingPlan, "amountMinor">,
	quantity: number,
): number | null {
	if (plan.amountMinor === null) return null;
	if (!Number.isFinite(quantity) || quantity < 0) {
		throw new Error("Quantity must be a non-negative finite number");
	}
	return Math.round(plan.amountMinor * quantity);
}
