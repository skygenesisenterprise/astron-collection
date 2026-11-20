import * as fs from "node:fs/promises";
import { join } from "node:path";
import satori from "satori";
import sharp from "sharp";

interface GenerateOGImageOptions {
	title: string;
	eyebrow?: string;
}

/** Official palette for generated visual assets (sRGB hex, exported). */
export const OG_PALETTE = {
	ink: "#111318",
	surface: "#1B1E25",
	white: "#F7F8FA",
	muted: "#9AA1AC",
	signal: "#4B91F0",
} as const;

const LINE = `${OG_PALETTE.white}22`;

export async function generateOGImage({
	title,
	eyebrow = "Astron Collection",
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
				flexDirection: "column",
				justifyContent: "space-between",
				backgroundColor: OG_PALETTE.ink,
				padding: "64px",
				position: "relative",
				overflow: "hidden",
				fontFamily: "Inter",
			},
			children: [
				// Boundary motif, right edge.
				{
					type: "div",
					props: {
						style: {
							position: "absolute",
							right: "-80px",
							top: "-40px",
							width: "460px",
							height: "460px",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						},
						children: [
							{
								type: "div",
								props: {
									style: {
										position: "absolute",
										width: "440px",
										height: "340px",
										border: `1px solid ${OG_PALETTE.white}1f`,
										borderRadius: "18px",
									},
								},
							},
							{
								type: "div",
								props: {
									style: {
										position: "absolute",
										width: "310px",
										height: "235px",
										border: `1px solid ${OG_PALETTE.white}14`,
										borderRadius: "14px",
									},
								},
							},
							{
								type: "div",
								props: {
									style: {
										position: "absolute",
										width: "150px",
										height: "150px",
										borderRadius: "75px",
										backgroundColor: OG_PALETTE.signal,
										opacity: 0.16,
									},
								},
							},
						],
					},
				},
				// Header
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							paddingBottom: "20px",
							borderBottom: `1px solid ${LINE}`,
							position: "relative",
						},
						children: [
							{
								type: "div",
								props: {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "14px",
										fontSize: "22px",
										fontWeight: 700,
										letterSpacing: "0.16em",
										color: OG_PALETTE.white,
									},
									children: [
										{
											type: "div",
											props: {
												style: {
													width: "12px",
													height: "12px",
													borderRadius: "6px",
													backgroundColor: OG_PALETTE.signal,
												},
											},
										},
										{ type: "div", props: { children: eyebrow.toUpperCase() } },
									],
								},
							},
							{
								type: "div",
								props: {
									style: {
										fontSize: "18px",
										color: OG_PALETTE.muted,
									},
									children: "Cloud infrastructure. Without boundaries.",
								},
							},
						],
					},
				},
				// Title
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							maxWidth: "860px",
							fontSize: "62px",
							fontWeight: 700,
							lineHeight: 1.12,
							letterSpacing: "-0.03em",
							color: OG_PALETTE.white,
							position: "relative",
						},
						children: title,
					},
				},
				// Footer
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							alignItems: "center",
							justifyContent: "space-between",
							paddingTop: "20px",
							borderTop: `1px solid ${LINE}`,
							fontSize: "18px",
							color: OG_PALETTE.muted,
							position: "relative",
						},
						children: [
							{ type: "div", props: { children: "astron-collection.com" } },
							{
								type: "div",
								props: { children: "European roots. Global ambitions." },
							},
						],
					},
				},
			],
		},
	};

	const svg = await satori(markup as Parameters<typeof satori>[0], {
		width: 1200,
		height: 630,
		fonts: [
			{ name: "Inter", data: interRegular, weight: 400, style: "normal" },
			{ name: "Inter", data: interBold, weight: 700, style: "normal" },
		],
	});

	return sharp(Buffer.from(svg)).png().toBuffer();
}
