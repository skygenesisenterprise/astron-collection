# Company CSS Design System

`@astron-collection/react` ships its own design system: tokens, light/dark themes, a
compiled stylesheet, and scoped component styles. Components are built with
Tailwind CSS v4 internally, but **consuming applications do not need Tailwind**.

## Quick start (no Tailwind required)

```tsx
// app entry point (Next.js root layout, Vite main.tsx, etc.)
import "@astron-collection/react/styles.css";
```

That single import contains:

- design tokens (`--color-zenth-*`, `--text-color-zenth-*`, spacing, radius,
  shadows, motion, z-index);
- light and dark themes driven by `data-zenth-mode`;
- base, accessibility and animation layers;
- every utility class used by the compiled components;
- component styles for portals, skeletons, code blocks, date pickers and
  scrollable navigation.

No Tailwind installation, Tailwind config, `@source` directive, or CSS rebuild
is required.

## CSS architecture

```text
src/styles/
├── index.css                  # compiled entry → dist/styles/styles.css
├── tokens.css                 # public token-only entry
├── tailwind.css               # raw entry for apps that already use Tailwind
├── core/
│   ├── reset.css              # scoped reset (never global html/body)
│   ├── base.css               # color-scheme, .zenth-root surface
│   ├── accessibility.css      # focus rings, cursor, sr-only, reduced motion
│   └── animations.css         # keyframes + animation utilities
├── tokens/
│   ├── colors.css             # palette primitives
│   ├── aliases.css            # background/surface/border/primary aliases
│   ├── typography.css         # families, sizes, weights, tracking
│   ├── spacing.css            # named spacing + control sizes
│   ├── radius.css
│   ├── shadows.css
│   ├── motion.css
│   └── z-index.css
├── themes/
│   ├── light.css              # explicit light-mode values (generated)
│   └── dark.css               # explicit dark-mode values (generated)
├── theme-zenth.css            # base semantic tokens (generated)
├── theme-fedramp.css          # optional FedRAMP theme (generated)
├── theme-kumo.css             # deprecated legacy aliases (generated)
├── components/                # non-utility component styles
├── utilities/                 # internal `zenth-` utilities
└── compat/kumo.css            # temporary `kumo-*` bridge
```

`scripts/theme-generator/config.ts` is the single source of truth for semantic
color tokens. Run `pnpm codegen:themes` after changing it.

## Public entry points

| Import                                       | Content                                       |
| -------------------------------------------- | --------------------------------------------- |
| `@astron-collection/react/styles.css`               | Everything (recommended, no Tailwind needed)  |
| `@astron-collection/react/tokens.css`               | Tokens only, no component styles or utilities |
| `@astron-collection/react/themes/light.css`         | Light-mode token values                       |
| `@astron-collection/react/themes/dark.css`          | Dark-mode token values                        |
| `@astron-collection/react/styles/tailwind`          | Raw Tailwind v4 entry (no preflight)          |
| `@astron-collection/react/styles/standalone`        | Deprecated alias of `styles.css`              |

All files are present in `dist/styles/` in the published package.

## Theming

### Light and dark mode

Set `data-zenth-mode` on `<html>` (or any subtree):

```html
<html data-zenth-mode="dark">
  <body>
    ...
  </body>
</html>
```

The legacy `data-mode="dark"` attribute is still supported.

### Applying the application surface

The library never resets `html` or `body`. To get the Company canvas,
foreground color and typography, opt in with the root class:

```tsx
<main className="zenth-root">{children}</main>
```

or `data-zenth-root` on an element.

### Optional themes

```html
<html data-zenth-theme="fedramp" data-zenth-mode="dark">
```

## Customizing tokens

Override any token after importing the stylesheet. No library file needs to be
edited:

```css
:root {
  --color-zenth-brand: #0f62fe;
  --color-zenth-brand-hover: #0043ce;
  --radius-zenth-lg: 0.625rem;
  --font-zenth-sans: "IBM Plex Sans", system-ui, sans-serif;
  --shadow-zenth-md: 0 4px 12px -2px rgb(0 0 0 / 0.12);
}
```

Because components consume semantic tokens only, the override propagates to
buttons, focus rings, links, badges, and every other component.

### Token reference

Color (`--color-zenth-*`):

`background`, `canvas`, `surface`, `surface-elevated`, `surface-muted`,
`base`, `elevated`, `recessed`, `tint`, `contrast`, `overlay`, `control`,
`interact`, `fill`, `fill-hover`, `border`, `border-subtle`, `line`,
`hairline`, `focus`, `brand`, `brand-hover`, `primary`, `secondary`, `info`,
`info-tint`, `success`, `success-tint`, `warning`, `warning-tint`, `danger`,
`danger-tint`, `disabled`, `shadow-edge`, `shadow-drop`, `arrow-edge`,
`arrow-stroke`.

Text (`--text-color-zenth-*`):

`foreground`, `default`, `strong`, `subtle`, `muted`, `inactive`,
`placeholder`, `disabled`, `inverse`, `brand`, `link`, `info`, `success`,
`warning`, `danger`.

Sizing and motion:

- `--spacing-zenth-{none,3xs,2xs,xs,sm,md,lg,xl,2xl,3xl}`
- `--spacing-zenth-control-{xs,sm,md,lg}`
- `--radius-zenth-{none,xs,sm,md,lg,xl,2xl,pill}`
- `--shadow-zenth-{none,xs,sm,md,lg,overlay}`
- `--motion-zenth-duration-*` and `--motion-zenth-ease-*`
- `--z-index-zenth-*`

## Next.js (App Router)

```tsx
// app/layout.tsx
import "@astron-collection/react/styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-zenth-mode="light">
      <body className="zenth-root">{children}</body>
    </html>
  );
}
```

Portals (dialogs, popovers, tooltips, toasts) render into `document.body` and
are styled by the same stylesheet, including dark mode.

## Vite

```tsx
// src/main.tsx
import "@astron-collection/react/styles.css";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")!).render(<App />);
```

## Using the optional Tailwind pipeline

If the host app already uses Tailwind CSS v4 and wants the library's `@theme`
tokens (to reuse `bg-zenth-*` utilities in app code), import the raw entry
before `tailwindcss`:

```css
@source "../node_modules/@astron-collection/react/dist/**/*.{js,jsx,ts,tsx}";
@import "@astron-collection/react/styles/tailwind";
@import "tailwindcss";
```

This is optional. `styles.css` is enough for every component.

## Migration from `kumo-*`

| Before                          | After                              |
| ------------------------------- | ---------------------------------- |
| `--color-kumo-base`             | `--color-zenth-base`               |
| `--text-color-kumo-default`     | `--text-color-zenth-default`       |
| `bg-kumo-base`                  | `bg-zenth-base`                    |
| `text-kumo-subtle`              | `text-zenth-subtle`                |
| `[data-kumo-component]`         | `[data-zenth-component]`           |
| `data-mode="dark"`              | `data-zenth-mode="dark"` (supported) |
| `@company/kumo/styles`       | `@astron-collection/react/styles.css`     |
| `@company/kumo/styles/standalone` | `@astron-collection/react/styles.css` |

Compatibility is intentional and temporary:

- `kumo-*` variables alias `zenth-*` tokens (`theme-kumo.css` and
  `compat/kumo.css`);
- `[data-kumo-component]` / `[data-kumo-part]` still receive focus and cursor
  affordances;
- legacy CSS entry points (`/styles`, `/styles/tailwind`,
  `/styles/standalone`) still resolve.

Exported React identifiers (`KUMO_*` variant maps, `Kumo*` types) are kept
unchanged for API stability.

## Accessibility guarantees

- keyboard focus rings use `--color-zenth-focus` and stay visible even when the
  host app resets outlines;
- cursor affordances are scoped to library attributes;
- `prefers-reduced-motion` shortens or disables animations;
- `forced-colors` mode keeps focus visible;
- `.zenth-sr-only` provides a scoped screen-reader-only utility.

## Verifying a build

```bash
pnpm build      # compiles JS + CSS and validates CSS artifacts
pnpm test:unit  # includes tests/styles/css-system.test.ts
```
