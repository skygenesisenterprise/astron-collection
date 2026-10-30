# Changesets

This repository uses [changesets](https://github.com/changesets/changesets) to
version and publish the packages in the pnpm workspace.

## How it works

1. Add a changeset for every user-facing change:

   ```bash
   pnpm changeset
   ```

   It asks which packages changed and how (`patch` / `minor` / `major`), then
   writes a Markdown file in `.changeset/`. Commit that file with your change.

2. Review pending changesets with `pnpm changeset status` and apply version
   bumps and changelogs with `pnpm changeset version`.

3. Push a version tag to publish a package through
   `.github/workflows/node-release.yml`. Tags follow `vX.Y.Z-cli`,
   `vX.Y.Z-sdk`, or `vX.Y.Z-trpc-openapi`; `vX.Y.Z-node` publishes all three.
   A manual run from `master` also publishes all three. Packages are published
   to npmjs; Docker images are published independently by
   `.github/workflows/docker-publish.yml`.

## Which packages are published

Published to npmjs (public):

- `@astron-collection/cli`
- `@astron-collection/sdk`
- `@astron-collection/trpc-openapi`

Other workspace packages are not published by this workflow. Some may be
versioned by Changesets or shipped as containers:

- `@astron-collection/app` (the dashboard/server, shipped as a Docker image)
- `@astron-collection/docs`, `@astron-collection/website` (deployed to GitHub Pages and Docker)
- `@astron-collection/api`, `@astron-collection/schedules` (internal services, ignored by changesets)

## Common commands

```bash
pnpm changeset status    # what would be released
pnpm changeset version   # apply pending changesets locally
pnpm changeset add       # add a new changeset
```
