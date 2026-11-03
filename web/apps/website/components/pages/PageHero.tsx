import type { ReactNode } from "react";
import { Container } from "../Container";
import { StatStrip } from "../Section";

/**
 * Shared page hero — the same pattern as the homepage: centered claim, badge,
 * two actions, a product-in-context slot and a factual strip underneath.
 * Server-rendered, no client JS.
 */
export function PageHero({
	eyebrow,
	badge,
	title,
	description,
	actions,
	meta,
	facts,
	children,
}: {
	eyebrow?: string;
	badge?: string;
	title: ReactNode;
	description: string;
	actions?: ReactNode;
	meta?: ReactNode;
	facts?: { value: string; label: string }[];
	children?: ReactNode;
}) {
	return (
		<>
			<section className="relative overflow-hidden border-b border-border">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0"
					style={{
						background:
							"radial-gradient(55% 45% at 50% 0%, oklch(var(--primary) / 0.10), transparent 70%)",
					}}
				/>
				<Container className="relative">
					<div className="flex flex-col items-center py-16 text-center sm:py-24">
						{badge && (
							<p className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-xs text-muted-foreground">
								<span
									aria-hidden="true"
									className="h-1.5 w-1.5 rounded-full bg-primary"
								/>
								{badge}
							</p>
						)}

						{eyebrow && (
							<p className={badge ? "eyebrow mt-6" : "eyebrow"}>{eyebrow}</p>
						)}

						<h1
							className={
								badge || eyebrow
									? "mt-4 max-w-3xl text-4xl text-foreground sm:text-5xl"
									: "max-w-3xl text-4xl text-foreground sm:text-5xl"
							}
						>
							{title}
						</h1>

						<p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
							{description}
						</p>

						{meta && <div className="mt-6 flex justify-center">{meta}</div>}

						{actions && (
							<div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
								{actions}
							</div>
						)}

						{children && <div className="mt-12 w-full">{children}</div>}
					</div>
				</Container>
			</section>
			{facts && <StatStrip facts={facts} />}
		</>
	);
}
