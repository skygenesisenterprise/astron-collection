import { fieldErrors, contactSalesSchema } from "@/lib/forms/contact-sales";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * In-memory rate limiter. It is per-instance and resets on deploy, which is
 * acceptable for a marketing form behind a reverse proxy but not a substitute
 * for edge-level limiting. Documented in docs/operations/deployment.md.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const attempts = new Map<string, number[]>();

function isRateLimited(key: string): boolean {
	const now = Date.now();
	const recent = (attempts.get(key) ?? []).filter((time) => now - time < WINDOW_MS);
	recent.push(now);
	attempts.set(key, recent);
	if (attempts.size > 5000) {
		// Keep the map bounded on long-running instances.
		for (const [entryKey, times] of attempts) {
			if (times.every((time) => now - time >= WINDOW_MS)) attempts.delete(entryKey);
		}
	}
	return recent.length > MAX_REQUESTS;
}

function clientKey(request: NextRequest): string {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
	return request.headers.get("x-real-ip") ?? "unknown";
}

function sameOrigin(request: NextRequest): boolean {
	const origin = request.headers.get("origin");
	if (!origin) return true; // Non-browser clients omit Origin; other checks still apply.
	try {
		return new URL(origin).host === request.headers.get("host");
	} catch {
		return false;
	}
}

export async function POST(request: NextRequest) {
	if (!sameOrigin(request)) {
		return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
	}

	if (isRateLimited(clientKey(request))) {
		return NextResponse.json(
			{ message: "Too many requests. Try again later or email sales@company.com." },
			{ status: 429, headers: { "Retry-After": "600" } },
		);
	}

	let payload: unknown;
	try {
		payload = await request.json();
	} catch {
		return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
	}

	const parsed = contactSalesSchema.safeParse(payload);
	if (!parsed.success) {
		return NextResponse.json(
			{
				message: "Some fields need attention.",
				errors: fieldErrors(parsed.error),
			},
			{ status: 400 },
		);
	}

	// Honeypot: acknowledge without sending anything.
	if (parsed.data.website) {
		return NextResponse.json({ message: "Request received" }, { status: 202 });
	}

	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) {
		// Never simulate success when there is no delivery backend.
		return NextResponse.json(
			{
				code: "FORM_BACKEND_NOT_CONFIGURED",
				message:
					"Mail delivery is not configured for this deployment. Please email sales@company.com directly.",
			},
			{ status: 503 },
		);
	}

	const resend = new Resend(apiKey);
	const { fullName, email, company, interest, region, message } = parsed.data;
	const from = process.env.RESEND_FROM ?? "Company website <website@company.com>";
	const recipients = (process.env.SALES_RECIPIENTS ?? "sales@company.com")
		.split(",")
		.map((value) => value.trim())
		.filter(Boolean);

	try {
		const result = await resend.emails.send({
			from,
			to: recipients,
			replyTo: email,
			subject: `[Website] ${interest} — ${company}`,
			text: [
				`Name: ${fullName}`,
				`Email: ${email}`,
				`Organisation: ${company}`,
				`Interest: ${interest}`,
				`Region: ${region}`,
				"",
				message,
				"",
				"---",
				"Sent from the company.com contact-sales form.",
			].join("\n"),
		});

		if (result.error) {
			console.error("contact-sales: provider error", result.error);
			return NextResponse.json(
				{
					message:
						"The message could not be delivered. Please email sales@company.com.",
				},
				{ status: 502 },
			);
		}
	} catch (error) {
		console.error("contact-sales: unexpected error", error);
		return NextResponse.json(
			{
				message:
					"The message could not be delivered. Please email sales@company.com.",
			},
			{ status: 502 },
		);
	}

	return NextResponse.json({ message: "Request received" }, { status: 200 });
}
