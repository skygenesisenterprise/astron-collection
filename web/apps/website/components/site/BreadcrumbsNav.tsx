"use client";

import { Breadcrumbs as ZenthBreadcrumbs } from "@astron-collection/react";
import * as React from "react";
import type { Crumb } from "./Breadcrumbs";

export function BreadcrumbsNav({ items }: { items: Crumb[] }) {
	return (
		<ZenthBreadcrumbs size="sm">
			<ZenthBreadcrumbs.Link href="/">Home</ZenthBreadcrumbs.Link>
			{items.map((item, index) => {
				const isLast = index === items.length - 1;
				return (
					<React.Fragment key={item.path}>
						<ZenthBreadcrumbs.Separator />
						{isLast ? (
							<ZenthBreadcrumbs.Current>{item.name}</ZenthBreadcrumbs.Current>
						) : (
							<ZenthBreadcrumbs.Link href={item.path}>
								{item.name}
							</ZenthBreadcrumbs.Link>
						)}
					</React.Fragment>
				);
			})}
		</ZenthBreadcrumbs>
	);
}
