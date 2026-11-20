import { Link, LinkButton } from "@astron-collection/react";
import { ArrowRight, Check } from "@phosphor-icons/react/dist/ssr";
import { Container } from "@/components/Container";
import { Faq } from "@/components/site/Faq";
import { SectionIntro } from "@/components/site/home/SectionIntro";
import {
	comparison,
	consumption,
	dedicated,
	deployment,
	enterprise,
	families,
	finalCta,
	planSection,
	plans,
	pricingFaqs,
	type SubscriptionPlan,
	type SubscriptionPrice,
} from "@/lib/content/plans";
import { formatMinorUnits } from "@/lib/domain/pricing";

function PlanPrice({ price }: { price: SubscriptionPrice }) {
	if (price.amountMinor !== null) {
		return (
			<p className="font-display text-3xl tracking-tight text-foreground">
				{formatMinorUnits(price.amountMinor, price.currency)}
				<span className="ml-1 text-sm font-normal text-muted-foreground">
					/ {price.interval}
				</span>
			</p>
		);
	}

	return (
		<p className="font-display text-2xl tracking-tight text-muted-foreground">
			{price.state === "quote" ? "Custom quote" : "Price not published"}
		</p>
	);
}

function PlanCard({ plan }: { plan: SubscriptionPlan }) {
	return (
		<article
			className={[
				"relative flex h-full flex-col rounded-2xl border p-7",
				plan.featured
					? "border-primary/40 bg-muted"
					: "border-border bg-background",
			].join(" ")}
		>
			{plan.featured && (
				<p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
					Recommended
				</p>
			)}
			<h3 className="mt-2 font-display text-2xl tracking-tight text-foreground">
				{plan.name}
			</h3>
			<p className="mt-1 text-sm font-medium text-foreground">
				{plan.headline}
			</p>
			<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
				{plan.summary}
			</p>
			<p className="mt-4 text-xs leading-relaxed text-muted-foreground">
				{plan.audience}
			</p>

			<div className="mt-6 border-t border-border pt-5">
				<PlanPrice price={plan.price} />
				<p className="mt-2 text-xs text-muted-foreground">{plan.price.note}</p>
			</div>

			<ul className="mt-6 space-y-2.5">
				{plan.features.map((feature) => (
					<li
						key={feature}
						className="flex gap-2.5 text-sm leading-relaxed text-foreground"
					>
						<Check
							className="mt-0.5 size-4 shrink-0 text-primary"
							aria-hidden="true"
						/>
						{feature}
					</li>
				))}
			</ul>

			<p className="mt-5 text-xs leading-relaxed text-muted-foreground">
				{plan.limitNote}
			</p>

			<div className="mt-auto pt-6">
				<LinkButton
					href={plan.cta.href}
					external={plan.cta.external}
					variant={plan.featured ? "primary" : "outline"}
					className="w-full justify-center"
				>
					{plan.cta.label}
					<ArrowRight className="size-4" aria-hidden="true" />
				</LinkButton>
			</div>
		</article>
	);
}

export function SubscriptionPlansSection() {
	return (
		<section
			id="plans"
			aria-labelledby="plans-title"
			className="scroll-mt-20 border-b border-border bg-background py-20 sm:py-28"
		>
			<Container>
				<SectionIntro
					id="plans-title"
					eyebrow={planSection.eyebrow}
					title={planSection.title}
					description={planSection.description}
					align="center"
				/>

				<div className="mx-auto mt-12 grid max-w-6xl items-stretch gap-5 lg:grid-cols-3">
					{plans.map((plan) => (
						<PlanCard key={plan.id} plan={plan} />
					))}
				</div>

				<p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
					{planSection.note}
				</p>
			</Container>
		</section>
	);
}

export function FamiliesIncludedSection() {
	return (
		<section
			id="families"
			aria-labelledby="families-included-title"
			className="border-b border-border bg-background py-20 sm:py-28"
		>
			<Container>
				<SectionIntro
					id="families-included-title"
					eyebrow={families.section.eyebrow}
					title={families.section.title}
					description={families.section.description}
					align="center"
				/>

				<ul className="mx-auto mt-12 grid max-w-6xl gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
					{families.items.map((family) => (
						<li key={family.name} className="bg-background">
							<Link
								href={family.href}
								variant="plain"
								className="group flex h-full flex-col p-7 no-underline!"
							>
								<h3 className="font-display text-xl tracking-tight text-foreground group-hover:text-primary">
									{family.name}
								</h3>
								<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
									{family.description}
								</p>
								<span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
									Explore
									<ArrowRight className="size-3.5" aria-hidden="true" />
								</span>
							</Link>
						</li>
					))}
				</ul>
			</Container>
		</section>
	);
}

export function PlanComparisonSection() {
	return (
		<section
			id="compare"
			aria-labelledby="compare-title"
			className="border-b border-border bg-background py-20 sm:py-28"
		>
			<Container>
				<SectionIntro
					id="compare-title"
					eyebrow={comparison.section.eyebrow}
					title={comparison.section.title}
					description={comparison.section.description}
					align="center"
				/>

				<div className="mx-auto mt-12 max-w-6xl overflow-x-auto rounded-2xl border border-border">
					<table className="w-full min-w-[880px] border-collapse text-left text-sm">
						<caption className="sr-only">
							Capabilities included in the Free, Pro and Enterprise plans
						</caption>
						<thead>
							<tr className="border-b border-border bg-muted/50">
								<th
									scope="col"
									className="w-52 px-5 py-4 align-bottom text-xs font-medium uppercase tracking-wide text-muted-foreground"
								>
									Capability
								</th>
								{plans.map((plan) => (
									<th
										key={plan.id}
										scope="col"
										className="px-5 py-4 align-bottom"
									>
										<span className="block text-sm font-semibold text-foreground">
											{plan.name}
										</span>
										<span className="mt-1 block text-xs font-normal text-muted-foreground">
											{plan.headline}
										</span>
									</th>
								))}
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{comparison.rows.map((row) => (
								<tr key={row.capability}>
									<th
										scope="row"
										className="px-5 py-5 align-top font-medium text-foreground"
									>
										{row.capability}
									</th>
									<td className="px-5 py-5 align-top text-muted-foreground">
										{row.free}
									</td>
									<td className="px-5 py-5 align-top text-muted-foreground">
										{row.pro}
									</td>
									<td className="px-5 py-5 align-top text-muted-foreground">
										{row.enterprise}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<p className="mx-auto mt-5 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
					{comparison.note}
				</p>
			</Container>
		</section>
	);
}

export function InfrastructurePricingSection() {
	return (
		<section
			id="infrastructure"
			aria-labelledby="infrastructure-title"
			className="border-b border-border bg-background py-20 sm:py-28"
		>
			<Container>
				<SectionIntro
					id="infrastructure-title"
					eyebrow={consumption.section.eyebrow}
					title={consumption.section.title}
					description={consumption.section.description}
					align="center"
				/>

				<div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-2">
					<article className="rounded-2xl border border-border p-7">
						<h3 className="font-display text-xl tracking-tight text-foreground">
							{consumption.subscription.title}
						</h3>
						<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
							{consumption.subscription.description}
						</p>
						<ul className="mt-5 space-y-2.5">
							{consumption.subscription.items.map((item) => (
								<li
									key={item}
									className="flex gap-2.5 text-sm leading-relaxed text-foreground"
								>
									<Check
										className="mt-0.5 size-4 shrink-0 text-primary"
										aria-hidden="true"
									/>
									{item}
								</li>
							))}
						</ul>
					</article>

					<article className="rounded-2xl border border-border p-7">
						<h3 className="font-display text-xl tracking-tight text-foreground">
							{consumption.consumption.title}
						</h3>
						<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
							{consumption.consumption.description}
						</p>
						<ul className="mt-5 divide-y divide-border border-y border-border">
							{consumption.consumption.items.map((item) => (
								<li
									key={item.resource}
									className="flex items-baseline justify-between gap-4 py-2.5"
								>
									<span className="text-sm text-foreground">
										{item.resource}
									</span>
									<span className="text-xs text-muted-foreground">
										{item.unit}
									</span>
								</li>
							))}
						</ul>
					</article>
				</div>

				<div className="mx-auto mt-5 max-w-6xl rounded-2xl bg-muted p-7">
					<p className="text-sm font-medium leading-relaxed text-foreground">
						{consumption.statement}
					</p>
					<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
						{consumption.useNote}
					</p>
					<p className="mt-3 border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
						{consumption.billing}
					</p>
				</div>

				<div className="mx-auto mt-8 max-w-6xl">
					<p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
						{consumption.resourceLinksNote}
					</p>
					<ul className="mt-3 flex flex-wrap gap-2">
						{consumption.resourceLinks.map((link) => (
							<li key={link.href}>
								<LinkButton
									href={link.href}
									variant="outline"
									size="sm"
									className="rounded-full"
								>
									{link.label}
								</LinkButton>
							</li>
						))}
					</ul>
				</div>
			</Container>
		</section>
	);
}

export function DedicatedInfrastructureSection() {
	return (
		<section
			id="dedicated"
			aria-labelledby="dedicated-title"
			className="border-b border-border bg-background py-20 sm:py-28"
		>
			<Container>
				<SectionIntro
					id="dedicated-title"
					eyebrow={dedicated.section.eyebrow}
					title={dedicated.section.title}
					description={dedicated.section.description}
					align="center"
				/>

				<div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-2">
					<div className="rounded-2xl border border-border p-7">
						<h3 className="text-sm font-semibold text-foreground">
							Managed from your workspace
						</h3>
						<ul className="mt-4 space-y-2.5">
							{dedicated.capabilities.map((capability) => (
								<li
									key={capability}
									className="flex gap-2.5 text-sm leading-relaxed text-foreground"
								>
									<Check
										className="mt-0.5 size-4 shrink-0 text-primary"
										aria-hidden="true"
									/>
									{capability}
								</li>
							))}
						</ul>
						<p className="mt-5 border-t border-border pt-4 text-xs leading-relaxed text-muted-foreground">
							{dedicated.boundary}
						</p>
					</div>

					<div className="rounded-2xl bg-muted p-7">
						<h3 className="text-sm font-semibold text-foreground">
							Billed separately from the subscription
						</h3>
						<dl className="mt-4 divide-y divide-border border-y border-border">
							{dedicated.costs.map((cost) => (
								<div
									key={cost.label}
									className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
								>
									<dt className="text-sm text-foreground">{cost.label}</dt>
									<dd className="text-xs text-muted-foreground">
										{cost.value}
									</dd>
								</div>
							))}
						</dl>
						<div className="mt-6 flex flex-col gap-2 sm:flex-row">
							<LinkButton
								href={dedicated.primary.href}
								variant="primary"
								className="justify-center"
							>
								{dedicated.primary.label}
								<ArrowRight className="size-4" aria-hidden="true" />
							</LinkButton>
							<LinkButton
								href={dedicated.secondary.href}
								variant="outline"
								className="justify-center"
							>
								{dedicated.secondary.label}
							</LinkButton>
						</div>
					</div>
				</div>
			</Container>
		</section>
	);
}

export function DeploymentOptionsSection() {
	return (
		<section
			id="deployment"
			aria-labelledby="deployment-title"
			className="border-b border-border bg-background py-20 sm:py-28"
		>
			<Container>
				<SectionIntro
					id="deployment-title"
					eyebrow={deployment.section.eyebrow}
					title={deployment.section.title}
					description={deployment.section.description}
					align="center"
				/>

				<div className="mx-auto mt-12 grid max-w-6xl gap-px overflow-hidden rounded-2xl border border-border bg-border lg:grid-cols-3">
					{deployment.modes.map((mode) => (
						<article
							key={mode.id}
							className="flex h-full flex-col bg-background p-7"
						>
							<h3 className="font-display text-2xl tracking-tight text-foreground">
								{mode.name}
							</h3>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								{mode.description}
							</p>
							<ul className="mt-5 space-y-2.5">
								{mode.points.map((point) => (
									<li
										key={point}
										className="flex gap-2.5 text-sm leading-relaxed text-foreground"
									>
										<Check
											className="mt-0.5 size-4 shrink-0 text-primary"
											aria-hidden="true"
										/>
										{point}
									</li>
								))}
							</ul>
							<div className="mt-auto flex flex-col gap-2 pt-6">
								<LinkButton
									href={mode.primary.href}
									external={"external" in mode.primary && mode.primary.external}
									variant={mode.id === "cloud" ? "primary" : "outline"}
									className="w-full justify-center"
								>
									{mode.primary.label}
									<ArrowRight className="size-4" aria-hidden="true" />
								</LinkButton>
								<LinkButton
									href={mode.secondary.href}
									external={
										"external" in mode.secondary && mode.secondary.external
									}
									variant="ghost"
									size="sm"
									className="w-full justify-center"
								>
									{mode.secondary.label}
								</LinkButton>
							</div>
						</article>
					))}
				</div>

				<p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-relaxed text-muted-foreground">
					{deployment.note}
				</p>
			</Container>
		</section>
	);
}

export function EnterprisePlanSection() {
	return (
		<section
			id="enterprise"
			aria-labelledby="enterprise-title"
			className="border-b border-border bg-background py-20 sm:py-28"
		>
			<Container>
				<SectionIntro
					id="enterprise-title"
					eyebrow={enterprise.section.eyebrow}
					title={enterprise.section.title}
					description={enterprise.section.description}
					align="center"
				/>

				<div className="mx-auto mt-12 grid max-w-6xl gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
					<ul className="grid gap-2.5 sm:grid-cols-2">
						{enterprise.capabilities.map((capability) => (
							<li
								key={capability}
								className="flex gap-2.5 text-sm leading-relaxed text-foreground"
							>
								<Check
									className="mt-0.5 size-4 shrink-0 text-primary"
									aria-hidden="true"
								/>
								{capability}
							</li>
						))}
					</ul>

					<aside className="h-fit rounded-2xl bg-muted p-7">
						<h3 className="text-sm font-semibold text-foreground">
							What we do not claim
						</h3>
						<ul className="mt-4 space-y-3">
							{enterprise.commitments.map((commitment) => (
								<li
									key={commitment}
									className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground"
								>
									<Check
										className="mt-0.5 size-4 shrink-0 text-primary"
										aria-hidden="true"
									/>
									{commitment}
								</li>
							))}
						</ul>
						<div className="mt-6 flex flex-col gap-2 border-t border-border pt-5">
							<LinkButton
								href={enterprise.primary.href}
								variant="primary"
								className="w-full justify-center"
							>
								{enterprise.primary.label}
								<ArrowRight className="size-4" aria-hidden="true" />
							</LinkButton>
							<LinkButton
								href={enterprise.secondary.href}
								variant="ghost"
								size="sm"
								className="w-full justify-center"
							>
								{enterprise.secondary.label}
							</LinkButton>
						</div>
					</aside>
				</div>
			</Container>
		</section>
	);
}

export function PricingFaqSection() {
	return (
		<section
			id="pricing-faq"
			aria-labelledby="pricing-faq-title"
			className="border-b border-border bg-background py-20 sm:py-28"
		>
			<Container>
				<SectionIntro
					id="pricing-faq-title"
					eyebrow="Questions"
					title="Pricing questions, answered plainly."
					description="What the subscription covers, what is metered, and what Self changes."
					align="center"
				/>
				<div className="mt-12">
					<Faq id="pricing-faq" items={pricingFaqs} />
				</div>
			</Container>
		</section>
	);
}

export function PricingFinalCtaSection() {
	return (
		<section
			aria-labelledby="pricing-start-title"
			className="bg-background py-20 sm:py-28"
		>
			<Container>
				<div className="relative overflow-hidden rounded-2xl bg-brand px-6 py-16 text-center text-brand-foreground sm:px-12 sm:py-20">
					<div
						className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_95%_85%_at_50%_45%,transparent_38%,rgba(0,0,0,0.32))]"
						aria-hidden="true"
					/>
					<div className="signal-dots absolute inset-0" aria-hidden="true" />

					<div className="relative mx-auto max-w-3xl">
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-foreground/75">
							{finalCta.eyebrow}
						</p>
						<h2
							id="pricing-start-title"
							className="mt-3 font-display text-4xl leading-[1.05] tracking-tight text-brand-foreground sm:text-5xl"
						>
							{finalCta.title}
						</h2>
						<p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-brand-foreground/85">
							{finalCta.description}
						</p>

						<div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
							<Link
								href={finalCta.primary.href}
								target={finalCta.primary.external ? "_blank" : undefined}
								rel={finalCta.primary.external ? "noreferrer" : undefined}
								className="inline-flex h-11 items-center gap-2 rounded-full bg-brand-foreground px-6 text-sm font-medium text-ink no-underline transition-colors hover:bg-brand-foreground/90"
							>
								{finalCta.primary.label}
								<ArrowRight className="size-4" aria-hidden="true" />
							</Link>
							<Link
								href={finalCta.secondary.href}
								className="inline-flex h-11 items-center rounded-full border border-brand-foreground/35 px-5 text-sm font-medium text-brand-foreground no-underline transition-colors hover:bg-brand-foreground/10"
							>
								{finalCta.secondary.label}
							</Link>
							<Link
								href={finalCta.tertiary.href}
								target={finalCta.tertiary.external ? "_blank" : undefined}
								rel={finalCta.tertiary.external ? "noreferrer" : undefined}
								className="inline-flex h-11 items-center rounded-full px-5 text-sm font-medium text-brand-foreground/90 no-underline transition-colors hover:bg-brand-foreground/10 hover:text-brand-foreground"
							>
								{finalCta.tertiary.label}
							</Link>
						</div>

						<p className="mt-5 text-xs leading-relaxed text-brand-foreground/75">
							{finalCta.note}
						</p>
					</div>
				</div>
			</Container>
		</section>
	);
}
