import { standardSchemaResolver as zodResolver } from "@hookform/resolvers/standard-schema";
import {
	DiscordLogoIcon,
	EyeIcon,
	EyeSlashIcon,
	GithubLogoIcon,
	GlobeIcon,
	LockKeyIcon,
	WarningCircleIcon,
} from "@phosphor-icons/react";
import {
	Banner,
	Button,
	Checkbox,
	Field,
	Input,
	Link as KumoLink,
	LayerCard,
	Text,
} from "@astron-collection/react";
import {
	getWebServerSettings,
	IS_CLOUD,
	isAdminPresent,
} from "@astron-collection/server";
import { validateRequest } from "@astron-collection/server/lib/auth";
import { readOnboardingStatus } from "@astron-collection/server/services/onboarding";
import type { GetServerSidePropsContext } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { SignInWithSSO } from "@/components/proprietary/sso/sign-in-with-sso";
import { authClient } from "@/lib/auth-client";
import { getTwoFactorMethod } from "@/lib/webauthn-two-factor";
import { appRouter } from "@/server/api/root";
import { generateServerSideHelper } from "@/utils/create-server-helpers";

const LoginSchema = z.object({
	email: z
		.string()
		.min(1, "Enter your email address")
		.email("Enter a valid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof LoginSchema>;

/** Stored locally so the next visit can prefill the account that was used. */
const SAVED_LOGIN_KEY = "astron-collection.saved-login";
const LOGIN_PATH = "/login";
/** The second factor lives on its own page; login only hands the challenge over. */
const TWO_FACTOR_PATH = "/two-factor";
/** Where a signed-in account that owns no workspace finishes onboarding. */
const CREATE_ACCOUNT_PATH = "/create-account";

/**
 * Opens the workspace of the account that just signed in. The active
 * organization lives in the session, not in the sign-in response, so it is read
 * back once the session cookie exists.
 */
async function openWorkspace() {
	let organizationId: string | null = null;
	try {
		const { data } = await authClient.getSession();
		const session = data?.session as
			| { activeOrganizationId?: string | null }
			| null
			| undefined;
		organizationId = session?.activeOrganizationId ?? null;
	} catch {
		// Reading the session back must not block a successful sign-in.
	}

	// Document navigation: the workspace route owns the dashboard, and the next
	// request carries the fresh session instead of the client guessing.
	window.location.assign(
		organizationId ? `/${organizationId}/home` : CREATE_ACCOUNT_PATH,
	);
}

/**
 * better-auth answers a 2FA account with `twoFactorRedirect` instead of a
 * session: the password step stays pending in its cookie and `/two-factor`
 * owns the challenge. A sign-in response without a user therefore still has a
 * second factor to complete.
 */
function isSecondFactorPending(data: unknown) {
	if (!data || typeof data !== "object") return false;
	const payload = data as { twoFactorRedirect?: boolean; user?: unknown };
	return payload.twoFactorRedirect === true || payload.user === undefined;
}

interface SavedLogin {
	email: string;
	method: string;
}

function readSavedLogin(): SavedLogin | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(SAVED_LOGIN_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as Partial<SavedLogin>;
		if (typeof parsed.email !== "string") return null;
		return {
			email: parsed.email,
			method: typeof parsed.method === "string" ? parsed.method : "password",
		};
	} catch {
		return null;
	}
}

function writeSavedLogin(value: SavedLogin | null) {
	if (typeof window === "undefined") return;
	try {
		if (value) {
			window.localStorage.setItem(SAVED_LOGIN_KEY, JSON.stringify(value));
		} else {
			window.localStorage.removeItem(SAVED_LOGIN_KEY);
		}
	} catch {
		// Storage can be unavailable (private mode, quota): the form still works.
	}
}

function GoogleMark({ className = "size-4" }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
			<path
				fill="#4285F4"
				d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
			/>
			<path
				fill="#34A853"
				d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
			/>
			<path
				fill="#FBBC05"
				d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
			/>
			<path
				fill="#EA4335"
				d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
			/>
		</svg>
	);
}

function MicrosoftMark({ className = "size-4" }: { className?: string }) {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
			<path fill="#F25022" d="M2 2h9.5v9.5H2z" />
			<path fill="#7FBA00" d="M12.5 2H22v9.5h-9.5z" />
			<path fill="#00A4EF" d="M2 12.5h9.5V22H2z" />
			<path fill="#FFB900" d="M12.5 12.5H22V22h-9.5z" />
		</svg>
	);
}

function OrDivider() {
	return (
		<div className="my-6 flex items-center gap-4" aria-hidden="true">
			<span className="h-px flex-1 bg-zenth-line" />
			<Text
				variant="secondary"
				size="xs"
				as="span"
				DANGEROUS_className="font-medium tracking-[0.1em] uppercase"
			>
				or
			</Text>
			<span className="h-px flex-1 bg-zenth-line" />
		</div>
	);
}

/** Text link built on the design-system Link (no app-specific styling). */
function AuthLink({
	href,
	children,
	external = false,
	inline = false,
}: {
	href: string;
	children: React.ReactNode;
	external?: boolean;
	inline?: boolean;
}) {
	return (
		<KumoLink
			href={href}
			variant={inline ? "inline" : "plain"}
			className="font-medium"
			{...(external ? { target: "_blank", rel: "noreferrer" } : {})}
		>
			{children}
		</KumoLink>
	);
}

interface Props {
	IS_CLOUD: boolean;
	enforceSSO: boolean;
}

type SocialProvider = "google" | "github" | "discord" | "microsoft";

export default function LoginPage({ IS_CLOUD, enforceSSO }: Props) {
	const router = useRouter();
	const [isLoginLoading, setIsLoginLoading] = useState(false);
	const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);
	const [rememberDevice, setRememberDevice] = useState(true);
	const [savedLogin, setSavedLogin] = useState<SavedLogin | null>(null);
	const [showSavedProfiles, setShowSavedProfiles] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const loginForm = useForm<LoginForm>({
		resolver: zodResolver(LoginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	// The identity provider redirects back with ?error=… when a sign-in fails.
	useEffect(() => {
		const queryError = router.query.error;
		if (!queryError) return;

		const raw = Array.isArray(queryError) ? queryError[0] : queryError;
		if (!raw) return;
		const normalized = raw.replace(/[+_]/g, " ").toLowerCase();

		setError(
			normalized.includes("account not linked")
				? "This account already exists but isn't linked to that sign-in provider yet. Contact your administrator to link it."
				: normalized.includes("access denied")
					? "Access was denied by the identity provider."
					: "We couldn't complete sign-in. Please try again or contact your administrator.",
		);

		const { error: _removed, ...rest } = router.query;
		router.replace({ pathname: router.pathname, query: rest }, undefined, {
			shallow: true,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.query.error]);

	// Prefill with the account saved on this browser.
	useEffect(() => {
		const saved = readSavedLogin();
		if (!saved) return;
		setSavedLogin(saved);
		if (!loginForm.getValues("email")) {
			loginForm.setValue("email", saved.email);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// A password step may already be pending when the browser comes back here
	// (back button, reload or an identity-provider callback). The method
	// endpoint reads that pending challenge, so login hands the account's second
	// factor over to its own page instead of asking for the password again.
	useEffect(() => {
		// `?restart=1` is the deliberate way back from /two-factor: it must not
		// bounce the user straight into the challenge again.
		if (router.query.restart) return;

		let cancelled = false;
		getTwoFactorMethod()
			.then(({ summary }) => {
				if (!cancelled && summary) {
					window.location.assign(TWO_FACTOR_PATH);
				}
			})
			.catch(() => {
				// No pending challenge: the form stays as it is.
			});

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const persistLogin = (email: string, method: string) => {
		if (!rememberDevice) return;
		const value = { email, method };
		writeSavedLogin(value);
		setSavedLogin(value);
	};

	const onSocialSignIn = async (provider: SocialProvider) => {
		setSocialLoading(provider);
		try {
			const { error } = await authClient.signIn.social({
				provider,
				callbackURL: LOGIN_PATH,
				newUserCallbackURL: `${LOGIN_PATH}?signup=${provider}`,
				errorCallbackURL: LOGIN_PATH,
			});
			if (error) {
				const message = error.message || `Could not sign in with ${provider}`;
				toast.error(message);
				setError(message);
			}
		} catch (caught) {
			const message =
				caught instanceof Error
					? caught.message
					: `Could not sign in with ${provider}`;
			toast.error(message);
			setError(message);
		} finally {
			setSocialLoading(null);
		}
	};

	const onSubmit = async (values: LoginForm) => {
		setIsLoginLoading(true);
		try {
			const { data, error } = await authClient.signIn.email({
				email: values.email,
				password: values.password,
			});

			if (error) {
				const isEmailNotVerified =
					error.code === "EMAIL_NOT_VERIFIED" ||
					error.message?.toLowerCase().includes("email not verified");
				if (isEmailNotVerified) {
					const msg =
						"Your email is not verified. We've sent a new verification link to your email.";
					toast.info(msg);
					setError(msg);
					return;
				}
				toast.error(error.message);
				setError(error.message || "An error occurred while logging in");
				return;
			}

			persistLogin(values.email, "password");

			// better-auth kept a pending challenge in its cookie. The dedicated
			// page owns the second factor, so login only navigates to it.
			if (isSecondFactorPending(data)) {
				toast.info("Please complete your second factor");
				window.location.assign(TWO_FACTOR_PATH);
				return;
			}

			toast.success("Logged in successfully");
			await openWorkspace();
		} catch {
			toast.error("An error occurred while logging in");
		} finally {
			setIsLoginLoading(false);
		}
	};

	const passwordError = loginForm.formState.errors.password?.message;
	const emailError = loginForm.formState.errors.email?.message;

	const loginPanel = (
		<>
			{" "}
			{IS_CLOUD && (
				<div className="mt-6 grid grid-cols-2 gap-2">
					<Button
						variant="outline"
						size="lg"
						className="w-full justify-center"
						loading={socialLoading === "google"}
						disabled={socialLoading !== null}
						onClick={() => onSocialSignIn("google")}
					>
						<GoogleMark />
						Google
					</Button>
					<Button
						variant="outline"
						size="lg"
						className="w-full justify-center"
						icon={GithubLogoIcon}
						loading={socialLoading === "github"}
						disabled={socialLoading !== null}
						onClick={() => onSocialSignIn("github")}
					>
						GitHub
					</Button>
					<Button
						variant="outline"
						size="lg"
						className="w-full justify-center"
						icon={DiscordLogoIcon}
						loading={socialLoading === "discord"}
						disabled={socialLoading !== null}
						onClick={() => onSocialSignIn("discord")}
					>
						Discord
					</Button>
					<Button
						variant="outline"
						size="lg"
						className="w-full justify-center"
						loading={socialLoading === "microsoft"}
						disabled={socialLoading !== null}
						onClick={() => onSocialSignIn("microsoft")}
					>
						<MicrosoftMark />
						Microsoft
					</Button>
				</div>
			)}
			{IS_CLOUD && (
				<div className="mt-2">
					{/* Managed cloud always offers SSO: an organization may not have a
					    source configured, so the local form remains the fallback. */}
					<SignInWithSSO />
				</div>
			)}
			{IS_CLOUD && <OrDivider />}
			<form
				method="post"
				onSubmit={loginForm.handleSubmit(onSubmit)}
				className={IS_CLOUD ? "mt-6 space-y-5" : "mt-8 space-y-5"}
				id="login-form"
			>
				<Field
					label="Email"
					error={emailError ? { message: emailError, match: true } : undefined}
				>
					<Input
						type="email"
						placeholder="john@example.com"
						autoComplete="email"
						size="lg"
						{...loginForm.register("email")}
					/>
				</Field>

				<Field
					label="Password"
					error={
						passwordError ? { message: passwordError, match: true } : undefined
					}
				>
					<div className="relative w-full">
						<Input
							type={showPassword ? "text" : "password"}
							placeholder="Enter your password"
							autoComplete="current-password"
							size="lg"
							className="w-full pr-12"
							{...loginForm.register("password")}
						/>
						<Button
							type="button"
							variant="ghost"
							shape="square"
							size="sm"
							onClick={() => setShowPassword((value) => !value)}
							aria-label={showPassword ? "Hide password" : "Show password"}
							aria-pressed={showPassword}
							className="absolute top-1/2 right-1.5 -translate-y-1/2"
						>
							{showPassword ? (
								<EyeSlashIcon className="size-4" />
							) : (
								<EyeIcon className="size-4" />
							)}
						</Button>
					</div>
				</Field>

				<Checkbox
					label="Save the email address and login method on this device"
					checked={rememberDevice}
					onCheckedChange={(checked) => setRememberDevice(checked === true)}
				/>

				<Button
					type="submit"
					variant="primary"
					size="lg"
					className="w-full justify-center rounded-lg"
					loading={isLoginLoading}
				>
					Sign in
				</Button>
			</form>
			<div className="mt-6 text-center">
				<Button
					type="button"
					variant="ghost"
					size="sm"
					className="mx-auto"
					onClick={() => setShowSavedProfiles((value) => !value)}
					aria-expanded={showSavedProfiles}
				>
					{showSavedProfiles ? "Hide saved profiles" : "Show saved profiles"}
				</Button>
				{showSavedProfiles && (
					<LayerCard className="mt-2 p-3 text-left">
						{savedLogin ? (
							<div className="flex items-center justify-between gap-3">
								<div className="min-w-0">
									<Text size="sm" bold truncate>
										{savedLogin.email}
									</Text>
									<Text variant="secondary" size="xs">
										{savedLogin.method === "password"
											? "Email and password"
											: savedLogin.method}
									</Text>
								</div>
								<div className="flex shrink-0 items-center gap-1">
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => {
											loginForm.setValue("email", savedLogin.email, {
												shouldValidate: true,
											});
											setShowSavedProfiles(false);
										}}
									>
										Use
									</Button>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										onClick={() => {
											writeSavedLogin(null);
											setSavedLogin(null);
											setShowSavedProfiles(false);
										}}
									>
										Forget
									</Button>
								</div>
							</div>
						) : (
							<Text variant="secondary" size="xs">
								No saved profile on this device.
							</Text>
						)}
					</LayerCard>
				)}
			</div>
			<div className="mt-6 space-y-1 text-center">
				{IS_CLOUD && (
					<Text variant="secondary" size="sm">
						Don&apos;t have an account?{" "}
						<AuthLink href="/register">Sign up</AuthLink>
					</Text>
				)}
				<Text variant="secondary" size="sm">
					Forgot your email or password?{" "}
					{IS_CLOUD ? (
						<AuthLink href="/reset-password">Reset it</AuthLink>
					) : (
						<AuthLink
							href="https://docs.astron-collection.com/docs/core/reset-password"
							external
						>
							Reset it
						</AuthLink>
					)}
				</Text>
			</div>
			<Text
				variant="secondary"
				size="xs"
				as="p"
				DANGEROUS_className="mt-7 text-center leading-relaxed"
			>
				By continuing, you agree to the Astron Collection{" "}
				<AuthLink href="https://astron-collection.com/legal/terms" external inline>
					Terms of Service
				</AuthLink>
				,{" "}
				<AuthLink href="https://astron-collection.com/legal/privacy" external inline>
					Privacy Policy
				</AuthLink>{" "}
				and{" "}
				<AuthLink href="https://astron-collection.com/legal/cookies" external inline>
					Cookie Policy
				</AuthLink>
				.
			</Text>
		</>
	);

	return (
		<main
			data-zenth-mode="light"
			className="flex min-h-svh flex-col bg-zenth-base text-zenth-default"
		>
			<Head>
				<title>Astron Collection Dashbord | Manage Your Account</title>
			</Head>
			<header className="flex h-20 items-center justify-end gap-4 px-6">
				<div className="flex items-center gap-3">
					<Text
						variant="secondary"
						size="sm"
						as="span"
						DANGEROUS_className="inline-flex items-center gap-1.5"
					>
						<GlobeIcon className="size-4" aria-hidden="true" />
						English
					</Text>
					{IS_CLOUD && (
						<Button variant="outline" onClick={() => router.push("/register")}>
							Sign up
						</Button>
					)}
				</div>
			</header>

			<section
				aria-labelledby="login-heading"
				className="flex flex-1 justify-center px-6 pt-12 pb-12 sm:px-4"
			>
				<div className="w-full max-w-[22.75rem]">
					<Text
						id="login-heading"
						variant="heading1"
						as="h1"
						DANGEROUS_className="text-center text-[1.75rem] leading-9 tracking-[-0.02em]"
					>
						Sign in to Astron Collection
					</Text>

					{error && (
						<Banner
							variant="error"
							size="sm"
							icon={<WarningCircleIcon className="size-4" />}
							description={error}
							className="mt-6"
						/>
					)}

					{!IS_CLOUD && enforceSSO ? (
						<div className="mt-8 space-y-4">
							<Banner
								variant="secondary"
								size="sm"
								icon={<LockKeyIcon className="size-4" />}
								description="Your administrator requires single sign-on."
							/>
							<SignInWithSSO enforce />
						</div>
					) : (
						loginPanel
					)}
				</div>
			</section>
		</main>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const helpers = generateServerSideHelper(appRouter, context);
	// Prefetch the public branding so the login logo and app name render
	// correctly on the server (no flash of default branding).
	await helpers.whitelabeling.getPublic.prefetch();

	if (IS_CLOUD) {
		try {
			const { user, session } = await validateRequest(context.req);
			if (user) {
				// The workspace stored on the session may have been deleted since:
				// only persisted memberships decide where the account belongs.
				const status = await readOnboardingStatus(
					user.id,
					session?.activeOrganizationId,
				);
				return {
					redirect: {
						permanent: false,
						destination: status.destination ?? CREATE_ACCOUNT_PATH,
					},
				};
			}
		} catch {}

		return {
			props: {
				trpcState: helpers.dehydrate(),
				IS_CLOUD: IS_CLOUD,
				enforceSSO: false,
			},
		};
	}

	const hasAdmin = await isAdminPresent();

	if (!hasAdmin) {
		return {
			redirect: {
				permanent: false,
				destination: "/register",
			},
		};
	}

	const { user, session } = await validateRequest(context.req);

	if (user) {
		const status = await readOnboardingStatus(
			user.id,
			session?.activeOrganizationId,
		);
		return {
			redirect: {
				permanent: false,
				destination: status.destination ?? CREATE_ACCOUNT_PATH,
			},
		};
	}

	const webServerSettings = await getWebServerSettings();

	return {
		props: {
			trpcState: helpers.dehydrate(),
			hasAdmin,
			enforceSSO: webServerSettings?.enforceSSO ?? false,
		},
	};
}
