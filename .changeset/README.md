# Changesets

This repository uses [changesets](https://github.com/changesets/changesets) for version management.

## Adding a Changeset

When you make a change that should be released:

```bash
pnpm changeset
```

This will prompt you to:
1. Select which packages have changed
2. Choose the semver bump type (patch/minor/major)
3. Write a summary of the change

## Releasing

Releases are handled automatically by CI when PRs are merged to main.

To release manually:

```bash
pnpm version    # Updates package versions based on changesets
pnpm ci:publish # Builds and publishes to npm
```

## Fixed Versioning

All @lit-ui packages use lockstep versioning - they always share the same version number.
This ensures compatibility between packages.
