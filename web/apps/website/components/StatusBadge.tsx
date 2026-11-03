import type { AppStatus } from "@/lib/content/applications";
import { statusLabel } from "@/lib/content/applications";
import { cn } from "@/lib/utils";

const styles: Record<AppStatus, { dot: string; text: string; ring: string }> = {
	available: {
		dot: "bg-success",
		text: "text-foreground",
		ring: "border-success/40",
	},
	in_development: {
		dot: "border border-warning bg-transparent",
		text: "text-foreground",
		ring: "border-warning/40",
	},
	planned: {
		dot: "border border-dashed border-subtle-foreground bg-transparent",
		text: "text-muted-foreground",
		ring: "border-border",
	},
};

/**
 * Status badge.
 *
 * The label is always rendered as text: colour and dot shape only reinforce it,
 * so the status survives greyscale, colour blindness and screen readers
 * (WEBSITE_DESIGN_SYSTEM.md §7.4).
 */
export function StatusBadge({
	status,
	className,
}: {
	status: AppStatus;
	className?: string;
}) {
	const style = styles[status];

	return (
		<span
			className={cn(
				"inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium",
				style.ring,
				style.text,
				className,
			)}
		>
			<span
				aria-hidden="true"
				className={cn("h-1.5 w-1.5 shrink-0 rounded-full", style.dot)}
			/>
			{statusLabel[status]}
		</span>
	);
}
