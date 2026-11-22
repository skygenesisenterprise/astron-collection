import {
	Badge,
	type BadgeVariant,
	buttonVariants,
	Empty,
	LinkButton,
	Loader,
	Text,
} from "@astron-collection/react";
import type { Icon } from "@phosphor-icons/react";
import { WarningCircleIcon } from "@phosphor-icons/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type ActionVariant = "primary" | "secondary" | "ghost" | "danger";
export type ActionSize = "sm" | "md";

const LINK_VARIANTS = {
	primary: "primary",
	secondary: "secondary",
	ghost: "ghost",
	danger: "secondary-destructive",
} as const;

const LINK_SIZES = {
	sm: "sm",
	md: "base",
} as const;

/**
 * Shared action styling taken from the design system, so native buttons and
 * Next links look identical without a wrapper forcing the element type.
 */
export function actionClass(
	variant: ActionVariant = "secondary",
	size: ActionSize = "md",
	className?: string,
) {
	return cn(
		buttonVariants({
			variant: LINK_VARIANTS[variant],
			size: LINK_SIZES[size],
		}),
		className,
	);
}

/** Action rendered through the design system's link button. */
export function ActionLink({
	href,
	children,
	variant = "secondary",
	size = "md",
	className,
	external = false,
	onClick,
}: {
	href: string;
	children: ReactNode;
	variant?: ActionVariant;
	size?: ActionSize;
	className?: string;
	external?: boolean;
	onClick?: () => void;
}) {
	return (
		<LinkButton
			href={href}
			variant={LINK_VARIANTS[variant]}
			size={LINK_SIZES[size]}
			className={className}
			external={external}
			onClick={onClick}
		>
			{children}
		</LinkButton>
	);
}

const AVATAR_SIZES = {
	sm: "size-8 text-xs",
	md: "size-9 text-sm",
	lg: "size-16 text-xl",
} as const;

function initials(name: string) {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "?";
	if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() ?? "?";
	return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
}

/**
 * Account avatar. Falls back to initials, never to a stock image, so a missing
 * image is visible as missing rather than as a fake identity.
 */
export function ManagerAvatar({
	image,
	name,
	size = "md",
	className,
}: {
	image?: string | null;
	name: string;
	size?: keyof typeof AVATAR_SIZES;
	className?: string;
}) {
	const shared = cn(
		"shrink-0 overflow-hidden rounded-full border border-zenth-line bg-zenth-tint text-zenth-default",
		AVATAR_SIZES[size],
		className,
	);

	if (image) {
		return (
			// biome-ignore lint/performance/noImgElement: avatar URLs are user-provided (uploads or OAuth), next/image cannot optimise them
			<img src={image} alt="" className={cn(shared, "object-cover")} />
		);
	}

	return (
		<span
			aria-hidden="true"
			className={cn(shared, "flex items-center justify-center font-semibold")}
		>
			{initials(name)}
		</span>
	);
}

export type StatusTone = "neutral" | "success" | "warning" | "danger" | "info";

const STATUS_VARIANTS: Record<StatusTone, BadgeVariant> = {
	neutral: "secondary",
	success: "success",
	warning: "warning",
	danger: "error",
	info: "info",
};

/** State label built on the design system's Badge. */
export function StatusPill({
	tone = "neutral",
	children,
	className,
}: {
	tone?: StatusTone;
	children: ReactNode;
	className?: string;
}) {
	return (
		<Badge variant={STATUS_VARIANTS[tone]} className={className}>
			{children}
		</Badge>
	);
}

/**
 * Surface used by every Personal Space page. Grouping is the only reason it
 * exists: a section title, an optional action and its content.
 */
export function Panel({
	title,
	description,
	action,
	children,
	className,
	bodyClassName,
}: {
	title?: string;
	description?: ReactNode;
	action?: ReactNode;
	children: ReactNode;
	className?: string;
	bodyClassName?: string;
}) {
	return (
		<section
			className={cn(
				"overflow-hidden rounded-lg bg-zenth-base shadow-xs ring ring-zenth-line",
				className,
			)}
		>
			{(title || description || action) && (
				<header className="flex flex-wrap items-start justify-between gap-3 border-b border-zenth-line px-5 py-4">
					<div className="min-w-0">
						{title && (
							<Text
								variant="heading"
								as="h2"
								DANGEROUS_className="text-sm font-semibold text-zenth-strong"
							>
								{title}
							</Text>
						)}
						{description && (
							<Text
								variant="secondary"
								size="xs"
								as="p"
								DANGEROUS_className="mt-1 leading-relaxed text-zenth-subtle"
							>
								{description}
							</Text>
						)}
					</div>
					{action && <div className="shrink-0">{action}</div>}
				</header>
			)}
			<div className={cn("p-5", bodyClassName)}>{children}</div>
		</section>
	);
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	action,
	note,
}: {
	icon: Icon;
	title: string;
	description: string;
	action?: ReactNode;
	note?: ReactNode;
}) {
	return (
		<div>
			<Empty
				size="sm"
				className="border-0 bg-transparent px-4 py-8"
				icon={<Icon aria-hidden="true" className="size-8 text-zenth-subtle" />}
				title={title}
				description={description}
				contents={
					action ? (
						<div className="flex flex-wrap justify-center gap-2">{action}</div>
					) : undefined
				}
			/>
			{note && (
				<p className="mx-auto -mt-3 max-w-md text-center text-xs leading-relaxed text-zenth-subtle/80">
					{note}
				</p>
			)}
		</div>
	);
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
	return (
		<div
			role="status"
			aria-live="polite"
			className="flex items-center justify-center gap-2 px-4 py-12 text-sm text-zenth-subtle"
		>
			<Loader size="sm" aria-label={label} />
			{label}
		</div>
	);
}

export function ErrorState({
	title = "Something went wrong",
	description,
	onRetry,
}: {
	title?: string;
	description?: ReactNode;
	onRetry?: () => void;
}) {
	return (
		<div
			role="alert"
			className="flex flex-col items-center px-4 py-10 text-center"
		>
			<div className="flex size-11 items-center justify-center rounded-full border border-zenth-danger/35 bg-zenth-danger-tint">
				<WarningCircleIcon
					aria-hidden="true"
					className="size-5 text-zenth-danger"
				/>
			</div>
			<h3 className="mt-4 text-sm font-semibold text-zenth-strong">{title}</h3>
			{description && (
				<p className="mt-1.5 max-w-md text-sm leading-relaxed text-zenth-subtle">
					{description}
				</p>
			)}
			{onRetry && (
				<button
					type="button"
					onClick={onRetry}
					className={actionClass("secondary", "sm", "mt-4")}
				>
					Try again
				</button>
			)}
		</div>
	);
}
