import { Text } from "@astron-collection/react";
import Head from "next/head";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { useWhitelabelingPublic } from "@/utils/hooks/use-whitelabeling";

/** Stars scattered across the night half of the backdrop. */
const NIGHT_STARS: Array<[number, number, number]> = [
	[120, 140, 1.8],
	[210, 250, 1.4],
	[70, 330, 1.2],
	[300, 190, 2],
	[380, 320, 1.3],
	[160, 430, 1.6],
	[260, 520, 1.2],
	[90, 560, 2.2],
	[420, 120, 1.4],
	[330, 600, 1.7],
	[470, 420, 1.1],
	[520, 260, 1.5],
	[40, 700, 1.3],
	[210, 660, 1.9],
	[400, 740, 1.2],
	[140, 60, 1.1],
	[500, 600, 1.6],
];

/**
 * Painted backdrop: a night half with a star field, and a flat-illustration
 * landscape running under the card to the right edge.
 */
function AuthBackdrop() {
	return (
		<div
			aria-hidden="true"
			className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
		>
			<div className="absolute inset-0 bg-[#0e1219]" />
			<div className="absolute inset-0 bg-[radial-gradient(120%_100%_at_18%_0%,#1b2637_0%,#121821_46%,#0c0f15_100%)]" />

			{/* Star field, kept on the night side only. */}
			<svg
				className="absolute inset-0 h-full w-full opacity-70"
				viewBox="0 0 1440 900"
				preserveAspectRatio="xMidYMid slice"
			>
				{NIGHT_STARS.map(([x, y, r]) => (
					<circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#dbe7f5" />
				))}
			</svg>

			{/* Landscape panel, faded into the night side. */}
			<div className="absolute inset-y-0 right-0 hidden w-[54%] [mask-image:linear-gradient(to_right,transparent,black_4rem)] md:block">
				<svg
					className="h-full w-full"
					viewBox="0 0 800 900"
					preserveAspectRatio="xMaxYMid slice"
				>
					<defs>
						<linearGradient id="auth-sky" x1="0.1" y1="0" x2="0.4" y2="1">
							<stop offset="0%" stopColor="#f5f0e8" />
							<stop offset="48%" stopColor="#e4e8e4" />
							<stop offset="100%" stopColor="#c7dcdc" />
						</linearGradient>
						<linearGradient id="auth-crystal" x1="0" y1="0" x2="0.4" y2="1">
							<stop offset="0%" stopColor="#57a8b3" />
							<stop offset="55%" stopColor="#36818f" />
							<stop offset="100%" stopColor="#22616f" />
						</linearGradient>
						<linearGradient id="auth-mint" x1="0" y1="0" x2="0.3" y2="1">
							<stop offset="0%" stopColor="#c3f0df" />
							<stop offset="100%" stopColor="#82cdbb" />
						</linearGradient>
						<linearGradient id="auth-purple" x1="0" y1="0" x2="0.5" y2="1">
							<stop offset="0%" stopColor="#9d8ab5" />
							<stop offset="100%" stopColor="#6b5b8a" />
						</linearGradient>
						<linearGradient id="auth-sand" x1="0.1" y1="0" x2="0.8" y2="1">
							<stop offset="0%" stopColor="#f4ddd5" />
							<stop offset="55%" stopColor="#dda79e" />
							<stop offset="100%" stopColor="#c08a84" />
						</linearGradient>
						<linearGradient id="auth-water" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="#3a879c" />
							<stop offset="60%" stopColor="#236880" />
							<stop offset="100%" stopColor="#163f52" />
						</linearGradient>
					</defs>

					<rect width="800" height="900" fill="url(#auth-sky)" />

					{/* Mist banks drifting over the valley */}
					<path
						d="M-40 30 Q120 -50 300 6 Q392 36 344 118 Q310 196 176 198 Q34 198 -40 132 Z"
						fill="#faf6ef"
						opacity="0.92"
					/>
					<path
						d="M-40 168 Q86 112 206 150 Q262 170 220 226 Q156 272 26 240 Z"
						fill="#efe9e0"
						opacity="0.7"
					/>

					{/* Crystal peaks */}
					<path
						d="M330 500 L432 210 L540 500 Z"
						fill="url(#auth-crystal)"
						opacity="0.8"
					/>
					<path
						d="M432 210 L468 322 L396 322 Z"
						fill="url(#auth-mint)"
						opacity="0.5"
					/>
					<path d="M470 500 L612 96 L762 500 Z" fill="url(#auth-crystal)" />
					<path
						d="M612 96 L658 254 L568 254 Z"
						fill="url(#auth-mint)"
						opacity="0.72"
					/>
					<path d="M612 96 L762 500 L660 500 Z" fill="#1f5b69" opacity="0.5" />
					<path
						d="M712 500 L838 190 L910 500 Z"
						fill="url(#auth-crystal)"
						opacity="0.7"
					/>

					{/* Haze across the valley */}
					<path
						d="M-40 452 Q120 396 268 436 Q412 476 556 430 Q694 386 840 424 L840 500 L-40 500 Z"
						fill="#ffffff"
						opacity="0.16"
					/>

					{/* Glacier shelf */}
					<path
						d="M288 500 L470 424 L648 476 L820 432 L840 500 L840 556 L288 556 Z"
						fill="url(#auth-mint)"
						opacity="0.5"
					/>

					{/* Mauve ridges */}
					<path
						d="M282 636 L428 500 L524 552 L616 486 L748 636 Z"
						fill="url(#auth-purple)"
						opacity="0.72"
					/>
					<path
						d="M616 486 L748 636 L840 636 L840 520 Z"
						fill="#6a5b87"
						opacity="0.68"
					/>

					{/* Teal terraces */}
					<path
						d="M-40 706 L132 656 L284 696 L426 642 L566 692 L706 646 L840 686 L840 786 L-40 786 Z"
						fill="#2c7a8c"
					/>
					<path
						d="M-40 728 L154 682 L304 720 L454 668 L606 716 L764 672 L840 704 L840 790 L-40 790 Z"
						fill="#21627a"
						opacity="0.5"
					/>

					{/* Pink rock tower */}
					<path
						d="M840 372 L744 428 L710 558 L676 722 L662 900 L840 900 Z"
						fill="url(#auth-sand)"
					/>
					<path
						d="M840 372 L796 440 L782 622 L812 762 L840 816 Z"
						fill="#f9e6df"
						opacity="0.6"
					/>
					<path
						d="M710 558 L676 900 L726 900 L734 722 L718 640 Z"
						fill="#b57f7a"
						opacity="0.5"
					/>
					<path
						d="M676 592 q28 -40 66 -22 q32 18 20 50 q-26 22 -66 12 q-28 -10 -20 -40 Z"
						fill="#d9d0e2"
					/>
					<path
						d="M676 592 q28 -40 66 -22 q-22 8 -66 22 Z"
						fill="#efe9f1"
						opacity="0.8"
					/>

					{/* Pines along the ridges */}
					<g fill="#173e46">
						<path d="M556 486 L570 522 L542 522 Z" />
						<path d="M574 470 L590 514 L558 514 Z" />
						<path d="M642 514 L654 546 L630 546 Z" />
						<path d="M714 552 L726 584 L702 584 Z" />
						<path d="M420 556 L432 588 L408 588 Z" />
						<path d="M438 540 L452 580 L424 580 Z" />
					</g>
					<g fill="#20505a" opacity="0.75">
						<path d="M604 522 L614 548 L594 548 Z" />
						<path d="M736 596 L746 622 L726 622 Z" />
					</g>

					{/* Rocks in the shallows */}
					<path
						d="M596 726 q34 -46 86 -24 q40 18 30 58 q-32 26 -84 14 q-38 -14 -32 -48 Z"
						fill="#7fb0bd"
					/>
					<path
						d="M596 726 q34 -46 86 -24 q-24 12 -86 24 Z"
						fill="#cae6e7"
						opacity="0.8"
					/>

					{/* Water */}
					<path
						d="M-40 764 L140 728 L322 762 L502 726 L662 762 L840 730 L840 900 L-40 900 Z"
						fill="url(#auth-water)"
					/>
					<g fill="#a6d3d9" opacity="0.26">
						<ellipse cx="96" cy="820" rx="56" ry="12" />
						<ellipse cx="300" cy="848" rx="72" ry="14" />
						<ellipse cx="520" cy="812" rx="50" ry="11" />
						<ellipse cx="704" cy="856" rx="78" ry="15" />
					</g>
					<path
						d="M572 800 q40 -14 82 -2 q-40 16 -82 2 Z"
						fill="#d9eeee"
						opacity="0.3"
					/>

					{/* Stone path and foreground rocks */}
					<path
						d="M-40 856 L60 822 L180 850 L286 826 L356 866 L356 900 L-40 900 Z"
						fill="#1b3546"
					/>
					<path d="M360 900 L470 846 L600 870 L566 900 Z" fill="#d3c2b1" />
					<path d="M566 900 L662 862 L784 886 L762 900 Z" fill="#c4b3a2" />
					<path
						d="M566 900 L662 862 L702 874 L624 900 Z"
						fill="#b3a292"
						opacity="0.7"
					/>
					<path d="M700 900 L762 862 L840 882 L840 900 Z" fill="#1a3341" />
				</svg>
			</div>

			{/* Keeps the header legible over the illustration. */}
			<div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/30 to-transparent" />
		</div>
	);
}

/** Small, tracked, uppercase label used above each credential field. */
export function fieldLabel(text: string) {
	return (
		<span className="text-xs font-bold tracking-[0.02em] text-zenth-subtle uppercase">
			{text}
		</span>
	);
}

interface AuthLayoutProps {
	/** Browser tab title. */
	pageTitle: string;
	/** Visible heading of the card. */
	title: string;
	/** Optional line under the heading. */
	subtitle?: ReactNode;
	/** Id the section is labelled by, and that the heading carries. */
	headingId: string;
	/** Header control on the right (sign up, back to sign in, …). */
	action?: ReactNode;
	/** Content rendered under the card: legal text, extra sign-in options. */
	footnote?: ReactNode;
	children: ReactNode;
}

/**
 * Frame shared by the authentication pages: painted backdrop, branded header
 * and the dark credentials card.
 */
export function AuthLayout({
	pageTitle,
	title,
	subtitle,
	headingId,
	action,
	footnote,
	children,
}: AuthLayoutProps) {
	const { config: whitelabeling } = useWhitelabelingPublic();
	const logoSrc =
		whitelabeling?.loginLogoUrl || whitelabeling?.logoUrl || undefined;

	return (
		<main
			data-zenth-mode="dark"
			className="relative isolate min-h-svh overflow-x-hidden bg-zenth-base text-zenth-default"
		>
			<Head>
				<title>{pageTitle}</title>
			</Head>
			<AuthBackdrop />

			<div className="relative z-10 min-h-svh">
				<header className="absolute inset-x-0 top-0 z-10 flex h-20 items-center justify-between gap-4 px-5 sm:px-8">
					<NextLink
						href="/"
						className="flex items-center gap-2.5 rounded-md focus:ring-2 focus:ring-zenth-focus focus:outline-hidden"
						aria-label="Astron Collection home"
					>
						{/* biome-ignore lint/performance/noImgElement: whitelabel logo URL is user-provided, next/image cannot optimize it */}
						<img
							src={logoSrc ?? "/icon-dark.svg"}
							alt=""
							className="size-9 object-contain"
						/>
						<span className="text-[15px] font-semibold tracking-tight text-zenth-strong">
							Astron Collection
						</span>
					</NextLink>

					{action && <div className="flex items-center gap-2">{action}</div>}
				</header>

				<section
					aria-labelledby={headingId}
					className="flex min-h-svh items-center justify-center px-4 py-24"
				>
					<div className="w-full max-w-[30rem]">
						<div className="rounded-[5px] bg-zenth-elevated p-6 shadow-[0_2px_10px_rgba(0,0,0,0.2),0_0_0_1px_rgba(0,0,0,0.25)] sm:p-8">
							<div className="text-center">
								<Text
									id={headingId}
									variant="heading1"
									as="h1"
									DANGEROUS_className="text-[24px] leading-[30px] font-normal tracking-[-0.01em] text-zenth-strong"
								>
									{title}
								</Text>
								{subtitle && (
									<Text
										variant="secondary"
										size="sm"
										as="p"
										DANGEROUS_className="mt-2 text-base leading-5 text-zenth-subtle"
									>
										{subtitle}
									</Text>
								)}
							</div>

							{children}
						</div>

						{footnote && <div className="mt-5 w-full px-1">{footnote}</div>}
					</div>
				</section>
			</div>
		</main>
	);
}
