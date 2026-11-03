"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Section entrance: opacity + a short rise, once, on a spring.
 * Reduced motion collapses it to a cross-fade (no translation).
 */
export function Reveal({
	children,
	className,
	delay = 0,
	y = 12,
}: {
	children: ReactNode;
	className?: string;
	delay?: number;
	y?: number;
}) {
	const reduceMotion = useReducedMotion();

	return (
		<motion.div
			className={className}
			initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y }}
			whileInView={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
			viewport={{ once: true, margin: "-80px" }}
			transition={
				reduceMotion
					? { duration: 0.2, delay }
					: { type: "spring", bounce: 0, duration: 0.35, delay }
			}
		>
			{children}
		</motion.div>
	);
}
