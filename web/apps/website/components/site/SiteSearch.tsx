"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Search, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import type { SearchEntry } from "@/lib/content/search-index";

export function SiteSearch({
	entries,
	variant = "default",
	className,
}: {
	entries: SearchEntry[];
	variant?: "default" | "icon";
	className?: string;
}) {
	const iconOnly = variant === "icon";
	const [open, setOpen] = React.useState(false);
	const [query, setQuery] = React.useState("");
	const router = useRouter();

	React.useEffect(() => {
		function onKeyDown(event: KeyboardEvent) {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				setOpen((value) => !value);
			}
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, []);

	const results = React.useMemo(() => {
		const term = query.trim().toLowerCase();
		if (!term) return entries.slice(0, 8);
		return entries
			.filter((entry) =>
				`${entry.title} ${entry.description} ${entry.group}`
					.toLowerCase()
					.includes(term),
			)
			.slice(0, 12);
	}, [entries, query]);

	const grouped = React.useMemo(() => {
		const map = new Map<string, SearchEntry[]>();
		for (const entry of results) {
			const list = map.get(entry.group) ?? [];
			list.push(entry);
			map.set(entry.group, list);
		}
		return [...map.entries()];
	}, [results]);

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger asChild>
				<button
					type="button"
					className={[
						iconOnly
							? "inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground/65 transition-colors hover:bg-accent/10 hover:text-muted-foreground"
							: "inline-flex h-9 items-center gap-2 rounded-md border border-border px-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:min-w-52 md:justify-start",
						className,
					]
						.filter(Boolean)
						.join(" ")}
					aria-label="Search the site"
				>
					<Search className="h-4 w-4" aria-hidden="true" />
					{iconOnly ? (
						<span className="sr-only">Search</span>
					) : (
						<>
							<span className="hidden md:inline">Search</span>
							<kbd className="ml-auto hidden rounded border border-border bg-muted px-1.5 py-0.5 font-sans text-[11px] text-muted-foreground md:inline">
								Ctrl K
							</kbd>
						</>
					)}
				</button>
			</Dialog.Trigger>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-[60] bg-overlay" />
				<Dialog.Content
					className="fixed left-1/2 top-[12vh] z-[61] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl focus:outline-none"
					aria-describedby="site-search-description"
				>
					<Dialog.Title className="sr-only">Search Sky Genesis Enterprise</Dialog.Title>
					<Dialog.Description id="site-search-description" className="sr-only">
						Search products, solutions, pricing, infrastructure and company pages.
					</Dialog.Description>
					<div className="flex items-center gap-2 border-b border-border px-3">
						<Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
						<input
							// eslint-disable-next-line jsx-a11y/no-autofocus -- focus belongs in the dialog
							autoFocus
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter" && results[0]) {
									setOpen(false);
									router.push(results[0].href);
								}
							}}
							placeholder="Search products, solutions, pages…"
							aria-label="Search query"
							className="h-12 w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
						/>
						<Dialog.Close asChild>
							<button
								type="button"
								aria-label="Close search"
								className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
							>
								<X className="h-4 w-4" aria-hidden="true" />
							</button>
						</Dialog.Close>
					</div>
					<div className="max-h-[60vh] overflow-y-auto p-2">
						{results.length === 0 ? (
							<p className="px-3 py-8 text-center text-sm text-muted-foreground">
								No page matches “{query}”. Try “compute”, “storage” or “pricing”.
							</p>
						) : (
							grouped.map(([group, items]) => (
								<div key={group} className="mb-2">
									<p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										{group}
									</p>
									<ul>
										{items.map((item) => (
											<li key={`${item.group}-${item.href}-${item.title}`}>
												<Link
													href={item.href}
													onClick={() => setOpen(false)}
													className="block rounded-md px-2 py-2 hover:bg-accent focus-visible:bg-accent"
												>
													<span className="block text-sm font-medium text-foreground">
														{item.title}
													</span>
													<span className="block text-xs text-muted-foreground">
														{item.description}
													</span>
												</Link>
											</li>
										))}
									</ul>
								</div>
							))
						)}
					</div>
					<div className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
						Enter opens the first result · Esc closes
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
