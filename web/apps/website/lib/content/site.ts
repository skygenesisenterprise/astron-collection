/**
 * Single source of truth for public destinations, footer and commercial CTAs.
 *
 * Rules:
 * - Internal links are paths; external destinations are marked `external`.
 * - No route is listed before it exists.
 * - Console/authentication lives on a separate service, never reimplemented here.
 * - Header navigation is defined in `lib/content/navigation.ts`, which imports
 *   these destinations rather than redeclaring them.
 */

export const siteTitle =
	"Astron Collection | The Best Discord suite for You";

export const links = {
	docs: {
		home: 'https://docs.skygenesisenterprise.com',
		api: 'https://docs.skygenesisenterprise.com/api',
		tutorials: 'https://docs.skygenesisenterprise.com/tutorials',
		support: 'https://docs.skygenesisenterprise.com/support',
		differences: 'https://docs.skygenesisenterprise.com/docs/core/differences',
	},
	status: 'https://status.astron-collection.com',
	console: 'https://dash.astron-collection.com',
	blog: 'https://blog.astron-collection.com',
	github: 'https://github.com/skygenesisenterprise/astron-collection',
	githubOrg: 'https://github.com/skygenesisenterprise',
	trust: '/company/trust',
	skyGenesis: 'https://skygenesisenterprise.com/',
	l0ck7: 'https://lk7cloud.com/',
} as const

export type NavLink = {
	href: string
	label: string
	description?: string
	external?: boolean
}

export const emergencyCta = {
	label: "Under attack?",
	href: "/products/network-edge",
	external: false,
} as const;

export const cta = {
	primary: { href: '/contact-sales', label: 'Get started' },
	secondary: { href: '/contact-sales', label: 'Contact sales' },
	signIn: { href: links.console, label: 'Dashboard', external: true },
	// The console is a separate identity surface; never implemented here.
	console: { href: links.console, label: 'Go to console', external: true },
} as const

export const footerSections: { title: string; links: NavLink[] }[] = [
	{
		title: 'Getting started',
		links: [
			{ href: '/pricing', label: 'Plans' },
			{ href: '/contact-sales', label: 'Contact sales' },
			{ href: '/company/partners', label: 'Partners' },
			{ href: '/company/partners', label: 'Find a partner' },
			{ href: '/solutions/startups', label: 'Startups' },
			{ href: '/products/security-identity', label: 'Under attack?' },
			{ href: '/products/domain-services', label: 'Domain name search' },
		],
	},
	{
		title: 'Public Interest',
		links: [
			{ href: '/solutions/ai-research', label: 'Project Galileo' },
			{ href: '/solutions/small-business', label: 'Athenian Project' },
			{ href: '/solutions/enterprise', label: 'company for Campaigns' },
			{ href: '/solutions/startups', label: 'Project Fairshot' },
			{ href: '/company/about', label: 'Impact' },
		],
	},
	{
		title: 'Resources',
		links: [
			{ href: '/resources/blog', label: 'App Innovation report' },
			{ href: '/resources', label: 'company Radar' },
			{ href: '/resources', label: 'Case studies' },
			{ href: links.status, label: 'Status', external: true },
			{ href: '/resources/support', label: 'Support' },
			{ href: '/resources', label: 'Events' },
			{ href: '/resources/blog', label: 'Blog' },
		],
	},
	{
		title: 'Solutions',
		links: [
			{ href: '/products/security-identity', label: 'Security and identity' },
			{ href: '/products/public-cloud/gpu', label: 'GPU and AI infrastructure' },
			{ href: '/products/network-edge', label: 'Web application protection' },
			{ href: '/products/web-hosting', label: 'Managed web hosting' },
			{ href: '/products/public-cloud/kubernetes', label: 'Multi-tenant platform development' },
			{ href: '/products/storage-databases', label: 'Storage and databases' },
		],
	},
	{
		title: 'Astron Collection',
		links: [
			{ href: '/company/about', label: 'About' },
			{ href: '/company/careers', label: 'Careers' },
			{ href: '/company/about', label: 'Investors' },
			{ href: '/company/newsroom', label: 'Press' },
			{ href: '/company/newsroom', label: 'Press kit' },
			{ href: '/company/infrastructure', label: 'Infrastructure' },
			{ href: '/company/trust', label: 'Trust & Compliance' },
		],
	},
	{
		title: 'Compliance',
		links: [
			{ href: '/legal/privacy', label: 'Compliance resources' },
			{ href: '/company/trust', label: 'Trust Hub' },
			{ href: '/legal/privacy', label: 'Data Protection' },
			{ href: '/legal/acceptable-use', label: 'Responsible AI' },
			{ href: '/legal/terms', label: 'Transparency report' },
			{ href: '/resources/support', label: 'Report abuse' },
		],
	},
	{
		title: 'Developers',
		links: [
			{ href: '/developers', label: 'Developers Hub' },
			{ href: links.docs.home, label: 'Documentation', external: true },
			{ href: links.github, label: 'Community', external: true },
			{ href: '/developers/changelog', label: 'Changelog' },
		],
	},
];

export const organisation = {
	name: 'Astron Collection',
	legalName: 'Sky Genesis Enterprise',
	positioning: 'European Integrated Cloud Infrastructure',
	supporting: 'European roots. Global ambitions.',
	description:
		'Astron Collection is a European integrated cloud infrastructure provider building compute, storage, networking, developer and security services on owned and partner infrastructure.',
} as const
