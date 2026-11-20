"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	CONTACT_INTERESTS,
	contactSalesSchema,
	EMPTY_CONTACT_FORM,
	fieldErrors,
	type ContactSalesFormValues,
	type ContactSalesInput,
} from "@/lib/forms/contact-sales";

type State = {
	values: ContactSalesFormValues;
	errors: Record<string, string>;
	status: "idle" | "submitting" | "success" | "unavailable" | "error";
	message?: string;
};

export function ContactSalesForm() {
	const [state, setState] = React.useState<State>({
		values: EMPTY_CONTACT_FORM,
		errors: {},
		status: "idle",
	});
	const [fieldFocus, setFieldFocus] = React.useState<string | null>(null);

	function update<K extends keyof ContactSalesFormValues>(
		key: K,
		value: ContactSalesFormValues[K],
	) {
		setState((current) => ({
			...current,
			values: { ...current.values, [key]: value },
			errors: { ...current.errors, [key]: "" },
		}));
	}

	async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const parsed = contactSalesSchema.safeParse(state.values);
		if (!parsed.success) {
			const errors = fieldErrors(parsed.error);
			setState((current) => ({ ...current, errors, status: "idle" }));
			const first = Object.keys(errors)[0];
			if (first) {
				document.getElementById(`contact-${first}`)?.focus();
			}
			return;
		}

		setState((current) => ({ ...current, status: "submitting", errors: {} }));
		try {
			const response = await fetch("/api/contact-sales", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(parsed.data),
			});
			const payload = (await response.json().catch(() => ({}))) as {
				message?: string;
				code?: string;
				errors?: Record<string, string>;
			};

			if (response.ok) {
				setState((current) => ({ ...current, status: "success" }));
				return;
			}
			if (response.status === 503 || payload.code === "FORM_BACKEND_NOT_CONFIGURED") {
				setState((current) => ({
					...current,
					status: "unavailable",
					message:
						payload.message ??
						"The form backend is not configured for this deployment. Email sales@company.com instead.",
				}));
				return;
			}
			setState((current) => ({
				...current,
				status: "error",
				errors: payload.errors ?? {},
				message:
					payload.message ??
					"The request could not be sent. Please try again or contact sales@company.com.",
			}));
		} catch {
			setState((current) => ({
				...current,
				status: "error",
				message:
					"The request could not be sent. Check your connection or email sales@company.com.",
			}));
		}
	}

	if (state.status === "success") {
		return (
			<div
				role="status"
				className="border border-success/40 bg-success/5 p-6"
			>
				<h2 className="font-display text-xl">Request received</h2>
				<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
					Your message was delivered to the sales team. A reply is not a
					commercial offer, and no capacity is reserved until a contract is
					signed.
				</p>
				<Button
					variant="outline"
					className="mt-4"
					onClick={() =>
						setState({
							values: EMPTY_CONTACT_FORM,
							errors: {},
							status: "idle",
						})
					}
				>
					Send another request
				</Button>
			</div>
		);
	}

	const errorFor = (key: string) => state.errors[key];

	return (
		<form onSubmit={onSubmit} noValidate className="space-y-5">
			{state.message && (
				<div
					role="alert"
					className="border border-destructive/40 bg-destructive/5 p-4 text-sm leading-relaxed text-foreground"
				>
					{state.message}
				</div>
			)}

			<div className="grid gap-5 sm:grid-cols-2">
				<Field
					id="contact-fullName"
					label="Full name"
					error={errorFor("fullName")}
					focused={fieldFocus === "fullName"}
				>
					<Input
						id="contact-fullName"
						value={state.values.fullName}
						onFocus={() => setFieldFocus("fullName")}
						onChange={(event) => update("fullName", event.target.value)}
						autoComplete="name"
						aria-invalid={Boolean(errorFor("fullName"))}
						aria-describedby={errorFor("fullName") ? "contact-fullName-error" : undefined}
					/>
				</Field>

				<Field
					id="contact-email"
					label="Work email"
					error={errorFor("email")}
					focused={fieldFocus === "email"}
				>
					<Input
						id="contact-email"
						type="email"
						value={state.values.email}
						onFocus={() => setFieldFocus("email")}
						onChange={(event) => update("email", event.target.value)}
						autoComplete="email"
						aria-invalid={Boolean(errorFor("email"))}
						aria-describedby={errorFor("email") ? "contact-email-error" : undefined}
					/>
				</Field>
			</div>

			<Field
				id="contact-company"
				label="Organisation"
				error={errorFor("company")}
				focused={fieldFocus === "company"}
			>
				<Input
					id="contact-company"
					value={state.values.company}
					onFocus={() => setFieldFocus("company")}
					onChange={(event) => update("company", event.target.value)}
					autoComplete="organization"
					aria-invalid={Boolean(errorFor("company"))}
					aria-describedby={errorFor("company") ? "contact-company-error" : undefined}
				/>
			</Field>

			<div className="grid gap-5 sm:grid-cols-2">
				<Field id="contact-interest" label="Area of interest" error={errorFor("interest")}>
					<select
						id="contact-interest"
						value={state.values.interest}
						onChange={(event) =>
							update("interest", event.target.value as ContactSalesInput["interest"])
						}
						className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						{CONTACT_INTERESTS.map((interest) => (
							<option key={interest} value={interest}>
								{interest}
							</option>
						))}
					</select>
				</Field>

				<Field id="contact-region" label="Target region" error={errorFor("region")}>
					<select
						id="contact-region"
						value={state.values.region}
						onChange={(event) =>
							update("region", event.target.value as ContactSalesInput["region"])
						}
						className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<option value="not-sure">Not sure yet</option>
						<option value="eu-core">European Union — core</option>
						<option value="global-partner">Partner network</option>
					</select>
				</Field>
			</div>

			<Field
				id="contact-message"
				label="What are you looking to run?"
				error={errorFor("message")}
				hint="Include expected capacity, timeline and any isolation or networking requirements."
			>
				<textarea
					id="contact-message"
					value={state.values.message}
					onChange={(event) => update("message", event.target.value)}
					rows={6}
					aria-invalid={Boolean(errorFor("message"))}
					aria-describedby={
						errorFor("message") ? "contact-message-error contact-message-hint" : "contact-message-hint"
					}
					className="w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				/>
			</Field>

			{/* Anti-spam honeypot: hidden from users and assistive technology. */}
			<div className="hidden" aria-hidden="true">
				<label htmlFor="contact-website">Website</label>
				<input
					id="contact-website"
					tabIndex={-1}
					autoComplete="off"
					value={state.values.website}
					onChange={(event) => update("website", event.target.value)}
				/>
			</div>

			<div>
				<label className="flex items-start gap-3 text-sm text-muted-foreground">
					<input
						id="contact-consent"
						type="checkbox"
						checked={state.values.consent}
						onChange={(event) =>
							update("consent", event.target.checked)
						}
						aria-invalid={Boolean(errorFor("consent"))}
						aria-describedby={errorFor("consent") ? "contact-consent-error" : undefined}
						className="mt-0.5 h-4 w-4 rounded border-input accent-[var(--primary)]"
					/>
					<span>
						I agree that Company may use these details to answer this
						request, as described in the{" "}
						<a href="/legal/privacy" className="text-foreground underline underline-offset-4">
							privacy policy
						</a>
						.
					</span>
				</label>
				{errorFor("consent") && (
					<p id="contact-consent-error" className="mt-1.5 text-sm text-destructive">
						{errorFor("consent")}
					</p>
				)}
			</div>

			<div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
				<p className="text-xs leading-relaxed text-muted-foreground">
					Required fields are validated on the server. A submission does not
					create an account or reserve capacity.
				</p>
				<Button
					type="submit"
					disabled={state.status === "submitting"}
					className="shrink-0"
				>
					{state.status === "submitting" ? "Sending…" : "Send request"}
				</Button>
			</div>
		</form>
	);
}

function Field({
	id,
	label,
	error,
	hint,
	children,
	focused,
}: {
	id: string;
	label: string;
	error?: string;
	hint?: string;
	children: React.ReactNode;
	focused?: boolean;
}) {
	return (
		<div>
			<label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">
				{label}
			</label>
			{children}
			{hint && (
				<p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">
					{hint}
				</p>
			)}
			{error && (
				<p id={`${id}-error`} className="mt-1.5 text-sm text-destructive">
					{error}
				</p>
			)}
		</div>
	);
}
