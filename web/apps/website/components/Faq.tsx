import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import type { FaqEntry } from "@/lib/content/home";

/** Accordion FAQ. Content stays in the DOM; opening is animated by Radix. */
export function Faq({ items }: { items: FaqEntry[] }) {
	return (
		<Accordion type="single" collapsible className="border-t border-border">
			{items.map((item, index) => (
				<AccordionItem
					key={item.question}
					value={`faq-${index}`}
					className="border-b border-border"
				>
					<AccordionTrigger className="py-5 text-left text-base font-medium text-foreground hover:no-underline">
						{item.question}
					</AccordionTrigger>
					<AccordionContent className="pb-5 text-base leading-relaxed text-muted-foreground">
						{item.answer}
					</AccordionContent>
				</AccordionItem>
			))}
		</Accordion>
	);
}
