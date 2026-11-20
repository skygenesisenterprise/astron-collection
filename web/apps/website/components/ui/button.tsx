"use client";

import { Button as ZenthButton, LinkButton } from "@company/react";
import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant =
	| "default"
	| "destructive"
	| "outline"
	| "secondary"
	| "ghost"
	| "link";

type ButtonSize = "default" | "sm" | "lg" | "icon";

const VARIANT_MAP = {
	default: "primary",
	destructive: "destructive",
	outline: "outline",
	secondary: "secondary",
	ghost: "ghost",
	link: "ghost",
} as const;

const SIZE_MAP = {
	default: "lg",
	sm: "base",
	lg: "lg",
	icon: "lg",
} as const;

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant;
	size?: ButtonSize;
	asChild?: boolean;
	children?: React.ReactNode;
}

/**
 * Site-facing adapter over the design-system Button.
 *
 * The public API used by the site (`variant`, `size`, `asChild`) is preserved,
 * but the rendering, tokens and interaction states come from
 * `@company/react`. `asChild` with a link renders the library's LinkButton
 * so routing still goes through the shared LinkProvider.
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	function Button(
		{
			className,
			variant = "default",
			size = "default",
			asChild = false,
			children,
			...props
		},
		ref,
	) {
		const mappedVariant = VARIANT_MAP[variant];
		const mappedSize = SIZE_MAP[size];
		const sizing = size === "lg" ? "h-11 px-5" : size === "sm" ? "h-9 px-3" : undefined;

		if (asChild && React.isValidElement(children)) {
			const child = children as React.ReactElement<{
				href?: string;
				children?: React.ReactNode;
			}>;
			return (
				<LinkButton
					href={child.props.href}
					variant={mappedVariant}
					size={mappedSize}
					className={cn(sizing, className)}
				>
					{child.props.children}
				</LinkButton>
			);
		}

		return (
			<ZenthButton
				ref={ref}
				variant={mappedVariant}
				size={mappedSize}
				className={cn(
					sizing,
					variant === "link" &&
						"h-auto bg-transparent p-0 text-zenth-link underline-offset-4 hover:underline",
					className,
				)}
				{...props}
			>
				{children}
			</ZenthButton>
		);
	},
);

Button.displayName = "Button";
