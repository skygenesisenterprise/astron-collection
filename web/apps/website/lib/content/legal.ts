export type LegalSection = {
	heading: string;
	paragraphs: string[];
	bullets?: string[];
};

export type LegalDocument = {
	slug: string;
	title: string;
	description: string;
	updated: string;
	status: "current" | "under-review";
	sections: LegalSection[];
};

/**
 * Legal content is a site-level summary, not the executed agreement.
 * The status field is rendered in the UI so a document under review is
 * never presented as final. Legal review remains a human responsibility.
 */
export const legalDocuments: LegalDocument[] = [
	{
		slug: "terms",
		title: "Terms of service",
		description:
			"The terms that govern use of the Astron Collection website and services.",
		updated: "2026-11-09",
		status: "under-review",
		sections: [
			{
				heading: "Scope",
				paragraphs: [
					"These terms cover the Astron Collection public website and the services ordered through Astron Collection. Service-specific terms, including capacity, availability and support scope, form part of the applicable order.",
					"This page is a summary maintained by the website. The executed agreement and the order documents prevail over it.",
				],
			},
			{
				heading: "Accounts and access",
				paragraphs: [
					"Access to the console is provided through the dedicated identity service. You are responsible for protecting credentials issued to your organisation and for activity performed with them.",
					"Public self-service onboarding is not open at the time of publication. Requesting access does not create a contract.",
				],
			},
			{
				heading: "Service levels",
				paragraphs: [
					"No uptime commitment is made on this website. A service level applies only where the signed contract or order states one, including its measurement method and remedies.",
				],
			},
			{
				heading: "Acceptable use",
				paragraphs: [
					"Use of the services is subject to the acceptable use policy. Prohibited activity includes unlawful content, unauthorised access to systems, and activity that degrades the platform for other customers.",
				],
			},
			{
				heading: "Suspension and termination",
				paragraphs: [
					"We may suspend a resource where continued operation creates a security, legal or platform-integrity risk. Where practicable, notice and a remediation path are provided first.",
				],
			},
			{
				heading: "Liability",
				paragraphs: [
					"Liability is limited as set out in the executed agreement. Nothing in this summary creates a warranty, guarantee or indemnity beyond that agreement.",
				],
			},
		],
	},
	{
		slug: "privacy",
		title: "Privacy policy",
		description:
			"How Astron Collection handles personal data collected through the website and services.",
		updated: "2026-11-09",
		status: "under-review",
		sections: [
			{
				heading: "Data we collect",
				paragraphs: [
					"The website collects the information you submit in a contact or sales form, and limited technical data required to serve and secure the site.",
					"No analytics or third-party tracking is enabled by default in this repository. Where analytics is configured for a deployment, it must be disclosed in this policy before activation.",
				],
			},
			{
				heading: "Purpose and legal basis",
				paragraphs: [
					"Form submissions are used to answer the request and, where relevant, to prepare a commercial proposal. Service data is processed to operate the services under the applicable contract.",
				],
			},
			{
				heading: "Retention",
				paragraphs: [
					"Retention periods depend on the type of record and the applicable contract. A request submitted through the website is retained only as long as needed to handle it, unless a legal obligation requires longer storage.",
				],
			},
			{
				heading: "Processors and transfers",
				paragraphs: [
					"Infrastructure and service providers may process data on our behalf. Where a transfer outside the European Economic Area occurs, the applicable safeguards are described in the contract or the processing agreement.",
				],
			},
			{
				heading: "Your rights",
				paragraphs: [
					"Subject to applicable law, you may request access, correction, deletion or restriction of your personal data, and object to processing. Requests are handled through the contact route.",
				],
			},
		],
	},
	{
		slug: "cookies",
		title: "Cookie policy",
		description:
			"What the website stores in your browser, and why.",
		updated: "2026-11-09",
		status: "under-review",
		sections: [
			{
				heading: "Essential storage",
				paragraphs: [
					"The website stores your theme preference (light or dark) in local storage. This value stays in your browser, is not sent to a server, and can be cleared at any time.",
					"No advertising cookie or cross-site tracker is set by this repository.",
				],
			},
			{
				heading: "Optional analytics",
				paragraphs: [
					"Analytics integrations are present in the codebase but disabled unless explicitly configured for a deployment. When enabled, they must be described here and offered with an appropriate consent mechanism.",
				],
			},
			{
				heading: "Managing storage",
				paragraphs: [
					"You can clear local storage through your browser settings. Clearing it resets the theme preference; it does not affect any account.",
				],
			},
		],
	},
	{
		slug: "acceptable-use",
		title: "Acceptable use policy",
		description:
			"What may and may not be run on Astron Collection infrastructure.",
		updated: "2026-11-09",
		status: "under-review",
		sections: [
			{
				heading: "Prohibited use",
				paragraphs: ["The following are not permitted on Astron Collection infrastructure:"],
				bullets: [
					"Unlawful content or activity, including content that infringes third-party rights.",
					"Unauthorised access, scanning or disruption of systems you do not own.",
					"Malware, phishing, spam and command-and-control infrastructure.",
					"Activity that degrades the platform or evades resource limits.",
				],
			},
			{
				heading: "Resource abuse",
				paragraphs: [
					"Cryptomining, traffic flooding and resource exhaustion are not permitted unless explicitly authorised in a written agreement. Rate limits and quotas exist to protect all customers.",
				],
			},
			{
				heading: "Security incidents",
				paragraphs: [
					"If you suspect that your resources are involved in an incident, contact support immediately and preserve relevant logs. Do not attempt to investigate third-party systems.",
				],
			},
			{
				heading: "Enforcement",
				paragraphs: [
					"Reported abuse is reviewed. Measures range from a request to remediate, to suspension of the affected resource, to termination of the contract where the breach is serious or repeated.",
				],
			},
		],
	},
];

export const legalBySlug = new Map(
	legalDocuments.map((document) => [document.slug, document]),
);
