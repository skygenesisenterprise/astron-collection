import { Link } from "@astron-collection/react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/Container";
import {
	DedicatedInfrastructureSection,
	DeploymentOptionsSection,
	EnterprisePlanSection,
	FamiliesIncludedSection,
	InfrastructurePricingSection,
	PlanComparisonSection,
	PricingFaqSection,
	PricingFinalCtaSection,
	SubscriptionPlansSection,
} from "@/components/site/pricing/PricingSections";
import { getPlans, pageMetadata } from "@/lib/domain/queries";
import type { Metadata } from "next";

export const metadata: Metadata = pageMetadata({
	title: "Pricing",
	description:
		"Company Cloud subscriptions — Free, Pro and Enterprise — with one platform covering six service families. Platform fees and infrastructure consumption are billed separately, and Self needs no subscription.",
	path: "/pricing",
});

export default function PricingPage() {
	const plans = getPlans();
	const published = plans.filter((plan) => plan.status === "published").length;

	return (
		<>
			{/* Hero — same brand panel as the homepage, carrying the page promise. */}
			<section className="bg-background">
				<Container className="pt-1.5 sm:pt-2">
					<div className="relative overflow-hidden rounded-2xl bg-brand text-brand-foreground">
						<div
							className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_95%_85%_at_50%_45%,transparent_38%,rgba(0,0,0,0.16))]"
							aria-hidden="true"
						/>
						<div
							className="signal-dots absolute inset-0 opacity-80"
							aria-hidden="true"
						/>
						<div
							className="pointer-events-none absolute inset-x-0 bottom-0 h-72 bg-[radial-gradient(ellipse_75%_100%_at_50%_100%,rgba(255,255,255,0.55),transparent_72%)]"
							aria-hidden="true"
						/>

						<div className="relative mx-auto flex min-h-[calc(62svh_-_5.25rem)] max-w-4xl flex-col items-center justify-center px-6 py-24 text-center sm:min-h-[calc(62svh_-_5.625rem)] lg:min-h-[calc(62svh_-_6rem)]">
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-foreground/75">
								Pricing
							</p>
							<h1 className="mt-5 max-w-5xl font-display text-5xl font-medium leading-[1.04] tracking-tight text-brand-foreground sm:text-6xl lg:text-7xl">
								Scale predictably
							</h1>
							<p className="mt-6 max-w-xl text-base leading-relaxed text-brand-foreground/95 sm:text-lg">
								Pay for the capacity you use. Every plan states its billing
								model, its unit and its conditions — and shows its price as
								soon as that price is approved.
							</p>
							<p className="mt-4 text-xs uppercase tracking-[0.16em] text-brand-foreground/75">
								{plans.length} modelled plans · {published} published{" "}
								{published === 1 ? "price" : "prices"}
							</p>
							<Link
								href="#plans"
								className="mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-brand-foreground px-7 text-base font-medium text-ink no-underline shadow-sm transition-colors hover:bg-brand-foreground/90"
							>
								See plans
								<ArrowRight className="size-4" aria-hidden="true" />
							</Link>
						</div>
					</div>
				</Container>
			</section>

			<SubscriptionPlansSection />
			<FamiliesIncludedSection />
			<PlanComparisonSection />
			<InfrastructurePricingSection />
			<DedicatedInfrastructureSection />
			<DeploymentOptionsSection />
			<EnterprisePlanSection />
			<PricingFaqSection />
			<PricingFinalCtaSection />
		</>
	);
}
