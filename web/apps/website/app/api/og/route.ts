import { generateOGImage } from "@/lib/og-image";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const DEFAULT_TITLE = "Cloud infrastructure. Without boundaries.";

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const title = (searchParams.get("title")?.trim() || DEFAULT_TITLE).slice(0, 90);
	const eyebrow = (searchParams.get("eyebrow")?.trim() || "Astron Collection").slice(0, 40);

	try {
		const png = await generateOGImage({ title, eyebrow });
		return new Response(new Uint8Array(png), {
			headers: {
				"Content-Type": "image/png",
				"Cache-Control": "public, max-age=86400, stale-while-revalidate",
			},
		});
	} catch (error) {
		console.error("Error generating OG image:", error);
		return new Response("Unable to generate image", { status: 500 });
	}
}
