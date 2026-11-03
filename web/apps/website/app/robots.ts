import { SITE_URL } from "@/lib/content/links";
import type { MetadataRoute } from "next";

// Required for `output: "export"` (GitHub Pages).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
		},
		sitemap: `${SITE_URL}/sitemap.xml`,
		host: SITE_URL,
	};
}
