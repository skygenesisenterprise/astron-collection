import { StatusBadge } from "@/components/StatusBadge";
import type { Application } from "@/lib/content/applications";
import { getInviteUrl } from "@/lib/discord-invite";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";

/** Application card: status, name, role and up to three verified highlights. */
export function AppCard({ application }: { application: Application }) {
	const invite =
		application.status === "available"
			? getInviteUrl(application.slug)
			: null;

	return (
		<article className="group relative flex h-full flex-col rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40">
			<div className="flex items-start justify-between gap-4">
				<span
					aria-hidden="true"
					className="flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-subtle font-mono text-xs tracking-[0.08em] text-primary"
				>
					{application.monogram}
				</span>
				<StatusBadge status={application.status} />
			</div>

			<h3 className="mt-5 text-xl font-semibold text-foreground">
				<Link
					href={`/applications/${application.slug}`}
					className="rounded-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				>
					{application.name}
				</Link>
			</h3>
			<p className="mt-1 font-mono text-xs text-subtle-foreground">
				{application.tagline}
			</p>
			<p className="mt-3 text-sm leading-relaxed text-muted-foreground">
				{application.role}
			</p>

			{application.highlights.length > 0 && (
				<ul className="mt-4 space-y-2">
					{application.highlights.slice(0, 3).map((highlight) => (
						<li
							key={highlight}
							className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
						>
							<span
								aria-hidden="true"
								className="mt-[0.45rem] h-1 w-1 shrink-0 rounded-full bg-primary/70"
							/>
							<span>{highlight}</span>
						</li>
					))}
				</ul>
			)}

			<div className="mt-6 flex-1" />
			<div className="flex flex-wrap items-center gap-x-4 gap-y-3">
				<Link
					href={`/applications/${application.slug}`}
					className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
					aria-label={`Read more about ${application.name}`}
				>
					Read more
					<ArrowRight className="h-4 w-4" aria-hidden="true" />
				</Link>
				{invite && (
					<a
						href={invite}
						target="_blank"
						rel="noreferrer"
						className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
					>
						Add to Discord
						<ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
					</a>
				)}
			</div>
		</article>
	);
}
