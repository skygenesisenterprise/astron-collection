"use client";

import type { Icon } from "@phosphor-icons/react";
import {
	BellIcon,
	CheckIcon,
	DeviceMobileIcon,
	GlobeSimpleIcon,
	MonitorIcon,
	MoonIcon,
	SunIcon,
} from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ManagerShell } from "@/components/manager/layout/manager-shell";
import { PageHeader } from "@/components/manager/layout/page-header";
import type { ManagerUser } from "@/components/manager/server";
import { personalSpacePageProps } from "@/components/manager/server";
import { Panel, StatusPill } from "@/components/manager/shared/states";
import { cn } from "@/lib/utils";

const THEMES: Array<{
	value: "light" | "dark" | "system";
	label: string;
	description: string;
	icon: Icon;
}> = [
	{
		value: "light",
		label: "Light",
		description: "Bright surfaces with dark text.",
		icon: SunIcon,
	},
	{
		value: "dark",
		label: "Dark",
		description: "The default authenticated appearance.",
		icon: MoonIcon,
	},
	{
		value: "system",
		label: "System",
		description: "Follow your device setting.",
		icon: MonitorIcon,
	},
];

export default function PreferencesPage({ user }: { user: ManagerUser }) {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const selectTheme = (value: "light" | "dark" | "system") => {
		setTheme(value);
		toast.success(
			value === "system"
				? "Appearance follows your device"
				: `${value === "dark" ? "Dark" : "Light"} appearance applied`,
		);
	};

	return (
		<ManagerShell user={user} title="Preferences">
			<PageHeader
				title="Preferences"
				description="Interface settings stored with this browser. Account-wide preferences require a preferences service."
			/>

			<Panel
				title="Appearance"
				description="Stored locally by the theme provider and applied immediately."
			>
				<div className="grid gap-3 sm:grid-cols-3">
					{THEMES.map((option) => {
						const selected = mounted && theme === option.value;
						return (
							<button
								key={option.value}
								type="button"
								onClick={() => selectTheme(option.value)}
								aria-pressed={selected}
								className={cn(
									"flex flex-col items-start gap-2 rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-zenth-focus",
									selected
										? "border-zenth-brand bg-zenth-brand/10"
										: "border-zenth-line bg-zenth-tint/60 hover:bg-zenth-tint",
								)}
							>
								<div className="flex w-full items-center justify-between">
									<option.icon
										aria-hidden="true"
										className="size-4 text-zenth-subtle"
									/>
									{selected && (
										<CheckIcon
											aria-hidden="true"
											className="size-4 text-zenth-brand"
										/>
									)}
								</div>
								<span className="text-sm font-medium text-zenth-default">
									{option.label}
								</span>
								<span className="text-xs leading-relaxed text-zenth-subtle">
									{option.description}
								</span>
							</button>
						);
					})}
				</div>
			</Panel>

			<div className="mt-5 grid gap-5 lg:grid-cols-2">
				<Panel title="Language" description="Interface language.">
					<div className="flex items-center justify-between gap-3 rounded-lg border border-zenth-line bg-zenth-tint/60 px-3 py-2.5">
						<div className="flex items-center gap-2.5">
							<GlobeSimpleIcon
								aria-hidden="true"
								className="size-4 text-zenth-subtle"
							/>
							<div>
								<p className="text-sm font-medium text-zenth-default">
									English
								</p>
								<p className="text-xs text-zenth-subtle">
									The only locale shipped by this build.
								</p>
							</div>
						</div>
						<StatusPill tone="info">Selected</StatusPill>
					</div>
				</Panel>

				<Panel title="Time zone" description="How dates are displayed.">
					<div className="flex items-center justify-between gap-3 rounded-lg border border-zenth-line bg-zenth-tint/60 px-3 py-2.5">
						<div className="flex items-center gap-2.5">
							<DeviceMobileIcon
								aria-hidden="true"
								className="size-4 text-zenth-subtle"
							/>
							<div>
								<p className="text-sm font-medium text-zenth-default">
									Automatic
								</p>
								<p className="text-xs text-zenth-subtle">
									Uses the device clock.
								</p>
							</div>
						</div>
						<StatusPill>Read-only</StatusPill>
					</div>
				</Panel>
			</div>

			<Panel
				className="mt-5"
				title="Notification preferences"
				description="Per-channel notification choices."
			>
				<div className="flex items-start gap-3 rounded-lg border border-zenth-line bg-zenth-tint/60 p-3">
					<BellIcon
						aria-hidden="true"
						className="mt-0.5 size-4 shrink-0 text-zenth-subtle"
					/>
					<div>
						<p className="text-sm font-medium text-zenth-default">
							Not available yet
						</p>
						<p className="mt-0.5 text-xs leading-relaxed text-zenth-subtle">
							Notification preferences need a user-addressed notification store
							and delivery settings. This page does not pretend they are saved.
						</p>
					</div>
					<StatusPill tone="warning" className="ml-auto shrink-0">
						Backend required
					</StatusPill>
				</div>
			</Panel>
		</ManagerShell>
	);
}

export const getServerSideProps = personalSpacePageProps;
