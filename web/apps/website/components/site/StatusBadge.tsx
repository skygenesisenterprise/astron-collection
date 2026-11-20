import { Badge } from "@astron-collection/react";
import {
	COMMERCIAL_STATUS_META,
	PRODUCT_AVAILABILITY_META,
} from "@/lib/domain/queries";
import type {
	CommercialStatus,
	ProductAvailability,
} from "@/lib/domain/schema";
import { cn } from "@/lib/utils";

const COMMERCIAL_VARIANT: Record<
	CommercialStatus,
	"success" | "secondary" | "info" | "warning"
> = {
	available: "success",
	coming_soon: "secondary",
	contact_sales: "info",
	partner_service: "warning",
};

const AVAILABILITY_VARIANT: Record<
	ProductAvailability,
	"success" | "secondary" | "info" | "warning"
> = {
	available: "success",
	limited: "info",
	private_preview: "warning",
	coming_soon: "secondary",
	planned: "secondary",
	unavailable: "secondary",
};

/**
 * Regional commercial status label.
 *
 * Colour, shape and typography come from the design-system Badge so the same
 * status reads identically on every product surface.
 */
export function StatusBadge({
	status,
	className,
	showDescription = false,
}: {
	status: CommercialStatus;
	className?: string;
	showDescription?: boolean;
}) {
	const meta = COMMERCIAL_STATUS_META[status];
	return (
		<span className={cn("inline-flex flex-col gap-1", className)}>
			<Badge variant={COMMERCIAL_VARIANT[status]}>{meta.label}</Badge>
			{showDescription && (
				<span className="text-xs leading-relaxed text-muted-foreground">
					{meta.description}
				</span>
			)}
		</span>
	);
}

/**
 * Product-level availability: whether a service can be consumed at all,
 * independent of the per-region commercial state.
 */
export function AvailabilityBadge({
	status,
	className,
	showDescription = false,
}: {
	status: ProductAvailability;
	className?: string;
	showDescription?: boolean;
}) {
	const meta = PRODUCT_AVAILABILITY_META[status];
	return (
		<span className={cn("inline-flex flex-col gap-1", className)}>
			<Badge variant={AVAILABILITY_VARIANT[status]}>{meta.label}</Badge>
			{showDescription && (
				<span className="text-xs leading-relaxed text-muted-foreground">
					{meta.description}
				</span>
			)}
		</span>
	);
}
