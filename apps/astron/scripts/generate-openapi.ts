#!/usr/bin/env tsx

/**
 * Script to generate OpenAPI specification locally
 * This runs in CI/CD to generate the openapi.json file
 * which can then be consumed by the documentation website
 */

import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateOpenApiDocument } from "@astron-collection/trpc-openapi";
import { appRouter } from "../server/api/root";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateOpenAPI() {
	try {
		console.log("🔄 Generating OpenAPI specification...");

		const openApiDocument = generateOpenApiDocument(appRouter, {
			title: "Astron Collection API",
			version: "1.0.0",
			baseUrl: "https://your-astron-collection-instance.com/api",
			docsUrl: "https://docs.astron-collection.com/api",
		});

		// Derive top-level tag metadata from the operations themselves. The
		// documentation generator (fumadocs-openapi, per: "tag") emits one
		// reference page per entry here, so a hardcoded list silently drops
		// pages whenever a router tag is added or renamed.
		const operationTags = new Set<string>();
		for (const pathItem of Object.values(openApiDocument.paths ?? {})) {
			for (const operation of Object.values(pathItem ?? {})) {
				if (!operation || typeof operation !== "object") continue;
				const tags = (operation as { tags?: string[] }).tags;
				if (Array.isArray(tags)) {
					for (const tag of tags) operationTags.add(tag);
				}
			}
		}
		openApiDocument.tags = [...operationTags].sort().map((name) => ({
			name,
		}));

		// Enhance metadata
		openApiDocument.info = {
			title: "Astron Collection API",
			description:
				"Complete API documentation for Astron Collection - Deploy applications, manage databases, and orchestrate your infrastructure. This API allows you to programmatically manage all aspects of your Astron Collection instance.",
			version: "1.0.0",
			contact: {
				name: "Astron Collection Team",
				url: "https://astron-collection.com",
			},
			license: {
				name: "Apache 2.0",
				url: "https://github.com/skygenesisenterprise/astron-collection/blob/master/LICENSE",
			},
		};

		// Add security schemes
		openApiDocument.components = {
			...openApiDocument.components,
			securitySchemes: {
				apiKey: {
					type: "apiKey",
					in: "header",
					name: "x-api-key",
					description:
						"API key authentication. Generate an API key from your Astron Collection dashboard under Settings > API Keys.",
				},
			},
		};

		// Apply global security
		openApiDocument.security = [
			{
				apiKey: [],
			},
		];

		// `@astron-collection/trpc-openapi` marks each operation with the legacy
		// "Authorization" scheme, which is not defined in the document. Point
		// those requirements at the `apiKey` scheme so the spec is internally
		// consistent and generated clients do not look for a missing scheme.
		for (const pathItem of Object.values(openApiDocument.paths ?? {})) {
			for (const operation of Object.values(pathItem ?? {})) {
				if (!operation || typeof operation !== "object") continue;
				const secured = operation as { security?: Array<Record<string, unknown>> };
				if (!Array.isArray(secured.security)) continue;
				secured.security = secured.security.map((requirement) =>
					Object.hasOwn(requirement, "Authorization")
						? { apiKey: [] }
						: requirement,
				);
			}
		}

		// Add external docs
		openApiDocument.externalDocs = {
			description: "Full documentation",
			url: "https://docs.astron-collection.com",
		};

		// Write to root of repo
		const outputPath = resolve(__dirname, "../../../openapi.json");
		writeFileSync(
			outputPath,
			JSON.stringify(openApiDocument, null, 2),
			"utf-8",
		);

		console.log("✅ OpenAPI specification generated successfully!");
		console.log(`📄 Output: ${outputPath}`);
		console.log(
			`📊 Endpoints: ${Object.keys(openApiDocument.paths || {}).length}`,
		);
	} catch (error) {
		console.error("❌ Error generating OpenAPI specification:", error);
		process.exit(1);
	} finally {
		process.exit(0);
	}
}

generateOpenAPI();
