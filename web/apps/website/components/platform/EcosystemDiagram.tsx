/**
 * Ecosystem schematic.
 *
 * Deliberately a diagram, not a screenshot: it shows the relationship between
 * the Discord applications, the shared framework and the platform services.
 */
export function EcosystemDiagram() {
	return (
		<figure className="rounded-lg border border-border bg-card p-5 sm:p-8">
			<div className="space-y-3">
				<Tier
					label="Discord"
					caption="Where communities use the applications"
					nodes={["Astron", "Guild", "Logger", "Protect", "Player"]}
					tone="brand"
				/>
				<Connector />
				<Tier
					label="Shared framework"
					caption="packages/discord-framework"
					nodes={[
						"Command contract",
						"Interaction routing",
						"Authorisation",
						"Structured logs",
						"Command deployment",
						"Voice presence",
					]}
					tone="neutral"
				/>
				<Connector />
				<Tier
					label="Platform services"
					caption="Console, API, workers, status"
					nodes={[
						"Manager (apps/astron)",
						"API & OpenAPI",
						"Background work",
						"Scheduler",
						"Status page",
					]}
					tone="signal"
				/>
				<Connector />
				<Tier
					label="Data"
					caption="Inside your boundary on Self, on your servers on Cloud"
					nodes={["PostgreSQL", "Redis", "Object storage", "Bot data volumes"]}
					tone="neutral"
				/>
			</div>
			<figcaption className="mt-6 text-center font-mono text-xs text-subtle-foreground">
				Schematic — relationships, not a screenshot of the product
			</figcaption>
		</figure>
	);
}

function Tier({
	label,
	caption,
	nodes,
	tone,
}: {
	label: string;
	caption: string;
	nodes: string[];
	tone: "brand" | "signal" | "neutral";
}) {
	const tones = {
		brand: "border-primary/40",
		signal: "border-signal/40",
		neutral: "border-border",
	} as const;

	return (
		<div className={`rounded-md border ${tones[tone]} bg-background p-4`}>
			<div className="flex flex-wrap items-baseline justify-between gap-2">
				<p className="font-mono text-xs uppercase tracking-[0.06em] text-foreground">
					{label}
				</p>
				<p className="font-mono text-[0.6875rem] text-subtle-foreground">
					{caption}
				</p>
			</div>
			<ul className="mt-3 flex flex-wrap gap-2">
				{nodes.map((node) => (
					<li
						key={node}
						className="rounded-xs border border-border bg-subtle px-2.5 py-1 text-xs text-muted-foreground"
					>
						{node}
					</li>
				))}
			</ul>
		</div>
	);
}

function Connector() {
	return (
		<div aria-hidden="true" className="flex justify-center">
			<span className="h-3 w-px bg-border-strong" />
		</div>
	);
}
