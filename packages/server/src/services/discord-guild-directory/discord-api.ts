import { logger } from "../../lib/logger";

export const DISCORD_API_BASE = "https://discord.com/api/v10";
export const DISCORD_GUILDS_ENDPOINT = `${DISCORD_API_BASE}/users/@me/guilds`;

/** Only the fields of Discord's partial guild object that we persist. */
export interface DiscordApiGuild {
	id: string;
	name: string;
	icon: string | null;
	owner: boolean;
	permissions: string;
	owner_id?: string | null;
	approximate_member_count?: number | null;
	verification_level?: number | null;
}

export type DiscordApiErrorCode =
	| "missing_token"
	| "missing_scope"
	| "invalid_token"
	| "revoked"
	| "rate_limited"
	| "api_error"
	| "invalid_response";

export class DiscordApiError extends Error {
	readonly code: DiscordApiErrorCode;
	readonly status: number | null;
	readonly retryAfterMs: number | null;

	constructor(
		code: DiscordApiErrorCode,
		message: string,
		options: { status?: number | null; retryAfterMs?: number | null } = {},
	) {
		super(message);
		this.name = "DiscordApiError";
		this.code = code;
		this.status = options.status ?? null;
		this.retryAfterMs = options.retryAfterMs ?? null;
	}
}

export interface FetchDiscordGuildsOptions {
	fetchImpl?: typeof fetch;
	/** Sleep hook, injected so rate-limit handling is testable without timers. */
	sleep?: (ms: number) => Promise<void>;
	maxRetries?: number;
	timeoutMs?: number;
	signal?: AbortSignal;
}

interface RateLimitBody {
	retry_after?: number | string;
	code?: number;
	message?: string;
	global?: boolean;
}

function parseRetryAfterMs(response: Response, body: RateLimitBody | null): number {
	const header = response.headers.get("retry-after");
	const raw = body?.retry_after ?? header;
	const parsed = typeof raw === "string" ? Number.parseFloat(raw) : raw;
	if (typeof parsed !== "number" || !Number.isFinite(parsed) || parsed < 0) {
		return 1_000;
	}
	// Discord may report seconds or milliseconds; values below 100 are seconds.
	return Math.min(30_000, Math.round(parsed < 100 ? parsed * 1_000 : parsed));
}

function isPartialGuild(value: unknown): value is DiscordApiGuild {
	if (!value || typeof value !== "object") return false;
	const guild = value as Record<string, unknown>;
	return (
		typeof guild.id === "string" &&
		/^\d{17,20}$/.test(guild.id) &&
		typeof guild.name === "string" &&
		guild.name.length > 0 &&
		typeof guild.permissions === "string" &&
		(guild.icon === null || typeof guild.icon === "string")
	);
}

/**
 * Lists every guild visible to the linked Discord account using the official
 * REST endpoint. No bot token, bot scope or runtime process is involved.
 *
 * Access and refresh tokens stay server-side: this function receives the token
 * as an argument and never includes it in a log line or an error message.
 */
export async function fetchDiscordGuilds(
	accessToken: string,
	options: FetchDiscordGuildsOptions = {},
): Promise<DiscordApiGuild[]> {
	if (!accessToken) {
		throw new DiscordApiError("missing_token", "Discord access token is missing.");
	}

	const fetchImpl = options.fetchImpl ?? fetch;
	const sleep = options.sleep ?? ((ms: number) => new Promise((resolve) => setTimeout(resolve, ms)));
	const maxRetries = options.maxRetries ?? 2;
	const timeoutMs = options.timeoutMs ?? 10_000;

	for (let attempt = 0; attempt <= maxRetries; attempt++) {
		let response: Response;
		try {
			response = await fetchImpl(DISCORD_GUILDS_ENDPOINT, {
				method: "GET",
				headers: {
					Authorization: `Bearer ${accessToken}`,
					Accept: "application/json",
				},
				cache: "no-store",
				signal: options.signal ?? AbortSignal.timeout(timeoutMs),
			});
		} catch (error) {
			if (options.signal?.aborted) throw error;
			throw new DiscordApiError(
				"api_error",
				"Discord could not be reached while listing servers.",
			);
		}

		if (response.status === 401 || response.status === 403) {
			throw new DiscordApiError(
				response.status === 401 ? "invalid_token" : "revoked",
				"Discord rejected the saved authorization. Reconnect your Discord account.",
				{ status: response.status },
			);
		}

		if (response.status === 429) {
			let body: RateLimitBody | null = null;
			try {
				body = (await response.json()) as RateLimitBody;
			} catch {
				body = null;
			}
			const retryAfterMs = parseRetryAfterMs(response, body);
			if (attempt >= maxRetries) {
				throw new DiscordApiError("rate_limited", "Discord is rate limiting requests.", {
					status: 429,
					retryAfterMs,
				});
			}
			logger.warn(
				{ event: "discord_guilds_rate_limited", attempt, retryAfterMs },
				"Discord guild listing was rate limited; retrying.",
			);
			await sleep(retryAfterMs);
			continue;
		}

		if (!response.ok) {
			throw new DiscordApiError(
				"api_error",
				"Discord returned an error while listing servers.",
				{ status: response.status },
			);
		}

		let payload: unknown;
		try {
			payload = await response.json();
		} catch {
			throw new DiscordApiError(
				"invalid_response",
				"Discord returned an unreadable guild list.",
				{ status: response.status },
			);
		}

		if (!Array.isArray(payload)) {
			throw new DiscordApiError(
				"invalid_response",
				"Discord returned an unexpected guild payload.",
				{ status: response.status },
			);
		}

		return payload.filter(isPartialGuild);
	}

	throw new DiscordApiError("rate_limited", "Discord is rate limiting requests.", {
		status: 429,
	});
}
