import { randomBytes } from "node:crypto";
import { db } from "@astron-collection/server/db";
import {
	auditLog,
	member,
	organization,
	user,
} from "@astron-collection/server/db/schema";
import {
	createFirstOrganization,
	drizzleOnboardingStore,
	OrganizationLimitReachedError,
} from "@astron-collection/server/services/onboarding";
import { eq, inArray } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";

/**
 * Workspace creation against the real PostgreSQL database.
 *
 * These tests exist because the guarantees under test come from PostgreSQL
 * itself: `SELECT … FOR UPDATE` on the account row and transactional inserts.
 * An in-memory or SQLite store cannot prove them.
 */
const createdUserIds: string[] = [];

async function createTestUser() {
	const id = `onb_${randomBytes(8).toString("hex")}`;
	await db.insert(user).values({
		id,
		email: `${id}@onboarding.test`,
		emailVerified: true,
		updatedAt: new Date(),
	});
	createdUserIds.push(id);
	return id;
}

const createWorkspace = (userId: string, organizationLimit?: number | null) =>
	createFirstOrganization(drizzleOnboardingStore, {
		userId,
		name: "Sky Genesis Enterprise",
		organizationLimit,
		audit: {
			userEmail: `${userId}@onboarding.test`,
			userRole: "owner",
		},
	});

const seedOwnedOrganization = async (userId: string) => {
	await db.insert(organization).values({
		name: "Provisioned",
		slug: `seeded-${randomBytes(4).toString("hex")}`,
		createdAt: new Date(),
		ownerId: userId,
	});
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

afterAll(async () => {
	if (createdUserIds.length === 0) return;
	await db.delete(auditLog).where(inArray(auditLog.userId, createdUserIds));
	await db.delete(user).where(inArray(user.id, createdUserIds));
});

describe("workspace creation against PostgreSQL", () => {
	it("creates exactly one workspace for two simultaneous submissions", async () => {
		const userId = await createTestUser();

		const results = await Promise.all([
			createWorkspace(userId),
			createWorkspace(userId),
		]);

		expect(results[0]?.organizationId).toBe(results[1]?.organizationId);
		expect(results.filter((entry) => entry.created)).toHaveLength(1);

		const organizations = await db.query.organization.findMany({
			where: eq(organization.ownerId, userId),
		});
		expect(organizations).toHaveLength(1);

		const memberships = await db.query.member.findMany({
			where: eq(member.userId, userId),
		});
		expect(memberships).toHaveLength(1);
		expect(memberships[0]).toMatchObject({
			organizationId: organizations[0]?.id,
			role: "owner",
			isDefault: true,
		});

		// The audit event committed with the workspace, exactly once.
		const audits = await db.query.auditLog.findMany({
			where: eq(auditLog.organizationId, organizations[0]?.id ?? ""),
		});
		expect(audits).toHaveLength(1);
		expect(audits[0]).toMatchObject({ action: "create", userId });
	});

	it("waits for the account row lock before creating", async () => {
		const userId = await createTestUser();

		// Hold the same row lock the creation transaction takes.
		let releaseLock = () => {};
		const lockAcquired = new Promise<void>((resolve) => {
			releaseLock = resolve;
		});
		const holder = db.transaction(async (tx) => {
			await tx
				.select({ id: user.id })
				.from(user)
				.where(eq(user.id, userId))
				.for("update");
			releaseLock();
			await wait(400);
		});
		await lockAcquired;

		let settled = false;
		const creation = createWorkspace(userId).then((result) => {
			settled = true;
			return result;
		});

		// While the lock is held, the creation must not run its checks.
		await wait(150);
		expect(settled).toBe(false);

		await holder;
		const result = await creation;
		expect(settled).toBe(true);
		expect(result.created).toBe(true);
	});

	it("lets two different accounts create their workspace simultaneously", async () => {
		const [firstUser, secondUser] = await Promise.all([
			createTestUser(),
			createTestUser(),
		]);

		const results = await Promise.all([
			createWorkspace(firstUser),
			createWorkspace(secondUser),
		]);

		expect(results.every((entry) => entry.created)).toBe(true);
		expect(results[0]?.organizationId).not.toBe(results[1]?.organizationId);
		expect(results[0]?.organizationId).toMatch(/^[0-9a-f]{32}$/);
	});

	it("refuses a creation over the plan quota without writing anything", async () => {
		const userId = await createTestUser();
		// An owned organization without a membership is what an externally
		// provisioned workspace looks like; the quota counts owned workspaces.
		await seedOwnedOrganization(userId);

		await expect(createWorkspace(userId, 1)).rejects.toBeInstanceOf(
			OrganizationLimitReachedError,
		);

		expect(
			await db.query.organization.findMany({
				where: eq(organization.ownerId, userId),
			}),
		).toHaveLength(1);
		expect(
			await db.query.member.findMany({ where: eq(member.userId, userId) }),
		).toHaveLength(0);
	});

	it("consumes a single quota slot when two submissions race near the quota", async () => {
		const userId = await createTestUser();
		// Limit 2 with one owned workspace: the two submissions must end on the
		// same workspace, and only one of them may create it.
		await seedOwnedOrganization(userId);

		const results = await Promise.all([
			createWorkspace(userId, 2),
			createWorkspace(userId, 2),
		]);

		expect(results[0]?.organizationId).toBe(results[1]?.organizationId);
		expect(results.filter((entry) => entry.created)).toHaveLength(1);
		// One provisioned workspace plus exactly one created: no double slot.
		expect(
			await db.query.organization.findMany({
				where: eq(organization.ownerId, userId),
			}),
		).toHaveLength(2);
		expect(
			await db.query.member.findMany({ where: eq(member.userId, userId) }),
		).toHaveLength(1);
	});

	it("does not consume quota when the workspace already exists", async () => {
		const userId = await createTestUser();

		const first = await createWorkspace(userId, 1);
		const retried = await createWorkspace(userId, 1);

		expect(retried).toEqual({
			organizationId: first.organizationId,
			created: false,
		});
		expect(
			await db.query.organization.findMany({
				where: eq(organization.ownerId, userId),
			}),
		).toHaveLength(1);
	});
});
