import { Button } from "@/components/ui/button";
import { Container } from "@/components/Container";
import Link from "next/link";

export default function NotFound() {
	return (
		<Container>
			<div className="mx-auto max-w-2xl py-24 text-center">
				<p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
					404
				</p>
				<h1 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">
					This page does not exist
				</h1>
				<p className="mt-4 text-base leading-relaxed text-muted-foreground">
					The address may have changed with the new information architecture.
					Start from the catalogue, or use search to find a product or page.
				</p>
				<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
					<Button asChild>
						<Link href="/products">Browse products</Link>
					</Button>
					<Button variant="outline" asChild>
						<Link href="/">Return home</Link>
					</Button>
				</div>
				<p className="mt-8 text-sm text-muted-foreground">
					Looking for documentation?{" "}
					<a
						href="https://docs.astron-collection.com"
						target="_blank"
						rel="noreferrer"
						className="text-foreground underline underline-offset-4"
					>
						docs.astron-collection.com
					</a>
				</p>
			</div>
		</Container>
	);
}
