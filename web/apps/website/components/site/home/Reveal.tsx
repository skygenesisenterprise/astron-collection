"use client";

import * as React from "react";

/**
 * Scroll reveal, homepage only.
 *
 * Progressive enhancement, done the safe way around: nothing is hidden in the
 * markup. On mount — and only when the user allows motion — the component
 * arms the `.reveal` class on every `[data-reveal]` descendant, then toggles
 * `.is-visible` with an IntersectionObserver as each element enters the
 * viewport. Elements are staggered by position batch (`--reveal-delay`), so
 * headers, content and lists arrive in sequence instead of one fade per block.
 * Without JavaScript, or with reduced motion, everything stays visible.
 */
export function Reveal({
	children,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	const ref = React.useRef<HTMLDivElement>(null);

	React.useEffect(() => {
		const root = ref.current;
		if (!root) return;
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const parts = Array.from(
			root.querySelectorAll<HTMLElement>("[data-reveal]"),
		);
		if (parts.length === 0) return;

		let observer: IntersectionObserver | undefined;
		if (typeof IntersectionObserver === "undefined") return;

		observer = new IntersectionObserver(
			(entries) => {
				let batchIndex = 0;
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					const element = entry.target as HTMLElement;
					element.style.setProperty(
						"--reveal-delay",
						`${Math.min(batchIndex, 3) * 40}ms`,
					);
					element.classList.add("is-visible");
					observer?.unobserve(element);
					batchIndex += 1;
				}
			},
			{ threshold: 0.1, rootMargin: "0px 0px -8% 0px" },
		);

		for (const element of parts) {
			element.classList.add("reveal");
			observer.observe(element);
		}

		return () => {
			observer?.disconnect();
		};
	}, []);

	return (
		<div ref={ref} {...props}>
			{children}
		</div>
	);
}
