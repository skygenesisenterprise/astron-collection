import Link from "next/link";
import {
	AVAILABILITY_ORDER,
	COMMERCIAL_STATUS_META,
	DELIVERY_MODEL_META,
	FAMILIES,
	PRODUCT_AVAILABILITY_META,
	getPlansForProduct,
	getProvider,
	getRegion,
	getRelatedProducts,
} from "@/lib/domain/queries";
import { billingModelLabel, formatPlanPrice } from "@/lib/domain/pricing";
import type {
	Availability,
	CommercialStatus,
	Product,
	ProductAvailability,
} from "@/lib/domain/schema";
import { cn } from "@/lib/utils";
import { AvailabilityBadge, StatusBadge } from "../site/StatusBadge";

const DEPLOYMENT_LABEL: Record<Availability["deployment"], string> = {
	shared: "Shared",
	dedicated: "Dedicated",
	managed: "Managed",
	self_service: "Self-service",
};

const OPERATIONAL_LABEL: Record<Availability["operationalStatus"], string> = {
	operational: "Operational",
	degraded: "Degraded",
	maintenance: "Maintenance",
	unknown: "Not published",
};

/** Regional commercial states, used inside availability tables. */
export function AvailabilityLegend() {
	return (
		<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{(Object.keys(COMMERCIAL_STATUS_META) as CommercialStatus[]).map((status) => (
				<li key={status} className="border border-border p-4">
					<StatusBadge status={status} />
					<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
						{COMMERCIAL_STATUS_META[status].description}
					</p>
				</li>
			))}
		</ul>
	);
}

/** Product-level availability states, used for catalogue discovery. */
export function ProductAvailabilityLegend() {
	return (
		<ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{AVAILABILITY_ORDER.map((status: ProductAvailability) => (
				<li key={status} className="border border-border p-4">
					<AvailabilityBadge status={status} />
					<p className="mt-2 text-xs leading-relaxed text-muted-foreground">
						{PRODUCT_AVAILABILITY_META[status].description}
					</p>
				</li>
			))}
		</ul>
	);
}

export function ProductCard({ product }: { product: Product }) {
	const family = FAMILIES[product.family];

	const body = (
		<>
			<div className="flex items-start justify-between gap-3">
				<p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
					{family.name}
				</p>
				<AvailabilityBadge status={product.availability} />
			</div>
			<h3 className="mt-4 font-display text-lg tracking-tight group-hover:text-primary">
				{product.name}
			</h3>
			<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
				{product.tagline}
			</p>
			<span className="mt-5 text-sm font-medium text-primary">
				{product.route ? "View product →" : "No product page yet"}
			</span>
		</>
	);

	if (!product.route) {
		return (
			<article className="flex h-full flex-col border border-border p-6">
				{body}
			</article>
		);
	}

	return (
		<Link
			href={product.route}
			className="group flex h-full flex-col border border-border p-6 no-underline! transition-colors hover:bg-muted/50"
		>
			{body}
		</Link>
	);
}

export function ProductGrid({ products }: { products: readonly Product[] }) {
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{products.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</div>
	);
}

export function AvailabilityTable({ product }: { product: Product }) {
	if (product.availabilityByRegion.length === 0) {
		return (
			<p className="border border-border p-5 text-sm text-muted-foreground">
				No regional availability is published for {product.name}. The
				catalogue entry is marked{" "}
				{PRODUCT_AVAILABILITY_META[product.availability].label.toLowerCase()}
				, so it cannot be ordered.
			</p>
		);
	}

	return (
		<div className="overflow-x-auto border border-border">
			<table className="w-full min-w-[720px] border-collapse text-left text-sm">
				<caption className="sr-only">
					Commercial and operational availability by region for {product.name}
				</caption>
				<thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
					<tr>
						<th scope="col" className="px-4 py-3 font-medium">Region</th>
						<th scope="col" className="px-4 py-3 font-medium">Provider</th>
						<th scope="col" className="px-4 py-3 font-medium">Deployment</th>
						<th scope="col" className="px-4 py-3 font-medium">Commercial</th>
						<th scope="col" className="px-4 py-3 font-medium">Operational</th>
						<th scope="col" className="px-4 py-3 font-medium">Note</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border">
					{product.availabilityByRegion.map((entry) => {
						const provider = getProvider(entry.providerId);
						const region = getRegion(entry.regionId);
						return (
							<tr key={`${entry.regionId}-${entry.providerId}-${entry.deployment}`}>
								<td className="px-4 py-4 align-top">
									<span className="font-medium text-foreground">
										{region?.name ?? entry.regionId}
									</span>
									{region?.verification === "pending" && (
										<span className="mt-1 block text-xs text-muted-foreground">
											Location pending verification
										</span>
									)}
								</td>
								<td className="px-4 py-4 align-top text-muted-foreground">
									{provider?.name ?? entry.providerId}
									{provider?.type === "partner" && (
										<span className="mt-1 block text-xs">Partner-operated</span>
									)}
								</td>
								<td className="px-4 py-4 align-top text-muted-foreground">
									{DEPLOYMENT_LABEL[entry.deployment]}
								</td>
								<td className="px-4 py-4 align-top">
									<StatusBadge status={entry.commercialStatus} />
								</td>
								<td className="px-4 py-4 align-top text-muted-foreground">
									{OPERATIONAL_LABEL[entry.operationalStatus]}
								</td>
								<td className="max-w-xs px-4 py-4 align-top text-xs leading-relaxed text-muted-foreground">
									{entry.note}
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
		</div>
	);
}

export function DeliveryModels({ product }: { product: Product }) {
	if (product.deliveryModels.length === 0) return null;
	return (
		<ul className="flex flex-wrap gap-2">
			{product.deliveryModels.map((model) => (
				<li
					key={model}
					className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
				>
					{DELIVERY_MODEL_META[model]}
				</li>
			))}
		</ul>
	);
}

export function SpecGroups({ product }: { product: Product }) {
	return (
		<div className="grid gap-6 lg:grid-cols-2">
			{product.specs.map((group) => (
				<div key={group.title} className="border border-border">
					<h3 className="border-b border-border bg-muted/50 px-5 py-3 text-sm font-semibold">
						{group.title}
					</h3>
					<dl className="divide-y divide-border">
						{group.rows.map((row) => (
							<div key={row.label} className="grid gap-1 px-5 py-3 sm:grid-cols-2 sm:gap-4">
								<dt className="text-sm text-muted-foreground">{row.label}</dt>
								<dd className="text-sm text-foreground">{row.value}</dd>
							</div>
						))}
					</dl>
				</div>
			))}
		</div>
	);
}

export function PricingTable({ product }: { product: Product }) {
	const plans = getPlansForProduct(product.id);
	if (plans.length === 0) {
		return (
			<p className="border border-border p-5 text-sm text-muted-foreground">
				No pricing plan is modelled for this product. Commercial terms are quoted
				individually.
			</p>
		);
	}

	return (
		<div className="overflow-x-auto border border-border">
			<table className="w-full min-w-[680px] border-collapse text-left text-sm">
				<caption className="sr-only">Pricing plans for {product.name}</caption>
				<thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
					<tr>
						<th scope="col" className="px-4 py-3 font-medium">Plan</th>
						<th scope="col" className="px-4 py-3 font-medium">Billing</th>
						<th scope="col" className="px-4 py-3 font-medium">Price</th>
						<th scope="col" className="px-4 py-3 font-medium">Conditions</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-border">
					{plans.map((plan) => (
						<tr key={plan.id}>
							<td className="px-4 py-4 align-top">
								<span className="font-medium text-foreground">{plan.name}</span>
								<span className="mt-1 block text-xs text-muted-foreground">
									{plan.unitLabel}
								</span>
							</td>
							<td className="px-4 py-4 align-top text-muted-foreground">
								{billingModelLabel(plan)}
							</td>
							<td className="px-4 py-4 align-top">
								<span className={cn("text-sm", plan.amountMinor === null ? "text-muted-foreground" : "font-medium text-foreground")}>
									{formatPlanPrice(plan)}
								</span>
								{plan.status === "draft" && (
									<span className="mt-1 block text-xs text-muted-foreground">
										Draft plan — not an offer
									</span>
								)}
							</td>
							<td className="max-w-sm px-4 py-4 align-top">
								<ul className="space-y-1 text-xs leading-relaxed text-muted-foreground">
									{plan.conditions.map((condition) => (
										<li key={condition}>{condition}</li>
									))}
								</ul>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function RelatedProducts({ product }: { product: Product }) {
	const related = getRelatedProducts(product);
	if (related.length === 0) return null;
	return (
		<ul className="divide-y divide-border border-y border-border">
			{related.map((item) => (
				<li key={item.id}>
					<Link
						href={item.route ?? FAMILIES[item.family].route}
						className="flex items-center justify-between gap-4 py-4 hover:text-primary"
					>
						<span>
							<span className="block text-sm font-medium text-foreground">
								{item.name}
							</span>
							<span className="block text-xs text-muted-foreground">
								{item.tagline}
							</span>
						</span>
						<span aria-hidden="true">→</span>
					</Link>
				</li>
			))}
		</ul>
	);
}
