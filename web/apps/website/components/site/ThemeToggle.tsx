"use client";

import { Button } from "@company/react";
import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle({
	className,
	variant = "default",
}: {
	className?: string;
	variant?: "default" | "ghost";
}) {
	const { theme, toggle } = useTheme();
	const nextLabel = theme === "dark" ? "light" : "dark";

	return (
		<Button
			variant={variant === "ghost" ? "ghost" : "outline"}
			shape="square"
			size="sm"
			onClick={toggle}
			aria-label={`Switch to ${nextLabel} theme`}
			className={className}
		>
			{theme === "dark" ? (
				<Sun className="size-4" weight="regular" aria-hidden="true" />
			) : (
				<Moon className="size-4" weight="regular" aria-hidden="true" />
			)}
		</Button>
	);
}
