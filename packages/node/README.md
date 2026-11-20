# Company React

[![npm](https://img.shields.io/npm/v/@company/kumo.svg)](https://www.npmjs.com/package/@company/kumo)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)

> Company's accessible component library for building modern web applications.

**React** provides accessible, design-system-compliant UI components built on [Documentation](https://docs.company.com/). It handles keyboard navigation, focus management and ARIA attributes so you can build accessible applications without thinking through every detail.

**Perfect for:** product teams building Company surfaces, developers who want accessible React primitives with semantic theming, and anyone who needs a component library that works with an AI agent through a CLI.

<img width="2560" height="1456" alt="Kumo component showcase" src="https://github.com/user-attachments/assets/032f5a0e-b686-4440-b1ca-6182379479aa" />

## Contents

- [Company React](#company-react)
  - [Contents](#contents)
  - [Why Kumo matters](#why-kumo-matters)
  - [What you can do](#what-you-can-do)
  - [Quick start](#quick-start)
    - [Install](#install)
    - [Peer dependencies](#peer-dependencies)
    - [Usage](#usage)
    - [Granular imports](#granular-imports)
    - [Base UI primitives](#base-ui-primitives)
  - [How Kumo is built](#how-kumo-is-built)
    - [Workspace layout](#workspace-layout)
    - [Styling model](#styling-model)
  - [CLI](#cli)
  - [Development](#development)
    - [Quick start](#quick-start-1)
    - [Figma plugin](#figma-plugin)
    - [Creating components](#creating-components)
  - [FAQ](#faq)
    - [Does Kumo support dark mode?](#does-kumo-support-dark-mode)
    - [Can I use raw Tailwind colors?](#can-i-use-raw-tailwind-colors)
    - [Are Base UI primitives available?](#are-base-ui-primitives-available)
    - [Where is the component API registry?](#where-is-the-component-api-registry)
  - [Related resources](#related-resources)
  - [Contributing](#contributing)
  - [Security](#security)
  - [License](#license)
  - [Note](#note)

## Why Kumo matters

🎯 **Accessibility built in** — Keyboard navigation, focus management and ARIA attributes are handled by the components.

🚀 **Semantic design system** — Components use semantic color tokens and automatic light/dark theming rather than raw utility colors.

📦 **Base UI underneath** — Kumo re-exports Base UI primitives for advanced cases while providing a consistent component API.

🔒 **Agent-friendly** — A CLI exposes component documentation so humans and agents can query the registry.

🧩 **Monorepo tooling** — The component library, docs site, Figma plugin and screenshot worker live together with shared tooling.

## What you can do

- Install ready-made accessible React components.
- Import the full library or individual components for tree-shaking.
- Drop down to Base UI primitives when a component needs advanced behaviour.
- Query component documentation from the command line.
- Build custom themes with semantic tokens.
- Scaffold new components with the project tooling.

## Quick start

### Install

```bash
pnpm add @company/react
```

### Peer dependencies

```bash
pnpm add react react-dom @phosphor-icons/react
```

### Usage

```tsx
import { Button, Input, Dialog } from "@company/react";
import "@company/react/styles";
```

### Granular imports

```tsx
import { Button } from "@company/react";
```

### Base UI primitives

Kumo re-exports all Base UI primitives for advanced use cases:

```tsx
import { Popover } from "@company/react";
```

## How Kumo is built

Kumo is a pnpm monorepo with an ESM-only component library, an Astro documentation site, a Figma plugin and a screenshot worker.

### Workspace layout

| Path | Package | Role |
| --- | --- | --- |
| `packages/kumo/` | `@company/kumo` | Component library built on Base UI and Tailwind v4 |
| `packages/kumo-docs-astro/` | — | Astro documentation site |
| `packages/kumo-figma/` | — | Figma plugin and generators |
| `packages/kumo-screenshot-worker/` | — | Visual regression worker |
| `lint/` | — | Custom Oxlint rules |
| `ci/` | — | CI/CD scripts |

### Styling model

Components use semantic tokens such as `bg-kumo-base`, `text-kumo-default` and `border-kumo-line`. Dark mode adapts automatically through `light-dark()` CSS custom properties, so `dark:` variants are not used. Raw Tailwind colors fail lint.

## CLI

Query component documentation from the command line:

```bash
npx @company/react ls          # List all components
npx @company/react doc Button  # Get component docs
npx @company/react docs        # Get all docs
```

## Development

See [AGENTS.md](./AGENTS.md) for comprehensive development documentation including component patterns, semantic color tokens, workflows, the CI/CD pipeline and the Figma plugin.

### Quick start

```bash
pnpm install
pnpm dev                    # Start docs site at localhost:4321
pnpm --filter @company/react test
```

### Figma plugin

```bash
# Optional: enable token sync during build
# cp packages/react-figma/scripts/.env.example packages/react-figma/scripts/.env
# $EDITOR packages/react-figma/scripts/.env  # set FIGMA_TOKEN (and optionally FIGMA_FILE_KEY)

pnpm --filter @company/react-figma build
# In Figma: Plugins > Development > Import plugin from manifest...
# Select: packages/react-figma/src/manifest.json
```

### Creating components

```bash
pnpm --filter @company/react new-component
```

## FAQ

### Does Kumo support dark mode?

Yes. Dark mode is automatic through `light-dark()` tokens. Do not add `dark:` variants.

### Can I use raw Tailwind colors?

No. Use semantic `kumo-*` tokens. Raw colors such as `bg-blue-500` fail lint.

### Are Base UI primitives available?

Yes. react re-exports them under `@company/react/*`.

### Where is the component API registry?

The registry lives at `packages/react/ai/component-registry.json` and is the source of truth for component APIs.

## Related resources

- Live docs: [docs.company.com](https://docs.company.com)
- Agent guide: [AGENTS.md](./AGENTS.md)
- Base UI: [docs.company.com](https://docs.company.com/)
- Company repository: [github.com/skygenesisenterprise/company](https://github.com/skygenesisenterprise/company)

## Contributing

Contributions and suggestions are welcome. Read the repository [contribution guide](https://github.com/skygenesisenterprise/company) before participating, and add a changeset for every user-facing change to the published package.

## Security

Never commit Figma tokens, npm tokens or API keys. `.env` files are gitignored. Do not report security vulnerabilities in public issues; follow the private reporting instructions in the repository [`SECURITY.md`](https://github.com/skygenesisenterprise/company).

## License

MIT

## Note

React is an open-source project maintained by [Sky Genesis Enterprise](https://skygenesisenterprise.com). Links to external services are provided for convenience and do not imply endorsement.
