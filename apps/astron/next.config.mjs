/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

/** @type {import("next").NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	typescript: {
		ignoreBuildErrors: true,
	},
	transpilePackages: ["@astron-collection/server", "@astron-collection/status"],
	/**
	 * The client container only serves the frontend: every `/api/*` call is proxied
	 * to the API service (GROUP 4), which owns authentication, tRPC/OpenAPI, the
	 * WebSocket endpoints and the database. `beforeFiles` runs before route
	 * matching, so the API route files bundled in this image stay unreachable —
	 * and that container has no database or Redis credentials anyway.
	 *
	 * The destination is read when the server starts (`next dev`) and baked into
	 * the routes manifest at build time (`next build`), where the Compose service
	 * name is already the default.
	 */
	async rewrites() {
		const apiInternalUrl = process.env.API_INTERNAL_URL ?? "http://api:4000";
		return {
			beforeFiles: [
				{
					source: "/api/:path*",
					destination: `${apiInternalUrl}/api/:path*`,
				},
			],
			afterFiles: [],
			fallback: [],
		};
	},
	webpack: (config) => {
		// Resolve monorepo packages for transpilation
		config.resolve.alias["@astron-collection/status"] = path.resolve(
			__dirname,
			"../../packages/status/src"
		);
		config.resolve.alias["@astron-collection/server"] = path.resolve(
			__dirname,
			"../../packages/server/src"
		);
		return config;
	},
	async headers() {
		return [
			{
				source: "/_next/static/:path*",
				headers: [
					{
						// Production chunks are content-hashed and safe to cache
						// forever. Development chunks are rebuilt on every edit:
						// caching them as immutable makes the browser serve a
						// stale chunk whose module factories no longer exist
						// ("module factory is not available" HMR error).
						key: "Cache-Control",
						value:
							process.env.NODE_ENV === "development"
								? "no-store, must-revalidate"
								: "public, max-age=31536000, immutable",
					},
				],
			},
			{
				source: "/_next/static/development/:path*",
				headers: [
					{
						key: "Content-Type",
						value: "application/javascript; charset=utf-8",
					},
				],
			},
			{
				// Apply security headers to all routes
				source: "/:path*",
				headers: [
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "Content-Security-Policy",
						value: "frame-ancestors 'none'",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Referrer-Policy",
						value: "strict-origin-when-cross-origin",
					},
				],
			},
		];
	},
};

export default nextConfig;
