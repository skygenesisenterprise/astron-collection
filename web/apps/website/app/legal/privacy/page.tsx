import { PageHero } from "@/components/pages/PageHero";
import { Callout, Section, SectionHeader } from "@/components/Section";
import { links } from "@/lib/content/links";
import { site } from "@/lib/content/site";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
	title: "Privacy",
	description:
		"How Astron Collection handles data across the website, the hosted console and self-hosted installations.",
	path: "/legal/privacy",
});

export default function PrivacyPage() {
	return (
		<>
			<PageHero
				badge="Legal"
				eyebrow="Legal"
				title="Privacy"
				description="What this website collects, what the hosted platform processes, and what never leaves your infrastructure when you self-host."
				meta={
					<p className="font-mono text-xs text-subtle-foreground">
						Last updated 3 November 2026
					</p>
				}
			/>

			<Section>
				<Callout title="Review status" tone="warning">
					This document describes the architecture accurately but has not been
					through legal review. It is published as a draft ahead of launch; the
					final version is issued by {site.company}.
				</Callout>

				<div className="mt-12 max-w-3xl space-y-10">
					<SectionHeader
						id="website"
						eyebrow="1"
						title="This website"
					/>
					<p className="text-base leading-relaxed text-muted-foreground">
						The marketing site is a static application. It sets no advertising
						cookies and builds no profiles. Server logs from the hosting provider
						record requests for security and capacity purposes; they are retained
						for a short operational window.
					</p>
					<p className="text-base leading-relaxed text-muted-foreground">
						If analytics is enabled on a deployment, it is configured per
						deployment by the operator and is not required for the site to
						function. The contact form sends the name, email address, topic and
						message you provide to the address published on the contact page,
						solely to answer your request.
					</p>

					<SectionHeader
						id="self-hosted"
						eyebrow="2"
						title="Self-hosted installations"
					/>
					<p className="text-base leading-relaxed text-muted-foreground">
						When you run Astron Collection yourself, the platform runs on your
						infrastructure: your PostgreSQL, your Redis, your volumes, your object
						storage. Sky Genesis Enterprise has no access to that data and receives
						no telemetry from it. Backup destinations and their retention are your
						decisions.
					</p>

					<SectionHeader
						id="cloud"
						eyebrow="3"
						title="Astron Collection Cloud"
					/>
					<p className="text-base leading-relaxed text-muted-foreground">
						On the hosted platform, SGE operates the control plane. That means it
						processes the account data needed to run it — identity, organisation
						membership, audit events and platform configuration — and stores it in
						the database backing the console. Your applications, their data and
						the servers you connect stay under your control.
					</p>
					<p className="text-base leading-relaxed text-muted-foreground">
						Secrets you store in the platform are held so the platform can use
						them; they are not read by staff except when required to resolve an
						incident you reported, and access is audited.
					</p>

					<SectionHeader
						id="discord"
						eyebrow="4"
						title="Discord data"
					/>
					<p className="text-base leading-relaxed text-muted-foreground">
						The Discord applications receive the events Discord sends them for the
						guilds they are installed in, and store what their features need —
						settings, warnings, level data, log records — in their own data store.
						That store is a volume on the host running the bot. Removing the bot
						from a guild stops further collection; deleting the volume removes the
						retained data.
					</p>

					<SectionHeader
						id="rights"
						eyebrow="5"
						title="Requests and contact"
					/>
					<p className="text-base leading-relaxed text-muted-foreground">
						For access, correction or deletion of data held on the hosted platform,
						write to{" "}
						<a
							href={`mailto:${links.email.contact}`}
							className="text-primary underline-offset-4 hover:underline"
						>
							{links.email.contact}
						</a>
						. Self-hosted operators are the controllers of their own installation
						and handle requests for it themselves.
					</p>
					<p className="text-base leading-relaxed text-muted-foreground">
						The software is licensed under MIT and provided without warranty, as
						described in the licence and in the{" "}
						<a
							href="/legal/terms"
							className="text-primary underline-offset-4 hover:underline"
						>
							terms
						</a>
						.
					</p>
				</div>
			</Section>
		</>
	);
}
