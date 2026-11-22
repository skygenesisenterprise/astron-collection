import {
	Button,
	Field,
	Input,
	Link as KumoLink,
	Text,
} from "@astron-collection/react";
import { IS_CLOUD, isAdminPresent } from "@astron-collection/server";
import { validateRequest } from "@astron-collection/server/lib/auth";
import { readOnboardingStatus } from "@astron-collection/server/services/onboarding";
import { standardSchemaResolver as zodResolver } from "@hookform/resolvers/standard-schema";
import {
	DiscordLogoIcon,
	EyeIcon,
	EyeSlashIcon,
	GithubLogoIcon,
} from "@phosphor-icons/react";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthLayout, fieldLabel } from "@/components/auth/auth-layout";
import { pushToDataLayer } from "@/lib/analytics";
import { authClient } from "@/lib/auth-client";
import { appRouter } from "@/server/api/root";
import { generateServerSideHelper } from "@/utils/create-server-helpers";

const RegisterSchema = z
	.object({
		email: z
			.string()
			.min(1, "Enter your email address")
			.email("Enter a valid email address"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string().min(1, "Confirm your password"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type RegisterForm = z.infer<typeof RegisterSchema>;

const REGISTER_PATH = "/register";
const LOGIN_PATH = "/login";
/** The organization step owns onboarding after the user account exists. */
const CREATE_ACCOUNT_PATH = "/create-account";
/** Where a freshly created account lands once its session exists. */
const CHANNELS_PATH = "/channels/me";

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

/** Text link built on the design-system Link (no app-specific styling). */
function AuthLink({
	href,
	children,
	external = false,
	inline = false,
	className,
}: {
	href: string;
	children: React.ReactNode;
	external?: boolean;
	inline?: boolean;
	className?: string;
}) {
	return (
		<KumoLink
			href={href}
			variant={inline ? "inline" : "plain"}
			className={["font-medium", className].filter(Boolean).join(" ")}
			{...(external ? { target: "_blank", rel: "noreferrer" } : {})}
		>
			{children}
		</KumoLink>
	);
}

interface Props {
	IS_CLOUD: boolean;
}

type SocialProvider = "google" | "github" | "discord" | "microsoft";

export default function RegisterPage({ IS_CLOUD }: Props) {
	const router = useRouter();
	const [isRegisterLoading, setIsRegisterLoading] = useState(false);
	const [socialLoading, setSocialLoading] = useState<SocialProvider | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [showMoreOptions, setShowMoreOptions] = useState(false);
	const registerForm = useForm<RegisterForm>({
		resolver: zodResolver(RegisterSchema),
		defaultValues: {
			email: "",
			password: "",
			confirmPassword: "",
		},
	});

	// The identity provider redirects back with ?error=… when a sign-up fails.
	useEffect(() => {
		const queryError = router.query.error;
		if (!queryError) return;

		const raw = Array.isArray(queryError) ? queryError[0] : queryError;
		if (!raw) return;
		const normalized = raw.replace(/[+_]/g, " ").toLowerCase();

		setError(
			normalized.includes("account not linked")
				? "This account already exists but isn't linked to that sign-in provider yet. Sign in instead or contact your administrator to link it."
				: normalized.includes("access denied")
					? "Access was denied by the identity provider."
					: "We couldn't complete sign-up. Please try again or contact your administrator.",
		);

		const { error: _removed, ...rest } = router.query;
		router.replace({ pathname: router.pathname, query: rest }, undefined, {
			shallow: true,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router.query.error]);

	const onSocialSignUp = async (provider: SocialProvider) => {
		setSocialLoading(provider);
		try {
			const { error } = await authClient.signIn.social({
				provider,
				// Existing accounts finish on the sign-in page, new accounts land on
				// their channels.
				callbackURL: LOGIN_PATH,
				newUserCallbackURL: CHANNELS_PATH,
				errorCallbackURL: REGISTER_PATH,
			});
			if (error) {
				const message = error.message || `Could not sign up with ${provider}`;
				toast.error(message);
				setError(message);
			}
		} catch (caught) {
			const message =
				caught instanceof Error
					? caught.message
					: `Could not sign up with ${provider}`;
			toast.error(message);
			setError(message);
		} finally {
			setSocialLoading(null);
		}
	};

	const onSubmit = async (values: RegisterForm) => {
		setIsRegisterLoading(true);
		setError(null);
		try {
			const { error } = await authClient.signUp.email({
				email: values.email,
				password: values.password,
				name: values.email,
				lastName: "",
			});

			if (error) {
				toast.error(error.message);
				setError(
					error.message || "An error occurred while creating your account",
				);
				return;
			}

			if (IS_CLOUD) {
				pushToDataLayer("sign_up", { method: "email" });
			}

			// Cloud installations disable `autoSignIn` on sign-up, so the account
			// exists without a session yet. Open it explicitly before moving on:
			// without one, /channels/me would send the new account to /login.
			const { data: signedIn } = await authClient.getSession();
			if (!signedIn?.session) {
				const { error: signInError } = await authClient.signIn.email({
					email: values.email,
					password: values.password,
				});
				if (signInError) {
					// Email verification blocks the session on production Cloud: the
					// account is created, the workspace step waits for the sign-in.
					const message =
						signInError.code === "EMAIL_NOT_VERIFIED"
							? "Your account was created. Verify your email address, then sign in to finish setting up your workspace."
							: signInError.message ||
								"Your account was created. Sign in to continue.";
					toast.info(message);
					setError(message);
					window.location.assign(LOGIN_PATH);
					return;
				}
			}

			toast.success("Account created successfully");
			// Document navigation so the next request carries the fresh session.
			window.location.assign(CHANNELS_PATH);
		} catch {
			toast.error("An error occurred while creating your account");
		} finally {
			setIsRegisterLoading(false);
		}
	};

	const emailError = registerForm.formState.errors.email?.message;
	const passwordError = registerForm.formState.errors.password?.message;
	const confirmPasswordError =
		registerForm.formState.errors.confirmPassword?.message;

	const form = (
		<form
			method="post"
			onSubmit={registerForm.handleSubmit(onSubmit)}
			className="mt-5 space-y-5"
			id="register-form"
		>
			<Field
				label={fieldLabel("Email")}
				error={emailError ? { message: emailError, match: true } : undefined}
			>
				<Input
					type="email"
					autoComplete="email"
					size="lg"
					aria-invalid={Boolean(emailError)}
					className="bg-zenth-base rounded-[3px]"
					{...registerForm.register("email")}
				/>
			</Field>

			<Field
				label={
					<>
						{fieldLabel("Password")}
						{passwordError && (
							<span className="ml-2 text-xs font-normal text-zenth-danger normal-case">
								— {passwordError}
							</span>
						)}
					</>
				}
			>
				<div className="relative w-full">
					<Input
						type={showPassword ? "text" : "password"}
						autoComplete="new-password"
						size="lg"
						aria-invalid={Boolean(passwordError)}
						className="w-full bg-zenth-base rounded-[3px] pr-11"
						{...registerForm.register("password")}
					/>
					<Button
						type="button"
						variant="ghost"
						shape="square"
						size="sm"
						onClick={() => setShowPassword((value) => !value)}
						aria-label={showPassword ? "Hide password" : "Show password"}
						aria-pressed={showPassword}
						className="absolute top-1/2 right-1.5 -translate-y-1/2 text-zenth-subtle hover:text-zenth-default"
					>
						{showPassword ? (
							<EyeSlashIcon className="size-4" />
						) : (
							<EyeIcon className="size-4" />
						)}
					</Button>
				</div>
			</Field>

			<Field
				label={
					<>
						{fieldLabel("Confirm password")}
						{confirmPasswordError && (
							<span className="ml-2 text-xs font-normal text-zenth-danger normal-case">
								— {confirmPasswordError}
							</span>
						)}
					</>
				}
			>
				<div className="relative w-full">
					<Input
						type={showConfirmPassword ? "text" : "password"}
						autoComplete="new-password"
						size="lg"
						aria-invalid={Boolean(confirmPasswordError)}
						className="w-full bg-zenth-base rounded-[3px] pr-11"
						{...registerForm.register("confirmPassword")}
					/>
					<Button
						type="button"
						variant="ghost"
						shape="square"
						size="sm"
						onClick={() => setShowConfirmPassword((value) => !value)}
						aria-label={
							showConfirmPassword
								? "Hide password confirmation"
								: "Show password confirmation"
						}
						aria-pressed={showConfirmPassword}
						className="absolute top-1/2 right-1.5 -translate-y-1/2 text-zenth-subtle hover:text-zenth-default"
					>
						{showConfirmPassword ? (
							<EyeSlashIcon className="size-4" />
						) : (
							<EyeIcon className="size-4" />
						)}
					</Button>
				</div>
			</Field>

			{error && (
				<Text
					variant="secondary"
					size="xs"
					as="p"
					DANGEROUS_className="text-xs leading-snug text-zenth-danger"
				>
					{error}
				</Text>
			)}

			<Button
				type="submit"
				variant="primary"
				size="lg"
				className="mt-1 w-full justify-center rounded-[3px]"
				loading={isRegisterLoading}
			>
				Create account
			</Button>
		</form>
	);

	return (
		<AuthLayout
			pageTitle="Astron Collection | Create your account"
			headingId="register-heading"
			title="Create an account"
			subtitle="We're so excited to see you again!"
			action={
				IS_CLOUD ? (
					<Button variant="secondary" onClick={() => router.push(LOGIN_PATH)}>
						Login
					</Button>
				) : undefined
			}
			footnote={
				<>
					{IS_CLOUD && (
						<>
							<div className="text-center">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="mx-auto text-xs text-zenth-subtle"
									onClick={() => setShowMoreOptions((value) => !value)}
									aria-expanded={showMoreOptions}
								>
									{showMoreOptions
										? "Hide sign-up options"
										: "More sign-up options"}
								</Button>
							</div>
							{showMoreOptions && (
								<div className="mt-3 grid grid-cols-2 gap-2">
									<Button
										variant="outline"
										size="lg"
										className="w-full justify-center rounded-[3px]"
										loading={socialLoading === "google"}
										disabled={socialLoading !== null}
										onClick={() => onSocialSignUp("google")}
									>
										<GoogleMark />
										Google
									</Button>
									<Button
										variant="outline"
										size="lg"
										className="w-full justify-center rounded-[3px]"
										icon={GithubLogoIcon}
										loading={socialLoading === "github"}
										disabled={socialLoading !== null}
										onClick={() => onSocialSignUp("github")}
									>
										GitHub
									</Button>
									<Button
										variant="outline"
										size="lg"
										className="w-full justify-center rounded-[3px]"
										icon={DiscordLogoIcon}
										loading={socialLoading === "discord"}
										disabled={socialLoading !== null}
										onClick={() => onSocialSignUp("discord")}
									>
										Discord
									</Button>
									<Button
										variant="outline"
										size="lg"
										className="w-full justify-center rounded-[3px]"
										loading={socialLoading === "microsoft"}
										disabled={socialLoading !== null}
										onClick={() => onSocialSignUp("microsoft")}
									>
										<MicrosoftMark />
										Microsoft
									</Button>
								</div>
							)}
						</>
					)}
					<Text
						variant="secondary"
						size="xs"
						as="p"
						DANGEROUS_className="mt-4 text-center leading-relaxed text-zenth-subtle"
					>
						By continuing, you agree to the Astron Collection{" "}
						<AuthLink
							href="https://astron-collection.com/legal/terms"
							external
							inline
						>
							Terms of Service
						</AuthLink>
						,{" "}
						<AuthLink
							href="https://astron-collection.com/legal/privacy"
							external
							inline
						>
							Privacy Policy
						</AuthLink>{" "}
						and{" "}
						<AuthLink
							href="https://astron-collection.com/legal/cookies"
							external
							inline
						>
							Cookie Policy
						</AuthLink>
						.
					</Text>
				</>
			}
		>
			{form}
			<Text
				variant="secondary"
				size="sm"
				as="p"
				DANGEROUS_className="mt-3 text-sm text-zenth-subtle"
			>
				Have an account? <AuthLink href={LOGIN_PATH}>Login</AuthLink>
			</Text>
		</AuthLayout>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	const helpers = generateServerSideHelper(appRouter, context);
	// Prefetch the public branding so the onboarding logo and app name render
	// correctly on the server (no flash of default branding).
	await helpers.whitelabeling.getPublic.prefetch();

	if (IS_CLOUD) {
		try {
			const { user, session } = await validateRequest(context.req);
			if (user) {
				// The active organization stored on the session may have been
				// deleted since: persisted memberships decide the destination.
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
				IS_CLOUD: true,
			},
		};
	}

	const hasAdmin = await isAdminPresent();

	if (hasAdmin) {
		return {
			redirect: {
				permanent: false,
				destination: LOGIN_PATH,
			},
		};
	}

	return {
		props: {
			trpcState: helpers.dehydrate(),
			IS_CLOUD: false,
		},
	};
}
