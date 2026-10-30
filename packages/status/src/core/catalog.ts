/**
 * Status Core — default status catalog.
 *
 * The Astron Collection status page tracks the public Astron Collection offerings. The catalog is
 * declarative and seeding is explicit (see `pnpm seed` / `make status-seed`),
 * idempotent and non-destructive: components are matched by name, so re-running
 * the seed after an upgrade never duplicates a component nor overwrites the
 * edits an operator made.
 *
 * `groupName` drives the sections the public page renders; `category` is the
 * fallback label. The observed state starts at `operational` and is then driven
 * by monitoring through the integration API.
 */
import type { ComponentCategory } from "./types";

export interface CatalogComponent {
	name: string;
	description: string;
	category: ComponentCategory;
	groupName: string;
}

/** Page settings applied when the catalog *creates* the page (never on re-runs). */
export interface CatalogPageSettings {
	staleAfterSeconds?: number;
	refreshIntervalSeconds?: number;
	showHistory?: boolean;
	historyLimit?: number;
}

export interface StatusCatalog {
	page: {
		slug: string;
		name: string;
		description: string;
		settings?: CatalogPageSettings;
	};
	components: CatalogComponent[];
}

export const ASTRON_COLLECTION_STATUS_CATALOG: StatusCatalog = {
	page: {
		slug: "astron-collection",
		name: "Astron Collection Status",
		description:
			"Real-time status and uptime history for the Astron Collection platform services.",
		// These are service-level components observed by monitoring, not probes
		// reporting every few seconds: the two-minute engine default would flag
		// them "no recent data" almost immediately. Fifteen minutes matches a
		// monitoring cadence that still surfaces a silent probe quickly.
		settings: {
			staleAfterSeconds: 900,
			refreshIntervalSeconds: 30,
		},
	},
	components: [
		{
			name: "Astron Collection Cloud",
			description:
				"Managed Astron Collection platform: console, deployments and billing.",
			category: "application",
			groupName: "Platform",
		},
		{
			name: "API",
			description: "Public HTTP API used by the console, CLI and integrations.",
			category: "api",
			groupName: "Platform",
		},
		{
			name: "MCP Server",
			description:
				"Model Context Protocol server exposing Astron Collection tools to AI agents.",
			category: "api",
			groupName: "Platform",
		},
		{
			name: "GitHub App",
			description:
				"GitHub App delivering deployments, commit checks and pull-request previews.",
			category: "application",
			groupName: "Integrations",
		},
		{
			name: "Website",
			description: "Marketing website and download pages.",
			category: "other",
			groupName: "Web presence",
		},
		{
			name: "Docs",
			description: "Product documentation and API reference.",
			category: "documentation",
			groupName: "Web presence",
		},
	],
};
