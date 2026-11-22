"use client";

import {
	BellIcon,
	CaretUpDownIcon,
	QuestionIcon,
	SparkleIcon,
	StarIcon,
	UserIcon,
} from "@phosphor-icons/react";
import { Button, DropdownMenu, LinkButton } from "@astron-collection/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useTheme } from "next-themes";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { api } from "@/utils/api";
import { organizationPath } from "./navigation";
import { useOrganization } from "./organization-context";

/** The signed-in user as the panel already resolved them on the server. */
export interface PanelHeaderUser {
	name?: string | null;
	email: string;
	image?: string | null;
}

/** Public support entry point, shared with the rest of the product. */
export const SUPPORT_URL = "https://astron-collection.com/community";

/**
 * Quiet text action of the top bar. The header carries secondary,
 * session-wide affordances only: the workspace itself is driven by the
 * sidebar, so these stay flat until hovered, the way the reference renders
 * them.
 */
const ACTION_CLASSES =
	"gap-2 px-2 text-[13px] font-normal text-zenth-subtle not-disabled:hover:bg-zenth-tint not-disabled:hover:text-zenth-default";

/**
 * Top bar of the panel, spanning the workspace column.
 *
 * It is built from the same `@astron-collection/react` primitives as the rest of the
 * shell — `Button`, `LinkButton` and `DropdownMenu` — so focus rings, disabled
 * states, tooltips and tokens are the design system's, not local styling.
 *
 * It holds what belongs to the whole session rather than to a page: the AI
 * assistant, support, notifications and the account.
 */
export function PanelHeader({
	user,
	domainName,
}: {
	user: PanelHeaderUser;
	domainName?: string;
}) {
	const router = useRouter();
	const { organization } = useOrganization();
	const { theme, setTheme } = useTheme();
	const { data: domains, isPending: isDomainsPending, isError: domainsError } =
		api.overview.domains.useQuery(undefined, { enabled: Boolean(domainName) });
	const favoriteStorageKey = domainName
		? `panel.favorite-domain:${organization.id}:${domainName}`
		: null;
	const [isFavorite, setIsFavorite] = useState(false);

	useEffect(() => {
		if (!favoriteStorageKey) return;
		try {
			setIsFavorite(window.localStorage.getItem(favoriteStorageKey) === "true");
		} catch {
			toast.error("Impossible de lire les domaines favoris");
		}
	}, [favoriteStorageKey]);

	// The assistant, the notification centre, profile and billing have no panel
	// page yet. They keep the reference's structure and say so when used instead
	// of opening a route that does not exist.
	const notifyComingSoon = (feature: string) => {
		toast.info(`${feature} arrive bientôt`);
	};

	const copyAccountId = async () => {
		try {
			await navigator.clipboard.writeText(organization.id);
			toast.success("ID du compte copié");
		} catch {
			toast.error("Impossible de copier l'ID du compte");
		}
	};

	const signOut = async () => {
		await authClient.signOut();
		router.push("/");
	};

	const toggleFavorite = () => {
		if (!favoriteStorageKey) return;
		const nextFavorite = !isFavorite;
		try {
			if (nextFavorite) {
				window.localStorage.setItem(favoriteStorageKey, "true");
			} else {
				window.localStorage.removeItem(favoriteStorageKey);
			}
			setIsFavorite(nextFavorite);
		} catch {
			toast.error("Impossible d’enregistrer ce domaine favori");
		}
	};

	// The height and the bottom border repeat `Sidebar.Header`'s own values
	// (`h-[58px]` + `border-b border-zenth-line`). Sharing them means the two
	// rules sit on the same line, so the separator reads as one continuous
	// line from the sidebar to the right edge of the window.
	return (
		<header className="flex h-[58px] shrink-0 items-center justify-between gap-0.5 border-b border-zenth-line bg-zenth-base px-4 sm:pr-6">
			{domainName && (
				<div className="flex min-w-0 max-w-[calc(100%-190px)] items-center gap-1">
					<Button
						variant="ghost"
						shape="square"
						aria-label={
							isFavorite
								? `Retirer ${domainName} des favoris`
								: `Ajouter ${domainName} aux favoris`
						}
						aria-pressed={isFavorite}
						title={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
						icon={
							<StarIcon
								weight={isFavorite ? "fill" : "regular"}
								className={`size-4 ${isFavorite ? "text-amber-500" : "text-zenth-subtle"}`}
								aria-hidden
							/>
						}
						onClick={toggleFavorite}
					/>

					<DropdownMenu>
						<DropdownMenu.Trigger>
							<Button
								variant="ghost"
								className="min-w-0 max-w-full justify-start gap-2 px-2"
							>
								<span className="truncate text-sm font-medium">
									{domainName}
								</span>
								<span className="shrink-0 rounded-md border bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
									Free
								</span>
								<CaretUpDownIcon
									aria-hidden
									className="size-3.5 shrink-0 text-muted-foreground"
								/>
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content
							align="start"
							sideOffset={6}
							className="w-64 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
						>
							<DropdownMenu.Group>
								<DropdownMenu.Label>Domaines</DropdownMenu.Label>
								{domainsError ? (
									<DropdownMenu.Item disabled>
										Impossible de charger les domaines
									</DropdownMenu.Item>
								) : isDomainsPending ? (
									<DropdownMenu.Item disabled>
										Chargement des domaines…
									</DropdownMenu.Item>
								) : domains?.length ? (
									domains.map((domain) => (
										<DropdownMenu.Item
											key={domain.domainId}
											selected={domain.host === domainName}
											onClick={() =>
												void router.push(
													organizationPath(
														organization.id,
														`domains/${domain.host}`,
													),
												)
											}
										>
											<span className="min-w-0 flex-1 truncate">
												{domain.host}
											</span>
										</DropdownMenu.Item>
									))
								) : (
									<DropdownMenu.Item disabled>Aucun domaine</DropdownMenu.Item>
								)}
							</DropdownMenu.Group>
							<DropdownMenu.Separator />
							<DropdownMenu.Item
								onClick={() =>
									void router.push(
										organizationPath(organization.id, "domains/overview"),
									)
								}
							>
								Tous les domaines
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu>
				</div>
			)}

			<div className="ml-auto flex shrink-0 items-center gap-0.5">
				<Button
					variant="ghost"
					icon={<SparkleIcon className="size-4.5" aria-hidden />}
					aria-label="Demander à l'IA"
					className={ACTION_CLASSES}
					onClick={() => notifyComingSoon("L'assistant IA")}
				>
					<span className="hidden sm:inline">Demander à l&apos;IA</span>
				</Button>

				<LinkButton
					href={SUPPORT_URL}
					external
					variant="ghost"
					icon={<QuestionIcon className="size-4.5" aria-hidden />}
					aria-label="Assistance"
					className={ACTION_CLASSES}
				>
					<span className="hidden sm:inline">Assistance</span>
				</LinkButton>

				<Button
					variant="ghost"
					shape="square"
					icon={<BellIcon className="size-4.5" aria-hidden />}
					aria-label="Notifications"
					onClick={() => notifyComingSoon("Le centre de notifications")}
				/>

				<DropdownMenu>
					<DropdownMenu.Trigger>
						<Button
							variant="ghost"
							shape="square"
							icon={<UserIcon className="size-4.5" aria-hidden />}
							aria-label="Compte et paramètres de session"
							className="ml-1"
						/>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						align="end"
						sideOffset={6}
						className="w-56 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
					>
						{/* Base UI group labels must live inside a group, otherwise the
					    menu throws when it opens. */}
						<DropdownMenu.Group>
							<DropdownMenu.Label className="truncate text-xs font-normal text-zenth-subtle">
								{user.email}
							</DropdownMenu.Label>
						</DropdownMenu.Group>
						<DropdownMenu.Separator />

						<DropdownMenu.Item onClick={() => notifyComingSoon("Le profil")}>
							Profil
						</DropdownMenu.Item>
						<DropdownMenu.Item
							onClick={() => notifyComingSoon("La facturation")}
						>
							Facturation
						</DropdownMenu.Item>

						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>Apparence</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent>
								<DropdownMenu.RadioGroup
									value={theme ?? "system"}
									onValueChange={setTheme}
								>
									<DropdownMenu.RadioItem value="light">
										Clair
										<DropdownMenu.RadioItemIndicator />
									</DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem value="dark">
										Sombre
										<DropdownMenu.RadioItemIndicator />
									</DropdownMenu.RadioItem>
									<DropdownMenu.RadioItem value="system">
										Système
										<DropdownMenu.RadioItemIndicator />
									</DropdownMenu.RadioItem>
								</DropdownMenu.RadioGroup>
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>

						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>Langue</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent>
								{/* The panel ships a single locale: show it selected rather
							    than offering translations that do not exist. */}
								<DropdownMenu.RadioGroup value="fr">
									<DropdownMenu.RadioItem value="fr">
										Français
										<DropdownMenu.RadioItemIndicator />
									</DropdownMenu.RadioItem>
								</DropdownMenu.RadioGroup>
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>

						<DropdownMenu.Sub>
							<DropdownMenu.SubTrigger>Fuseau horaire</DropdownMenu.SubTrigger>
							<DropdownMenu.SubContent>
								{/* Dates follow the device's timezone; there is no
							    per-account setting to pick one yet. */}
								<DropdownMenu.RadioGroup value="auto">
									<DropdownMenu.RadioItem value="auto">
										Automatique (appareil)
										<DropdownMenu.RadioItemIndicator />
									</DropdownMenu.RadioItem>
								</DropdownMenu.RadioGroup>
							</DropdownMenu.SubContent>
						</DropdownMenu.Sub>

						<DropdownMenu.Separator />
						<DropdownMenu.Item onClick={copyAccountId}>
							Copier l&apos;ID de compte
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item variant="danger" onClick={signOut}>
							Se déconnecter
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu>
			</div>
		</header>
	);
}
