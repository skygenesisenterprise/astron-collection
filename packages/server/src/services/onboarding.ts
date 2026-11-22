import { db } from "@astron-collection/server/db";
import type {
	AuditAction,
	AuditResourceType,
} from "@astron-collection/server/db/schema";
import {
	auditLog,
	member,
	organization,
	user,
} from "@astron-collection/server/db/schema";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import {
	type OnboardingMembership,
	organizationLimitMessage,
	resolveOnboardingStatus,
} from "./onboarding-paths";

// The pages import the database-free decisions from `./onboarding-paths`; the
// API keeps importing everything from here.
export * from "./onboarding-paths";

/** Audit event written by the same transaction that creates a workspace. */
export interface OnboardingAuditEntry {
	organizationId: string;
	userId: string;
	userEmail: string;
	userRole: string;
	action: AuditAction;
	resourceType: AuditResourceType;
	resourceId?: string;
	resourceName?: string;
}

/**
 * The writes onboarding performs inside a single database transaction.
 *
 * `lockUser` serializes workspace creation for one account: a submission that
 * raced past the initial lookup waits for the other one, then observes the
 * committed membership instead of creating a second workspace.
 */
export interface OnboardingTransaction {
	lockUser(userId: string): Promise<void>;
	findMembership(userId: string): Promise<OnboardingMembership | null>;
	countOwnedOrganizations(userId: string): Promise<number>;
	insertOrganization(input: {
		name: string;
		slug: string;
		ownerId: string;
		createdAt: Date;
	}): Promise<{ id: string; name: string }>;
	insertOwnerMember(input: {
		organizationId: string;
		userId: string;
		createdAt: Date;
		isDefault: boolean;
	}): Promise<void>;
	insertAuditLog(entry: OnboardingAuditEntry): Promise<void>;
}

/** Persistence boundary: production supplies Drizzle, tests supply memory. */
export interface OnboardingStore {
	listMemberships(userId: string): Promise<OnboardingMembership[]>;
	transaction<T>(
		run: (transaction: OnboardingTransaction) => Promise<T>,
	): Promise<T>;
}

export interface CreateFirstOrganizationResult {
	organizationId: string;
	created: boolean;
}

export interface CreateFirstOrganizationInput {
	userId: string;
	name: string;
	now?: Date;
	/**
	 * Owned-organization quota enforced when the plan defines one. `null` (or
	 * omitted) means unlimited, which is the self-hosted behaviour.
	 */
	organizationLimit?: number | null;
	/** Identity recorded in the audit trail of the created workspace. */
	audit?: { userEmail: string; userRole: string };
}

/**
 * Raised inside the creation transaction when the plan's quota is already
 * consumed. Thrown before anything is written, so the caller can map it to a
 * "quota reached" response without a second creation.
 */
export class OrganizationLimitReachedError extends Error {
	readonly limit: number;

	constructor(limit: number) {
		super(organizationLimitMessage(limit));
		this.name = "OrganizationLimitReachedError";
		this.limit = limit;
	}
}

/**
 * Creates the first workspace of an account and makes it the owner.
 *
 * Idempotent on purpose: a duplicate submission, or a retry after the
 * organization was created but its activation failed, returns the workspace
 * that already exists instead of creating a second one.
 *
 * Concurrency: the transaction locks the account row (`SELECT … FOR UPDATE`)
 * before re-reading the membership, so two simultaneous submissions cannot both
 * pass the check and insert. The quota is evaluated under the same lock, and the
 * audit entry commits with the organization.
 */
export async function createFirstOrganization(
	store: OnboardingStore,
	input: CreateFirstOrganizationInput,
): Promise<CreateFirstOrganizationResult> {
	// Fast path: an account that already owns a workspace never consumes quota.
	const memberships = await store.listMemberships(input.userId);
	const existing = memberships[0];
	if (existing) {
		return { organizationId: existing.organizationId, created: false };
	}

	return store.transaction(async (transaction) => {
		// PostgreSQL serializes concurrent onboarding of the same account here.
		await transaction.lockUser(input.userId);

		const raced = await transaction.findMembership(input.userId);
		if (raced) {
			return { organizationId: raced.organizationId, created: false };
		}

		const limit = input.organizationLimit ?? null;
		if (limit !== null) {
			const owned = await transaction.countOwnedOrganizations(input.userId);
			if (owned >= limit) {
				throw new OrganizationLimitReachedError(limit);
			}
		}

		const now = input.now ?? new Date();
		const created = await transaction.insertOrganization({
			name: input.name,
			slug: nanoid(),
			ownerId: input.userId,
			createdAt: now,
		});
		await transaction.insertOwnerMember({
			organizationId: created.id,
			userId: input.userId,
			createdAt: now,
			isDefault: true,
		});

		// The audit row is part of the creation transaction: it commits with the
		// workspace or not at all, so a retry neither loses nor duplicates it.
		if (input.audit) {
			await transaction.insertAuditLog({
				organizationId: created.id,
				userId: input.userId,
				userEmail: input.audit.userEmail,
				userRole: input.audit.userRole,
				action: "create",
				resourceType: "organization",
				resourceId: created.id,
				resourceName: created.name,
			});
		}

		return { organizationId: created.id, created: true };
	});
}

const membershipColumns = {
	organizationId: true,
	role: true,
	isDefault: true,
} as const;

const toMembership = (row: {
	organizationId: string;
	role: string;
	isDefault: boolean;
}): OnboardingMembership => ({
	organizationId: row.organizationId,
	role: row.role,
	isDefault: row.isDefault,
});

/**
 * Drizzle-backed onboarding store.
 *
 * The organization and its owner membership are inserted in one transaction:
 * an account must never end up with a workspace it is not a member of. The
 * unique index on `member (organization_id, user_id)` backs the same rule in
 * PostgreSQL when two requests race.
 */
export const drizzleOnboardingStore: OnboardingStore = {
	listMemberships: async (userId) => {
		const rows = await db.query.member.findMany({
			where: eq(member.userId, userId),
			columns: membershipColumns,
		});
		return rows.map(toMembership);
	},
	transaction: (run) =>
		db.transaction((tx) =>
			run({
				lockUser: async (userId) => {
					// Row lock held until commit: the account row is the lock, not the
					// workspace that does not exist yet.
					await tx
						.select({ id: user.id })
						.from(user)
						.where(eq(user.id, userId))
						.for("update");
				},
				findMembership: async (userId) => {
					const row = await tx.query.member.findFirst({
						where: eq(member.userId, userId),
						columns: membershipColumns,
					});
					return row ? toMembership(row) : null;
				},
				countOwnedOrganizations: (userId) =>
					tx.$count(organization, eq(organization.ownerId, userId)),
				insertOrganization: async (input) => {
					const [created] = await tx
						.insert(organization)
						.values({
							name: input.name,
							slug: input.slug,
							createdAt: input.createdAt,
							ownerId: input.ownerId,
						})
						.returning({ id: organization.id, name: organization.name });
					if (!created) {
						throw new Error("Failed to create organization");
					}
					return created;
				},
				insertOwnerMember: async (input) => {
					await tx.insert(member).values({
						organizationId: input.organizationId,
						userId: input.userId,
						role: "owner",
						createdAt: input.createdAt,
						isDefault: input.isDefault,
					});
				},
				insertAuditLog: async (entry) => {
					await tx.insert(auditLog).values({ ...entry });
				},
			}),
		),
};

/** Memberships of an account, used to decide between onboarding and workspace. */
export const listUserMemberships = async (userId: string) =>
	(
		await db.query.member.findMany({
			where: eq(member.userId, userId),
			columns: membershipColumns,
		})
	).map(toMembership);

/** Creates the first workspace of an account through the Drizzle store. */
export const createOwnedOrganization = (input: CreateFirstOrganizationInput) =>
	createFirstOrganization(drizzleOnboardingStore, input);

/** Onboarding state of an account, shared by the API and the pages' SSR. */
export const readOnboardingStatus = async (
	userId: string,
	activeOrganizationId?: string | null,
) =>
	resolveOnboardingStatus({
		activeOrganizationId,
		memberships: await listUserMemberships(userId),
	});

/** Organization row, used to tell a deleted workspace from a missing membership. */
export const findOnboardingOrganizationById = async (organizationId: string) =>
	db.query.organization.findFirst({
		where: eq(organization.id, organizationId),
		columns: { id: true, name: true },
	});

/**
 * Membership of an account in one workspace, with the organization attached.
 *
 * The organization id comes from the URL, so this is the only thing that grants
 * access: a missing membership always means "forbidden", never "not found".
 */
export const findUserOrganizationMembership = async (
	userId: string,
	organizationId: string,
) =>
	db.query.member.findFirst({
		where: and(
			eq(member.organizationId, organizationId),
			eq(member.userId, userId),
		),
		with: { organization: true },
	});
