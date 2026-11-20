import { z } from "zod";

/**
 * Shared between the browser form and the server route. The server always
 * re-validates; the client only uses this schema for immediate feedback.
 */

export const CONTACT_INTERESTS = [
	"Public Cloud",
	"Private Cloud",
	"Bare Metal",
	"GPU Instances",
	"Managed Databases",
	"Managed Kubernetes",
	"Networking",
	"Security",
	"Web & hosting",
	"Managed services",
	"Partnership",
	"Other",
] as const;

export const contactSalesSchema = z.object({
	fullName: z
		.string()
		.trim()
		.min(2, "Enter your full name")
		.max(120, "Name is too long"),
	email: z
		.string()
		.trim()
		.toLowerCase()
		.email("Enter a valid email address")
		.max(200, "Email is too long"),
	company: z
		.string()
		.trim()
		.min(2, "Enter your organisation")
		.max(160, "Organisation name is too long"),
	interest: z.enum(CONTACT_INTERESTS),
	region: z.enum(["eu-core", "global-partner", "not-sure"]),
	message: z
		.string()
		.trim()
		.min(20, "Describe your requirement in at least 20 characters")
		.max(4000, "Message is too long"),
	consent: z.literal(true, {
		error: "Confirm that we may use your details to answer this request",
	}),
	/** Hidden field: a real visitor leaves it empty. */
	website: z.string().max(0).optional(),
});

export type ContactSalesInput = z.infer<typeof contactSalesSchema>;

/** Form state allows an unchecked consent box; the schema requires it checked. */
export type ContactSalesFormValues = Omit<ContactSalesInput, "consent" | "website"> & {
	consent: boolean;
	website: string;
};

export const EMPTY_CONTACT_FORM: ContactSalesFormValues = {
	fullName: "",
	email: "",
	company: "",
	interest: "Public Cloud",
	region: "not-sure",
	message: "",
	consent: false,
	website: "",
};

export function fieldErrors(error: z.ZodError): Record<string, string> {
	const result: Record<string, string> = {};
	for (const issue of error.issues) {
		const key = issue.path.join(".") || "form";
		if (!result[key]) result[key] = issue.message;
	}
	return result;
}
