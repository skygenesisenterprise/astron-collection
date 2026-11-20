import type { Metadata } from "next";
import { SignalHero } from "@/components/site/SignalHero";
import { BuildSection } from "@/components/site/home/build-section";
import { DomainsSection } from "@/components/site/home/domains-section";
import { EcosystemSection } from "@/components/site/home/ecosystem-section";
import { EngineeringPrinciplesSection } from "@/components/site/home/engineering-principles-section";
import { FeaturedProjectsSection } from "@/components/site/home/featured-projects-section";
import { IntroductionSection } from "@/components/site/home/introduction-section";
import { NewsSection } from "@/components/site/home/news-section";
import { PartnersSection } from "@/components/site/home/partners-section";
import { Reveal } from "@/components/site/home/Reveal";
import { ResearchSection } from "@/components/site/home/research-section";
import { homeSeo, productCategories } from "@/lib/content/ecosystem";
import { links } from "@/lib/content/site";
import { SITE_URL, pageMetadata } from "@/lib/domain/queries";

const baseMetadata = pageMetadata({
	title: homeSeo.title,
	description: homeSeo.description,
	path: "/",
});

/** The global title template still carries the site brand; the homepage
 * declares the group name explicitly for social and structured data. */
export const metadata: Metadata = {
	...baseMetadata,
	openGraph: {
		...(baseMetadata.openGraph ?? {}),
		siteName: "Sky Genesis Enterprise",
	},
};

const structuredData = {
	"@context": "https://schema.org",
	"@graph": [
		{
			"@type": "Organization",
			name: "Sky Genesis Enterprise",
			url: SITE_URL,
			logo: `${SITE_URL}/icon.svg`,
			description: homeSeo.description,
			sameAs: [links.skyGenesis, links.githubOrg],
		},
		{
			"@type": "WebSite",
			name: "Sky Genesis Enterprise",
			url: SITE_URL,
			inLanguage: "en",
			potentialAction: {
				"@type": "SearchAction",
				target: `${SITE_URL}/products?q={search_term_string}`,
				"query-input": "required name=search_term_string",
			},
		},
		{
			"@type": "ItemList",
			name: "Sky Genesis Enterprise technology domains",
			itemListElement: productCategories.map((category, index) => ({
				"@type": "ListItem",
				position: index + 1,
				name: category.name,
				url: `${SITE_URL}${category.href}`,
			})),
		},
	],
};

/**
 * Homepage composition, after the protected hero: the institutional
 * introduction, the six technology domains, the ecosystem relationships, the
 * featured projects, the engineering principles, partners, research, news and
 * the closing panel. All editorial content comes from `lib/content`; the
 * footer in the root layout is protected.
 */
export default function HomePage() {
	return (
		<>
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>

			<div className="bg-background text-foreground">
				<SignalHero />
				<Reveal>
					<div className="zenth-root isolate bg-background font-sans">
						<IntroductionSection />
						<DomainsSection />
						<EcosystemSection />
						<FeaturedProjectsSection />
						<EngineeringPrinciplesSection />
						<PartnersSection />
						<ResearchSection />
						<NewsSection />
						<BuildSection />
					</div>
				</Reveal>
			</div>
		</>
	);
}
