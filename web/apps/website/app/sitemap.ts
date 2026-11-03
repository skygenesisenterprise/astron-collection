import { SITE_URL } from "@/lib/content/links";
import { siteRoutes } from "@/lib/content/site";
import type { MetadataRoute } from "next";

// Required for `output: "export"` (GitHub Pages).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
	const now = new Date();

	return siteRoutes.map((route) => ({
		url: `${SITE_URL}${route.path}`,
		lastModified: now,
		changeFrequency: "monthly" as const,
		priority: route.priority,
	}));
}
