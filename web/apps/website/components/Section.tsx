import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Container } from "./Container";
import { Faq } from "./Faq";
import type { FaqEntry } from "@/lib/content/home";

/** Section shell with the shared vertical rhythm. */
export function Section({
	id,
	children,
	className,
	labelledBy,
}: {
	id?: string;
	children: ReactNode;
	className?: string;
	labelledBy?: string;
}) {
	return (
		<section
			id={id}
			aria-labelledby={labelledBy}
			className={cn("py-20 sm:py-28", className)}
		>
			<Container>{children}</Container>
		</section>
	);
}

export function SectionHeader({
	id,
	eyebrow,
	title,
	description,
	align = "left",
	className,
}: {
	id?: string;
	eyebrow?: string;
	title: string;
	description?: string;
	align?: "left" | "center";
	className?: string;
}) {
	return (
		<div
			className={cn(
				align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-3xl",
				className,
			)}
		>
			{eyebrow && <p className="eyebrow">{eyebrow}</p>}
			<h2
				id={id}
				className={cn("text-3xl text-foreground sm:text-4xl", eyebrow && "mt-3")}
			>
				{title}
			</h2>
			{description && (
				<p className="mt-4 text-lg leading-relaxed text-muted-foreground">
					{description}
				</p>
			)}
		</div>
	);
}

/**
 * Factual proof strip — the same band used under the homepage hero.
 * Values must be verifiable; it is not a place for invented social proof.
 */
export function StatStrip({
	facts,
	className,
}: {
	facts: { value: string; label: string }[];
	className?: string;
}) {
	const columns =
		facts.length === 2
			? "sm:grid-cols-2"
			: facts.length === 3
				? "sm:grid-cols-3"
				: "sm:grid-cols-4";

	return (
		<div className={cn("border-b border-border", className)}>
			<Container>
				<dl className={cn("grid grid-cols-2 gap-y-6 py-8", columns)}>
					{facts.map((fact) => (
						<div key={fact.label} className="text-center">
							<dt className="mt-1 font-mono text-xs uppercase tracking-wide text-muted-foreground">
								{fact.label}
							</dt>
							<dd className="text-2xl font-semibold text-foreground">
								{fact.value}
							</dd>
						</div>
					))}
				</dl>
			</Container>
		</div>
	);
}

/** FAQ block in the two-column rhythm used across the site. */
export function FaqSection({
	id,
	eyebrow,
	title,
	description,
	items,
}: {
	id: string;
	eyebrow?: string;
	title: string;
	description?: string;
	items: FaqEntry[];
}) {
	return (
		<Section labelledBy={id} className="border-t border-border bg-muted/30">
			<div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
				<SectionHeader
					id={id}
					eyebrow={eyebrow}
					title={title}
					description={description}
				/>
				<Faq items={items} />
			</div>
		</Section>
	);
}

/** Two-column editorial block: sticky heading, content on the right. */
export function SplitSection({
	id,
	eyebrow,
	title,
	description,
	children,
}: {
	id: string;
	eyebrow?: string;
	title: string;
	description?: string;
	children: ReactNode;
}) {
	return (
		<Section labelledBy={id}>
			<div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
				<div className="lg:sticky lg:top-28 lg:self-start">
					<SectionHeader
						id={id}
						eyebrow={eyebrow}
						title={title}
						description={description}
					/>
				</div>
				<div>{children}</div>
			</div>
		</Section>
	);
}

/** Bordered card used for applications, surfaces and capabilities. */
export function Card({
	children,
	className,
	as: Tag = "div",
}: {
	children: ReactNode;
	className?: string;
	as?: "div" | "li" | "article";
}) {
	return (
		<Tag className={cn("rounded-lg border border-border bg-card p-6", className)}>
			{children}
		</Tag>
	);
}

/** Hairline grid of titled items. */
export function FeatureGrid({
	items,
	columns = 3,
}: {
	items: { title: string; description: string }[];
	columns?: 2 | 3;
}) {
	return (
		<div
			className={cn(
				"hairline-grid grid border-l border-t border-border/60",
				columns === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
			)}
		>
			{items.map((item) => (
				<div key={item.title} className="bg-background px-6 py-7">
					<h3 className="text-base font-semibold text-foreground">
						{item.title}
					</h3>
					<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
						{item.description}
					</p>
				</div>
			))}
		</div>
	);
}

/** Key/value list used for facts, configuration and permissions. */
export function DefinitionList({
	items,
	mono = false,
}: {
	items: { term: string; description: string }[];
	mono?: boolean;
}) {
	return (
		<dl className="divide-y divide-border border-y border-border">
			{items.map((item) => (
				<div
					key={item.term}
					className="grid gap-1 py-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)] sm:gap-6"
				>
					<dt
						className={cn(
							"text-sm font-medium text-foreground",
							mono && "font-mono text-[0.8125rem]",
						)}
					>
						{item.term}
					</dt>
					<dd className="text-sm leading-relaxed text-muted-foreground">
						{item.description}
					</dd>
				</div>
			))}
		</dl>
	);
}

/** Bulleted proof list. */
export function Checklist({ items }: { items: string[] }) {
	return (
		<ul className="space-y-3">
			{items.map((item) => (
				<li
					key={item}
					className="flex gap-3 text-base leading-relaxed text-muted-foreground"
				>
					<span
						aria-hidden="true"
						className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40"
					/>
					<span>{item}</span>
				</li>
			))}
		</ul>
	);
}

/** Callout for limits, responsibilities and caveats. */
export function Callout({
	title,
	tone = "neutral",
	children,
}: {
	title: string;
	tone?: "neutral" | "warning" | "brand";
	children: ReactNode;
}) {
	const tones = {
		neutral: "border-border bg-muted/50",
		warning: "border-warning/50 bg-warning/10",
		brand: "border-primary/40 bg-primary/5",
	} as const;

	return (
		<div className={cn("rounded-md border-l-2 p-5", tones[tone])}>
			<p className="font-mono text-xs uppercase tracking-wide text-muted-foreground">
				{title}
			</p>
			<div className="mt-2 text-sm leading-relaxed text-foreground">
				{children}
			</div>
		</div>
	);
}

/** Closing call-to-action band. */
export function CtaBand({
	title,
	description,
	children,
}: {
	title: string;
	description: string;
	children: ReactNode;
}) {
	return (
		<Section className="border-t border-border">
			<div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
				<div className="max-w-xl">
					<h2 className="text-2xl text-foreground sm:text-3xl">{title}</h2>
					<p className="mt-3 text-base leading-relaxed text-muted-foreground">
						{description}
					</p>
				</div>
				<div className="flex flex-col gap-3 sm:flex-row">{children}</div>
			</div>
		</Section>
	);
}
