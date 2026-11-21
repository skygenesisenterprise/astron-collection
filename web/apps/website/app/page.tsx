import type { Metadata } from "next";
import { SignalHero } from "@/components/site/SignalHero";
import { BotsSection } from "@/components/site/home/bots-section";
import { BuildSection } from "@/components/site/home/build-section";
import { CollectionSection } from "@/components/site/home/collection-section";
import { CommunitySection } from "@/components/site/home/community-section";
import { DashboardSection } from "@/components/site/home/dashboard-section";
import { DevelopersSection } from "@/components/site/home/developers-section";
import { EcosystemSection } from "@/components/site/home/ecosystem-section";
import { NeedsSection } from "@/components/site/home/needs-section";
import { Reveal } from "@/components/site/home/Reveal";
import {
	homeBots,
	homeDestinations,
	homeSeo,
} from "@/lib/content/home-collection";
import { SITE_NAME, SITE_URL, pageMetadata } from "@/lib/domain/queries";

const baseMetadata = pageMetadata({
	title: homeSeo.title,
	description: homeSeo.description,
	path: "/",
});

/** The homepage is the Astron Collection surface; social metadata names that
 * collection explicitly instead of inheriting the wider group identity. */
export const metadata: Metadata = {
	...baseMetadata,
	title: { absolute: homeSeo.title },
	openGraph: {
		...(baseMetadata.openGraph ?? {}),
		siteName: SITE_NAME,
	},
};

const structuredData = {
	"@context": "https://schema.org",
	"@graph": [
		{
			"@type": "Organization",
			name: SITE_NAME,
			url: SITE_URL,
			logo: `${SITE_URL}/icon.svg`,
			description: homeSeo.description,
			sameAs: [homeDestinations.repository, homeDestinations.discord],
		},
		{
			"@type": "WebSite",
			name: SITE_NAME,
			url: SITE_URL,
			inLanguage: "en",
		},
		{
			"@type": "ItemList",
			name: "Astron Collection Discord bots",
			itemListElement: homeBots.map((bot, index) => ({
				"@type": "ListItem",
				position: index + 1,
				item: {
					"@type": "SoftwareApplication",
					name: bot.label,
					description: bot.description,
					applicationCategory: "Discord bot",
					operatingSystem: "Discord",
				},
			})),
		},
	],
};

/**
 * Homepage composition, after the protected hero: the collection statement,
 * the six-bot selector, the by-need index, the server-surface overview, the
 * dashboard boundary, the developer surfaces, the community panel and the
 * closing route panel. Bot names and capabilities come from the same records
 * as the header navigation; the hero and root-layout footer are untouched.
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
						<CollectionSection />
						<BotsSection />
						<NeedsSection />
						<EcosystemSection />
						<DashboardSection />
						<DevelopersSection />
						<CommunitySection />
						<BuildSection />
					</div>
				</Reveal>
			</div>
		</>
	);
}
