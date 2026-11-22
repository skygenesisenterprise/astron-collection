/**
 * Public visibility flag for the legacy Templates gallery inherited from
 * Notploy (https://templates.notploy.com/).
 *
 * The server flag `ASTRON_COLLECTION_TEMPLATES_ENABLED` rejects every template
 * API call; this `NEXT_PUBLIC_` flag only hides the UI entry points. Both default
 * to disabled so enabling one alone never leaves dead buttons in the dashboard.
 */
export const TEMPLATES_ENABLED = ["1", "true", "yes"].includes(
	(
		process.env.NEXT_PUBLIC_ASTRON_COLLECTION_TEMPLATES_ENABLED ?? ""
	).toLowerCase(),
);
