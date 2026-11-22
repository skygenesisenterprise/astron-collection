import { TRPCError } from "@trpc/server";
import { IS_CLOUD } from "@astron-collection/server";
import {
	createOwnedOrganization,
	OrganizationLimitReachedError,
	readOnboardingStatus,
} from "@astron-collection/server/services/onboarding";
import { z } from "zod";
import { getOrganizationLimitForUser } from "@/server/api/utils/plan-limits";
import { createTRPCRouter, protectedProcedure } from "../trpc";

const OrganizationNameSchema = z
	.string()
	.trim()
	.min(2, "Enter at least 2 characters")
	.max(64, "Keep the name under 64 characters");

/**
 * Onboarding lifecycle: `getStatus` decides between the workspace and the
 * organization step, `createOrganization` creates the first workspace, and
 * `complete` verifies where the account has to land next.
 *
 * Every procedure is protected: the user id always comes from the session, never
 * from the input, and the destination is built from the persisted id.
 */
export const onboardingRouter = createTRPCRouter({
	getStatus: protectedProcedure.query(async ({ ctx }) =>
		readOnboardingStatus(ctx.user.id, ctx.session.activeOrganizationId),
	),

	complete: protectedProcedure.query(async ({ ctx }) => {
		const status = await readOnboardingStatus(
			ctx.user.id,
			ctx.session.activeOrganizationId,
		);
		return { ...status, completed: status.hasOrganization };
	}),

	createOrganization: protectedProcedure
		.input(z.object({ name: OrganizationNameSchema }))
		.mutation(async ({ ctx, input }) => {
			// Onboarding only ever creates the account's first workspace (creation is
			// idempotent), so no role check is needed here: the self-hosted owner
			// role is assigned after this step, and additional organizations stay
			// restricted to owners and admins in the organization router.
			//
			// The plan comes from the server, never from the client. The service
			// enforces it under the account's row lock, so concurrent submissions
			// cannot both pass it.
			const organizationLimit = IS_CLOUD
				? await getOrganizationLimitForUser(ctx.user.id)
				: null;

			try {
				// Idempotent: a retry or a double click returns the existing workspace,
				// and the audit event commits with the creation.
				return await createOwnedOrganization({
					userId: ctx.user.id,
					name: input.name,
					organizationLimit,
					audit: {
						userEmail: ctx.user.email,
						userRole: ctx.user.role,
					},
				});
			} catch (error) {
				if (error instanceof OrganizationLimitReachedError) {
					throw new TRPCError({ code: "FORBIDDEN", message: error.message });
				}
				throw error;
			}
		}),
});
