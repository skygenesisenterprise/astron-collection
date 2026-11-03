import { SITE_URL } from "@/lib/content/links";
import { site } from "@/lib/content/site";
import type { Metadata } from "next";

interface PageMetaOptions {
	title: string;
	description: string;
	path: string;
	/** Set for pages that should not be indexed. */
	noIndex?: boolean;
}

/** Per-page metadata with canonical URL and Open Graph defaults. */
export function pageMetadata({
	title,
	description,
	path,
	noIndex = false,
}: PageMetaOptions): Metadata {
	const url = `${SITE_URL}${path}`;

	return {
		title,
		description,
		alternates: { canonical: url },
		robots: noIndex ? { index: false, follow: false } : undefined,
		openGraph: {
			title,
			description,
			url,
			siteName: site.name,
			locale: "en_GB",
			type: "website",
			images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
		},
		twitter: {
			card: "summary_large_image",
			title,
			description,
			images: ["/og.png"],
		},
	};
}

/** Organisation markup shared by every page. */
export const organisationJsonLd = {
	"@context": "https://schema.org",
	"@type": "Organization",
	name: site.name,
	url: SITE_URL,
	logo: `${SITE_URL}/icon.svg`,
	slogan: site.tagline,
	sameAs: [
		"https://github.com/skygenesisenterprise/astron-collection",
		"https://discord.gg/GUkDugVh34",
	],
	parentOrganization: {
		"@type": "Organization",
		name: site.company,
		url: "https://skygenesisenterprise.com",
	},
};

/** Software application markup for a product page. */
export function softwareJsonLd({
	name,
	description,
	path,
}: {
	name: string;
	description: string;
	path: string;
}) {
	return {
		"@context": "https://schema.org",
		"@type": "SoftwareApplication",
		name,
		description,
		applicationCategory: "SocialNetworkingApplication",
		operatingSystem: "Linux, macOS, Windows",
		url: `${SITE_URL}${path}`,
		license: "https://opensource.org/license/mit",
		publisher: { "@type": "Organization", name: site.company },
	};
}
