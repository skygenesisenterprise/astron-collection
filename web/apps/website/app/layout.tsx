import type { Metadata } from "next";
import { Inter, Lexend } from "next/font/google";
import type { ReactNode } from "react";
import "@astron-collection/react/styles.css";
import "@/styles/tailwind.css";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { ThemeProvider } from "@/components/site/ThemeProvider";
import { ZenthProvider } from "@/components/site/ZenthProvider";
import { siteTitle } from "@/lib/content/site";
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
		default: siteTitle,
		template: "%s | Astron Collection",
	},
	description:
		"Hybrid cloud infrastructure from Astron Collection: compute, storage, networking, managed services and hosting on owned and partner infrastructure. Availability and pricing published per product and region.",
	applicationName: "Astron Collection",
	icons: {
		icon: "/icon.svg",
		apple: "/apple-touch-icon.png",
	},
	openGraph: {
		title: siteTitle,
		description:
			"Compute, storage, networking and managed services on owned and partner infrastructure. European roots. Global ambitions.",
		url: SITE_URL,
		siteName: "Astron Collection",
		locale: "en_GB",
		type: "website",
		images: "/og.png",
	},
	twitter: {
		card: "summary_large_image",
		title: siteTitle,
		description:
			"Hybrid cloud infrastructure with availability published per product and region.",
		images: ["/og.png"],
	},
};

/**
 * The public site defaults to dark mode. Declaring the mode on the initial HTML
 * keeps the first render aligned with the design system before hydration.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			data-theme="dark"
			data-zenth-mode="dark"
			data-mode="dark"
			className={`dark ${inter.variable} ${lexend.variable}`}
			suppressHydrationWarning
		>
			<body className="bg-background text-foreground">
				<ZenthProvider>
					<ThemeProvider initialTheme="dark">
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
