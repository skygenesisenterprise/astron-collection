/** Developer surfaces: API, CLI, SDK, MCP and the OpenAPI document. */

import { links } from "./links";

export const apiFacts = [
	{ label: "API operations", value: "724" },
	{ label: "MCP business capabilities", value: "19" },
	{ label: "OpenAPI version", value: "1.0.0" },
	{ label: "Licence", value: "MIT" },
];

export const developerSurfaces = [
	{
		name: "HTTP API",
		description:
			"tRPC procedures exposed through an OpenAPI document. Every management action in the console is available to automation.",
		href: links.docs.api,
		linkLabel: "API reference",
		mono: "REST",
	},
	{
		name: "MCP server",
		description:
			"A Model Context Protocol server with 19 workflow-oriented capabilities for assistants, plus an opt-in advanced catalogue.",
		href: links.docs.mcp,
		linkLabel: "MCP guide",
		mono: "MCP",
	},
	{
		name: "CLI",
		description:
			"The `astron-collection` binary: every command and flag is documented, including authentication and project workflows.",
		href: links.docs.cli,
		linkLabel: "CLI reference",
		mono: "$",
	},
	{
		name: "TypeScript SDK",
		description:
			"Typed client generated from the same contract as the API, so a renamed field fails at build time.",
		href: links.docs.sdk,
		linkLabel: "SDK guide",
		mono: "TS",
	},
	{
		name: "VS Code extension",
		description:
			"Inspect projects, deployments and logs without leaving the editor.",
		href: links.docs.vscode,
		linkLabel: "Extension guide",
		mono: "VS",
	},
	{
		name: "OpenAPI document",
		description:
			"The generated specification in the repository — the source both the SDK and the MCP catalogue derive from.",
		href: links.openapi,
		linkLabel: "openapi.json",
		mono: "{ }",
	},
];

/** MCP capability catalogue (packages/mcp/TOOLS.md). */
export const mcpCapabilities: {
	tool: string;
	category: string;
	risk: string;
	purpose: string;
}[] = [
	{
		tool: "get_connection_status",
		category: "discovery",
		risk: "read",
		purpose:
			"Validate the key, resolve the identity, permissions and target instance before any workflow.",
	},
	{
		tool: "list_projects",
		category: "discovery",
		risk: "read",
		purpose: "Discover the projects and environments the identity can access.",
	},
	{
		tool: "get_environment_overview",
		category: "discovery",
		risk: "read",
		purpose: "Summarise a project and every environment it contains.",
	},
	{
		tool: "list_servers",
		category: "discovery",
		risk: "read",
		purpose: "List readable servers with status and connection details.",
	},
	{
		tool: "get_deployment_status",
		category: "diagnostics",
		risk: "read",
		purpose: "Follow a deployment by id, or the latest one of an application.",
	},
	{
		tool: "get_deployment_history",
		category: "diagnostics",
		risk: "read",
		purpose: "Recent deployments, newest first, with counts by status.",
	},
	{
		tool: "get_application_logs",
		category: "diagnostics",
		risk: "read",
		purpose: "Bounded log tail with an optional text filter.",
	},
	{
		tool: "inspect_application_health",
		category: "diagnostics",
		risk: "read",
		purpose: "Combine record, domains and latest deployment into a verdict.",
	},
	{
		tool: "diagnose_deployment",
		category: "diagnostics",
		risk: "read",
		purpose:
			"Explain a failed or in-progress deployment from status, error and logs.",
	},
	{
		tool: "analyze_recent_failures",
		category: "diagnostics",
		risk: "read",
		purpose: "Failure rate and failures grouped by normalised signature.",
	},
	{
		tool: "prepare_deployment",
		category: "deployment",
		risk: "read",
		purpose: "Read-only preflight returning an ordered plan with blockers.",
	},
	{
		tool: "execute_deployment",
		category: "deployment",
		risk: "write",
		purpose:
			"Queue a deployment after permission, policy and approval checks; returns an operationId.",
	},
	{
		tool: "restart_application",
		category: "deployment",
		risk: "write",
		purpose: "Reload a container in place without rebuilding.",
	},
	{
		tool: "get_operation_status",
		category: "operations",
		risk: "read",
		purpose: "Poll a long-running operation and its verification outcome.",
	},
	{
		tool: "delete_application",
		category: "administration",
		risk: "destructive",
		purpose:
			"Delete an application and its deployments; requires confirmation, an approval token and an explicit opt-in.",
	},
];

/** Guard rails stated in the MCP documentation. */
export const mcpGuards: { title: string; description: string }[] = [
	{
		title: "Risk levels are metadata, not permission",
		description:
			"The API still enforces the credential's permissions; a catalogue filter never grants access.",
	},
	{
		title: "Approval tokens for high-impact calls",
		description:
			"`execute_deployment` and destructive operations require an operator-configured approval token.",
	},
	{
		title: "Destructive actions are opt-in",
		description:
			"Deletion needs `ASTRON_COLLECTION_MCP_ALLOW_DESTRUCTIVE=true` and an explicit `confirm`.",
	},
	{
		title: "Retrieved content is data",
		description:
			"Logs, repository content and deployment output are never treated as instructions.",
	},
];

export const quickStart = `# Point the client at your instance
export ASTRON_COLLECTION_URL="https://app.astron-collection.com"
export ASTRON_COLLECTION_API_KEY="<your key>"

# Verify the identity, permissions and target instance first
npx @astron-collection/mcp get_connection_status`;

export const codeSample = `curl -s "$ASTRON_COLLECTION_URL/api/trpc/project.all" \\
  -H "Authorization: Bearer $ASTRON_COLLECTION_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"json":null}'`;
