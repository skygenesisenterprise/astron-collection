# @company/react

Company's React component library and design system for building modern web applications.

## Installation

```bash
pnpm add @company/react
```

### Peer Dependencies

Company React requires the following peer dependencies:

```bash
pnpm add react react-dom @phosphor-icons/react
```

## Component Documentation

Company React includes a built-in CLI for quick component reference:

```bash
npx @company/react ls         # List all components
npx @company/react doc Button # Get component documentation
npx @company/react docs       # Get all component docs
```

The CLI reads from `ai/component-registry.json` (generated from TypeScript types + demo examples).

## Usage

### Import Components

```tsx
// Main package import
import { Button, Input, Surface } from "@company/react";

// Granular imports (recommended for tree-shaking)
import { Button } from "@company/react/components/button";
```

### Import Styles

Import the precompiled stylesheet once, in your application entry point:

```tsx
import "@company/react/styles.css";
```

That is all that is required. **Tailwind is not required in the consuming application**: no Tailwind install, config file, `@source` directive, or rebuild of the library styles.

The stylesheet includes the Company design tokens, light/dark themes, accessibility rules, animations, and every utility class used by the compiled components.

See **[docs/css.md](./docs/css.md)** for the full design system documentation: tokens, theming, customization, Next.js/Vite setup, exports and migration.

#### Applying the theme surface

The library never resets `html` or `body`. Set the color mode on the document and opt into the Company surface when you want its canvas, foreground color and typography:

```html
<html data-zenth-mode="dark">
  <body class="zenth-root">
    <!-- application -->
  </body>
</html>
```

`data-mode="dark"` is still supported for backward compatibility.

#### Tokens only

```tsx
import "@company/react/tokens.css";
import "@company/react/themes/light.css";
import "@company/react/themes/dark.css";
```

#### For Tailwind CSS Users (optional)

If your application already runs Tailwind CSS v4 and wants the `@theme` tokens to use `bg-zenth-*` utilities in its own code, import the raw entry before `tailwindcss`:

```css
@source "../node_modules/@company/react/dist/**/*.{js,jsx,ts,tsx}";
@import "@company/react/styles/tailwind";
@import "tailwindcss";
```

> **Import order matters** — import the Company entry **before** `@import "tailwindcss"` so its `@theme` tokens are registered first.

> **Note:** The `@source` path is relative to your CSS file. Adjust it to your project layout — e.g. from `src/styles/` use `../../node_modules/@company/react/dist/**/*.{js,jsx,ts,tsx}`.

This pipeline is optional. `styles.css` already covers every component.

#### Legacy entry points (deprecated)

`@company/react/styles`, `@company/react/styles/tailwind` and `@company/react/styles/standalone` still resolve. New code should use `styles.css`, or `styles/tailwind` when it needs the raw Tailwind source.

### Base UI Primitives

Company React bundles [Base UI](https://base-ui.com) and re-exports all primitives for advanced use cases:

```tsx
// Barrel import - imports all primitives (convenient but larger bundle)
import { Popover, Slider, Accordion } from "@company/react/primitives";

// Granular imports - tree-shakeable, smaller bundles (recommended)
import { Popover } from "@company/react/primitives/popover";
import { Slider } from "@company/react/primitives/slider";
import { Accordion } from "@company/react/primitives/accordion";
```

> **Note:** Prefer styled Company React components when available. Primitives are for custom components not yet in Company React or cases requiring fine-grained control.
>
> **Performance tip:** Use granular imports (`@company/react/primitives/{name}`) for better tree-shaking and smaller bundle sizes.

#### Updating Primitives

Primitive exports are automatically generated from Base UI. After upgrading `@base-ui/react`:

```bash
# Regenerate primitive files to sync with new Base UI version
pnpm build:primitives

# Review changes (new/removed primitives)
git diff src/primitives/

# Commit if primitives changed
git add src/primitives/ package.json
git commit -m "chore: update primitives for base-ui@x.x.x"
```

The `build:primitives` script:

- Generates individual primitive files in `src/primitives/*.ts`
- Updates barrel export in `src/primitives/index.ts`
- Updates `package.json` with granular export paths
- Runs automatically before every build via the `prebuild` script

#### Validating Build Output

After building, validate the primitives output:

```bash
# Run post-build validation (checks dist/ structure)
pnpm validate:build
```

This validates:

- All primitive JS files exist in `dist/primitives/`
- All type definitions exist in `dist/src/primitives/`
- Base UI is bundled (not externalized)
- Import paths reference bundled modules
- Source maps are present

## Development

**For comprehensive contributor documentation, see [AGENTS.md](../../AGENTS.md).**

### Creating New Components

Use the scaffolding tool to quickly create new components with all required files and configurations:

```bash
# Create a new component
pnpm new-component

# Or use the shorthand
pnpm new
```

**What it creates:**

- Component file: `src/components/{name}/{name}.tsx`
- Index file: `src/components/{name}/index.ts`
- Test file: `src/components/{name}/{name}.test.tsx`

**What it updates:**

- `src/index.ts` - Adds component export
- `vite.config.ts` - Adds build entry
- `package.json` - Adds export configuration

**Example:**

```bash
? Component name: Alert Banner

✅ Component scaffolded successfully!

📁 Files created:
   - src/components/alert-banner/alert-banner.tsx
   - src/components/alert-banner/index.ts
   - src/components/alert-banner/alert-banner.test.tsx
```

The scaffolding tool handles naming automatically - input any format (spaces, PascalCase, kebab-case) and it will convert appropriately.

### Creating New Blocks

Blocks are higher-level components that compose multiple base components to create common page patterns. Use the block scaffolding tool:

```bash
# Create a new block
pnpm new-block
```

**What it creates:**

- Block file: `src/blocks/{name}/{name}.tsx`
- Index file: `src/blocks/{name}/index.ts`
- Test file: `src/blocks/{name}/{name}.test.tsx`

**What it updates:**

- `src/index.ts` - Adds block export
- `vite.config.ts` - Adds build entry
- `package.json` - Adds export configuration

Blocks are higher-level components that compose multiple base components. See [AGENTS.md](../../AGENTS.md) for detailed documentation on blocks.

### Development Workflows

#### Watch Build Mode

To test components in the actual documentation site or consuming application:

**Start watch build:**

```bash
pnpm dev
```

This runs Vite in watch mode with optimizations for fast rebuilds:

- ⚡~400ms rebuild time (10x faster than production builds)
- Skips minification in development
- Incremental TypeScript compilation
- Selective file watching (ignores tests)
- Validates components against production build output

**Using with documentation site:**

Terminal 1 (this directory):

```bash
pnpm dev
```

Terminal 2 (from workspace root or kumo-docs):

```bash
cd ../kumo-docs
pnpm dev
```

When you edit a component:

1. Company React rebuilds automatically (~400ms)
2. Refresh browser to see changes in docs site
3. Changes are validated against the actual build output

**Build modes:**

- `pnpm dev` - Development mode (fast, optimized for iteration)
- `pnpm build` - Production mode (full optimization, minification, CSS processing)

### Testing

The package includes comprehensive import validation tests that ensure all components are properly exported and consumable.

**Run tests:**

```bash
# Watch mode
pnpm test

# Single run
pnpm test:run

# With UI
pnpm test:ui

# With coverage
pnpm test:coverage
```

**What's tested:**

- All components importable from main entry: `import { Component } from "@company/react"`
- All components importable via deep imports: `import { Component } from "@company/react/components/component-name"`
- All blocks importable from main entry: `import { Block } from "@company/react"`
- All blocks importable via deep imports: `import { Block } from "@company/react/blocks/block-name"`
- Package.json exports sync with actual components and blocks
- Export paths and formats are correct
- Build configuration consistency

**Zero maintenance:** Tests automatically discover components and blocks from the filesystem and validate against package.json. When adding new items, tests will fail with exact code snippets to fix configuration.

## Beta Releases

Beta releases allow you to test changes before publishing to production. Beta versions are automatically created for pull requests and include the commit hash for identification.

### Automated Beta Releases

Beta releases are automatically triggered for pull requests through GitHub Actions (`.github/workflows/package-preview-pr.yml`):

**Workflow Configuration:**

- **Workflow**: `package-preview-pr.yml`
- **Triggers**: Pull requests with changes to `packages/react/**` or `.changeset/**`
- **Dependencies**: Requires changeset to exist for `@company/react`

**Process Flow:**

1. **Validate**: Ensures changeset exists for `@company/react`
2. **Version**: Runs `pnpm run version:beta`
   - Consumes pending changesets
   - Appends `-beta.{commit-hash}` to version number
3. **Build**: Runs `pnpm --filter @company/react build`
4. **Publish**: Publishes to npm with `beta` tag
5. **Notify**: Posts PR comment with installation instructions

**Secrets Required:**

- `NPM_TOKEN`: Authentication for npm registry
- `GITHUB_TOKEN`: For posting PR comments (built-in)

### Beta Version Format

Beta versions follow this pattern:

```
{base-version}-beta.{commit-hash}
```

For example: `0.1.0-beta.a1b2c3d`

### Installing Beta Versions

When a beta is published, the PR will include a comment with installation instructions:

```bash
# Install the specific beta version
npm install @company/react@0.1.0-beta.a1b2c3d

# Or with pnpm
pnpm add @company/react@0.1.0-beta.a1b2c3d
```

### Testing Beta Releases

1. **Create PR**: Submit your changes with a changeset
2. **Wait for Beta**: The beta job runs automatically after changeset validation passes
3. **Install Beta**: Use the version from the PR comment
4. **Test Changes**: Verify functionality in your project
5. **Merge**: Once tested, merge the PR for production release

### Changeset Validation

All pull requests with changes to `packages/react/` must include a changeset:

```bash
# Create a changeset
pnpm changeset
```

- Select `@company/react` when prompted
- Choose the type of change: `patch`, `minor`, or `major`
- Write a clear description of what changed

The CI will automatically validate that a changeset exists before allowing beta publication.

## Production Releases

This package uses [Changesets](https://github.com/changesets/changesets) for version management and automated releases.

### Creating a Release

1. **Check for existing changesets**:

   ```bash
   # List any pending changesets
   ls .changeset/*.md 2>/dev/null | grep -v "README\|USAGE" || echo "No pending changesets"
   ```

2. **Create a changeset** for your changes (if necessary):

   ```bash
   pnpm changeset
   ```

   - Select `@company/react` from the list
   - Select the type of change: `patch`, `minor`, or `major`
   - Write a clear description of what changed
   - This creates a `.changeset/*.md` file describing the change

### Release Workflow

1. **Development**: Make changes to components or blocks
2. **Changeset**: Create changeset describing the changes
3. **Review**: Submit PR with changes and changeset
4. **Beta Test**: Test the beta version published to the PR
5. **Merge**: Merge PR to main branch
6. **Release**: Run the production release process

### Production Release Process

To publish a production release:

```bash
# 1. Ensure you're on main branch with latest changes
git checkout main
git pull

# 2. Version all packages (consumes changesets)
pnpm version

# 3. Build all packages
pnpm build:all

# 4. Publish to npm
pnpm release
```

This will:

- Update `package.json` with new version
- Generate/update `CHANGELOG.md`
- Remove consumed changeset files
- Publish to npm registry
- Create git tags

### Post-Release

After publishing:

1. **Commit version changes**:

   ```bash
   git add .
   git commit -m "chore: release @company/react@{version}"
   git push
   ```

2. **Push tags**:

   ```bash
   git push --tags
   ```

3. **Verify publication**:
   ```bash
   npm view @company/react versions
   ```

### Semantic Versioning

Follow semantic versioning guidelines:

- **Patch** (`0.0.1`): Bug fixes, small component updates, style tweaks
- **Minor** (`0.1.0`): New components, new features, backwards-compatible changes
- **Major** (`1.0.0`): Breaking changes, removed components, API changes

### Release Notes

Changesets automatically generate:

- Updated `package.json` version
- `CHANGELOG.md` with release notes
- Git tags for each release

The changelog includes all changeset descriptions, providing clear documentation of what changed in each release.

## Troubleshooting

### Common Issues

**Changeset Validation Failed**

If the CI fails with a changeset validation error:

1. **Check if changeset exists**: Run `ls .changeset/*.md` to see pending changesets
2. **Create changeset**: Run `pnpm changeset` and select `@company/react`
3. **Verify changeset targets correct package**: Open the changeset file and ensure it includes `@company/react`
4. **Commit changeset**: Add and commit the changeset file to your branch

**Beta Publication Failed**

If the beta release job fails:

1. **Check build**: Ensure `pnpm build` succeeds locally
2. **Check npm token**: Verify npm authentication is configured in CI
3. **Check version format**: Ensure version follows semver format
4. **Review CI logs**: Check GitHub Actions logs for specific error messages

**Import Errors After Release**

If consumers report import errors:

1. **Verify exports**: Check `package.json` exports match actual files
2. **Run tests**: Ensure `pnpm test:run` passes
3. **Check build output**: Verify `dist/` contains expected files
4. **Test locally**: Use `npm link` to test package locally before publishing
