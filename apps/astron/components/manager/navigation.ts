import type { Icon } from "@phosphor-icons/react";
import {
	BookmarkSimpleIcon,
	ClockCounterClockwiseIcon,
	GearSixIcon,
	HouseIcon,
	PlugsConnectedIcon,
	ShieldCheckIcon,
	SlidersHorizontalIcon,
	SquaresFourIcon,
	TrayIcon,
	UserCircleIcon,
} from "@phosphor-icons/react";

/**
 * One destination of the Personal Space sidebar.
 *
 * The href is the only source of truth for navigation: labels never decide
 * which section a page belongs to, so routes can be reorganised without
 * touching the layout.
 */
export interface PersonalNavigationItem {
	label: string;
	href: string;
	icon: Icon;
}

export interface PersonalNavigationSection {
	id: string;
	label: string;
	items: PersonalNavigationItem[];
}

/**
 * Personal Space destinations. Server administration modules deliberately do
 * not appear here: a guild workspace lives under `/channels/{guildId}` and the
 * personal space only exposes account-level concerns.
 */
export const PERSONAL_NAVIGATION: PersonalNavigationSection[] = [
	{
		id: "personal",
		label: "Personal space",
		items: [
			{ label: "Home", href: "/channels/me", icon: HouseIcon },
			{
				label: "My Servers",
				href: "/channels/me/servers",
				icon: SquaresFourIcon,
			},
			{ label: "Inbox", href: "/channels/me/inbox", icon: TrayIcon },
			{
				label: "Applications",
				href: "/channels/me/apps",
				icon: PlugsConnectedIcon,
			},
			{
				label: "Recent Activity",
				href: "/channels/me/activity",
				icon: ClockCounterClockwiseIcon,
			},
			{
				label: "Saved",
				href: "/channels/me/saved",
				icon: BookmarkSimpleIcon,
			},
		],
	},
	{
		id: "account",
		label: "Account",
		items: [
			{ label: "Profile", href: "/profile", icon: UserCircleIcon },
			{
				label: "Connections",
				href: "/channels/me/connections",
				icon: PlugsConnectedIcon,
			},
			{
				label: "Security",
				href: "/channels/me/security",
				icon: ShieldCheckIcon,
			},
			{
				label: "Preferences",
				href: "/channels/me/preferences",
				icon: SlidersHorizontalIcon,
			},
			{
				label: "Account Settings",
				href: "/channels/me/settings",
				icon: GearSixIcon,
			},
		],
	},
];

/** Trailing slashes are normalised before matching, so `?tab=` and `/` agree. */
export function normalizeManagerPathname(pathname: string): string {
	const withoutQuery = pathname.split(/[?#]/)[0] ?? pathname;
	const trimmed = withoutQuery.replace(/\/+$/, "");
	return trimmed === "" ? "/" : trimmed;
}

/**
 * Home only matches its own path; every other entry also matches its nested
 * routes, so `/channels/me/servers/123` keeps "My Servers" highlighted.
 */
export function isPersonalNavigationItemActive(
	item: PersonalNavigationItem,
	pathname: string,
): boolean {
	const current = normalizeManagerPathname(pathname);
	if (item.href === "/channels/me") return current === "/channels/me";
	return current === item.href || current.startsWith(`${item.href}/`);
}
