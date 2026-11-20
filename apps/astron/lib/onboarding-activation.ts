/**
 * Session checks for workspace activation.
 *
 * Activation is a separate operation from creation: the page must confirm that
 * the session really points at the workspace the server created before it may
 * navigate, and it must tell a retryable failure from an expired session.
 */

/** The organization the session currently points at, if any. */
export const readActiveOrganizationId = (session: unknown): string | null => {
	if (!session || typeof session !== "object") return null;
	const active = (session as { activeOrganizationId?: unknown })
		.activeOrganizationId;
	return typeof active === "string" && active.length > 0 ? active : null;
};

/** Whether a failed activation means the account has to sign in again. */
export const isSessionExpired = (error: { status?: number } | null) =>
	error?.status === 401;
