// Static export target for GitHub Pages. The Docker image keeps the default
// server output, so API routes (contact, OG image) stay available there while
// the Pages build is plain HTML.
const isStaticExport = process.env.NEXT_OUTPUT === "export";
const basePath = process.env.NEXT_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
const nextConfig = {
	output: isStaticExport ? "export" : undefined,
	basePath,
	trailingSlash: isStaticExport,
	...(isStaticExport
		? {}
		: {
				async redirects() {
					return [
						// Retired Notploy-era routes and the previous information
						// architecture. Server builds redirect; the static export has no
						// runtime redirects, and nothing links to these paths anymore.
						{ source: "/self", destination: "/platform/self-hosted", permanent: true },
						{ source: "/cloud", destination: "/platform/cloud", permanent: true },
						{ source: "/enterprise", destination: "/platform/cloud", permanent: true },
						{ source: "/pricing", destination: "/platform/cloud", permanent: true },
						{ source: "/capabilities", destination: "/platform", permanent: true },
						{ source: "/integrations", destination: "/developers", permanent: true },
						{ source: "/use-cases", destination: "/applications", permanent: true },
						{ source: "/community", destination: "/resources/community", permanent: true },
						{ source: "/contact", destination: "/resources/contact", permanent: true },
						{ source: "/privacy", destination: "/legal/privacy", permanent: true },
						{ source: "/terms", destination: "/legal/terms", permanent: true },
						{ source: "/terms-of-service", destination: "/legal/terms", permanent: true },
						{ source: "/features/:path*", destination: "/platform", permanent: true },
						{ source: "/industries/:path*", destination: "/applications", permanent: true },
						{ source: "/templates/:path*", destination: "/applications", permanent: true },
						{ source: "/partners", destination: "/resources", permanent: true },
						{ source: "/jobs", destination: "/resources", permanent: true },
						{ source: "/trust", destination: "/platform", permanent: true },
						{
							source: "/self-hosted-paas",
							destination: "/platform/self-hosted",
							permanent: true,
						},
						{ source: "/deploy-ai", destination: "/platform", permanent: true },
						{ source: "/sandbox-software", destination: "/platform", permanent: true },
						{ source: "/comparison", destination: "/platform", permanent: true },
					];
				},
			}),
	images: {
		...(isStaticExport ? { unoptimized: true } : {}),
		remotePatterns: [
			{
				hostname: "cms.astron-collection.com",
			},
		],
	},
};

module.exports = nextConfig;
