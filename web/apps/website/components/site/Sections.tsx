import { Link, LinkButton } from "@company/react";
import type * as React from "react";
import { cn } from "@/lib/utils";
import { Container } from "../Container";

export function Section({
	id,
	title,
	description,
	eyebrow,
	actions,
	children,
	className,
	contentClassName,
	headingSize = "default",
}: {
	id?: string;
	title?: string;
	description?: string;
	eyebrow?: string;
	actions?: React.ReactNode;
	children?: React.ReactNode;
	className?: string;
	contentClassName?: string;
	headingSize?: "default" | "display";
}) {
	const headingId = id ? `${id}-title` : undefined;
	const display = headingSize === "display";

	return (
		<section
			id={id}
			aria-labelledby={title ? headingId : undefined}
			className={cn("border-b border-border py-16 sm:py-24", className)}
		>
			<Container>
				{(title || description) &&
					(display ? (
						<div className="mb-12 grid gap-8 lg:mb-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
							<div>
								{eyebrow && (
									<p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
										{eyebrow}
									</p>
								)}
								{title && (
									<h2
										id={headingId}
										className="mt-3 font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
									>
										{title}
									</h2>
								)}
							</div>
							{(description || actions) && (
								<div className="lg:pb-2">
									{description && (
										<p className="max-w-xl text-base leading-relaxed text-muted-foreground">
											{description}
										</p>
									)}
									{actions && <div className="mt-6">{actions}</div>}
								</div>
							)}
						</div>
					) : (
						<div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
							<div className="max-w-2xl">
								{eyebrow && (
									<p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
										{eyebrow}
									</p>
								)}
								{title && (
									<h2
										id={headingId}
										className="mt-2 font-display text-2xl tracking-tight sm:text-3xl"
									>
										{title}
									</h2>
								)}
								{description && (
									<p className="mt-3 text-base leading-relaxed text-muted-foreground">
										{description}
									</p>
								)}
							</div>
							{actions && <div className="shrink-0">{actions}</div>}
						</div>
					))}
				<div className={contentClassName}>{children}</div>
			</Container>
		</section>
	);
}

export function Prose({ children }: { children: React.ReactNode }) {
	return <div className="prose-site max-w-3xl">{children}</div>;
}

export function BulletList({ items }: { items: readonly string[] }) {
	return (
		<ul className="space-y-2">
			{items.map((item) => (
				<li key={item} className="flex gap-3 text-base text-muted-foreground">
					<span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
					<span>{item}</span>
				</li>
			))}
		</ul>
	);
}

export function LinkList({
	links,
}: {
	links: { label: string; href: string; external?: boolean }[];
}) {
	return (
		<ul className="divide-y divide-border border-y border-border">
			{links.map((link) => (
				<li key={link.href}>
					<Link
						href={link.href}
						variant="current"
						target={link.external ? "_blank" : undefined}
						rel={link.external ? "noreferrer" : undefined}
						className="flex w-full items-center justify-between gap-4 py-3 text-sm font-medium text-foreground no-underline hover:text-primary"
					>
						{link.label}
						<span className="shrink-0" aria-hidden="true">
							→
						</span>
					</Link>
				</li>
			))}
		</ul>
	);
}

export function CtaBand({
	title,
	description,
	primary,
	secondary,
}: {
	title: string;
	description: string;
	primary: { label: string; href: string; external?: boolean };
	secondary?: { label: string; href: string; external?: boolean };
}) {
	return (
		<section className="border-b border-border bg-muted/30 py-14 sm:py-16">
			<Container>
				<div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
					<div className="max-w-2xl">
						<h2 className="font-display text-2xl tracking-tight sm:text-3xl">
							{title}
						</h2>
						<p className="mt-3 text-base leading-relaxed text-muted-foreground">
							{description}
						</p>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row">
						<LinkButton
							href={primary.href}
							variant="primary"
							external={primary.external}
							className="h-11 px-5"
						>
							{primary.label}
							<span aria-hidden="true">→</span>
						</LinkButton>
						{secondary && (
							<LinkButton
								href={secondary.href}
								variant="outline"
								external={secondary.external}
								className="h-11 px-5"
							>
								{secondary.label}
							</LinkButton>
						)}
					</div>
				</div>
			</Container>
		</section>
	);
}
