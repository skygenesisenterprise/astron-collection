import type {
	DiscordServerItem,
	WorkspaceAuthorizationState,
} from "./contracts";

/**
 * Discord permission bits. BigInt literals keep values such as
 * `ADMINISTRATOR | MANAGE_GUILD | …` exact; a JS Number silently rounds them.
 */
export const DISCORD_PERMISSION_ADMINISTRATOR = 1n << 3n;
export const DISCORD_PERMISSION_MANAGE_GUILD = 1n << 5n;

export interface DiscordPermissionInput {
	isOwner: boolean;
	/** Discord returns the bitfield as a decimal string. */
	permissions: string;
}

export interface DiscordPermissionEvaluation {
	isOwner: boolean;
	canManage: boolean;
	/** Decimal BigInt string, preserved for the UI and audit trails. */
	raw: string;
	authorization: WorkspaceAuthorizationState;
}

const DECIMAL_BITFIELD = /^\d+$/;
const SNOWFLAKE = /^\d{17,20}$/;
const ICON_HASH = /^[A-Za-z0-9_-]+$/;

/** Discord snowflakes are strings; this only validates their shape. */
export function isDiscordSnowflake(value: unknown): value is string {
	return typeof value === "string" && SNOWFLAKE.test(value);
}

/**
 * Parses a Discord bitfield without ever going through Number. Invalid values
 * are treated as no permissions rather than throwing on a third-party payload.
 */
export function parsePermissionBitfield(value: unknown): bigint {
	if (typeof value !== "string" || !DECIMAL_BITFIELD.test(value)) return 0n;
	try {
		const parsed = BigInt(value);
		return parsed < 0n ? 0n : parsed;
	} catch {
		return 0n;
	}
}

function hasPermission(bitfield: bigint, flag: bigint): boolean {
	return (bitfield & flag) === flag;
}

/**
 * A guild is manageable when the linked Discord account owns it or holds
 * ADMINISTRATOR / MANAGE_GUILD. Ownership never needs a permission bit.
 */
export function evaluateDiscordPermissions({
	isOwner,
	permissions,
}: DiscordPermissionInput): DiscordPermissionEvaluation {
	const bitfield = parsePermissionBitfield(permissions);
	const isAdministrator = hasPermission(bitfield, DISCORD_PERMISSION_ADMINISTRATOR);
	const canManageGuild = hasPermission(bitfield, DISCORD_PERMISSION_MANAGE_GUILD);
	const canManage = isOwner || isAdministrator || canManageGuild;

	return {
		isOwner,
		canManage,
		raw: bitfield.toString(),
		authorization: isOwner || isAdministrator
			? "administrator"
			: canManageGuild
				? "manage-server"
				: "none",
	};
}

/** Builds a small CDN icon URL, validating both path segments. */
export function buildDiscordIconUrl(
	guildId: string | null | undefined,
	icon: string | null | undefined,
): string | null {
	if (!icon || !isDiscordSnowflake(guildId) || !ICON_HASH.test(icon)) {
		return null;
	}
	const extension = icon.startsWith("a_") ? "gif" : "png";
	return `https://cdn.discordapp.com/icons/${guildId}/${icon}.${extension}?size=64`;
}

/**
 * Server-side gate for a general guild workspace. The URL alone never grants
 * access; this is the shared rule used by the route and the rail projection.
 */
export function canAccessGuildWorkspace(
	membership: Pick<DiscordServerItem, "membership" | "permissions"> | null | undefined,
): boolean {
	if (!membership || membership.membership !== "member") return false;
	return membership.permissions.canManage;
}

/** Product workspaces additionally require an installed, enabled product. */
export function canAccessProductWorkspace(
	membership: Pick<DiscordServerItem, "membership" | "permissions"> | null | undefined,
	productId: string,
	products: DiscordServerItem["products"],
): boolean {
	if (!canAccessGuildWorkspace(membership)) return false;
	return products.some(
		(product) => product.id === productId && product.installed && product.enabled,
	);
}

/** Legacy Discord links may predate the `guilds` scope. */
export function hasGuildsScope(scopes: readonly string[]): boolean {
	return scopes.some((scope) => scope.toLowerCase() === "guilds");
}
