import type * as React from "react";
import { cn } from "@/lib/utils";
import { Container } from "../Container";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

export function PageHeader({
	eyebrow,
	title,
	description,
	breadcrumbs,
	actions,
	aside,
	className,
}: {
	eyebrow?: string;
	title: string;
	description: string;
	breadcrumbs?: Crumb[];
	actions?: React.ReactNode;
	aside?: React.ReactNode;
	className?: string;
}) {
	return (
		<section className={cn("border-b border-border py-10 sm:py-14", className)}>
			<Container>
				{breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
				<div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:gap-16">
					<div className="max-w-3xl">
						{eyebrow && (
							<p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
								{eyebrow}
							</p>
						)}
						<h1 className="mt-3 font-display text-3xl leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl">
							{title}
						</h1>
						<p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
							{description}
						</p>
						{actions && (
							<div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
								{actions}
							</div>
						)}
					</div>
					{aside && <div className="lg:pt-2">{aside}</div>}
				</div>
			</Container>
		</section>
	);
}
