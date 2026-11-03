/**
 * Builds the marketing site as a static export for GitHub Pages / Cloudflare
 * Pages.
 *
 * One route handler needs a Node server and cannot be exported:
 *   app/api/contact   POST — the contact form
 *   app/api/og        renders an image from request query params
 *
 * They are moved aside for the duration of the build and restored afterwards,
 * so `next build` (the Docker/server build) keeps them untouched. The exported
 * site uses `NEXT_PUBLIC_CONTACT_ENDPOINT` for the form when configured; see
 * the Pages workflow.
 *
 * Usage: node scripts/build-static.mjs
 */

import { existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const APP_ROOT = resolve(import.meta.dirname, "..");
const BACKUP_ROOT = join(APP_ROOT, ".static-export-disabled");
const SERVER_ROUTES = ["app/api/contact", "app/api/og"];

const moved = [];
let status = 1;

try {
	for (const route of SERVER_ROUTES) {
		const from = join(APP_ROOT, route);
		if (!existsSync(from)) continue;
		const to = join(BACKUP_ROOT, route);
		mkdirSync(dirname(to), { recursive: true });
		renameSync(from, to);
		moved.push({ from, to });
	}

	const result = spawnSync("pnpm", ["exec", "next", "build", "--webpack"], {
		cwd: APP_ROOT,
		stdio: "inherit",
		env: { ...process.env, NEXT_OUTPUT: "export" },
	});
	status = result.status ?? 1;
} finally {
	for (const { from, to } of moved) {
		mkdirSync(dirname(from), { recursive: true });
		renameSync(to, from);
	}
	rmSync(BACKUP_ROOT, { recursive: true, force: true });
}

process.exitCode = status;
