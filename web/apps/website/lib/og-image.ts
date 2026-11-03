import * as fs from "node:fs/promises";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";

interface GenerateOGImageOptions {
	title: string;
	label?: string;
}

/** Open Graph image for pages that render one dynamically (server builds). */
export async function generateOGImage({
	title,
	label = "Astron Collection",
}: GenerateOGImageOptions): Promise<Buffer> {
	const interRegular = await fs.readFile(
		join(process.cwd(), "public/fonts/Inter-Regular.ttf"),
	);
	const interBold = await fs.readFile(
		join(process.cwd(), "public/fonts/Inter-Bold.ttf"),
	);

	const markup = {
		type: "div",
		props: {
			style: {
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column" as const,
				justifyContent: "center",
				backgroundColor: "#111318",
				padding: "80px",
				position: "relative" as const,
				overflow: "hidden",
			},
			children: [
				{
					type: "div",
					props: {
						style: {
							position: "absolute" as const,
							right: "-60px",
							top: "-60px",
							width: "420px",
							height: "420px",
							borderRadius: "9999px",
							backgroundColor: "rgba(160,107,240,0.16)",
							display: "flex",
						},
					},
				},
				{
					type: "div",
					props: {
						style: {
							fontSize: "26px",
							fontWeight: 700,
							color: "#a06bf0",
							letterSpacing: "3px",
							zIndex: 1,
						},
						children: label.toUpperCase(),
					},
				},
				{
					type: "div",
					props: {
						style: {
							marginTop: "28px",
							fontSize: "62px",
							fontWeight: 700,
							color: "#ffffff",
							lineHeight: 1.12,
							maxWidth: "900px",
							letterSpacing: "-1.5px",
							zIndex: 1,
						},
						children: title,
					},
				},
				{
					type: "div",
					props: {
						style: {
							marginTop: "36px",
							fontSize: "24px",
							color: "#b9bacb",
							zIndex: 1,
						},
						children: "Open source · MIT · Self-hosted or Cloud",
					},
				},
			],
		},
	};

	const svg = await satori(markup as never, {
		width: 1200,
		height: 630,
		fonts: [
			{ name: "Inter", data: interRegular, weight: 400, style: "normal" },
			{ name: "Inter", data: interBold, weight: 700, style: "normal" },
		],
	});

	return sharp(Buffer.from(svg)).png().toBuffer();
}
