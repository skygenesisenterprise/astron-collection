"use client";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Button.
 *
 * Feedback starts on pointer-down (`active:`), transitions are limited to
 * colour and transform, and the radius/size scale comes from the tokens.
 */
const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,color,border-color,transform] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				secondary:
					"border border-border bg-secondary text-secondary-foreground hover:border-border-strong hover:bg-card",
				outline:
					"border border-border bg-transparent text-foreground hover:bg-secondary",
				ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
				danger:
					"bg-danger text-destructive-foreground hover:bg-danger/90",
				link: "text-primary underline-offset-4 hover:underline",
			},
			size: {
				sm: "h-8 px-3 text-sm",
				default: "h-10 px-4",
				lg: "h-12 px-6 text-base",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: {
			variant: "default",
			size: "default",
		},
	},
);

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : "button";
		return (
			<Comp
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		);
	},
);
Button.displayName = "Button";

export { Button, buttonVariants };
