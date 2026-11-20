/**
 * Content for the protected homepage hero (`SignalHero`).
 *
 * The hero is preserved unchanged by the homepage workstream, so its copy
 * stays here rather than being folded into the new ecosystem content.
 * Everything below the hero is defined in `lib/content/ecosystem.ts`.
 */

export const homeHero = {
	eyebrow: "Enterprise cloud infrastructure",
	title: "Cloud infrastructure.",
	highlight: "Boundaries you can verify.",
	description:
		"Compute, storage, networking and platform services on infrastructure operated by Astron Collection or a named partner. Availability and commercial state are published per product and region.",
	primaryCta: { href: "/products", label: "Explore products" },
	secondaryCta: { href: "/pricing", label: "View pricing" },
} as const;
