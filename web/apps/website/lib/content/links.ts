/**
 * Every public destination used by the site, in one place.
 *
 * Rules:
 * - Internal targets are paths so the static export keeps working.
 * - Documentation, console and status are subdomains listed in the repository
 *   README ("Related resources").
 * - No public bot invite URLs are published yet: `applications.invite` stays
 *   null until the Discord application IDs are provided, and call-to-action
 *   buttons fall back to `/applications`.
 */

export const SITE_URL = "https://astron-collection.com";

export const links = {
	console: "https://app.astron-collection.com",
	docs: {
		home: "https://docs.astron-collection.com",
		installation: "https://docs.astron-collection.com/docs/core/installation",
		architecture: "https://docs.astron-collection.com/docs/core/architecture",
		api: "https://docs.astron-collection.com/docs/api",
		cli: "https://docs.astron-collection.com/docs/cli",
		develop: "https://docs.astron-collection.com/docs/core/develop",
		mcp: "https://docs.astron-collection.com/docs/core/develop/mcp",
		sdk: "https://docs.astron-collection.com/docs/core/develop/sdk",
		vscode: "https://docs.astron-collection.com/docs/core/develop/vscode",
	},
	github: {
		repo: "https://github.com/skygenesisenterprise/astron-collection",
		issues:
			"https://github.com/skygenesisenterprise/astron-collection/issues",
		discussions:
			"https://github.com/skygenesisenterprise/astron-collection/discussions",
		releases:
			"https://github.com/skygenesisenterprise/astron-collection/releases",
		license:
			"https://github.com/skygenesisenterprise/astron-collection/blob/master/LICENSE",
		contributing:
			"https://github.com/skygenesisenterprise/astron-collection/blob/master/.github/CONTRIBUTING.md",
	},
	community: {
		discord: "https://discord.gg/GUkDugVh34",
	},
	status: "https://status.astron-collection.com",
	openapi: "https://github.com/skygenesisenterprise/astron-collection/blob/master/openapi.json",
	email: {
		contact: "contact@skygenesisenterprise.com",
		security: "security@skygenesisenterprise.com",
	},
	company: "https://skygenesisenterprise.com",
} as const;
