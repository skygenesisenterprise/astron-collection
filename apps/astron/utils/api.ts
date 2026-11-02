import {
	createWSClient,
	httpBatchLink,
	httpLink,
	splitLink,
	wsLink,
} from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";
import type { AppRouter } from "@/server/api/root";

/**
 * HTTP calls stay on the client origin: Next.js rewrites `/api/*` to the API
 * service (see next.config.mjs), so session cookies remain first-party.
 * Server-side calls (tests, SSR helpers) target the internal API service instead.
 */
const getBaseUrl = () => {
	if (typeof window !== "undefined") return "";
	return (
		process.env.API_INTERNAL_URL ??
		`http://localhost:${process.env.PORT ?? 3000}`
	);
};

/**
 * WebSockets cannot go through a Next.js rewrite: they connect directly to the
 * API origin published as NEXT_PUBLIC_API_URL (baked in at build time), and fall
 * back to the client origin when it is not configured.
 */
const getWsUrl = () => {
	if (typeof window === "undefined") return null;

	const configured = process.env.NEXT_PUBLIC_API_URL;
	if (configured) {
		try {
			const { protocol, host } = new URL(configured);
			return `${protocol === "https:" ? "wss" : "ws"}://${host}/drawer-logs`;
		} catch {
			// Not a valid URL: fall back to the current origin below.
		}
	}

	const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
	const host = window.location.host;

	return `${protocol}${host}/drawer-logs`;
};

let wsClientSingleton: ReturnType<typeof createWSClient> | null = null;

const getOrCreateWSClient = () => {
	if (typeof window === "undefined") return null;

	if (!wsClientSingleton) {
		wsClientSingleton = createWSClient({
			url: getWsUrl()!,
			lazy: { enabled: true, closeMs: 3000 },
			retryDelayMs: () => 3000,
		});
	}

	return wsClientSingleton;
};

const wsClient = getOrCreateWSClient();

const links =
	typeof window !== "undefined"
		? [
				splitLink({
					condition: (op) => op.type === "subscription",
					true: wsLink({
						client: wsClient!,
						transformer: superjson,
					}),
					false: splitLink({
						condition: (op) => op.input instanceof FormData,
						true: httpLink({
							url: `${getBaseUrl()}/api/trpc`,
							transformer: superjson,
						}),
						false: httpBatchLink({
							url: `${getBaseUrl()}/api/trpc`,
							transformer: superjson,
						}),
					}),
				}),
			]
		: [
				httpBatchLink({
					url: `${getBaseUrl()}/api/trpc`,
					transformer: superjson,
				}),
			];

export const api = createTRPCNext<AppRouter>({
	config() {
		return { links };
	},
	ssr: false,
	transformer: superjson,
});

export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;
