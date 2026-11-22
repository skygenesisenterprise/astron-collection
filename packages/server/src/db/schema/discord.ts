import { relations } from "drizzle-orm";
import {
	boolean,
	index,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { account } from "./account";
import { user } from "./user";

/**
 * Discord guild directory.
 *
 * These tables hold data obtained with the user's OAuth `guilds` scope. They
 * deliberately do not describe bot installations: membership and permissions
 * are answerable without an Astron bot ever joining the guild.
 *
 * Snowflakes stay strings everywhere. Discord ids exceed Number.MAX_SAFE_INTEGER.
 */
export const discordGuild = pgTable(
	"discord_guild",
	{
		guildId: text("guild_id").primaryKey(),
		name: text("name").notNull(),
		/** Raw Discord CDN hash, never a bearer token. */
		icon: text("icon"),
		ownerId: text("owner_id"),
		approximateMemberCount: integer("approximate_member_count"),
		verificationLevel: integer("verification_level"),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [index("discord_guild_name_idx").on(table.name)],
);

/**
 * One row per linked Discord account and guild. Unmanageable guilds are kept:
 * the rail only exposes the manageable view, but the directory stays complete.
 */
export const discordGuildMembership = pgTable(
	"discord_guild_membership",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => nanoid()),
		/** Better Auth `account.id` of the linked Discord identity. */
		accountId: text("account_id")
			.notNull()
			.references(() => account.id, { onDelete: "cascade" }),
		/** Denormalised owner of the linked account, for user-scoped queries. */
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		guildId: text("guild_id")
			.notNull()
			.references(() => discordGuild.guildId, { onDelete: "cascade" }),
		isOwner: boolean("is_owner").notNull().default(false),
		/** Discord permission bitfield as a decimal string (BigInt-safe). */
		permissions: text("permissions").notNull(),
		canManage: boolean("can_manage").notNull().default(false),
		/** `left` is retained after a successful sync sees the guild disappear. */
		membershipState: text("membership_state")
			.$type<"active" | "left">()
			.notNull()
			.default("active"),
		lastSyncedAt: timestamp("last_synced_at").notNull().defaultNow(),
		createdAt: timestamp("created_at").notNull().defaultNow(),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		uniqueIndex("discord_guild_membership_account_guild_uq").on(
			table.accountId,
			table.guildId,
		),
		index("discord_guild_membership_user_state_idx").on(
			table.userId,
			table.membershipState,
		),
		index("discord_guild_membership_guild_idx").on(table.guildId),
	],
);

/** Synchronisation outcome per linked Discord account. */
export const discordGuildSyncState = pgTable("discord_guild_sync_state", {
	/** Better Auth `account.id` of the linked Discord identity. */
	accountId: text("account_id")
		.primaryKey()
		.references(() => account.id, { onDelete: "cascade" }),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	status: text("status")
		.$type<"idle" | "syncing" | "error" | "disconnected">()
		.notNull()
		.default("idle"),
	lastAttemptAt: timestamp("last_attempt_at"),
	lastSuccessfulSyncAt: timestamp("last_successful_sync_at"),
	lastError: text("last_error"),
	errorCode: text("error_code"),
	guildCount: integer("guild_count").notNull().default(0),
	consecutiveFailures: integer("consecutive_failures").notNull().default(0),
	createdAt: timestamp("created_at").notNull().defaultNow(),
	updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/**
 * Minimal installation registry used only to *enrich* the directory.
 *
 * It is intentionally independent from guild retrieval: no guild is filtered
 * by a row here, and no bot runtime process is contacted to list servers.
 */
export const discordGuildInstallation = pgTable(
	"discord_guild_installation",
	{
		guildId: text("guild_id")
			.notNull()
			.references(() => discordGuild.guildId, { onDelete: "cascade" }),
		productId: text("product_id").notNull(),
		installed: boolean("installed").notNull().default(true),
		/** Reported by the registry, never probed during a guild listing. */
		runtimeState: text("runtime_state"),
		updatedAt: timestamp("updated_at").notNull().defaultNow(),
	},
	(table) => [
		primaryKey({ columns: [table.guildId, table.productId] }),
		index("discord_guild_installation_product_idx").on(table.productId),
	],
);

export const discordGuildRelations = relations(discordGuild, ({ many }) => ({
	memberships: many(discordGuildMembership),
	installations: many(discordGuildInstallation),
}));

export const discordGuildMembershipRelations = relations(
	discordGuildMembership,
	({ one }) => ({
		guild: one(discordGuild, {
			fields: [discordGuildMembership.guildId],
			references: [discordGuild.guildId],
		}),
		account: one(account, {
			fields: [discordGuildMembership.accountId],
			references: [account.id],
		}),
		user: one(user, {
			fields: [discordGuildMembership.userId],
			references: [user.id],
		}),
	}),
);

export const discordGuildSyncStateRelations = relations(
	discordGuildSyncState,
	({ one }) => ({
		account: one(account, {
			fields: [discordGuildSyncState.accountId],
			references: [account.id],
		}),
		user: one(user, {
			fields: [discordGuildSyncState.userId],
			references: [user.id],
		}),
	}),
);

export const discordGuildInstallationRelations = relations(
	discordGuildInstallation,
	({ one }) => ({
		guild: one(discordGuild, {
			fields: [discordGuildInstallation.guildId],
			references: [discordGuild.guildId],
		}),
	}),
);
