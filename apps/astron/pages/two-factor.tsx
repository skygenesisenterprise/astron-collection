import { Banner, Button, Field, Input, Text } from "@astron-collection/react";
import { validateRequest } from "@astron-collection/server/lib/auth";
import { KeyIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { startAuthentication } from "@simplewebauthn/browser";
import type { GetServerSidePropsContext } from "next";
import { useRouter } from "next/router";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthLayout, fieldLabel } from "@/components/auth/auth-layout";
import { authClient } from "@/lib/auth-client";
import {
	getTwoFactorMethod,
	isCeremonyCancellation,
	requestWebAuthnTwoFactorOptions,
	type TwoFactorMethodSummary,
	verifySecurityKeyBackupCode,
	verifyWebAuthnTwoFactor,
} from "@/lib/webauthn-two-factor";

/** The second factor is the last step of a sign-in the login page started. */
const LOGIN_PATH = "/login";
/**
 * Leaving the challenge on purpose. The login page resumes a pending factor, so
 * its restart flag is what keeps "Back to sign in" from bouncing back here.
 */
const RESTART_LOGIN_PATH = "/login?restart=1";

/** The factor the account must present after its password. */
type Factor = "totp" | "securityKey";

/** `loading` until the pending challenge has been read from the server. */
type PageState = "loading" | "ready" | "expired";

/**
 * Workspace an authenticated user belongs to. Resolved on the server from the
 * session, never from client state or a query parameter.
 */
function workspaceDestination(organizationId: string | null | undefined) {
	return organizationId ? `/${organizationId}/home` : "/dashboard/home";
}

/**
 * Accounts that never picked a factor accept both: the authenticator app is the
 * default and the page offers the security key when one is registered.
 */
function resolveFactor(summary: TwoFactorMethodSummary): Factor {
	if (summary.method === "securityKey") return "securityKey";
	if (summary.method === "totp") return "totp";
	return summary.hasTotp
		? "totp"
		: summary.hasSecurityKey
			? "securityKey"
			: "totp";
}

/**
 * Maps the server's error codes to what the user can act on. `null` means the
 * pending password step is gone and the page must restart the sign-in.
 */
function messageForCode(code: string | undefined): string | null | undefined {
	switch (code) {
		case "INVALID_CODE":
			return "That authenticator code is not valid. Check the code and try again.";
		case "INVALID_BACKUP_CODE":
			return "That recovery code is invalid or was already used.";
		case "NO_SECURITY_KEY":
			return "No security key is registered on this account. Use a recovery code instead.";
		case "SECURITY_KEY_DISABLED":
			return "This account signs in with authenticator codes. Enter the code from your app instead.";
		case "SECURITY_KEY_REQUIRED":
			return "This account requires a security key. Use your security key instead of a code.";
		case "SECURITY_KEY_VERIFICATION_FAILED":
			return "The security key could not be verified. Try again or use a recovery code.";
		case "SECURITY_KEY_NOT_FOUND":
			return "This security key is not registered on the account. Try another key.";
		case "SECURITY_KEY_REGISTRATION_EXPIRED":
		case "INVALID_TWO_FACTOR_CHALLENGE":
		case "INVALID_TWO_FACTOR_COOKIE":
			return null;
		case "TOO_MANY_ATTEMPTS_REQUEST_NEW_CODE":
			return "Too many attempts. Sign in again to request a new code.";
		case "ACCOUNT_TEMPORARILY_LOCKED":
			return "Too many attempts. This account is temporarily locked.";
		default:
			return undefined;
	}
}

export default function TwoFactorPage() {
	const router = useRouter();
	const [summary, setSummary] = useState<TwoFactorMethodSummary | null>(null);
	const [factor, setFactor] = useState<Factor | null>(null);
	const [state, setState] = useState<PageState>("loading");
	const [code, setCode] = useState("");
	const [recoveryMode, setRecoveryMode] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isKeyLoading, setIsKeyLoading] = useState(false);

	// The pending two-factor cookie is the only handle on this step: the method
	// endpoint reads it, so the page knows what the account is configured with.
	useEffect(() => {
		let cancelled = false;

		const load = async () => {
			const { summary: loaded, error: loadError } = await getTwoFactorMethod();
			if (cancelled) return;
			if (loadError || !loaded) {
				setState("expired");
				return;
			}
			setSummary(loaded);
			setFactor(resolveFactor(loaded));
			setState("ready");
		};

		load().catch(() => {
			if (!cancelled) setState("expired");
		});

		return () => {
			cancelled = true;
		};
	}, []);

	const handleAuthError = (
		authError: { code?: string; message?: string } | null,
	) => {
		const known = messageForCode(authError?.code);
		if (known === null) {
			setState("expired");
			return;
		}

		const message =
			known ?? authError?.message ?? "We couldn't verify that. Try again.";
		setError(message);
		toast.error(message);
	};

	/**
	 * Completes the sign-in as a document navigation: the next request carries
	 * the fresh session cookie, so `/login` answers with a redirect to the
	 * workspace instead of the client guessing the organization.
	 */
	const finish = () => {
		toast.success("Signed in successfully");
		window.location.assign(LOGIN_PATH);
	};

	const toggleRecovery = () => {
		setRecoveryMode((value) => !value);
		setCode("");
		setError(null);
	};

	const useSecurityKeyInstead = () => {
		setFactor("securityKey");
		setRecoveryMode(false);
		setCode("");
		setError(null);
	};

	const onSubmitCode = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isSubmitting) return;

		const value = code.trim();
		if (!value) {
			setError(
				recoveryMode
					? "Enter one of your recovery codes."
					: "Enter the code from your authenticator app.",
			);
			return;
		}

		setIsSubmitting(true);
		setError(null);
		try {
			// A security-key account only has its own recovery codes: better-auth's
			// backup codes stop working once that factor is selected.
			if (factor === "securityKey") {
				const { token, error: verifyError } =
					await verifySecurityKeyBackupCode(value);
				if (verifyError || !token) {
					handleAuthError(verifyError);
					return;
				}
				finish();
				return;
			}

			const { error: verifyError } = recoveryMode
				? await authClient.twoFactor.verifyBackupCode({ code: value })
				: await authClient.twoFactor.verifyTotp({ code: value });
			if (verifyError) {
				handleAuthError(verifyError);
				return;
			}
			finish();
		} catch {
			setError("We couldn't complete the verification. Try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const signInWithSecurityKey = async () => {
		if (isKeyLoading) return;

		setIsKeyLoading(true);
		setError(null);
		try {
			const { options, error: optionsError } =
				await requestWebAuthnTwoFactorOptions();
			if (optionsError || !options) {
				handleAuthError(optionsError);
				return;
			}

			const assertion = await startAuthentication({ optionsJSON: options });
			const { token, error: verifyError } =
				await verifyWebAuthnTwoFactor(assertion);
			if (verifyError || !token) {
				handleAuthError(verifyError);
				return;
			}
			finish();
		} catch (caught) {
			// Dismissing the browser's key prompt is not an error worth a banner
			// toast, but the page must stay usable for a second attempt.
			if (isCeremonyCancellation(caught)) {
				setError(
					"The security key prompt was cancelled. Try again when you're ready.",
				);
				return;
			}
			const message =
				caught instanceof Error
					? caught.message
					: "The security key could not be used.";
			setError(message);
			toast.error(message);
		} finally {
			setIsKeyLoading(false);
		}
	};

	const isSecurityKeyScreen = state === "ready" && factor === "securityKey";
	const heading = isSecurityKeyScreen
		? "Verify with a security key"
		: "Two-factor authentication";
	const subtitle =
		state === "loading"
			? "Checking your sign-in…"
			: isSecurityKeyScreen
				? "Use the security key registered on this account."
				: "Enter a code from your authenticator app.";

	const errorBanner = error && (
		<Banner
			variant="error"
			size="sm"
			icon={<WarningCircleIcon className="size-4" />}
			description={error}
			className="mt-5"
		/>
	);

	const panel = (() => {
		if (state === "loading") {
			return (
				<Text
					variant="secondary"
					size="sm"
					as="p"
					DANGEROUS_className="mt-5 text-center text-zenth-subtle"
				>
					Waiting for the server…
				</Text>
			);
		}

		if (state === "expired") {
			return (
				<>
					<Banner
						variant="secondary"
						size="sm"
						icon={<WarningCircleIcon className="size-4" />}
						description="This sign-in expired or was already used. Sign in again to start a new one."
						className="mt-5"
					/>
					<Button
						type="button"
						variant="primary"
						size="lg"
						className="mt-4 w-full justify-center rounded-[3px]"
						onClick={() => router.replace(RESTART_LOGIN_PATH)}
					>
						Return to sign in
					</Button>
				</>
			);
		}

		if (isSecurityKeyScreen) {
			return (
				<>
					<div className="mt-5 flex justify-center">
						<KeyIcon
							className="size-14 text-zenth-brand"
							weight="duotone"
							aria-hidden="true"
						/>
					</div>
					<Text
						variant="secondary"
						size="sm"
						as="p"
						DANGEROUS_className="mt-4 text-center leading-relaxed text-zenth-subtle"
					>
						Insert your security key and touch it to verify your identity. If
						your device offers a passkey, confirm with Face ID, a fingerprint or
						your screen lock.
					</Text>

					{errorBanner}

					{recoveryMode ? (
						<form
							method="post"
							onSubmit={onSubmitCode}
							className="mt-5 space-y-5"
							id="two-factor-recovery-form"
						>
							<Field
								label={fieldLabel("Recovery code")}
								description="Codes look like ABCDE-FGHJKM. Each one works only once."
							>
								<Input
									name="recoveryCode"
									placeholder="ABCDE-FGHJKM"
									autoComplete="one-time-code"
									autoCapitalize="characters"
									spellCheck={false}
									maxLength={11}
									size="lg"
									autoFocus
									value={code}
									onChange={(event) => setCode(event.target.value)}
									className="bg-zenth-base rounded-[3px]"
								/>
							</Field>

							<Button
								type="submit"
								variant="primary"
								size="lg"
								className="w-full justify-center rounded-[3px]"
								loading={isSubmitting}
							>
								Verify recovery code
							</Button>
							<div className="text-center">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="mx-auto text-zenth-subtle"
									onClick={toggleRecovery}
								>
									Use your security key instead
								</Button>
							</div>
						</form>
					) : (
						<div className="mt-5 space-y-3">
							<Button
								type="button"
								variant="primary"
								size="lg"
								icon={KeyIcon}
								className="w-full justify-center rounded-[3px]"
								loading={isKeyLoading}
								onClick={signInWithSecurityKey}
							>
								Use security key
							</Button>
							<div className="text-center">
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="mx-auto text-zenth-subtle"
									onClick={toggleRecovery}
								>
									Can&apos;t access your 2FA device or backup codes?
								</Button>
							</div>
						</div>
					)}
				</>
			);
		}

		return (
			<>
				{errorBanner}

				<form
					method="post"
					onSubmit={onSubmitCode}
					className="mt-5 space-y-5"
					id="two-factor-form"
				>
					<Field
						label={fieldLabel(
							recoveryMode ? "Recovery code" : "Authenticator app code",
						)}
						description={
							recoveryMode
								? "Codes look like ABCDE-FGHJKM. Each one works only once."
								: "The 6-digit code from your authenticator app."
						}
					>
						<Input
							name="code"
							placeholder={recoveryMode ? "ABCDE-FGHJKM" : "123456"}
							autoComplete="one-time-code"
							inputMode={recoveryMode ? "text" : "numeric"}
							autoCapitalize={recoveryMode ? "characters" : "off"}
							spellCheck={false}
							maxLength={recoveryMode ? 11 : 6}
							size="lg"
							autoFocus
							value={code}
							onChange={(event) => setCode(event.target.value)}
							className="bg-zenth-base rounded-[3px]"
						/>
					</Field>

					<div className="text-center">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="mx-auto text-zenth-subtle"
							onClick={toggleRecovery}
						>
							{recoveryMode
								? "Use your authenticator app instead"
								: "Can't access your 2FA device or backup codes?"}
						</Button>
					</div>

					<Button
						type="submit"
						variant="primary"
						size="lg"
						className="w-full justify-center rounded-[3px]"
						loading={isSubmitting}
					>
						Login
					</Button>
				</form>

				{summary?.method === null && summary.hasSecurityKey && (
					<div className="mt-3 text-center">
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="mx-auto text-zenth-subtle"
							onClick={useSecurityKeyInstead}
						>
							Use a security key instead
						</Button>
					</div>
				)}
			</>
		);
	})();

	return (
		<AuthLayout
			pageTitle="Astron Collection | Two-factor authentication"
			headingId="two-factor-heading"
			title={heading}
			subtitle={subtitle}
			action={
				<Button
					variant="secondary"
					onClick={() => router.push(RESTART_LOGIN_PATH)}
				>
					Back to sign in
				</Button>
			}
			footnote={
				state === "ready" && (
					<Text
						variant="secondary"
						size="xs"
						as="p"
						DANGEROUS_className="text-center leading-relaxed text-zenth-subtle"
					>
						Lost access to your 2FA device and recovery codes? Contact your
						administrator to unlock the account.
					</Text>
				)
			}
		>
			<div aria-busy={state === "loading"}>{panel}</div>
		</AuthLayout>
	);
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
	// A session means this step already passed: the page must not offer a
	// second factor to a signed-in user.
	try {
		const { user, session } = await validateRequest(context.req);
		if (user) {
			return {
				redirect: {
					permanent: false,
					destination: workspaceDestination(session?.activeOrganizationId),
				},
			};
		}
	} catch {
		// No session is the expected case for a pending second factor.
	}

	return { props: {} };
}
