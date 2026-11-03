import { PageHero } from "@/components/pages/PageHero";
import { CodeBlock } from "@/components/CodeBlock";
import {
	Callout,
	Checklist,
	CtaBand,
	DefinitionList,
	FaqSection,
	Section,
	SectionHeader,
} from "@/components/Section";
import { Button } from "@/components/ui/button";
import { selfHostedFaqs } from "@/lib/content/faq";
import { links } from "@/lib/content/links";
import { dockerTargets } from "@/lib/content/platform";
import { pageMetadata } from "@/lib/metadata";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

export const metadata = pageMetadata({
	title: "Self-hosted",
	description:
		"Run Astron Collection on infrastructure you control: four services, one Compose stack, your database, your backups and your boundary — with the operational responsibilities that come with it.",
	path: "/platform/self-hosted",
});

const install = `git clone https://github.com/skygenesisenterprise/astron-collection.git
cd astron-collection
cp .env.example .env

# Required: generate and set each value
openssl rand -hex 32   # POSTGRES_PASSWORD
openssl rand -hex 32   # REDIS_PASSWORD
openssl rand -hex 32   # BETTER_AUTH_SECRET

docker compose up -d --build
docker compose logs -f api`;

const makeTargets = `make docker-up self   # production profile, self-hosted
make docker-dev self  # development profile, hot reload
make migrate          # apply migrations once
make backup           # backups/astron-<date>.sql
make restore FILE=backups/astron-<date>.sql
make status           # stack status
make update           # pull, rebuild, restart`;

export default function SelfHostedPage() {
	return (
		<>
			<PageHero
				badge="Self-hosted"
				facts={[
					{ value: "4", label: "Services in the stack" },
					{ value: "1", label: "Compose file" },
					{ value: "0", label: "Host Docker sockets" },
					{ value: "MIT", label: "Licence" },
				]}
				eyebrow="Deployment / Self-hosted"
				title={
					<>
						Your infrastructure,{" "}
						<span className="text-primary">your data</span>
					</>
				}
				description="Install the platform on servers you control. Four services — PostgreSQL, Redis, client and API — with no Traefik, no Swarm and no host Docker socket required to run the platform itself."
				actions={
					<>
						<Button size="lg" className="rounded-full" asChild>
							<Link
								href={links.docs.installation}
								target="_blank"
								rel="noreferrer"
							>
								Installation guide
								<ArrowUpRight className="h-4 w-4" aria-hidden="true" />
							</Link>
						</Button>
						<Button size="lg" variant="secondary" className="rounded-full" asChild>
							<Link href="/platform/cloud">Compare with Cloud</Link>
						</Button>
					</>
				}
			/>

			<Section labelledBy="install">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
					<div>
						<SectionHeader
							id="install"
							eyebrow="Install"
							title="One stack, four services"
							description="The stack refuses to start while a required secret is missing, and the API refuses a weak or known auth secret."
						/>
						<div className="mt-6">
							<Callout title="Before you expose it" tone="warning">
								Keep <code className="font-mono text-xs">.env</code> private and do
								not expose the dashboard publicly until authentication and HTTPS
								are configured.
							</Callout>
						</div>
					</div>
					<div>
						<CodeBlock code={install} label="shell · first install" />
						<p className="mt-3 text-sm text-muted-foreground">
							The interface is published on port 3000 and the API on port 4000.
							PostgreSQL and Redis stay internal to the Compose network.
						</p>
					</div>
				</div>
			</Section>

			<Section labelledBy="operations" className="border-t border-border/60">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
					<SectionHeader
						id="operations"
						eyebrow="Operations"
						title="The commands you will actually run"
						description="The Makefile wraps the tools already in the repository; it does not introduce a second deployment system."
					/>
					<CodeBlock code={makeTargets} label="shell · make" />
				</div>
			</Section>

			<Section labelledBy="responsibilities" className="border-t border-border/60">
				<div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
					<div>
						<SectionHeader
							id="responsibilities"
							eyebrow="Yours"
							title="What you take on"
							description="Self-hosting is a trade: control in exchange for operational work. These are the tasks nobody else will do for you."
						/>
						<div className="mt-8">
							<Checklist
								items={[
									"Host hardening, network boundary and firewall",
									"TLS termination and certificate renewal",
									"Upgrades: pull, rebuild, restart, verify",
									"Database backups — and restore tests, which matter more",
									"PostgreSQL and Redis capacity and monitoring",
									"Who has access, and revoking it when somebody leaves",
								]}
							/>
						</div>
					</div>
					<div>
						<SectionHeader
							id="guarantees"
							eyebrow="Ours"
							title="What the platform handles"
						/>
						<div className="mt-8">
							<Checklist
								items={[
									"Deployments, rollbacks and preview environments",
									"Routing, domains and certificate issuance for your services",
									"The audit log and permission model",
									"Backup scheduling and restore workflows (you choose the destination)",
									"Status page and its incident model",
								]}
							/>
						</div>
						<div className="mt-6">
							<Callout title="Same product as Cloud">
								A self-hosted install is not a reduced edition: the console, API,
								CLI, SDK and MCP server are the same. What changes is who operates
								the control plane.
							</Callout>
						</div>
					</div>
				</div>
			</Section>

			<Section labelledBy="images" className="border-t border-border/60">
				<div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
					<SectionHeader
						id="images"
						eyebrow="Images"
						title="What ships in the container"
						description="The root Dockerfile exposes several targets; Compose uses the one that matches the product you run."
					/>
					<DefinitionList
						mono
						items={dockerTargets.map((target) => ({
							term: target.name,
							description: target.role,
						}))}
					/>
				</div>
			</Section>

			<FaqSection
				id="faq"
				eyebrow="Questions"
				title="Before you install"
				description="The operational answers that decide whether self-hosting is the right model."
				items={selfHostedFaqs}
			/>

			<CtaBand
				title="Prefer not to run the control plane?"
				description="Astron Collection Cloud operates the same platform for you, while your workloads stay on the servers you connect."
			>
				<Button className="rounded-full" asChild>
					<Link href="/platform/cloud">
						Compare Cloud
						<ArrowRight className="h-4 w-4" aria-hidden="true" />
					</Link>
				</Button>
				<Button variant="secondary" className="rounded-full" asChild>
					<Link href={links.github.repo} target="_blank" rel="noreferrer">
						View the source
					</Link>
				</Button>
			</CtaBand>
		</>
	);
}
