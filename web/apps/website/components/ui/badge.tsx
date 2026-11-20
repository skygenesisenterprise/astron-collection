"use client";

import { Badge as ZenthBadge } from "@company/react";
import type * as React from "react";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

const VARIANT_MAP = {
	default: "primary",
	secondary: "secondary",
	destructive: "error",
	outline: "outline",
} as const;

export interface BadgeProps {
	variant?: BadgeVariant;
	className?: string;
	children: React.ReactNode;
}

/** Site-facing alias for the design-system Badge. */
export function Badge({ variant = "default", className, children }: BadgeProps) {
	return (
		<ZenthBadge variant={VARIANT_MAP[variant]} className={className}>
			{children}
		</ZenthBadge>
	);
}
