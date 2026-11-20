/**
 * Original hero graphic for the "Ink & Signal" identity.
 *
 * It expresses the product idea — resources inside boundaries, sourced from
 * owned and partner infrastructure — without reproducing any reference
 * illustration, facility map or capacity claim.
 */
export function BoundaryGraphic({ className }: { className?: string }) {
	return (
		<figure className={className}>
			<svg
				viewBox="0 0 480 400"
				role="img"
				aria-labelledby="boundary-title boundary-desc"
				className="h-auto w-full"
			>
				<title id="boundary-title">Company boundary model</title>
				<desc id="boundary-desc">
					Three nested boundaries representing owned infrastructure, partner
					infrastructure and regional availability, connected to a customer
					estate. A conceptual model, not a network map.
				</desc>

				<defs>
					<pattern
						id="boundary-grid"
						width="32"
						height="32"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M32 0H0V32"
							fill="none"
							stroke="currentColor"
							strokeWidth="1"
							opacity="0.09"
						/>
					</pattern>
				</defs>

				<rect width="480" height="400" fill="url(#boundary-grid)" />

				{/* Nested boundaries */}
				<g fill="none" stroke="currentColor">
					<rect
						x="40.5"
						y="56.5"
						width="399"
						height="287"
						rx="10"
						opacity="0.22"
					/>
					<rect
						x="104.5"
						y="104.5"
						width="271"
						height="191"
						rx="8"
						opacity="0.16"
					/>
					<rect
						x="168.5"
						y="152.5"
						width="143"
						height="95"
						rx="6"
						opacity="0.12"
					/>
				</g>

				{/* Boundary labels */}
				<g
					fontFamily="Inter, system-ui, sans-serif"
					fontSize="9"
					letterSpacing="1.6"
					fill="currentColor"
				>
					<text x="52" y="46" opacity="0.55">
						OWNED
					</text>
					<text x="116" y="94" opacity="0.45">
						PARTNER
					</text>
					<text x="180" y="142" opacity="0.4">
						REGION
					</text>
				</g>

				{/* Connection lines */}
				<g fill="none" stroke="currentColor" strokeWidth="1">
					<path d="M240 199.5V56.5" opacity="0.18" />
					<path d="M240 199.5H40.5" opacity="0.18" />
					<path d="M240 199.5H439.5" opacity="0.18" />
					<path d="M240 199.5V343.5" opacity="0.18" strokeDasharray="3 4" />
				</g>

				{/* Nodes */}
				<g>
					<circle cx="240" cy="199.5" r="5" className="fill-signal" />
					<circle cx="240" cy="56.5" r="3" className="fill-signal" opacity="0.75" />
					<circle cx="40.5" cy="199.5" r="3" className="fill-signal" opacity="0.75" />
					<circle cx="439.5" cy="199.5" r="3" className="fill-signal" opacity="0.75" />
					<circle cx="240" cy="343.5" r="3.5" className="fill-signal" opacity="0.6" />
				</g>

				{/* Customer estate */}
				<g
					fontFamily="Inter, system-ui, sans-serif"
					fill="currentColor"
					textAnchor="middle"
				>
					<text x="240" y="196" fontSize="0" />
					<text x="240" y="368" fontSize="10" opacity="0.65">
						CUSTOMER ESTATE
					</text>
					<text x="240" y="384" fontSize="8" opacity="0.4">
						compute · storage · network
					</text>
				</g>

				{/* Corner ticks — editorial framing */}
				<g stroke="currentColor" strokeWidth="1" opacity="0.35">
					<path d="M40 68V56.5H52" fill="none" />
					<path d="M428 56.5H439.5V68" fill="none" />
					<path d="M40 331V343.5H52" fill="none" />
					<path d="M428 343.5H439.5V331" fill="none" />
				</g>
			</svg>
			<figcaption className="mt-3 border-t border-ink-foreground/15 pt-3 text-xs leading-relaxed text-ink-foreground/50">
				Conceptual boundary model. Not a network map, facility or capacity
				statement.
			</figcaption>
		</figure>
	);
}
