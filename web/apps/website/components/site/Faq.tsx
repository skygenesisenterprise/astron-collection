import { Plus } from "lucide-react";

export type FaqItem = { question: string; answer: string };

/**
 * Native <details> gives keyboard and screen-reader behaviour without client
 * JavaScript. Answers are plain text so they can also feed FAQPage JSON-LD.
 * `tone` selects the surface it is placed on, so it stays legible on the dark
 * stage as well as on the light pages.
 */
export function Faq({
	id,
	items,
	tone = "light",
}: {
	id: string;
	items: readonly FaqItem[];
	tone?: "light" | "dark";
}) {
	const dark = tone === "dark";

	return (
		<div
			className={
				dark
					? "mx-auto max-w-3xl border-t border-white/10"
					: "mx-auto max-w-3xl border-t border-border"
			}
		>
			{items.map((item) => (
				<details
					key={item.question}
					className={
						dark ? "group border-b border-white/10" : "group border-b border-border"
					}
				>
					<summary
						className={[
							"flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-base font-medium [&::-webkit-details-marker]:hidden",
							dark ? "text-ink-foreground" : "text-foreground",
						].join(" ")}
					>
						{item.question}
						<Plus
							className={[
								"h-4 w-4 shrink-0 transition-transform group-open:rotate-45",
								dark ? "text-ink-foreground/50" : "text-muted-foreground",
							].join(" ")}
							aria-hidden="true"
						/>
					</summary>
					<div className="faq-answer">
						<p
							id={`${id}-${items.indexOf(item)}`}
							className={[
								"pb-4 pr-8 text-sm leading-relaxed",
								dark ? "text-ink-foreground/65" : "text-muted-foreground",
							].join(" ")}
						>
							{item.answer}
						</p>
					</div>
				</details>
			))}
		</div>
	);
}
