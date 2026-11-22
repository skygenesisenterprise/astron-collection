"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { authClient } from "@/lib/auth-client";
import { readActiveOrganizationId } from "@/lib/onboarding-activation";

/**
 * The organization a panel page belongs to, as resolved on the server from the
 * URL and the user's membership. It is never derived from `activeOrganizationId`
 * alone: a stale session must not grant access.
 */
export interface PanelOrganization {
	id: string;
	name: string;
	role: string;
}

export type ActivationStatus = "idle" | "syncing" | "ready" | "error";

interface OrganizationContextValue {
	organization: PanelOrganization;
	/** Whether the session points at this organization yet. */
	activation: ActivationStatus;
	/** Retries the session sync after a failure. */
	syncSession: () => void;
}

const OrganizationContext = createContext<OrganizationContextValue | null>(
	null,
);

/**
 * Keeps the session's active organization aligned with the workspace in the
 * URL. Panel APIs read `activeOrganizationId`, so a direct visit to another
 * workspace must move the session before any of them run.
 *
 * A failed sync never blocks the page: server-side rendering already authorized
 * this URL by membership, and the banner in the shell offers a retry.
 */
export function OrganizationProvider({
	organization,
	children,
}: {
	organization: PanelOrganization;
	children: React.ReactNode;
}) {
	const [activation, setActivation] = useState<ActivationStatus>("idle");

	const syncSession = useCallback(() => {
		let cancelled = false;
		setActivation("syncing");

		void (async () => {
			try {
				const { data } = await authClient.getSession();
				if (cancelled) return;
				if (readActiveOrganizationId(data?.session) === organization.id) {
					setActivation("ready");
					return;
				}

				const { error } = await authClient.organization.setActive({
					organizationId: organization.id,
				});
				if (cancelled) return;
				setActivation(error ? "error" : "ready");
			} catch {
				if (!cancelled) setActivation("error");
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [organization.id]);

	useEffect(() => syncSession(), [syncSession]);

	const value = useMemo<OrganizationContextValue>(
		() => ({ organization, activation, syncSession }),
		[organization, activation, syncSession],
	);

	return (
		<OrganizationContext.Provider value={value}>
			{children}
		</OrganizationContext.Provider>
	);
}

export function useOrganization(): OrganizationContextValue {
	const value = useContext(OrganizationContext);
	if (!value) {
		throw new Error(
			"useOrganization must be used inside an OrganizationProvider",
		);
	}
	return value;
}
