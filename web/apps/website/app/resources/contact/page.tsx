import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/pages/PageHero";
import { Section } from "@/components/Section";
import { links } from "@/lib/content/links";
import { pageMetadata } from "@/lib/metadata";
import { Mail, ShieldAlert } from "lucide-react";

export const metadata = pageMetadata({
	title: "Contact",
	description:
		"Contact Sky Genesis Enterprise about Astron Collection: self-hosting support, the managed platform, or a security disclosure.",
	path: "/resources/contact",
});

export default function ContactPage() {
	return (
		<>
			<PageHero
				badge="Contact"
				eyebrow="Resources / Contact"
				title="Talk to the people who build it"
				description="Self-hosting questions, the managed platform, or a security report — pick the topic and it reaches the right inbox."
			/>

			<Section>
				<div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
					<div className="rounded-lg border border-border bg-card p-6 sm:p-8">
						<h2 className="text-xl font-semibold text-foreground">
							Send a message
						</h2>
						<p className="mt-2 text-sm text-muted-foreground">
							Fields are validated as you leave them, not when you submit.
						</p>
						<div className="mt-6">
							<ContactForm />
						</div>
					</div>

					<div className="space-y-6">
						<div>
							<h2 className="text-base font-semibold text-foreground">
								Direct addresses
							</h2>
							<ul className="mt-4 space-y-4">
								<li className="flex gap-3">
									<Mail
										className="mt-0.5 h-4 w-4 shrink-0 text-primary"
										aria-hidden="true"
									/>
									<div>
										<p className="text-sm font-medium text-foreground">
											General and commercial
										</p>
										<a
											href={`mailto:${links.email.contact}`}
											className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
										>
											{links.email.contact}
										</a>
									</div>
								</li>
								<li className="flex gap-3">
									<ShieldAlert
										className="mt-0.5 h-4 w-4 shrink-0 text-primary"
										aria-hidden="true"
									/>
									<div>
										<p className="text-sm font-medium text-foreground">
											Security disclosure
										</p>
										<a
											href={`mailto:${links.email.security}`}
											className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
										>
											{links.email.security}
										</a>
									</div>
								</li>
							</ul>
						</div>

						<div className="rounded-md border-l-2 border-warning bg-warning/10 p-4">
							<p className="text-sm leading-relaxed text-foreground">
								Do not open a public issue for a vulnerability. Include
								reproduction steps and the affected version in the private
								report.
							</p>
						</div>

						<div>
							<h2 className="text-base font-semibold text-foreground">
								Faster options
							</h2>
							<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
								For setup help, the community Discord usually answers quicker
								than email. For reproducible bugs, an issue with logs is easier
								to act on than a message.
							</p>
						</div>
					</div>
				</div>
			</Section>
		</>
	);
}
