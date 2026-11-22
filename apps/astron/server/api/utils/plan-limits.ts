import { TRPCError } from "@trpc/server";
import { db } from "@astron-collection/server/db";
import {
	environments,
	member,
	organization,
	schedules,
	user,
} from "@astron-collection/server/db/schema";
import { organizationLimitMessage } from "@astron-collection/server/services/onboarding-paths";
import { eq } from "drizzle-orm";
import { getCurrentPlan, getCurrentPlanForUser } from "@/server/utils/billing";

export type PlanLimitResource =
	| "organization"
	| "member"
	| "environment"
	| "volumeBackup"
	| "databaseBackup"
	| "scheduledJob";

const UNLIMITED = Number.POSITIVE_INFINITY;

export const PLAN_LIMITS: Record<
	"hobby" | "startup" | "legacy",
	Record<PlanLimitResource, number>
> = {
	hobby: {
		organization: 1,
		member: 1,
		environment: 2,
		volumeBackup: 1,
		databaseBackup: 1,
		scheduledJob: 1,
	},
	startup: {
		organization: 3,
		member: UNLIMITED,
		environment: UNLIMITED,
		volumeBackup: UNLIMITED,
		databaseBackup: UNLIMITED,
		scheduledJob: UNLIMITED,
	},
	legacy: {
		organization: UNLIMITED,
		member: UNLIMITED,
		environment: UNLIMITED,
		volumeBackup: UNLIMITED,
		databaseBackup: UNLIMITED,
		scheduledJob: UNLIMITED,
	},
};

const resourceLabels: Record<PlanLimitResource, string> = {
	organization: "organizations",
	member: "users",
	environment: "environments per project",
	volumeBackup: "volume backups per application",
	databaseBackup: "backups per database",
	scheduledJob: "scheduled jobs per service",
};

const assertLimitForPlan = (
	plan: "hobby" | "startup" | "legacy" | null,
	resource: PlanLimitResource,
	currentCount: number,
) => {
	const limit = PLAN_LIMITS[plan ?? "legacy"][resource];

	if (currentCount >= limit) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: `You've reached your plan's limit of ${limit} ${resourceLabels[resource]}. Upgrade your plan to add more.`,
		});
	}
};

type Database = typeof db;
export type DatabaseTransaction = Parameters<
	Parameters<Database["transaction"]>[0]
>[0];

/**
 * Organization quota of an account, or `null` when the plan is unlimited.
 *
 * Read outside the creation transaction on purpose: resolving the plan may call
 * the billing provider, and a network call must not run while a row lock is
 * held. The value is then enforced inside the transaction.
 */
export const getOrganizationLimitForUser = async (
	userId: string,
): Promise<number | null> => {
	const plan = await getCurrentPlanForUser(userId);
	const limit = PLAN_LIMITS[plan ?? "legacy"].organization;
	return Number.isFinite(limit) ? limit : null;
};

/**
 * Locks the account row for the duration of an organization creation.
 *
 * Concurrent creations for the same account queue here, so the quota check and
 * the inserts below observe each other's committed work.
 */
export const lockOrganizationCreation = async (
	tx: DatabaseTransaction,
	userId: string,
) => {
	await tx
		.select({ id: user.id })
		.from(user)
		.where(eq(user.id, userId))
		.for("update");
};

/**
 * Enforces the plan quota from inside the creation transaction.
 *
 * Must run after `lockOrganizationCreation`: the count is then stable until the
 * transaction ends, so simultaneous creations cannot both consume the same slot.
 */
export const assertOrganizationQuotaInTransaction = async (
	tx: DatabaseTransaction,
	userId: string,
	limit: number | null,
) => {
	if (limit === null) return;

	const owned = await tx.$count(organization, eq(organization.ownerId, userId));
	if (owned >= limit) {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: organizationLimitMessage(limit),
		});
	}
};

export const assertMemberLimit = async (organizationId: string) => {
	const plan = await getCurrentPlan(organizationId);
	const members = await db.query.member.findMany({
		where: eq(member.organizationId, organizationId),
	});
	assertLimitForPlan(plan, "member", members.length);
};

export const assertEnvironmentLimit = async (
	organizationId: string,
	projectId: string,
) => {
	const plan = await getCurrentPlan(organizationId);
	const envs = await db.query.environments.findMany({
		where: eq(environments.projectId, projectId),
	});
	assertLimitForPlan(plan, "environment", envs.length);
};

export const assertVolumeBackupLimit = async (
	organizationId: string,
	currentCount: number,
) => {
	const plan = await getCurrentPlan(organizationId);
	assertLimitForPlan(plan, "volumeBackup", currentCount);
};

export const assertDatabaseBackupLimit = async (
	organizationId: string,
	currentCount: number,
) => {
	const plan = await getCurrentPlan(organizationId);
	assertLimitForPlan(plan, "databaseBackup", currentCount);
};

export const assertScheduledJobLimit = async (
	organizationId: string,
	scheduleType: "application" | "compose" | "server",
	serviceId: string,
) => {
	const plan = await getCurrentPlan(organizationId);
	const column = `${scheduleType}Id` as const;
	const rows = await db.query.schedules.findMany({
		where: eq(schedules[column], serviceId),
	});
	assertLimitForPlan(plan, "scheduledJob", rows.length);
};
