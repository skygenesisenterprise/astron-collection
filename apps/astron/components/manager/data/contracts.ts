/**
 * Personal Space data contracts.
 *
 * The application only renders data it actually has. Several concepts the
 * Personal Space is designed around — the Discord guild directory, Astron bot
 * installations, user notifications and a personal activity feed — have no
 * database model in this repository yet. Instead of inventing rows, each
 * contract below describes the shape the UI already consumes, together with an
 * explicitly empty snapshot and the backend capability that must be added to
 * make it real.
 *
 * Required backend work (not implemented here):
 * 1. A Discord guild directory resolved from the user's OAuth guild scopes,
 *    exposing membership, bot installation, workspace availability and the
 *    caller's workspace authorization as four independent values.
 * 2. A notification store addressed to a user (read/unread, category, target),
 *    with mark-as-read and mark-all-as-read mutations.
 * 3. A personal activity feed written by account, connection, security and
 *    workspace events.
 * 4. A saved-items store scoped to the user, keyed by a typed item reference.
 *
 * None of these values are fabricated: every consumer receives the empty
 * snapshots below until a real source is wired in.
 */

/** Whether the signed-in user is a member of the Discord server. */
export type DiscordMembershipState = "member" | "unknown";

/** Whether an Astron bot is installed in the Discord server. */
export type AstronInstallationState = "installed" | "not-installed" | "unknown";

/** Whether Astron Manager can expose a workspace for the server. */
export type WorkspaceAvailabilityState =
	| "available"
	| "unavailable"
	| "unknown";

/**
 * What the signed-in user may do inside the workspace. This is resolved
 * server-side; a Discord membership or an installation never implies it.
 */
export type WorkspaceAuthorizationState =
	| "administrator"
	| "manage-server"
	| "none"
	| "unknown";

export interface ManagerServerProduct {
	id: string;
	name: string;
	enabled: boolean;
}

/**
 * A server entry of the rail. The four state fields stay separate on purpose:
 * membership, installation, workspace availability and authorization are
 * different questions with different answers.
 */
export interface ManagerServer {
	id: string;
	name: string;
	iconUrl: string | null;
	membership: DiscordMembershipState;
	installation: AstronInstallationState;
	workspace: WorkspaceAvailabilityState;
	authorization: WorkspaceAuthorizationState;
	products: ManagerServerProduct[];
}

export interface ManagerServersSnapshot {
	status: "ready" | "unavailable";
	servers: ManagerServer[];
	/** Human-readable reason the directory cannot be listed; null when ready. */
	reason: string | null;
}

export const SERVER_DIRECTORY_UNAVAILABLE_REASON =
	"This deployment has no Discord guild directory or Astron bot registry connected, so your servers cannot be listed yet.";

/** The rail and the server pages both read this snapshot. */
export const MANAGER_SERVERS: ManagerServersSnapshot = {
	status: "unavailable",
	servers: [],
	reason: SERVER_DIRECTORY_UNAVAILABLE_REASON,
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
