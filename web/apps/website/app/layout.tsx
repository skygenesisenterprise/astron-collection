import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import type { ReactNode } from "react";
import "@company/react/styles.css";
import "@/styles/tailwind.css";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ThemeProvider } from "@/components/site/ThemeProvider";
import { ZenthProvider } from "@/components/site/ZenthProvider";
import { SITE_URL } from "@/lib/domain/queries";

const inter = Inter({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-inter",
});

const lexend = Lexend({
	subsets: ["latin"],
	display: "swap",
	variable: "--font-lexend",
});

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: "Company — Cloud infrastructure. Without boundaries.",
		template: "%s | Company",
	},
	description:
		"Hybrid cloud infrastructure from Company: compute, storage, networking, managed services and hosting on owned and partner infrastructure. Availability and pricing published per product and region.",
	applicationName: "Company",
	icons: {
		icon: "/icon.svg",
		apple: "/apple-touch-icon.png",
	},
	openGraph: {
		title: "Company — Cloud infrastructure. Without boundaries.",
		description:
			"Compute, storage, networking and managed services on owned and partner infrastructure. European roots. Global ambitions.",
		url: SITE_URL,
		siteName: "Company",
		locale: "en_GB",
		type: "website",
		images: "/og.png",
	},
	twitter: {
		card: "summary_large_image",
		title: "Company — Cloud infrastructure. Without boundaries.",
		description:
			"Hybrid cloud infrastructure with availability published per product and region.",
		images: ["/og.png"],
	},
};

/**
 * The public site is light-only. Declaring the mode here — `data-mode`,
 * `data-zenth-mode`, `color-scheme: light` through the light token block — makes
 * every page resolve the light values of the library's `light-dark()` tokens,
 * regardless of the visitor's OS preference or a legacy theme cookie. The dark
 * theme remains in the design system, unused by the public site.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			data-zenth-mode="light"
			data-mode="light"
			className={`${inter.variable} ${lexend.variable}`}
			suppressHydrationWarning
		>
			<body className="bg-background text-foreground">
				<ZenthProvider>
					<ThemeProvider initialTheme="light">
						<a
							href="#main-content"
							className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
						>
							Skip to content
						</a>
						<div className="flex min-h-svh flex-col bg-background">
							<SiteHeader />
							<main id="main-content" tabIndex={-1} className="flex-1">
								{children}
							</main>
							<SiteFooter />
						</div>
					</ThemeProvider>
				</ZenthProvider>
			</body>
		</html>
	);
}
