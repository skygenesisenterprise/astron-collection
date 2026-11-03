import { Hash, ShieldCheck } from "lucide-react";

/**
 * Product-in-context preview.
 *
 * Illustrates the command flow with real command names from the shared
 * catalogue. It is explicitly labelled as an example: nothing here is presented
 * as a screenshot of a running server.
 */
export function HeroPreview() {
	return (
		<div className="mx-auto w-full max-w-2xl text-left">
			<div className="overflow-hidden rounded-xl border border-border bg-card shadow-float">
				<div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
					<Hash className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
					<span className="font-mono text-xs text-muted-foreground">
						mod-log
					</span>
					<span className="ml-auto font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
						Example interaction
					</span>
				</div>

				<div className="space-y-4 px-4 py-5 sm:px-5">
					<div className="flex gap-3">
						<span
							aria-hidden="true"
							className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted font-mono text-[0.625rem] text-foreground"
						>
							AS
						</span>
						<div className="min-w-0">
							<p className="flex flex-wrap items-baseline gap-2">
								<span className="text-sm font-semibold text-foreground">
									Astron
								</span>
								<span className="rounded-xs bg-primary px-1 py-0.5 font-mono text-[0.5625rem] uppercase tracking-wide text-primary-foreground">
									Bot
								</span>
							</p>
							<p className="mt-1 text-sm leading-relaxed text-muted-foreground">
								Configuration saved for this server.
							</p>
							<div className="mt-2 grid gap-1.5 rounded-md border-l-2 border-primary/60 bg-muted/50 px-3 py-2 text-xs">
								<p className="text-foreground">
									<span className="text-muted-foreground">Moderation log </span>
									<span className="font-mono">#mod-log</span>
								</p>
								<p className="text-foreground">
									<span className="text-muted-foreground">Moderator role </span>
									<span className="font-mono">@Moderator</span>
								</p>
								<p className="text-foreground">
									<span className="text-muted-foreground">Welcome channel </span>
									<span className="font-mono">#welcome</span>
								</p>
							</div>
						</div>
					</div>

					<div className="flex gap-3">
						<span
							aria-hidden="true"
							className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted font-mono text-[0.625rem] text-muted-foreground"
						>
							OP
						</span>
						<div className="min-w-0">
							<p className="text-sm font-semibold text-foreground">
								operator
							</p>
							<p className="mt-1 font-mono text-xs leading-relaxed text-foreground">
								/warn member:@member reason:&quot;Repeated off-topic&quot;
							</p>
							<div className="mt-2 flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
								<ShieldCheck
									className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning"
									aria-hidden="true"
								/>
								<p className="text-xs leading-relaxed text-muted-foreground">
									Warning recorded — 2 total. Logged to{" "}
									<span className="font-mono text-foreground">#mod-log</span>.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<p className="mt-3 text-center font-mono text-[0.6875rem] text-muted-foreground">
				Illustrative example of the command flow — not a screenshot
			</p>
		</div>
	);
}
