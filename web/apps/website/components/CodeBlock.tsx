"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Code block with a copy control that confirms in place. */
export function CodeBlock({
	code,
	label,
	className,
}: {
	code: string;
	label?: string;
	className?: string;
}) {
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		if (!copied) return;
		const timer = setTimeout(() => setCopied(false), 1400);
		return () => clearTimeout(timer);
	}, [copied]);

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
		} catch {
			setCopied(false);
		}
	}

	return (
		<div className={cn("overflow-hidden rounded-md border border-border bg-subtle", className)}>
			<div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2">
				<span className="font-mono text-xs text-subtle-foreground">
					{label ?? "shell"}
				</span>
				<button
					type="button"
					onClick={copy}
					className="inline-flex items-center gap-1.5 rounded-xs px-2 py-1 font-mono text-xs text-subtle-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-label={copied ? "Copied" : "Copy to clipboard"}
				>
					{copied ? (
						<Check className="h-3.5 w-3.5" aria-hidden="true" />
					) : (
						<Copy className="h-3.5 w-3.5" aria-hidden="true" />
					)}
					{copied ? "Copied" : "Copy"}
				</button>
			</div>
			<pre className="overflow-x-auto px-4 py-3 text-[0.8125rem] leading-relaxed text-foreground">
				<code>{code}</code>
			</pre>
			<span aria-live="polite" className="sr-only">
				{copied ? "Copied to clipboard" : ""}
			</span>
		</div>
	);
}
