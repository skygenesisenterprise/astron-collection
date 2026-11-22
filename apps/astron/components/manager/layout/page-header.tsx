import type { ReactNode } from "react";

/**
 * Heading block shared by every Personal Space page: one title, one short
 * description and at most a few contextual actions.
 */
export function PageHeader({
	title,
	description,
	actions,
}: {
	title: string;
	description?: ReactNode;
	actions?: ReactNode;
}) {
	return (
		<div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div className="min-w-0">
				<h1 className="text-xl font-semibold tracking-tight text-zenth-strong">
					{title}
				</h1>
				{description && (
					<p className="mt-1 max-w-3xl text-sm leading-relaxed text-zenth-subtle">
						{description}
					</p>
				)}
			</div>
			{actions && (
				<div className="flex shrink-0 flex-wrap items-center gap-2">
					{actions}
				</div>
			)}
		</div>
	);
}
