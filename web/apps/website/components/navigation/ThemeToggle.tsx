"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
	const root = document.documentElement;
	root.classList.toggle("dark", theme === "dark");
	root.style.colorScheme = theme;
}

/**
 * Theme control.
 *
 * Dark is the default theme: `.dark` ships on <html> and the inline script
 * resolves an explicit light choice before paint. This component reads that
 * decision and lets the visitor override it.
 */
export function ThemeToggle() {
	const [theme, setTheme] = useState<Theme>("dark");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const stored = window.localStorage.getItem("astron-theme");
		const initial: Theme =
			stored === "light" || stored === "dark"
				? stored
				: document.documentElement.classList.contains("dark")
					? "dark"
					: "light";
		setTheme(initial);
		setMounted(true);
	}, []);

	function toggle() {
		const next: Theme = theme === "dark" ? "light" : "dark";
		setTheme(next);
		applyTheme(next);
		try {
			window.localStorage.setItem("astron-theme", next);
		} catch {
			// Storage can be unavailable (private mode); the theme still applies.
		}
	}

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={
				mounted
					? `Switch to ${theme === "dark" ? "light" : "dark"} theme`
					: "Switch theme"
			}
			className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		>
			<Sun
				className={mounted && theme === "dark" ? "hidden" : "h-4 w-4"}
				aria-hidden="true"
			/>
			<Moon
				className={mounted && theme === "dark" ? "h-4 w-4" : "hidden"}
				aria-hidden="true"
			/>
		</button>
	);
}

