import { SITE_URL } from "@/lib/content/links";
import { site } from "@/lib/content/site";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

// Same face and loading strategy as the documentation site.
const inter = Inter({ subsets: ["latin"], display: "swap" });
import { themeScript } from "@/lib/theme-script";
import { Footer } from "@/components/navigation/Footer";
import { Header } from "@/components/navigation/Header";
import "@/styles/tailwind.css";
import type { ReactNode } from "react";

export const metadata: Metadata = {
	metadataBase: new URL(SITE_URL),
	title: {
		default: `${site.name} — ${site.tagline}`,
		template: `%s | ${site.name}`,
	},
	description: site.description,
	applicationName: site.name,
	icons: {
		// The official mark is `public/astron.png`; the smaller sizes are derived
		// from it by `scripts/generate-brand-assets.mjs`.
		icon: [
			{ url: "/astron.png", type: "image/png" },
			{ url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
		],
		apple: "/apple-touch-icon.png",
	},
	openGraph: {
		title: `${site.name} — ${site.tagline}`,
		description: site.description,
		url: SITE_URL,
		siteName: site.name,
		locale: "en_GB",
		type: "website",
		images: [{ url: "/og.png", width: 1200, height: 630, alt: site.name }],
	},
	twitter: {
		card: "summary_large_image",
		title: `${site.name} — ${site.tagline}`,
		description: site.description,
		images: ["/og.png"],
	},
	alternates: { canonical: SITE_URL },
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html
			lang="en"
			className={`dark ${inter.className} h-full antialiased`}
			suppressHydrationWarning
		>
			<head>
				{/* Resolves the theme before paint, so there is no light/dark flash. */}
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body className="flex min-h-full flex-col bg-background text-foreground">
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
				>
					Skip to content
				</a>
				<Header />
				<main id="main-content" tabIndex={-1} className="flex-1">
					{children}
				</main>
				<Footer />
			</body>
		</html>
	);
}
