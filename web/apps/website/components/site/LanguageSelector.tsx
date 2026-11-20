"use client";

import { Globe2 } from "lucide-react";

/**
 * English is the only complete locale. French and Dutch are listed as planned
 * with a native <details> disclosure: they are not links and cannot be
 * mistaken for working routes. No hreflang is emitted for untranslated pages.
 */
export function LanguageSelector({
	className,
	variant = "default",
}: {
	className?: string;
	variant?: "default" | "ghost";
}) {
	const ghost = variant === "ghost";

	return (
		<details className={`group relative ${className ?? ""}`}>
			<summary
				className={`flex h-9 cursor-pointer list-none items-center gap-1.5 rounded-full px-2.5 text-sm transition-colors [&::-webkit-details-marker]:hidden ${
					ghost
						? "text-muted-foreground/65 hover:bg-accent/10 hover:text-muted-foreground"
						: "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
				}`}
			>
				<Globe2 className="h-4 w-4" aria-hidden="true" />
				<span className={ghost ? "sr-only" : "hidden sm:inline"}>EN</span>
				<span className="sr-only">Change language (current: English)</span>
			</summary>
			<div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-border bg-popover p-1.5 shadow-lg">
				<p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
					Language
				</p>
				<span
					aria-current="true"
					className="flex items-center justify-between rounded-md bg-accent px-2 py-1.5 text-sm text-foreground"
				>
					English
					<span className="text-xs text-muted-foreground">Current</span>
				</span>
				<span className="flex items-center justify-between px-2 py-1.5 text-sm text-muted-foreground">
					Français
					<span className="text-xs">Planned</span>
				</span>
				<span className="flex items-center justify-between px-2 py-1.5 text-sm text-muted-foreground">
					Nederlands
					<span className="text-xs">Planned</span>
				</span>
				<p className="border-t border-border px-2 pb-1 pt-2 text-xs leading-relaxed text-muted-foreground">
					Only English is complete. Translations are published once reviewed.
				</p>
			</div>
		</details>
	);
}
