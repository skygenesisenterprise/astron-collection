/**
 * Astron Collection mark: a body, its orbit and a satellite node.
 *
 * Monochrome (`currentColor`) so it inherits text colour in either theme and
 * can be rasterised for favicons by `scripts/generate-brand-assets.mjs`.
 */
export function Logo(props: React.ComponentPropsWithoutRef<"svg">) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
			{...props}
		>
			<circle
				cx="12"
				cy="12"
				r="9"
				stroke="currentColor"
				strokeWidth="1.6"
				opacity="0.55"
			/>
			<circle
				cx="12"
				cy="12"
				r="3.9"
				stroke="currentColor"
				strokeWidth="1.6"
			/>
			<circle cx="12" cy="12" r="1.5" fill="currentColor" />
			<circle cx="18.6" cy="6.4" r="2.1" fill="currentColor" />
		</svg>
	);
}
