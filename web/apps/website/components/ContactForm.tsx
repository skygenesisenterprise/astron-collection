"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Check } from "lucide-react";
import { useState } from "react";

const topics = [
	{ value: "support", label: "Self-hosting and support" },
	{ value: "sales", label: "Cloud and commercial" },
	{ value: "security", label: "Security disclosure" },
] as const;

type Topic = (typeof topics)[number]["value"];

const endpoint =
	process.env.NEXT_PUBLIC_CONTACT_ENDPOINT ?? "/api/contact";

/**
 * Contact form.
 *
 * Validation runs on blur, not on submit; the error is attached to the field it
 * concerns and the success state replaces the form in place.
 */
export function ContactForm() {
	const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
		"idle",
	);
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = new FormData(event.currentTarget);
		const payload = {
			topic: String(form.get("topic") ?? "support") as Topic,
			name: String(form.get("name") ?? "").trim(),
			email: String(form.get("email") ?? "").trim(),
			message: String(form.get("message") ?? "").trim(),
		};

		if (!payload.name || !payload.email || !payload.message) {
			setFieldErrors({
				...(payload.name ? {} : { name: "Tell us who you are." }),
				...(payload.email ? {} : { email: "We need an address to reply to." }),
				...(payload.message ? {} : { message: "Add a short message." }),
			});
			return;
		}

		setStatus("sending");
		setError(null);

		try {
			const response = await fetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const body = await response.json().catch(() => null);
				throw new Error(body?.error ?? "The message could not be sent.");
			}

			setStatus("sent");
		} catch (caught) {
			setStatus("error");
			setError(
				caught instanceof Error
					? caught.message
					: "The message could not be sent.",
			);
		}
	}

	if (status === "sent") {
		return (
			<div className="rounded-lg border border-success/40 bg-card p-6">
				<div className="flex items-center gap-2 text-success">
					<Check className="h-4 w-4" aria-hidden="true" />
					<p className="text-sm font-medium">Message received</p>
				</div>
				<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
					Thanks — we have your message and will reply to the address you
					provided.
				</p>
			</div>
		);
	}

	return (
		<form onSubmit={onSubmit} noValidate className="space-y-5">
			<Field label="Topic" htmlFor="topic">
				<select
					id="topic"
					name="topic"
					defaultValue="support"
					className="h-10 w-full rounded-sm border border-border bg-subtle px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					{topics.map((topic) => (
						<option key={topic.value} value={topic.value}>
							{topic.label}
						</option>
					))}
				</select>
			</Field>

			<div className="grid gap-5 sm:grid-cols-2">
				<Field label="Name" htmlFor="name" error={fieldErrors.name}>
					<input
						id="name"
						name="name"
						autoComplete="name"
						className="h-10 w-full rounded-sm border border-border bg-subtle px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						aria-invalid={Boolean(fieldErrors.name)}
						aria-describedby={fieldErrors.name ? "name-error" : undefined}
					/>
				</Field>

				<Field label="Email" htmlFor="email" error={fieldErrors.email}>
					<input
						id="email"
						name="email"
						type="email"
						autoComplete="email"
						className="h-10 w-full rounded-sm border border-border bg-subtle px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						aria-invalid={Boolean(fieldErrors.email)}
						aria-describedby={fieldErrors.email ? "email-error" : undefined}
					/>
				</Field>
			</div>

			<Field label="Message" htmlFor="message" error={fieldErrors.message}>
				<textarea
					id="message"
					name="message"
					rows={6}
					className="w-full rounded-sm border border-border bg-subtle px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-invalid={Boolean(fieldErrors.message)}
					aria-describedby={fieldErrors.message ? "message-error" : undefined}
				/>
			</Field>

			{status === "error" && (
				<p className="flex items-start gap-2 rounded-sm border-l-2 border-danger bg-danger/10 p-3 text-sm text-foreground">
					<AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden="true" />
					<span>
						{error} You can also write to{" "}
						<a
							href="mailto:contact@skygenesisenterprise.com"
							className="underline underline-offset-4"
						>
							contact@skygenesisenterprise.com
						</a>
						.
					</span>
				</p>
			)}

			<Button type="submit" disabled={status === "sending"} className="rounded-full">
				{status === "sending" ? "Sending…" : "Send message"}
			</Button>
		</form>
	);
}

function Field({
	label,
	htmlFor,
	error,
	children,
}: {
	label: string;
	htmlFor: string;
	error?: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<label
				htmlFor={htmlFor}
				className="mb-1.5 block text-sm font-medium text-foreground"
			>
				{label}
			</label>
			{children}
			{error && (
				<p id={`${htmlFor}-error`} className="mt-1.5 text-xs text-danger">
					{error}
				</p>
			)}
		</div>
	);
}
