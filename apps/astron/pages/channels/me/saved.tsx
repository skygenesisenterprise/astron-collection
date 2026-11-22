import {
	BookmarkSimpleIcon,
	FileTextIcon,
	GearSixIcon,
	GlobeSimpleIcon,
	SquaresFourIcon,
} from "@phosphor-icons/react";
import { MANAGER_SAVED_ITEMS } from "@/components/manager/data/contracts";
import { ManagerShell } from "@/components/manager/layout/manager-shell";
import { PageHeader } from "@/components/manager/layout/page-header";
import type { ManagerUser } from "@/components/manager/server";
import { personalSpacePageProps } from "@/components/manager/server";
import {
	ActionLink,
	EmptyState,
	Panel,
} from "@/components/manager/shared/states";

const SAVED_KINDS = [
	{
		icon: SquaresFourIcon,
		label: "Server workspaces",
		detail: "A server workspace you return to often.",
	},
	{
		icon: GlobeSimpleIcon,
		label: "Products",
		detail: "An Astron product page for one server.",
	},
	{
		icon: GearSixIcon,
		label: "Configurations",
		detail: "A settings screen with its context.",
	},
	{
		icon: FileTextIcon,
		label: "Documentation",
		detail: "A guide kept next to your work.",
	},
];

export default function SavedPage({ user }: { user: ManagerUser }) {
	return (
		<ManagerShell user={user} title="Saved">
			<PageHeader
				title="Saved"
				description="Personal shortcuts to the servers, products and references you use most."
				actions={
					<ActionLink href="/channels/me/servers" variant="primary">
						Browse servers
					</ActionLink>
				}
			/>

			<Panel title="Saved items">
				{MANAGER_SAVED_ITEMS.length > 0 ? (
					<ul className="divide-y divide-zenth-line">
						{MANAGER_SAVED_ITEMS.map((item) => (
							<li key={item.id} className="py-3 text-sm">
								<a
									href={item.href}
									className="font-medium text-zenth-link hover:underline"
								>
									{item.label}
								</a>
							</li>
						))}
					</ul>
				) : (
					<EmptyState
						icon={BookmarkSimpleIcon}
						title="Nothing saved yet"
						description="Saved workspaces, product pages, configurations and documentation will appear here."
						action={
							<ActionLink href="/channels/me/servers" size="sm">
								Go to servers
							</ActionLink>
						}
						note="Saving requires a per-account store keyed by item type and reference. The page already works from that contract; it does not keep a local-only list that would silently disappear between devices."
					/>
				)}
			</Panel>

			<Panel
				className="mt-5"
				title="What can be saved"
				description="The item model the page is built for."
			>
				<ul className="grid gap-3 sm:grid-cols-2">
					{SAVED_KINDS.map((kind) => (
						<li
							key={kind.label}
							className="flex items-start gap-3 rounded-lg border border-zenth-line bg-zenth-tint/60 p-3"
						>
							<kind.icon
								aria-hidden="true"
								className="mt-0.5 size-4 shrink-0 text-zenth-subtle"
							/>
							<div>
								<p className="text-sm font-medium text-zenth-default">
									{kind.label}
								</p>
								<p className="mt-0.5 text-xs leading-relaxed text-zenth-subtle">
									{kind.detail}
								</p>
							</div>
						</li>
					))}
				</ul>
			</Panel>
		</ManagerShell>
	);
}

export const getServerSideProps = personalSpacePageProps;
