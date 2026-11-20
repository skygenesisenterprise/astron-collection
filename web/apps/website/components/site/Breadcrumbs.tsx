import { breadcrumbJsonLd } from "@/lib/domain/queries";
import { BreadcrumbsNav } from "./BreadcrumbsNav";

export type Crumb = { name: string; path: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
	if (items.length === 0) return null;

	return (
		<>
			<BreadcrumbsNav items={items} />
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{
					__html: JSON.stringify(
						breadcrumbJsonLd([{ name: "Home", path: "/" }, ...items]),
					),
				}}
			/>
		</>
	);
}
