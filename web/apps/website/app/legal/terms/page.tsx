import { PageHero } from "@/components/pages/PageHero";
import { Callout, Section, SectionHeader } from "@/components/Section";
import { links } from "@/lib/content/links";
import { site } from "@/lib/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
	title: "Terms",
	description:
		"Terms for using the Astron Collection website and hosted services, and how the MIT licence applies to the software.",
	path: "/legal/terms",
});

export default function TermsPage() {
	return (
		<>
			<PageHero
				badge="Legal"
				eyebrow="Legal"
				title="Terms"
				description="The software licence, the conditions attached to the hosted services, and the limits of what is promised."
				meta={
					<p className="font-mono text-xs text-subtle-foreground">
						Last updated 3 November 2026
					</p>
				}
			/>

			<Section>
				<Callout title="Review status" tone="warning">
					This document describes the current arrangement but has not been through
					legal review. It is published as a draft ahead of launch; the final
					version is issued by {site.company}.
				</Callout>

				<div className="mt-12 max-w-3xl space-y-10">
					<SectionHeader id="software" eyebrow="1" title="The software" />
					<p className="text-base leading-relaxed text-muted-foreground">
						Astron Collection is distributed under the MIT licence. You may use,
						copy, modify and redistribute it, provided the copyright notice and
						permission notice are included. The software is provided “as is”,
						without warranty of any kind, and the authors are not liable for
						damages arising from its use.
					</p>
					<p className="text-base leading-relaxed text-muted-foreground">
						Separately published packages or bundled components may carry their
						own licence terms. The licence file in the relevant directory governs
						that component.{" "}
						<a
							href={links.github.license}
							target="_blank"
							rel="noreferrer"
							className="text-primary underline-offset-4 hover:underline"
						>
							Read the licence
						</a>
						.
					</p>

					<SectionHeader id="website" eyebrow="2" title="This website" />
					<p className="text-base leading-relaxed text-muted-foreground">
						The site is provided for information. Product descriptions reflect the
						state of the software at the time of publication; features marked as
						in development or planned are not commitments to deliver them on a
						schedule.
					</p>

					<SectionHeader id="hosted" eyebrow="3" title="Hosted services" />
					<p className="text-base leading-relaxed text-muted-foreground">
						Access to Astron Collection Cloud is governed by the agreement attached
						to your workspace, including its availability commitments, acceptable
						use conditions and commercial terms. Where this page and that
						agreement differ, the agreement prevails for the hosted service.
					</p>
					<p className="text-base leading-relaxed text-muted-foreground">
						You remain responsible for the workloads you deploy, the content you
						process with them, and compliance with the terms of the services you
						connect — including Discord's own developer terms.
					</p>

					<SectionHeader id="self-hosted" eyebrow="4" title="Self-hosted installations" />
					<p className="text-base leading-relaxed text-muted-foreground">
						When you self-host, you operate the platform and are responsible for
						its availability, security, backups and lawful use. Sky Genesis
						Enterprise does not have access to that installation and provides no
						operational guarantee for it.
					</p>

					<SectionHeader id="trademarks" eyebrow="5" title="Trademarks" />
					<p className="text-base leading-relaxed text-muted-foreground">
						Discord is a trademark of Discord Inc. Astron Collection is not
						affiliated with, endorsed by or sponsored by Discord Inc. Other product
						names remain the property of their respective owners.
					</p>

					<SectionHeader id="contact" eyebrow="6" title="Contact" />
					<p className="text-base leading-relaxed text-muted-foreground">
						Questions about these terms:{" "}
						<a
							href={`mailto:${links.email.contact}`}
							className="text-primary underline-offset-4 hover:underline"
						>
							{links.email.contact}
						</a>
						.
					</p>
				</div>
			</Section>
		</>
	);
}
