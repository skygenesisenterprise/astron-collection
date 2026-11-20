import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { SocketMark } from "./marks";

/**
 * Section header used across the site. One lead-in pattern keeps every page
 * reading as a single editorial system: one display heading and an optional
 * supporting paragraph. The socket marker, institutional index and eyebrow
 * form one optional row above the heading; a page that does not number its
 * sections omits all three at once.
 *
 * `align="center"` is the homepage and pricing default: the heading sits on the
 * page's centre line and the supporting paragraph is narrowed beneath it, so
 * each section opens on one calm axis. Each part carries `data-reveal` so the
 * Reveal client component can stagger its entrance.
 */
export function SectionIntro({
	id,
	index,
	eyebrow,
	title,
	description,
	actions,
	tone = "default",
	align = "start",
	className,
}: {
	id: string;
	/** Section order, e.g. "03". Institutional numbering, not decoration. */
	index?: string;
	eyebrow?: string;
	title: string;
	description?: string;
	actions?: ReactNode;
	tone?: "default" | "inverse";
	align?: "start" | "center";
	className?: string;
}) {
	const inverse = tone === "inverse";
	const centered = align === "center";
	const showEyebrowRow = Boolean(eyebrow || index);

	return (
		<div
			className={cn(
				centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl",
				className,
			)}
		>
			{showEyebrowRow ? (
				<p
					data-reveal
					className={cn(
						"flex items-center gap-2.5 text-sm",
						centered && "justify-center",
						inverse ? "text-brand-foreground/80" : "text-muted-foreground",
					)}
				>
					<SocketMark />
					{index ? (
						<span
							className={cn(
								"font-mono text-xs tabular-nums",
								inverse ? "text-brand-foreground" : "text-foreground",
							)}
						>
							{index}
						</span>
					) : null}
					{eyebrow ? <span>{eyebrow}</span> : null}
				</p>
			) : null}
			<h2
				id={id}
				data-reveal
				className={cn(
					"font-display text-3xl font-medium leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl",
					showEyebrowRow && "mt-4",
					inverse ? "text-brand-foreground" : "text-foreground",
				)}
			>
				{title}
			</h2>
			{description ? (
				<p
					data-reveal
					className={cn(
						"mt-4 max-w-xl text-base leading-7",
						centered && "mx-auto",
						inverse ? "text-brand-foreground/85" : "text-muted-foreground",
					)}
				>
					{description}
				</p>
			) : null}
			{actions ? (
				<div
					data-reveal
					className={cn(
						"mt-8 flex flex-wrap items-center gap-3",
						centered && "justify-center",
					)}
				>
					{actions}
				</div>
			) : null}
		</div>
	);
}
