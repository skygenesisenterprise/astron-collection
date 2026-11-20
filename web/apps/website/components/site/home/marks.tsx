import { cn } from "@/lib/utils";

/**
 * The homepage signature: a socket mark.
 *
 * A 6px hairline square, taken from the port faces and rack diagrams of the
 * infrastructure the group operates. It is filled only when the thing it marks
 * is a verified fact, so a filled socket on the page always means a state that
 * can be checked. It takes its colour from the surrounding text role, so the
 * same mark works on paper and on the closing ink panel.
 */
export function SocketMark({
	live = false,
	className,
}: {
	/** Filled when the adjacent state is verified, hollow otherwise. */
	live?: boolean;
	className?: string;
}) {
	return (
		<span
			aria-hidden="true"
			className={cn(
				"size-1.5 shrink-0 border border-current",
				live ? "bg-current" : "bg-transparent",
				className,
			)}
		/>
	);
}
