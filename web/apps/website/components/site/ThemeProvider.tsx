"use client";

import * as React from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "company-theme";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

type ThemeContextValue = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	toggle: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
	const root = document.documentElement;
	root.classList.toggle("dark", theme === "dark");
	root.dataset.theme = theme;
	// The design system resolves its light-dark() tokens from these attributes
	// and from the CSS color-scheme property. Setting all three keeps the
	// library, Tailwind's dark variant and native controls in sync.
	root.dataset.zenthTheme = "zenth";
	root.dataset.zenthMode = theme;
	root.dataset.mode = theme;
	root.style.colorScheme = theme;
}

/**
 * The initial theme is resolved on the server from the `company-theme`
 * cookie, so the correct class is present in the first HTML response. No
 * inline pre-paint script is needed.
 */
export function ThemeProvider({
	children,
	initialTheme = "light",
}: {
	children: React.ReactNode;
	initialTheme?: Theme;
}) {
	const [theme, setThemeState] = React.useState<Theme>(initialTheme);

	React.useEffect(() => {
		applyTheme(initialTheme);
	}, [initialTheme]);

	const setTheme = React.useCallback((next: Theme) => {
		setThemeState(next);
		applyTheme(next);
		try {
			window.localStorage.setItem(STORAGE_KEY, next);
		} catch {
			// Storage can be unavailable in private modes; the theme still applies.
		}
		document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
	}, []);

	const toggle = React.useCallback(() => {
		setTheme(theme === "dark" ? "light" : "dark");
	}, [setTheme, theme]);

	return (
		<ThemeContext.Provider value={{ theme, setTheme, toggle }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const context = React.useContext(ThemeContext);
	if (!context) {
		throw new Error("useTheme must be used inside ThemeProvider");
	}
	return context;
}
