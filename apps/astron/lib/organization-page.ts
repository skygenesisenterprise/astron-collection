import { validateRequest } from "@astron-collection/server/lib/auth";
import {
	findOnboardingOrganizationById,
	findUserOrganizationMembership,
	readOnboardingStatus,
} from "@astron-collection/server/services/onboarding";
import {
	CREATE_ACCOUNT_PATH,
	LOGIN_PATH,
	resolveWorkspaceAccess,
} from "@astron-collection/server/services/onboarding-paths";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

export interface OrganizationPageProps {
	organization: {
		id: string;
		name: string;
		role: string;
	};
	user: {
		name: string | null;
		email: string;
		image: string | null;
	};
}

/**
 * Resolves everything a `/{organizationId}` panel page needs.
 *
 * The organization id is an input from the browser, never a grant: it is only
 * used to look the organization up, and the membership row decides access.
 * Every panel page goes through this helper so the redirect rules and the
 * payload cannot drift apart.
 */
export async function getOrganizationPageProps(
	context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<OrganizationPageProps>> {
	const rawOrganizationId = context.params?.organizationId;
	const organizationId = Array.isArray(rawOrganizationId)
		? rawOrganizationId[0]
		: rawOrganizationId;

	if (!organizationId) {
		return { notFound: true };
	}

	let session: Awaited<ReturnType<typeof validateRequest>> | null = null;
	try {
		session = await validateRequest(context.req);
	} catch {
		session = null;
	}

	const user = session?.user;
	if (!user) {
		return { redirect: { permanent: false, destination: LOGIN_PATH } };
	}

	// A workspace whose organization row is gone cannot be opened: its
	// memberships were cascaded away, and the session may still point at it.
	const organizationExists =
		await findOnboardingOrganizationById(organizationId);
	const membership = await findUserOrganizationMembership(
		user.id,
		organizationId,
	);
	const status = await readOnboardingStatus(
		user.id,
		session?.session?.activeOrganizationId,
	);

	const access = resolveWorkspaceAccess({
		hasSession: true,
		organizationExists: Boolean(organizationExists),
		isMember: Boolean(membership?.organization),
		destination: status.destination,
	});

	if (!access.allowed) {
		return { redirect: { permanent: false, destination: access.redirect } };
	}

	if (!membership?.organization) {
		// `allowed` already implies a membership row; keep the result type-safe.
		return {
			redirect: { permanent: false, destination: CREATE_ACCOUNT_PATH },
		};
	}

	return {
		props: {
			organization: {
				id: membership.organization.id,
				name: membership.organization.name,
				role: membership.role,
			},
			user: {
				name: user.name,
				email: user.email,
				image: user.image ?? null,
			},
		},
	};
}
