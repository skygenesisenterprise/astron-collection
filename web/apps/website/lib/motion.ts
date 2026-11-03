/**
 * Motion tokens (WEBSITE_DESIGN_SYSTEM.md §6), expressed for framer-motion.
 *
 * Springs are Apple's damping + response concepts mapped to Motion's
 * `bounce`/`duration` API: `standard` is critically damped (no overshoot),
 * `momentum` is reserved for interactions that follow a gesture, `sheet` for
 * panels and menus.
 */
export const spring = {
	standard: { type: "spring", bounce: 0, duration: 0.35 },
	momentum: { type: "spring", bounce: 0.2, duration: 0.32 },
	sheet: { type: "spring", bounce: 0.1, duration: 0.3 },
} as const;

export const transitions = {
	press: 0.1,
	feedback: 0.15,
	transition: 0.25,
} as const;
