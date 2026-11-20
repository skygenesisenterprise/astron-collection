import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { generateOGImage } from "../lib/og-image";

async function main() {
	const png = await generateOGImage({
		title: "Cloud infrastructure. Without boundaries.",
		eyebrow: "Company",
	});

	await writeFile(join(process.cwd(), "public/og.png"), new Uint8Array(png));
	console.log(`Wrote public/og.png (${png.byteLength} bytes)`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
