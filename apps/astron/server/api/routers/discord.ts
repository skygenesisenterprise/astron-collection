import { logger } from "@astron-collection/server/lib/logger";
import {
	authorizeGuildWorkspace,
	authorizeProductWorkspace,
	getDiscordConnectionStatus,
	isDiscordSnowflake,
	listDiscordGuilds,
	syncDiscordGuildsForUser,
} from "@astron-collection/server/services/discord-guild-directory";
import { createRateLimiter } from "@astron-collection/server/utils/rate-limit";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";

/**
 * Personal-space procedures are browser-only. An API key may identify a user,
 * but it must never open the interactive guild directory.
 */
const managerProcedure = protectedProcedure.use(({ ctx, next }) => {
	if (ctx.apiKey) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "This endpoint requires an interactive Astron Manager session.",
		});
	}
	return next();
});

const guildIdInput = z
	.string()
	.refine(isDiscordSnowflake, "A valid Discord guild id is required.");

/** Manual refreshes are allowed, but must not become a Discord API flood. */
const discordSyncRateLimiter = createRateLimiter({
	namespace: "discord-guild-sync",
});
const DISCORD_SYNC_LIMIT = 5;
const DISCORD_SYNC_WINDOW_SECONDS = 60;

export const discordRouter = createTRPCRouter({
	connection: createTRPCRouter({
		get: managerProcedure.query(({ ctx }) =>
			getDiscordConnectionStatus(ctx.user.id),
		),
	}),
	guilds: createTRPCRouter({
		list: managerProcedure
			.input(
				z
					.object({
						manageableOnly: z.boolean().default(true),
					})
					.default(() => ({ manageableOnly: true })),
			)
			.query(({ ctx, input }) =>
				listDiscordGuilds(ctx.user.id, {
					manageableOnly: input.manageableOnly,
				}),
			),
		sync: managerProcedure.mutation(async ({ ctx }) => {
			const limit = await discordSyncRateLimiter.consume(ctx.user.id, {
				limit: DISCORD_SYNC_LIMIT,
				windowSeconds: DISCORD_SYNC_WINDOW_SECONDS,
			});
			if (!limit.allowed) {
				logger.warn(
					{
						event: "discord_guilds_sync_rate_limited",
						userId: ctx.user.id,
						retryAfterSeconds: limit.retryAfterSeconds,
					},
					"Manual Discord guild sync was rate limited.",
				);
				throw new TRPCError({
					code: "TOO_MANY_REQUESTS",
					message: `Please wait ${limit.retryAfterSeconds} seconds before syncing again.`,
				});
			}
			return syncDiscordGuildsForUser(ctx.user.id, { force: true });
		}),
		syncStatus: managerProcedure.query(async ({ ctx }) => {
			const connection = await getDiscordConnectionStatus(ctx.user.id);
			const {
				linked,
				status,
				lastAttemptAt,
				lastSuccessfulSyncAt,
				lastError,
				errorCode,
				guildCount,
				consecutiveFailures,
			} = connection;
			return {
				linked,
				status,
				lastAttemptAt,
				lastSuccessfulSyncAt,
				lastError,
				errorCode,
				guildCount,
				consecutiveFailures,
			};
		}),
		get: managerProcedure
			.input(z.object({ guildId: guildIdInput }))
			.query(async ({ ctx, input }) => {
				const { guild, reason } = await authorizeGuildWorkspace(
					ctx.user.id,
					input.guildId,
				);
				if (!guild) {
					throw new TRPCError({
						code: reason === "reconnect" ? "UNAUTHORIZED" : "NOT_FOUND",
						message:
							reason === "reconnect"
								? "Reconnect Discord to open this workspace."
								: "Server workspace not found.",
					});
				}
				return guild;
			}),
		product: managerProcedure
			.input(
				z.object({
					guildId: guildIdInput,
					productId: z.string().min(1),
				}),
			)
			.query(async ({ ctx, input }) => {
				const { product, reason } = await authorizeProductWorkspace(
					ctx.user.id,
					input.guildId,
					input.productId,
				);
				if (!product) {
					throw new TRPCError({
						code: reason === "reconnect" ? "UNAUTHORIZED" : "NOT_FOUND",
						message:
							reason === "reconnect"
								? "Reconnect Discord to open this workspace."
								: "Product workspace not found.",
					});
				}
				return product;
			}),
	}),
});
