import path from "node:path";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

/**
 * Tests that need a real PostgreSQL database.
 *
 * Row locks and transaction isolation only behave like production there, so
 * these run without the in-memory DB mock of `setup.ts`. `DATABASE_URL` is
 * inherited from the environment (or the development default).
 */
export default defineConfig({
	test: {
		include: ["__test__/**/*.postgres.test.ts"],
		exclude: ["**/node_modules/**", "**/dist/**", "**/.docker/**"],
		pool: "forks",
		testTimeout: 30_000,
		hookTimeout: 30_000,
	},
	plugins: [
		tsconfigPaths({
			projects: [path.resolve(__dirname, "../tsconfig.json")],
		}),
	],
	resolve: {
		alias: {
			"@astron-collection/server": path.resolve(
				__dirname,
				"../../../packages/server/src",
			),
		},
	},
});
