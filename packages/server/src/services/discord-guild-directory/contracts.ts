/**
 * Canonical contracts of the Discord guild directory.
 *
 * Kept free of database and network imports so both the tRPC layer and the
 * browser can depend on the same shapes without pulling server-only code into
 * a client bundle.
 */

export const DISCORD_PROVIDER_ID = "discord";

/** Scopes required to list the guilds of the linked Discord account. */
export const DISCORD_REQUIRED_SCOPES = ["identify", "guilds"] as const;

/** Published Astron bot families, used as stable product ids in workspaces. */
export const ASTRON_PRODUCT_IDS = [
	"astron",
	"automations",
	"guild",
	"logger",
	"player",
	"protect",
] as const;

export type AstronProductId = (typeof ASTRON_PRODUCT_IDS)[number];

export interface AstronProductDefinition {
	id: AstronProductId;
	name: string;
}

export const ASTRON_PRODUCTS: readonly AstronProductDefinition[] =
	ASTRON_PRODUCT_IDS.map((id) => ({
		id,
		name: id.charAt(0).toUpperCase() + id.slice(1),
	}));

export function isAstronProductId(value: string): value is AstronProductId {
	return (ASTRON_PRODUCT_IDS as readonly string[]).includes(value);
}

export type DiscordMembershipState = "member" | "unknown";
export type AstronInstallationState = "installed" | "not-installed" | "unknown";
export type WorkspaceAvailabilityState =
	| "available"
	| "unavailable"
	| "unknown";
export type WorkspaceAuthorizationState =
	| "administrator"
	| "manage-server"
	| "none"
	| "unknown";

/** Validated installation-registry information for one product in a guild. */
export interface DiscordServerProduct {
	id: string;
	name: string;
	enabled: boolean;
	installed: boolean;
	runtimeState?: string | null;
}

/**
 * One server of the rail. Membership, permissions, workspace access,
 * installation and runtime state remain separate values on purpose.
 */
export interface DiscordServerItem {
	/** Discord guild snowflake, the canonical workspace identifier. */
	guildId: string;
	name: string;
	/** Ready-to-render Discord CDN URL, or null when the guild has no icon. */
	icon: string | null;
	permissions: {
		isOwner: boolean;
		canManage: boolean;
		/** Decimal BigInt string; never a JavaScript Number. */
		raw: string;
	};
	membership: DiscordMembershipState;
	installation: AstronInstallationState;
	workspace: WorkspaceAvailabilityState;
	authorization: WorkspaceAuthorizationState;
	workspaceAccessible: boolean;
	products: DiscordServerProduct[];
}

export interface DiscordGuildSyncStatus {
	linked: boolean;
	status: "idle" | "syncing" | "error" | "disconnected";
	lastAttemptAt: string | null;
	lastSuccessfulSyncAt: string | null;
	lastError: string | null;
	errorCode: string | null;
	guildCount: number;
	consecutiveFailures: number;
}

export interface DiscordConnectionStatus extends DiscordGuildSyncStatus {
	/** Better Auth account record id; safe to expose, never a token. */
	accountId: string | null;
	discordUserId: string | null;
	scopes: string[];
	canListGuilds: boolean;
	linkedAt: string | null;
}

export type DiscordGuildListStatus = "ready" | "unavailable";

/**
 * Response of `discord.guilds.list`. `servers` contains manageable guilds when
 * `manageableOnly` is true, otherwise every stored membership.
 */
export interface DiscordGuildListResult {
	status: DiscordGuildListStatus;
	servers: DiscordServerItem[];
	reason: string | null;
	manageableOnly: boolean;
	connection: DiscordConnectionStatus;
}

export interface DiscordSyncResult {
	syncedAccounts: number;
	guildCount: number;
	manageableCount: number;
	status: DiscordGuildSyncStatus;
}
