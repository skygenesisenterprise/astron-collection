import { and, desc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { db } from "../../db";
import {
	account,
	discordGuild,
	discordGuildInstallation,
	discordGuildMembership,
	discordGuildSyncState,
} from "../../db/schema";
import { auth } from "../../lib/auth";
import { logger } from "../../lib/logger";
import { redactSecrets } from "../../utils/security/redact";
import {
	DISCORD_PROVIDER_ID,
	type AstronProductId,
	type DiscordConnectionStatus,
	type DiscordGuildListResult,
	type DiscordGuildSyncStatus,
	type DiscordServerItem,
	type DiscordServerProduct,
	type DiscordSyncResult,
	isAstronProductId,
} from "./contracts";
import {
	DiscordApiError,
	type DiscordApiGuild,
	fetchDiscordGuilds,
} from "./discord-api";
import {
	buildDiscordIconUrl,
	canAccessProductWorkspace,
	canAccessGuildWorkspace,
	evaluateDiscordPermissions,
	hasGuildsScope,
	isDiscordSnowflake,
} from "./permissions";

/** Automatic refresh cadence; manual syncs are explicitly requested. */
export const GUILD_SYNC_TTL_MS = 5 * 60 * 1_000;
/** Minimum spacing between two automatic attempts for the same Discord account. */
export const GUILD_SYNC_MIN_INTERVAL_MS = 10 * 1_000;
/**
 * Manual syncs bypass the automatic cooldown, but a user must still not be able
 * to hammer Discord's REST API by clicking refresh repeatedly.
 */
export const MANUAL_SYNC_MIN_INTERVAL_MS = 15 * 1_000;

/** Errors that mean the saved OAuth grant can no longer be trusted. */
const CREDENTIAL_ERROR_CODES = new Set([
	"missing_token",
	"missing_scope",
	"invalid_token",
	"revoked",
]);

type Now = () => Date;

export interface SyncServiceOptions {
	now?: Now;
	/** Manual synchronisation ignores the short inter-attempt cooldown. */
	force?: boolean;
	fetchGuilds?: (
		accessToken: string,
	) => Promise<DiscordApiGuild[]>;
	getAccessToken?: (input: {
		userId: string;
		discordAccountId: string;
		providerAccountId: string;
		scopes: string[];
	}) => Promise<{ accessToken: string; scopes: string[] }>;
}

interface LinkedAccount {
	id: string;
	accountId: string;
	scopes: string[];
	createdAt: Date;
}

type SyncRow = typeof discordGuildSyncState.$inferSelect;

const toIso = (value: Date | null | undefined): string | null =>
	value instanceof Date ? value.toISOString() : null;

function parseScopes(raw: string | null | undefined): string[] {
	if (!raw) return [];
	return raw
		.split(/[\s,]+/)
		.map((scope) => scope.trim())
		.filter(Boolean);
}

function defaultGetAccessToken({
	userId,
	providerAccountId,
	scopes,
}: {
	userId: string;
	providerAccountId: string;
	scopes: string[];
}) {
	// Better Auth owns token storage and refresh. It validates that the account
	// belongs to `userId`; the caller has already loaded it from the DB as well.
	return auth
		.getAccessToken({
			body: {
				providerId: DISCORD_PROVIDER_ID,
				accountId: providerAccountId,
				userId,
			},
		})
		.then((result) => ({
			accessToken: result.accessToken,
			scopes: result.scopes?.length ? result.scopes : scopes,
		}));
}

/** Pure projection from a Discord guild list to database rows. */
export function buildGuildSyncPlan(
	guilds: readonly DiscordApiGuild[],
	linked: { accountId: string; userId: string },
	now: Date,
) {
	const guildRows = guilds.map((guild) => ({
		guildId: guild.id,
		name: guild.name,
		icon: guild.icon,
		ownerId: guild.owner_id ?? null,
		approximateMemberCount:
			typeof guild.approximate_member_count === "number"
				? Math.trunc(guild.approximate_member_count)
				: null,
		verificationLevel:
			typeof guild.verification_level === "number"
				? Math.trunc(guild.verification_level)
				: null,
		createdAt: now,
		updatedAt: now,
	}));

	const membershipRows = guilds.map((guild) => {
		const evaluation = evaluateDiscordPermissions({
			isOwner: guild.owner === true,
			permissions: guild.permissions,
		});
		return {
			accountId: linked.accountId,
			userId: linked.userId,
			guildId: guild.id,
			isOwner: evaluation.isOwner,
			permissions: evaluation.raw,
			canManage: evaluation.canManage,
			membershipState: "active" as const,
			lastSyncedAt: now,
			createdAt: now,
			updatedAt: now,
		};
	});

	return {
		guildRows,
		membershipRows,
		activeGuildIds: guilds.map((guild) => guild.id),
		manageableCount: membershipRows.filter((row) => row.canManage).length,
	};
}

function mapSyncRow(row: SyncRow | undefined, linked: boolean): DiscordGuildSyncStatus {
	if (!row) {
		return {
			linked,
			status: linked ? "idle" : "disconnected",
			lastAttemptAt: null,
			lastSuccessfulSyncAt: null,
			lastError: null,
			errorCode: null,
			guildCount: 0,
			consecutiveFailures: 0,
		};
	}
	return {
		linked,
		status: row.status,
		lastAttemptAt: toIso(row.lastAttemptAt),
		lastSuccessfulSyncAt: toIso(row.lastSuccessfulSyncAt),
		lastError: row.lastError,
		errorCode: row.errorCode,
		guildCount: row.guildCount,
		consecutiveFailures: row.consecutiveFailures,
	};
}

async function findLinkedAccounts(userId: string): Promise<LinkedAccount[]> {
	const rows = await db.query.account.findMany({
		where: and(
			eq(account.userId, userId),
			eq(account.providerId, DISCORD_PROVIDER_ID),
		),
		orderBy: [desc(account.updatedAt)],
	});
	return rows.map((row) => ({
		id: row.id,
		accountId: row.accountId,
		scopes: parseScopes(row.scope),
		createdAt: row.createdAt,
	}));
}

async function findSyncRow(accountId: string): Promise<SyncRow | undefined> {
	return db.query.discordGuildSyncState.findFirst({
		where: eq(discordGuildSyncState.accountId, accountId),
	});
}

/** Aggregate status across every Discord identity linked to this account. */
export function mergeSyncStatuses(
	statuses: DiscordGuildSyncStatus[],
): DiscordGuildSyncStatus {
	if (statuses.length === 0) {
		return {
			linked: false,
			status: "disconnected",
			lastAttemptAt: null,
			lastSuccessfulSyncAt: null,
			lastError: null,
			errorCode: null,
			guildCount: 0,
			consecutiveFailures: 0,
		};
	}
	const newest = (select: (item: DiscordGuildSyncStatus) => string | null) =>
		statuses
			.map(select)
			.filter((value): value is string => Boolean(value))
			.sort()
			.at(-1) ?? null;
	return {
		linked: true,
		status: statuses.some((item) => item.status === "error")
			? "error"
			: statuses.some((item) => item.status === "syncing")
				? "syncing"
				: "idle",
		lastAttemptAt: newest((item) => item.lastAttemptAt),
		lastSuccessfulSyncAt: newest((item) => item.lastSuccessfulSyncAt),
		lastError: statuses.find((item) => item.lastError)?.lastError ?? null,
		errorCode: statuses.find((item) => item.errorCode)?.errorCode ?? null,
		guildCount: statuses.reduce((total, item) => total + item.guildCount, 0),
		consecutiveFailures: Math.max(
			0,
			...statuses.map((item) => item.consecutiveFailures),
		),
	};
}

export async function getDiscordConnectionStatus(
	userId: string,
): Promise<DiscordConnectionStatus> {
	const linkedAccounts = await findLinkedAccounts(userId);
	if (linkedAccounts.length === 0) {
		return { ...mergeSyncStatuses([]), accountId: null, discordUserId: null, scopes: [], canListGuilds: false, linkedAt: null };
	}
	const statuses = await Promise.all(
		linkedAccounts.map(async (entry) => mapSyncRow(await findSyncRow(entry.id), true)),
	);
	const scopes = Array.from(new Set(linkedAccounts.flatMap((entry) => entry.scopes)));
	return {
		...mergeSyncStatuses(statuses),
		accountId: linkedAccounts[0]?.id ?? null,
		discordUserId: linkedAccounts[0]?.accountId ?? null,
		scopes,
		canListGuilds: hasGuildsScope(scopes),
		linkedAt: toIso(linkedAccounts[0]?.createdAt),
	};
}

/** Never mutate stored memberships on a failed Discord request. */
async function recordSyncFailure(
	accountId: string,
	userId: string,
	now: Date,
	error: unknown,
): Promise<void> {
	const code =
		error instanceof DiscordApiError
			? error.code
			: "sync_failed";
	const message = redactSecrets(
		error instanceof Error ? error.message : "Discord guild synchronization failed.",
	);
	const previous = await findSyncRow(accountId);
	const failures = (previous?.consecutiveFailures ?? 0) + 1;
	await db
		.insert(discordGuildSyncState)
		.values({
			accountId,
			userId,
			status: "error",
			lastAttemptAt: now,
			lastSuccessfulSyncAt: previous?.lastSuccessfulSyncAt ?? null,
			lastError: message.slice(0, 1_000),
			errorCode: code,
			consecutiveFailures: failures,
			guildCount: previous?.guildCount ?? 0,
			createdAt: now,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: discordGuildSyncState.accountId,
			set: {
				status: "error",
				lastAttemptAt: now,
				lastError: message.slice(0, 1_000),
				errorCode: code,
				consecutiveFailures: failures,
				updatedAt: now,
			},
		});
	logger.warn(
		{ event: "discord_guilds_sync_failed", errorCode: code, accountId },
		"Discord guild synchronization failed; previous memberships were retained.",
	);
}

/**
 * Synchronises one linked Discord identity. Idempotent: all writes are upserts
 * keyed by snowflake + Better Auth account id.
 */
async function syncLinkedAccount(
	linked: LinkedAccount,
	userId: string,
	options: SyncServiceOptions,
	now: Date,
	force: boolean,
): Promise<DiscordGuildSyncStatus> {
	const previous = await findSyncRow(linked.id);
	const minInterval = force
		? MANUAL_SYNC_MIN_INTERVAL_MS
		: GUILD_SYNC_MIN_INTERVAL_MS;
	if (
		previous?.lastAttemptAt &&
		now.getTime() - previous.lastAttemptAt.getTime() < minInterval
	) {
		return mapSyncRow(previous, true);
	}

	await db
		.insert(discordGuildSyncState)
		.values({
			accountId: linked.id,
			userId,
			status: "syncing",
			lastAttemptAt: now,
			lastSuccessfulSyncAt: previous?.lastSuccessfulSyncAt ?? null,
			lastError: null,
			errorCode: null,
			consecutiveFailures: previous?.consecutiveFailures ?? 0,
			guildCount: previous?.guildCount ?? 0,
			createdAt: now,
			updatedAt: now,
		})
		.onConflictDoUpdate({
			target: discordGuildSyncState.accountId,
			set: { status: "syncing", lastAttemptAt: now, updatedAt: now },
		});

	try {
		const token = await (options.getAccessToken ?? defaultGetAccessToken)({
			userId,
			discordAccountId: linked.id,
			providerAccountId: linked.accountId,
			scopes: linked.scopes,
		});
		const scopes = token.scopes.length ? token.scopes : linked.scopes;
		if (!hasGuildsScope(scopes)) {
			throw new DiscordApiError(
				"missing_scope",
				"Discord connection is missing the guilds scope. Reconnect Discord to list servers.",
			);
		}

		const guilds = await (options.fetchGuilds ?? ((accessToken: string) =>
			fetchDiscordGuilds(accessToken)))(token.accessToken);
		const plan = buildGuildSyncPlan(guilds, { accountId: linked.id, userId }, now);

		await db.transaction(async (tx) => {
			if (plan.guildRows.length > 0) {
				await tx
					.insert(discordGuild)
					.values(plan.guildRows)
					.onConflictDoUpdate({
						target: discordGuild.guildId,
						set: {
							name: sql`excluded.name`,
							icon: sql`excluded.icon`,
							ownerId: sql`excluded.owner_id`,
							approximateMemberCount: sql`excluded.approximate_member_count`,
							verificationLevel: sql`excluded.verification_level`,
							updatedAt: now,
						},
					});
			}
			if (plan.membershipRows.length > 0) {
				await tx
					.insert(discordGuildMembership)
					.values(plan.membershipRows)
					.onConflictDoUpdate({
						target: [
							discordGuildMembership.accountId,
							discordGuildMembership.guildId,
						],
						set: {
							isOwner: sql`excluded.is_owner`,
							permissions: sql`excluded.permissions`,
							canManage: sql`excluded.can_manage`,
							membershipState: "active",
							lastSyncedAt: now,
							updatedAt: now,
						},
					});
			}
			const missingClause = [
				eq(discordGuildMembership.accountId, linked.id),
				eq(discordGuildMembership.userId, userId),
				eq(discordGuildMembership.membershipState, "active"),
			];
			if (plan.activeGuildIds.length > 0) {
				missingClause.push(
					notInArray(discordGuildMembership.guildId, plan.activeGuildIds),
				);
			}
			await tx
				.update(discordGuildMembership)
				.set({ membershipState: "left", updatedAt: now })
				.where(and(...missingClause));

			await tx
				.insert(discordGuildSyncState)
				.values({
					accountId: linked.id,
					userId,
					status: "idle",
					lastAttemptAt: now,
					lastSuccessfulSyncAt: now,
					lastError: null,
					errorCode: null,
					consecutiveFailures: 0,
					guildCount: plan.activeGuildIds.length,
					createdAt: now,
					updatedAt: now,
				})
				.onConflictDoUpdate({
					target: discordGuildSyncState.accountId,
					set: {
						status: "idle",
						lastAttemptAt: now,
						lastSuccessfulSyncAt: now,
						lastError: null,
						errorCode: null,
						consecutiveFailures: 0,
						guildCount: plan.activeGuildIds.length,
						updatedAt: now,
					},
				});
		});

		logger.info(
			{
				event: "discord_guilds_synced",
				accountId: linked.id,
				guildCount: plan.activeGuildIds.length,
				manageableCount: plan.manageableCount,
			},
			"Discord guild memberships synchronized.",
		);
		return {
			linked: true,
			status: "idle",
			lastAttemptAt: toIso(now),
			lastSuccessfulSyncAt: toIso(now),
			lastError: null,
			errorCode: null,
			guildCount: plan.activeGuildIds.length,
			consecutiveFailures: 0,
		};
	} catch (error) {
		await recordSyncFailure(linked.id, userId, now, error);
		const previousAfterFailure = await findSyncRow(linked.id);
		return mapSyncRow(previousAfterFailure, true);
	}
}

export async function syncDiscordGuildsForUser(
	userId: string,
	options: SyncServiceOptions = {},
): Promise<DiscordSyncResult> {
	const now = (options.now ?? (() => new Date()))();
	const linkedAccounts = await findLinkedAccounts(userId);
	if (linkedAccounts.length === 0) {
		return {
			syncedAccounts: 0,
			guildCount: 0,
			manageableCount: 0,
			status: mergeSyncStatuses([]),
		};
	}
	const statuses = await Promise.all(
		linkedAccounts.map((linked) =>
			syncLinkedAccount(linked, userId, options, now, options.force === true),
		),
	);
	return {
		syncedAccounts: linkedAccounts.length,
		guildCount: statuses.reduce((total, item) => total + item.guildCount, 0),
		manageableCount: (await loadServerItems(userId, true)).length,
		status: mergeSyncStatuses(statuses),
	};
}

/** Strips a failed automatic refresh from a list response without hiding data. */
function unavailableReason(
	connection: DiscordConnectionStatus,
): string | null {
	if (!connection.linked) {
		return "Link your Discord account to list the servers you can manage.";
	}
	if (!connection.canListGuilds) {
		return "Your Discord connection is missing the guilds scope. Reconnect Discord to refresh the server list.";
	}
	if (connection.status === "error") {
		return connection.lastError ?? "Discord could not be reached. Showing the last known servers.";
	}
	return null;
}

async function findInstallations(guildIds: string[]) {
	if (guildIds.length === 0) return [];
	return db.query.discordGuildInstallation.findMany({
		where: inArray(discordGuildInstallation.guildId, guildIds),
	});
}

/** Projects a membership row and its registry enrichment into the shared contract. */
export function mapGuildMembershipToServerItem(input: {
	guildId: string;
	name: string;
	icon: string | null;
	isOwner: boolean;
	permissions: string;
	canManage: boolean;
	installations: Array<{
		productId: string;
		installed: boolean;
		runtimeState: string | null;
	}>;
}): DiscordServerItem {
	const evaluation = evaluateDiscordPermissions({
		isOwner: input.isOwner,
		permissions: input.permissions,
	});
	const canManage = input.canManage || evaluation.canManage;
	const products = input.installations.map((installation) => ({
		id: installation.productId,
		name: isAstronProductId(installation.productId)
			? (installation.productId as AstronProductId).charAt(0).toUpperCase() +
				installation.productId.slice(1)
			: installation.productId,
		enabled: installation.installed,
		installed: installation.installed,
		runtimeState: installation.runtimeState,
	}));
	return {
		guildId: input.guildId,
		name: input.name,
		icon: buildDiscordIconUrl(input.guildId, input.icon),
		permissions: {
			isOwner: evaluation.isOwner,
			canManage,
			raw: evaluation.raw,
		},
		membership: "member",
		installation: products.some((product) => product.installed)
			? "installed"
			: "not-installed",
		workspace: canManage ? "available" : "unavailable",
		authorization: canManage ? evaluation.authorization : "none",
		workspaceAccessible: canManage,
		products,
	};
}

async function loadServerItems(
	userId: string,
	manageableOnly: boolean,
): Promise<DiscordServerItem[]> {
	const filters = [
		eq(discordGuildMembership.userId, userId),
		eq(discordGuildMembership.membershipState, "active"),
	];
	if (manageableOnly) filters.push(eq(discordGuildMembership.canManage, true));
	const rows = await db
		.select({
			guildId: discordGuild.guildId,
			name: discordGuild.name,
			icon: discordGuild.icon,
			isOwner: discordGuildMembership.isOwner,
			permissions: discordGuildMembership.permissions,
			canManage: discordGuildMembership.canManage,
		})
		.from(discordGuildMembership)
		.innerJoin(discordGuild, eq(discordGuildMembership.guildId, discordGuild.guildId))
		.where(and(...filters))
		.orderBy(desc(discordGuildMembership.lastSyncedAt));

	const installations = await findInstallations(rows.map((row) => row.guildId));
	const byGuild = new Map<string, typeof installations>();
	for (const installation of installations) {
		const list = byGuild.get(installation.guildId) ?? [];
		list.push(installation);
		byGuild.set(installation.guildId, list);
	}

	return rows.map((row) =>
		mapGuildMembershipToServerItem({
			...row,
			installations: byGuild.get(row.guildId) ?? [],
		}),
	);
}

/**
 * Lists guilds for the rail. Triggers a sync only when the cached directory is
 * stale; every request still filters by the authenticated user id.
 */
export async function listDiscordGuilds(
	userId: string,
	options: { manageableOnly?: boolean } & SyncServiceOptions = {},
): Promise<DiscordGuildListResult> {
	const manageableOnly = options.manageableOnly !== false;
	const connection = await getDiscordConnectionStatus(userId);
	if (connection.linked && connection.canListGuilds) {
		const lastSynced = connection.lastSuccessfulSyncAt
			? Date.parse(connection.lastSuccessfulSyncAt)
			: 0;
		const now = (options.now ?? (() => new Date()))();
		if (!lastSynced || now.getTime() - lastSynced > GUILD_SYNC_TTL_MS) {
			await syncDiscordGuildsForUser(userId, { ...options, force: false });
			const refreshed = await getDiscordConnectionStatus(userId);
			connection.status = refreshed.status;
			connection.lastError = refreshed.lastError;
			connection.errorCode = refreshed.errorCode;
			connection.lastSuccessfulSyncAt = refreshed.lastSuccessfulSyncAt;
		}
	}

	return {
		status: "ready",
		servers: await loadServerItems(userId, manageableOnly),
		reason: unavailableReason(connection),
		manageableOnly,
		connection,
	};
}

/** Loads a single guild for a server-scoped route, with a fresh auth decision. */
export async function getGuildForUser(
	userId: string,
	guildId: string,
): Promise<DiscordServerItem | null> {
	if (!isDiscordSnowflake(guildId)) return null;
	const rows = await db
		.select({
			guildId: discordGuild.guildId,
			name: discordGuild.name,
			icon: discordGuild.icon,
			isOwner: discordGuildMembership.isOwner,
			permissions: discordGuildMembership.permissions,
			canManage: discordGuildMembership.canManage,
		})
		.from(discordGuildMembership)
		.innerJoin(discordGuild, eq(discordGuildMembership.guildId, discordGuild.guildId))
		.where(
			and(
				eq(discordGuildMembership.userId, userId),
				eq(discordGuildMembership.guildId, guildId),
				eq(discordGuildMembership.membershipState, "active"),
			),
		)
		.limit(1);
	const row = rows[0];
	if (!row) return null;
	return mapGuildMembershipToServerItem({
		...row,
		installations: await findInstallations([guildId]),
	});
}

/** Registry lookup used by product workspaces; never contacts bot runtimes. */
export async function getInstalledProductIds(guildId: string): Promise<string[]> {
	if (!isDiscordSnowflake(guildId)) return [];
	const rows = await findInstallations([guildId]);
	return rows
		.filter((row) => row.installed)
		.map((row) => row.productId)
		.filter(isAstronProductId);
}

export interface GuildWorkspaceAuthorization {
	guild: DiscordServerItem | null;
	connection: DiscordConnectionStatus;
	reason: "reconnect" | "forbidden" | null;
}

/**
 * Server-side gate for a general server workspace.
 *
 * A stale cached membership is not enough when Discord has told us the OAuth
 * grant is gone: reconnecting is required before any server-scoped operation is
 * allowed again. A transient Discord outage keeps the last known membership so
 * a provider incident cannot lock every user out of Astron.
 */
export async function authorizeGuildWorkspace(
	userId: string,
	guildId: string,
): Promise<GuildWorkspaceAuthorization> {
	await listDiscordGuilds(userId, { manageableOnly: false });
	const connection = await getDiscordConnectionStatus(userId);
	if (
		connection.status === "error" &&
		connection.errorCode &&
		CREDENTIAL_ERROR_CODES.has(connection.errorCode)
	) {
		return { guild: null, connection, reason: "reconnect" };
	}
	const guild = await getGuildForUser(userId, guildId);
	if (!guild || !canAccessGuildWorkspace(guild)) {
		return { guild: null, connection, reason: "forbidden" };
	}
	return { guild, connection, reason: null };
}

export interface ProductWorkspaceAuthorization {
	guild: DiscordServerItem | null;
	connection: DiscordConnectionStatus;
	product: DiscordServerProduct | null;
	reason:
		| GuildWorkspaceAuthorization["reason"]
		| "invalid-product"
		| "not-installed";
}

/** Product workspaces require both guild authorization and an installation. */
export async function authorizeProductWorkspace(
	userId: string,
	guildId: string,
	productId: string,
): Promise<ProductWorkspaceAuthorization> {
	const authorized = await authorizeGuildWorkspace(userId, guildId);
	const base = {
		guild: authorized.guild,
		connection: authorized.connection,
		product: null,
	};
	if (authorized.reason || !authorized.guild) {
		return { ...base, reason: authorized.reason ?? "forbidden" };
	}
	if (!isAstronProductId(productId)) {
		return { ...base, reason: "invalid-product" };
	}
	const product =
		authorized.guild.products.find((entry) => entry.id === productId) ?? null;
	if (
		!product ||
		!canAccessProductWorkspace(
			authorized.guild,
			productId,
			authorized.guild.products,
		)
	) {
		return { ...base, reason: "not-installed" };
	}
	return { ...base, product, reason: null };
}
