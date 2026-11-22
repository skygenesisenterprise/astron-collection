import { useCallback, useEffect, useState } from "react";
import type { RecentNavigationPage } from "./navigation";

const MAX_RECENT_PAGES = 5;
const RECENT_PAGES_EVENT = "astron-collection:recent-pages-updated";

export function updateRecentPages(
	pages: readonly RecentNavigationPage[],
	page: RecentNavigationPage,
): RecentNavigationPage[] {
	return [
		page,
		...pages.filter((recentPage) => recentPage.path !== page.path),
	].slice(0, MAX_RECENT_PAGES);
}

function storageKey(organizationId: string, userEmail: string): string {
	return `astron-collection:recent-pages:${organizationId}:${encodeURIComponent(
		userEmail.trim().toLowerCase(),
	)}`;
}

function isRecentNavigationPage(value: unknown): value is RecentNavigationPage {
	if (!value || typeof value !== "object") return false;
	const page = value as Record<string, unknown>;
	return (
		typeof page.path === "string" &&
		page.path.length > 0 &&
		typeof page.section === "string" &&
		typeof page.item === "string"
	);
}

function readRecentPages(key: string): RecentNavigationPage[] {
	if (typeof window === "undefined") return [];

	try {
		const serialized = window.localStorage.getItem(key);
		if (!serialized) return [];

		const parsed: unknown = JSON.parse(serialized);
		if (!Array.isArray(parsed)) {
			throw new TypeError("Recent page data must be an array.");
		}

		const pages = parsed.filter(isRecentNavigationPage);
		if (pages.length !== parsed.length) {
			console.warn("Some invalid recent page entries were ignored.");
		}
		return pages.slice(0, MAX_RECENT_PAGES);
	} catch (error) {
		console.error("Could not read recent pages from local storage.", error);
		return [];
	}
}

function writeRecentPages(key: string, pages: RecentNavigationPage[]): void {
	try {
		window.localStorage.setItem(key, JSON.stringify(pages));
	} catch (error) {
		console.error("Could not save recent pages to local storage.", error);
	}
}

export function useRecentPages(
	organizationId: string,
	userEmail: string,
): [RecentNavigationPage[], (page: RecentNavigationPage) => void] {
	const key = storageKey(organizationId, userEmail);
	const [state, setState] = useState<{
		key: string;
		pages: RecentNavigationPage[];
	}>({ key, pages: [] });
	const pages = state.key === key ? state.pages : [];

	useEffect(() => {
		const sync = () => setState({ key, pages: readRecentPages(key) });
		const handleStorage = (event: StorageEvent) => {
			if (event.key === key) sync();
		};
		const handleUpdate = (event: Event) => {
			if (event instanceof CustomEvent && event.detail === key) {
				sync();
			}
		};

		sync();
		window.addEventListener("storage", handleStorage);
		window.addEventListener(RECENT_PAGES_EVENT, handleUpdate);
		return () => {
			window.removeEventListener("storage", handleStorage);
			window.removeEventListener(RECENT_PAGES_EVENT, handleUpdate);
		};
	}, [key]);

	const addPage = useCallback(
		(page: RecentNavigationPage) => {
			const next = updateRecentPages(readRecentPages(key), page);
			writeRecentPages(key, next);
			setState({ key, pages: next });
			window.dispatchEvent(
				new CustomEvent(RECENT_PAGES_EVENT, { detail: key }),
			);
		},
		[key],
	);

	return [pages, addPage];
}
