import type { LicenseTier } from "@/components/layouts/navigation";
import { api } from "@/utils/api";

/**
 * Resolves the cloud licence tier of the active workspace.
 *
 * Licence tiers are a Cloud concept: self-hosted instances are unlicensed and
 * the Console is an internal operator surface, so both always return `null`.
 * Only the `cloud` product reports a tier (and only there is the subscription
 * queried).
 *
 * Local development has no real subscription, so it defaults to the Enterprise
 * licence: that keeps licence gating from blocking developers. The dev stack is
 * the only place NODE_ENV is not "production"; production always resolves the
 * real tier.
 *
 * Shared by the `/dashboard` sidebar and the `/{organizationId}` panel so both
 * surfaces gate their destinations on the same tier.
 */
export function useWorkspaceLicense(): LicenseTier | null {
	const { data: product } = api.settings.getProduct.useQuery();
	const { data: user } = api.user.get.useQuery();
	const { data: currentPlan } = api.stripe.getCurrentPlan.useQuery(undefined, {
		enabled: product === "cloud",
		refetchOnWindowFocus: false,
	});

	if (product !== "cloud") return null;
	if (process.env.NODE_ENV !== "production" || user?.user.isEnterpriseCloud) {
		return "enterprise";
	}
	return currentPlan ? "pro" : "free";
}
