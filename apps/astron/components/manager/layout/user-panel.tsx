"use client";

import { Button, DropdownMenu, LinkButton } from "@astron-collection/react";
import {
	BellIcon,
	GearSixIcon,
	SignOutIcon,
	SlidersHorizontalIcon,
	UserCircleIcon,
} from "@phosphor-icons/react";
import { useRouter } from "next/router";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import type { ManagerUser } from "../server";
import { ManagerAvatar } from "../shared/states";

/**
 * Account panel pinned to the bottom of the contextual sidebar.
 *
 * Same structure as the reference: avatar with presence, the display name and
 * its secondary line, then three compact icon actions on the right. The
 * identity opens the account menu; Inbox, Preferences and Settings stay one
 * click away from anywhere in the Personal Space.
 */
export function UserPanel({ user }: { user: ManagerUser }) {
	const router = useRouter();

	const signOut = async () => {
		try {
			await authClient.signOut();
			await router.push("/login");
		} catch {
			toast.error("Could not sign out. Please try again.");
		}
	};

	return (
		<div className="flex h-full w-full items-center gap-1 px-2">
			<DropdownMenu>
				<DropdownMenu.Trigger>
					<Button
						variant="ghost"
						className="h-full min-w-0 flex-1 justify-start gap-2 rounded-md px-1 group-data-[state=collapsed]/sidebar:justify-center group-data-[state=collapsed]/sidebar:px-0"
						aria-label={`Account menu for ${user.displayName}`}
					>
						<span className="relative shrink-0">
							<ManagerAvatar
								image={user.image}
								name={user.displayName}
								size="sm"
							/>
							<span
								aria-hidden="true"
								className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-zenth-base bg-zenth-success"
							/>
							<span className="sr-only">Signed in</span>
						</span>
						<span className="flex min-w-0 flex-1 flex-col items-start group-data-[state=collapsed]/sidebar:hidden">
							<span
								className="w-full truncate text-left text-sm leading-tight font-semibold text-zenth-strong"
								title={user.displayName}
							>
								{user.displayName}
							</span>
							<span className="w-full truncate text-left text-[11px] leading-tight text-zenth-success">
								Online
							</span>
						</span>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content
					align="start"
					side="top"
					sideOffset={8}
					className="w-60"
				>
					<DropdownMenu.Group>
						<DropdownMenu.Label className="truncate text-xs font-normal text-zenth-subtle">
							Signed in as {user.email}
						</DropdownMenu.Label>
					</DropdownMenu.Group>
					<DropdownMenu.Separator />
					<DropdownMenu.Item onClick={() => void router.push("/profile")}>
						<UserCircleIcon aria-hidden="true" className="size-4" />
						Profile
					</DropdownMenu.Item>
					<DropdownMenu.Item
						onClick={() => void router.push("/channels/me/settings")}
					>
						<GearSixIcon aria-hidden="true" className="size-4" />
						Account settings
					</DropdownMenu.Item>
					<DropdownMenu.Item
						onClick={() => void router.push("/channels/me/security")}
					>
						<SlidersHorizontalIcon aria-hidden="true" className="size-4" />
						Privacy & security
					</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item variant="danger" onClick={() => void signOut()}>
						<SignOutIcon aria-hidden="true" className="size-4" />
						Sign out
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu>

			<div className="flex shrink-0 items-center gap-1 group-data-[state=collapsed]/sidebar:hidden">
				<LinkButton
					href="/channels/me/inbox"
					variant="ghost"
					shape="square"
					size="sm"
					className="size-8"
					aria-label="Inbox"
					title="Inbox"
					icon={<BellIcon aria-hidden="true" className="size-4.5" />}
				/>
				<LinkButton
					href="/channels/me/preferences"
					variant="ghost"
					shape="square"
					size="sm"
					className="size-8"
					aria-label="Preferences"
					title="Preferences"
					icon={
						<SlidersHorizontalIcon aria-hidden="true" className="size-4.5" />
					}
				/>
				<LinkButton
					href="/channels/me/settings"
					variant="ghost"
					shape="square"
					size="sm"
					className="size-8"
					aria-label="Account settings"
					title="Account settings"
					icon={<GearSixIcon aria-hidden="true" className="size-4.5" />}
				/>
			</div>
		</div>
	);
}
