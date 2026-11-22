import { validateRequest } from "@astron-collection/server/lib/auth";
import { LOGIN_PATH } from "@astron-collection/server/services/onboarding-paths";
import type { GetServerSidePropsContext, GetServerSidePropsResult } from "next";

/**
 * The signed-in account as the Personal Space renders it.
 *
 * Only identity fields the application already has are exposed: no OAuth
 * tokens, no session object and no organization-scoped role leak into the
 * page props.
 */
export interface ManagerUser {
	id: string;
	email: string;
	displayName: string;
	firstName: string | null;
	lastName: string | null;
	image: string | null;
	emailVerified: boolean;
	twoFactorEnabled: boolean;
	/** ISO timestamp of account creation, when the session exposes it. */
	createdAt: string | null;
}

/**
 * Structural subset of the better-auth session user. The fields are optional
 * because they depend on the auth configuration and on how the account was
 * created (credentials, social provider or API key impersonation).
 */
interface SessionUserLike {
	id: string;
	email?: string | null;
	name?: string | null;
	firstName?: string | null;
	lastName?: string | null;
	image?: string | null;
	emailVerified?: boolean | null;
	twoFactorEnabled?: boolean | null;
	createdAt?: Date | string | null;
}

/**
 * Turns an account identifier into a readable display name. Registration
 * stores the email as the better-auth name, so an address must never be shown
 * as "Liam.dispa@example.com" in the account panel.
 */
function humanizeAccountName(value: string) {
	return value
		.split(/[._\-+\s]+/)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export function toManagerUser(input: SessionUserLike): ManagerUser {
	const firstName = input.firstName?.trim() ?? "";
	const lastName = input.lastName?.trim() ?? "";
	const fullName = [firstName, lastName].filter(Boolean).join(" ");
	const email = input.email ?? "";
	const sessionName = input.name?.trim() ?? "";
	const nameSeed =
		sessionName && !sessionName.includes("@")
			? sessionName
			: (email.split("@")[0] ?? "");
	const createdAt =
		input.createdAt instanceof Date
			? input.createdAt.toISOString()
			: (input.createdAt ?? null);

	return {
		id: input.id,
		email,
		displayName: fullName || humanizeAccountName(nameSeed) || "Astron user",
		firstName: firstName || null,
		lastName: lastName || null,
		image: input.image ?? null,
		emailVerified: Boolean(input.emailVerified),
		twoFactorEnabled: Boolean(input.twoFactorEnabled),
		createdAt,
	};
}

/**
 * Resolves the session for a Personal Space request. API-key sessions are not
 * accepted here: the space is a browser experience, and an API key must never
 * open an HTML application session.
 */
export async function resolveManagerSession(
	context: GetServerSidePropsContext,
): Promise<ManagerUser | null> {
	try {
		const { user, apiKey } = await validateRequest(context.req);
		if (!user || apiKey) return null;
		return toManagerUser(user as unknown as SessionUserLike);
	} catch {
		return null;
	}
}

/**
 * Shared `getServerSideProps` for every authenticated Personal Space page.
 *
 * It keeps the existing behaviour of `/channels/me`: an anonymous visitor is
 * answered with a 307 (`permanent: false`) to `/login`, and the login and
 * registration flows keep pointing at this route unchanged.
 */
export async function personalSpacePageProps(
	context: GetServerSidePropsContext,
): Promise<GetServerSidePropsResult<{ user: ManagerUser }>> {
	const user = await resolveManagerSession(context);
	if (!user) {
		return { redirect: { destination: LOGIN_PATH, permanent: false } };
	}
	return { props: { user } };
}
