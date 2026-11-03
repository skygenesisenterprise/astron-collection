/**
 * Generates the static brand assets that cannot be CSS/SVG-only:
 * og.png (social), apple-touch-icon.png and the Android chrome icons.
 *
 * Run from `web/apps/website`:  node scripts/generate-brand-assets.mjs
 * Requires `sharp` (already a dependency).
 */

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const PUBLIC = join(ROOT, "public");

const VIOLET = "#a06bf0";
const INK = "#111318";
const PAPER = "#fbfbfd";

/**
 * Favicons derive from the official mark, `public/astron.png`, so the tab icon
 * and the site mark never drift apart.
 */
async function iconFromMark(size, name) {
	await sharp(join(PUBLIC, "astron.png"))
		.resize(size, size, { fit: "cover" })
		.png()
		.toFile(join(PUBLIC, name));
	console.log(`wrote public/${name} (${size}×${size}) from astron.png`);
}

const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="line" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${VIOLET}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#5ec8e8" stop-opacity="0.55"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="${INK}"/>
  <circle cx="1010" cy="150" r="230" fill="${VIOLET}" opacity="0.14"/>
  <circle cx="1010" cy="150" r="230" fill="none" stroke="url(#line)" stroke-width="1.5"/>
  <circle cx="1010" cy="150" r="118" fill="none" stroke="${VIOLET}" stroke-width="1.5" opacity="0.5"/>
  <circle cx="1010" cy="150" r="26" fill="${VIOLET}"/>
  <circle cx="1155" cy="42" r="13" fill="#5ec8e8"/>
  <g font-family="Inter, Helvetica, Arial, sans-serif">
    <text x="80" y="150" fill="#e9e9f2" font-size="26" letter-spacing="4">ASTRON COLLECTION</text>
    <text x="80" y="268" fill="#ffffff" font-size="76" font-weight="700" letter-spacing="-2">Focused Discord</text>
    <text x="80" y="352" fill="#ffffff" font-size="76" font-weight="700" letter-spacing="-2">applications.</text>
    <text x="80" y="440" fill="#b9bacb" font-size="34">One platform behind them.</text>
    <text x="80" y="540" fill="#8a8b9c" font-size="24">Open source · MIT · Self-hosted or Cloud</text>
  </g>
</svg>`;

mkdirSync(PUBLIC, { recursive: true });
await sharp(Buffer.from(og)).png().toFile(join(PUBLIC, "og.png"));
console.log("wrote public/og.png (1200×630)");

await iconFromMark(32, "favicon-32x32.png");
await iconFromMark(180, "apple-touch-icon.png");
await iconFromMark(192, "android-chrome-192x192.png");
await iconFromMark(512, "android-chrome-512x512.png");

// Light-variant mark for print/light contexts.
await sharp(
	Buffer.from(
		`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 24 24"><rect width="24" height="24" fill="${PAPER}"/><circle cx="12" cy="12" r="9" fill="none" stroke="${VIOLET}" stroke-width="1.6" opacity="0.55"/><circle cx="12" cy="12" r="3.9" fill="none" stroke="${VIOLET}" stroke-width="1.6"/><circle cx="12" cy="12" r="1.5" fill="${VIOLET}"/><circle cx="18.6" cy="6.4" r="2.1" fill="${VIOLET}"/></svg>`,
	),
)
	.png()
	.toFile(join(PUBLIC, "mark-light.png"));
console.log("wrote public/mark-light.png");
