import { PageHero } from "@/components/pages/PageHero";
import { Reveal } from "@/components/Reveal";
import {
	Callout,
	Checklist,
	CtaBand,
	DefinitionList,
	Section,
	SectionHeader,
} from "@/components/Section";
import { CodeBlock } from "@/components/CodeBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import {
	applications,
	getApplication,
	intents,
	requiredPermissions,
	sharedCommands,
	statusLabel,
} from "@/lib/content/applications";
import { links } from "@/lib/content/links";
import { getInviteUrl } from "@/lib/discord-invite";
import { pageMetadata } from "@/lib/metadata";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamicParams = false;

export function generateStaticParams() {
	return applications.map((application) => ({ slug: application.slug }));
}

export async function generateMetadata({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const application = getApplication(slug);
	if (!application) return { title: "Application not found" };

	return pageMetadata({
		title: `${application.name} — ${application.tagline}`,
		description: application.summary,
		path: `/applications/${application.slug}`,
	});
}

export default async function ApplicationPage({
	params,
}: {
	params: Promise<{ slug: string }>;
}) {
	const { slug } = await params;
	const application = getApplication(slug);

	if (!application) notFound();

	const others = applications.filter((item) => item.slug !== application.slug);
	const isAvailable = application.status === "available";
	const invite = isAvailable ? getInviteUrl(application.slug) : null;

	return (
		<>
			<PageHero
				badge={statusLabel[application.status]}
				facts={
					isAvailable
						? [
								{ value: "20", label: "Commands in the catalogue" },
								{ value: "9", label: "Gateway intents" },
								{ value: "4", label: "Authorisation layers" },
								{ value: "MIT", label: "Licence" },
							]
						: undefined
				}
				eyebrow={`Applications / ${application.name}`}
				title={application.name}
				description={application.summary}
				meta={
					<div className="flex flex-wrap items-center gap-3">
						<StatusBadge status={application.status} />
						<span className="font-mono text-xs text-subtle-foreground">
							{application.role}
						</span>
					</div>
				}
				actions={
					<>
						<Button size="lg" className="rounded-full" asChild>
							{invite ? (
								<Link href={invite} target="_blank" rel="noreferrer">
									Add to Discord
									<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
								</Link>
							) : (
								<Link
									href={links.community.discord}
									target="_blank"
									rel="noreferrer"
								>
									{isAvailable ? "Join the Discord" : "Follow the project"}
									<ArrowRight className="h-4 w-4" aria-hidden="true" />
								</Link>
							)}
						</Button>
						<Button size="lg" variant="secondary" className="rounded-full" asChild>
							<Link
								href={application.docsHref ?? links.docs.home}
								target="_blank"
								rel="noreferrer"
							>
								Documentation
								<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
							</Link>
						</Button>
					</>
				}
			/>

			{application.status === "planned" && (
				<Section>
					<Callout title="Planned — no release yet" tone="warning">
						<code className="font-mono text-xs">bot/automation</code> is listed
						by the release catalogue and the Makefile, but the distribution does
						not exist. Nothing on this page describes a feature you can install
						today. Announcements are posted in the{" "}
						<Link
							href={links.community.discord}
							target="_blank"
							rel="noreferrer"
							className="underline underline-offset-4"
						>
							community Discord
						</Link>
						.
					</Callout>
				</Section>
			)}

			<Section labelledBy="problem">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
					<SectionHeader
						id="problem"
						eyebrow="Why it exists"
						title="The problem it solves"
					/>
					<div className="space-y-6">
						<p className="text-lg leading-relaxed text-muted-foreground">
							{application.problem}
						</p>
						{application.useCases.length > 0 && (
							<>
								<h3 className="text-base font-semibold text-foreground">
									Where it fits
								</h3>
								<Checklist items={application.useCases} />
							</>
						)}
					</div>
				</div>
			</Section>

			{application.highlights.length > 0 && (
				<Section labelledBy="capabilities" className="border-t border-border/60">
					<div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
						<div>
							<SectionHeader
								id="capabilities"
								eyebrow="Verified"
								title="What it does today"
								description="Each item below is implemented in the distribution's command catalogue or in the shared framework."
							/>
							<div className="mt-6">
								<Callout title="Shared catalogue">
									The 20 commands are identical across the five available
									distributions. Differences are in deployment intent, not in
									the feature set.
								</Callout>
							</div>
						</div>
						<Checklist items={application.highlights} />
					</div>

					<div className="mt-14">
						<h3 className="text-base font-semibold text-foreground">
							Command catalogue
						</h3>
						<div className="hairline-grid mt-4 grid border-l border-t border-border/60 sm:grid-cols-2 lg:grid-cols-3">
							{sharedCommands.map((item) => (
								<div key={item.command} className="bg-background px-4 py-3">
									<code className="font-mono text-sm text-primary">
										{item.command}
									</code>
									<p className="mt-1 text-sm text-muted-foreground">
										{item.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</Section>
			)}

			{application.example && (
				<Section labelledBy="interaction" className="border-t border-border/60">
					<div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
						<SectionHeader
							id="interaction"
							eyebrow="How you interact"
							title="In practice"
							description="Commands are registered by the bot and re-authorised at execution — the registration hint alone never grants access."
						/>
						<div>
							<CodeBlock
								code={application.example.content}
								label={application.example.label}
							/>
							{application.example.note && (
								<p className="mt-3 text-sm text-muted-foreground">
									{application.example.note}
								</p>
							)}
						</div>
					</div>
				</Section>
			)}

			{isAvailable && (
				<Section labelledBy="permissions" className="border-t border-border/60">
					<div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
						<div>
							<SectionHeader
								id="permissions"
								eyebrow="Permissions"
								title="What it asks Discord for"
								description="All five distributions request the same intents today."
							/>
							<div className="mt-8">
								<DefinitionList
									mono
									items={intents.map((intent) => ({
										term: intent.name,
										description: intent.reason,
									}))}
								/>
							</div>
						</div>
						<div>
							<h3 className="text-base font-semibold text-foreground">
								Bot permissions by feature
							</h3>
							<p className="mt-2 text-sm text-muted-foreground">
								Grant only what the features you enable require.
							</p>
							<div className="mt-6">
								<Checklist items={requiredPermissions} />
							</div>
						</div>
					</div>
				</Section>
			)}

			{application.config && application.config.length > 0 && (
				<Section labelledBy="configuration" className="border-t border-border/60">
					<div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
						<SectionHeader
							id="configuration"
							eyebrow="Configuration"
							title="Environment variables"
							description="Credentials are scoped to one bot. The shared DISCORD_TOKEN fallback still exists but is deprecated and logs a warning."
						/>
						<DefinitionList
							mono
							items={application.config.map((entry) => ({
								term: entry.name,
								description: `${entry.value} — ${entry.note}`,
							}))}
						/>
					</div>
				</Section>
			)}

			<Section labelledBy="platform" className="border-t border-border/60">
				<div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
					<div>
						<SectionHeader
							id="platform"
							eyebrow="With the platform"
							title="What the console does — and does not"
						/>
						<div className="mt-6 space-y-4">
							<Callout title="Configured in Discord">
								Welcome messages, levels, logs channels, moderation roles and
								AutoMod live in the guild, through{" "}
								<code className="font-mono text-xs">/config</code> and the
								command set.
							</Callout>
							<Callout title="Managed in the console" tone="brand">
								The servers and services the collection runs on: deployments,
								databases, domains and certificates, backups, roles, API keys and
								the audit log.
							</Callout>
						</div>
					</div>
					<div>
						<SectionHeader
							id="deployment-model"
							eyebrow="Self or Cloud"
							title="The same image in both models"
						/>
						<p className="mt-6 text-base leading-relaxed text-muted-foreground">
							The distribution depends on neither edition. Self-hosted runs it
							on your infrastructure with your own token and volume; Cloud
							injects the same variables per service. Only the credentials and
							the secrets differ.
						</p>
						<div className="mt-6 flex flex-wrap gap-3">
							<Button variant="secondary" className="rounded-full" asChild>
								<Link href="/platform/self-hosted">Self-hosted</Link>
							</Button>
							<Button variant="secondary" className="rounded-full" asChild>
								<Link href="/platform/cloud">Cloud</Link>
							</Button>
						</div>
					</div>
				</div>
			</Section>

			<Section labelledBy="others" className="border-t border-border/60">
				<SectionHeader
					id="others"
					eyebrow="Continue"
					title="Other applications"
				/>
				<ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
					{others.map((other) => (
						<li key={other.slug}>
							<Link
								href={`/applications/${other.slug}`}
								className="flex h-full flex-col rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/40"
							>
								<span className="font-mono text-xs text-subtle-foreground">
									{other.monogram}
								</span>
								<span className="mt-2 text-sm font-medium text-foreground">
									{other.name}
								</span>
								<span className="mt-1 text-xs text-muted-foreground">
									{other.tagline}
								</span>
							</Link>
						</li>
					))}
				</ul>
			</Section>

			<CtaBand
				title={isAvailable ? "Deploy it with your own credentials" : "Follow the project"}
				description={
					isAvailable
						? "Each distribution has its own Dockerfile, Compose file and environment example. Start one, add the others when you need them."
						: "Progress on this distribution is announced in the community Discord and in the repository releases."
				}
			>
				<Button className="rounded-full" asChild>
					<Link
						href={isAvailable ? "/platform/self-hosted" : links.community.discord}
						{...(isAvailable ? {} : { target: "_blank", rel: "noreferrer" })}
					>
						{isAvailable ? "Deployment guide" : "Join the Discord"}
						<ArrowRight className="h-4 w-4" aria-hidden="true" />
					</Link>
				</Button>
				<Button variant="secondary" className="rounded-full" asChild>
					<Link href="/applications">All applications</Link>
				</Button>
			</CtaBand>
		</>
	);
}
