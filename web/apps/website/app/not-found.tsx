import { Container } from "@/components/Container";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
	return (
		<Container>
			<div className="flex flex-col items-start py-24 sm:py-32">
				<p className="font-mono text-xs uppercase tracking-[0.06em] text-primary">
					404
				</p>
				<h1 className="mt-4 text-4xl text-foreground sm:text-5xl">
					This page does not exist
				</h1>
				<p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
					The link may be out of date, or the page may have moved. These are the
					places most people are looking for.
				</p>
				<div className="mt-8 flex flex-col gap-3 sm:flex-row">
					<Button className="rounded-full" asChild>
						<Link href="/">
							Back to home
							<ArrowRight className="h-4 w-4" aria-hidden="true" />
						</Link>
					</Button>
					<Button variant="secondary" className="rounded-full" asChild>
						<Link href="/applications">Applications</Link>
					</Button>
					<Button variant="ghost" className="rounded-full" asChild>
						<Link href="/resources">Resources</Link>
					</Button>
				</div>
			</div>
		</Container>
	);
}
