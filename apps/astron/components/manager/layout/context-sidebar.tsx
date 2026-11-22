"use client";

import { Sidebar } from "@astron-collection/react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import {
	isPersonalNavigationItemActive,
	PERSONAL_NAVIGATION,
} from "../navigation";
import type { ManagerUser } from "../server";
import { UserPanel } from "./user-panel";

/**
 * Contextual navigation of the Personal Space.
 *
 * Built from the design system's `Sidebar` primitives: it owns the collapse
 * behaviour, the mobile sheet, the tooltips and the scroll fades. This
 * component only decides which destinations exist and which one is active.
 * It must be rendered inside `Sidebar.Provider` — the shell guarantees it.
 */
export function ContextSidebar({
	user,
	pathname,
}: {
	user: ManagerUser;
	pathname: string;
}) {
	const [query, setQuery] = useState("");

	const sections = useMemo(() => {
		const needle = query.trim().toLowerCase();
		if (!needle) return PERSONAL_NAVIGATION;
		return PERSONAL_NAVIGATION.map((section) => ({
			...section,
			items: section.items.filter((item) =>
				item.label.toLowerCase().includes(needle),
			),
		})).filter((section) => section.items.length > 0);
	}, [query]);

	return (
		<>
			<Sidebar.Header className="gap-2">
				<div className="min-w-0 flex-1 group-data-[state=collapsed]/sidebar:hidden">
					<div className="flex h-9 items-center gap-2 rounded-lg border border-zenth-line bg-zenth-control px-2.5 focus-within:ring-2 focus-within:ring-zenth-focus focus-within:ring-inset">
						<MagnifyingGlassIcon
							aria-hidden="true"
							className="size-4 shrink-0 text-zenth-subtle"
						/>
						<input
							type="search"
							value={query}
							onChange={(event) => setQuery(event.target.value)}
							placeholder="Search or jump to…"
							aria-label="Search personal space"
							className="min-w-0 flex-1 bg-transparent text-sm text-zenth-default outline-none placeholder:text-zenth-subtle"
						/>
					</div>
				</div>
				<Sidebar.Trigger />
			</Sidebar.Header>

			<Sidebar.Content>
				{sections.map((section) => (
					<Sidebar.Group key={section.id}>
						<Sidebar.GroupLabel>{section.label}</Sidebar.GroupLabel>
						<Sidebar.Menu>
							{section.items.map((item) => {
								const isActive = isPersonalNavigationItemActive(item, pathname);
								const ItemIcon = item.icon;
								return (
									<Sidebar.MenuButton
										key={item.href}
										href={item.href}
										icon={
											<ItemIcon
												aria-hidden="true"
												className={cn(
													"size-4.5 shrink-0",
													isActive ? "text-zenth-strong" : "text-zenth-subtle",
												)}
											/>
										}
										active={isActive}
										tooltip={item.label}
										aria-current={isActive ? "page" : undefined}
									>
										{item.label}
									</Sidebar.MenuButton>
								);
							})}
						</Sidebar.Menu>
					</Sidebar.Group>
				))}

				{query.trim() && sections.length === 0 && (
					<p className="px-3 py-3 text-xs text-zenth-subtle">
						No destination matches “{query.trim()}”.
					</p>
				)}
			</Sidebar.Content>

			{/* Pinned inside the navigation column, exactly like the reference:
			    the server rail keeps its full height beside it. */}
			<Sidebar.Footer
				className="mt-auto w-full shrink-0 items-center gap-0 overflow-hidden p-0!"
				style={{ width: "100%" }}
			>
				<UserPanel user={user} />
			</Sidebar.Footer>
		</>
	);
}
