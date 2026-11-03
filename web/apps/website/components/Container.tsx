import clsx from "clsx";

/** Page container: 1200px measure, 24/32/48px gutters. */
export function Container({
	className,
	...props
}: React.ComponentPropsWithoutRef<"div">) {
	return (
		<div
			className={clsx(
				"mx-auto w-full max-w-[1200px] px-6 md:px-8 xl:px-12",
				className,
			)}
			{...props}
		/>
	);
}
