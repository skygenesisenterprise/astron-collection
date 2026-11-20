"use client";

import { LinkProvider } from "@company/react";
import NextLink from "next/link";
import * as React from "react";

type AppLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
	href?: string;
	to?: string;
};

/**
 * Bridges the library's framework-agnostic LinkButton/Link to the Next.js
 * router. Every `@company/react` link rendered under this provider keeps
 * client-side navigation.
 */
const AppLink = React.forwardRef<HTMLAnchorElement, AppLinkProps>(
	function AppLink({ href, to, ...props }, ref) {
		return <NextLink ref={ref} href={href ?? to ?? "#"} {...props} />;
	},
);

export function ZenthProvider({ children }: { children: React.ReactNode }) {
	return <LinkProvider component={AppLink}>{children}</LinkProvider>;
}
