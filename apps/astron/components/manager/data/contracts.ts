/**
 * Personal Space data contracts.
 *
 * Guild data comes from the backend directory (`discord.guilds.list`). The
 * canonical shapes live in the server package and are imported as types only,
 * so no database or OAuth code reaches the browser bundle. The UI keeps its
 * own naming (`iconUrl`, `id`) as an adapter for the existing components.
 *
 * Notification, activity and saved-item collections remain local empty
 * snapshots until their own stores exist; they are never filled with invented
 * rows.
 */
import type {
	DiscordConnectionStatus,
	DiscordGuildListResult,
	DiscordGuildSyncStatus,
	DiscordServerItem,
	DiscordServerProduct,
} from "@astron-collection/server/services/discord-guild-directory/contracts";

export type {
	AstronInstallationState,
	DiscordMembershipState,
	WorkspaceAuthorizationState,
	WorkspaceAvailabilityState,
} from "@astron-collection/server/services/discord-guild-directory/contracts";

export type ManagerServerProduct = DiscordServerProduct;

/** A server entry of the rail, with legacy UI aliases. */
export interface ManagerServer extends DiscordServerItem {
	/** @deprecated Use `guildId`; the Discord snowflake is the canonical id. */
	id: string;
	/** @deprecated Use `icon`. */
	iconUrl: string | null;
}

export interface ManagerServersSnapshot {
	status: DiscordGuildListResult["status"];
	servers: ManagerServer[];
	/** Human-readable reason the directory cannot be listed; null when ready. */
	reason: string | null;
	manageableOnly: boolean;
	connection: DiscordConnectionStatus;
	sync: DiscordGuildSyncStatus;
}

/** Adapts a backend item to the names the existing rail components use. */
export function toManagerServer(server: DiscordServerItem): ManagerServer {
	return { ...server, id: server.guildId, iconUrl: server.icon };
}

export const SERVER_DIRECTORY_UNAVAILABLE_REASON =
	"Link your Discord account to list the servers you can manage.";

/** Empty fallback used before the first query resolves; never a data source. */
export const MANAGER_SERVERS: ManagerServersSnapshot = {
	status: "unavailable",
	servers: [],
	reason: SERVER_DIRECTORY_UNAVAILABLE_REASON,
	manageableOnly: true,
	connection: {
		linked: false,
		status: "disconnected",
		lastAttemptAt: null,
		lastSuccessfulSyncAt: null,
		lastError: null,
		errorCode: null,
		guildCount: 0,
		consecutiveFailures: 0,
		accountId: null,
		discordUserId: null,
		scopes: [],
		canListGuilds: false,
		linkedAt: null,
	},
	sync: {
		linked: false,
		status: "disconnected",
		lastAttemptAt: null,
		lastSuccessfulSyncAt: null,
		lastError: null,
		errorCode: null,
		guildCount: 0,
		consecutiveFailures: 0,
	},
};

export type NotificationCategory =
	| "platform"
	| "security"
	| "discord"
	| "server"
	| "product"
	| "integration";

export interface ManagerNotification {
	id: string;
	category: NotificationCategory;
	title: string;
	body: string;
	/** ISO timestamp. */
	createdAt: string;
	read: boolean;
	/** In-app destination the notification points at. */
	href?: string;
}

/** Empty until a user-addressed notification store exists. */
export const MANAGER_NOTIFICATIONS: ManagerNotification[] = [];

export type ActivityCategory =
	| "account"
	| "security"
	| "discord"
	| "workspace"
	| "application";

export interface ManagerActivityEvent {
	id: string;
	category: ActivityCategory;
	description: string;
	/** ISO timestamp. */
	occurredAt: string;
	href?: string;
}

/** Empty until personal events are recorded outside the organization scope. */
export const MANAGER_ACTIVITY: ManagerActivityEvent[] = [];

export type SavedItemKind =
	| "server"
	| "product"
	| "configuration"
	| "documentation"
	| "shortcut";

export interface ManagerSavedItem {
	id: string;
	kind: SavedItemKind;
	label: string;
	href: string;
	/** ISO timestamp. */
	savedAt: string;
}

/** Empty until saved items can be persisted for the account. */
export const MANAGER_SAVED_ITEMS: ManagerSavedItem[] = [];

/**
 * Formats a timestamp in a fixed locale and time zone so the server-rendered
 * markup and the hydrated client agree. `null` input is rendered as an em dash.
 */
export function formatManagerDate(value: string | Date | null | undefined) {
	if (!value) return "—";
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return "—";
	return new Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: "UTC",
	}).format(date);
}

/** Same formatting rule, date only. */
export function formatManagerDay(value: string | Date | null | undefined) {
	if (!value) return "—";
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return "—";
	return new Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
		timeZone: "UTC",
	}).format(date);
}
