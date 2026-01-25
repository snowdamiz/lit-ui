# Phase 13: Monorepo Infrastructure - Research

**Researched:** 2026-01-24
**Domain:** pnpm workspaces, changesets, TypeScript monorepo configuration
**Confidence:** HIGH

## Summary

This phase restructures the lit-components project into a pnpm monorepo with changesets for version management. The research covers pnpm workspace configuration, changesets setup with fixed/lockstep versioning, shared TypeScript configuration patterns, and Vite library build configuration for multiple packages.

The standard approach is straightforward: pnpm workspaces handle package linking and dependency management, changesets manages versioning with its "fixed" mode for lockstep versions, a shared TypeScript config package provides consistency, and each component package has its own Vite build configuration that externalizes Lit as a peer dependency.

**Primary recommendation:** Use flat `packages/` directory with one package per component, shared config packages for TypeScript and Vite, and changesets with `fixed` array for lockstep versioning. Keep docs as a workspace package for natural testbed integration.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| pnpm | 10.x | Package manager + workspaces | Content-addressable store, strict node_modules, native workspace support |
| @changesets/cli | 2.x | Version management + changelogs | Purpose-built for monorepos, fixed mode for lockstep, GitHub action integration |
| vite-plugin-dts | 4.x | TypeScript declaration generation | Already in use, supports monorepo entryRoot option |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @changesets/changelog-github | 0.5.x | Enhanced changelog formatting | Links PRs and contributors in changelogs |
| pnpm/action-setup | v4 | GitHub Actions pnpm setup | CI/CD workflows |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| pnpm workspaces alone | Turborepo/Nx | Adds caching + task orchestration but more complexity; not needed for small package count |
| changesets fixed mode | changesets linked mode | Linked allows different versions; fixed enforces identical versions (project decision) |
| TypeScript project references | extends only | References add build caching but also complexity; not recommended by Turborepo docs |

**Installation:**
```bash
pnpm add -Dw @changesets/cli @changesets/changelog-github
pnpm changeset init
```

## Architecture Patterns

### Recommended Project Structure

```
lit-components/
├── .changeset/
│   └── config.json           # Changesets configuration
├── packages/
│   ├── core/                 # @lit-ui/core - base classes, utilities
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json     # Extends shared config
│   │   └── vite.config.ts    # Extends shared config
│   ├── button/               # @lit-ui/button
│   │   ├── src/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   ├── dialog/               # @lit-ui/dialog
│   │   └── ...
│   ├── typescript-config/    # @lit-ui/typescript-config (internal)
│   │   ├── base.json
│   │   └── package.json
│   └── vite-config/          # @lit-ui/vite-config (internal)
│       ├── library.js
│       └── package.json
├── apps/
│   └── docs/                 # Documentation site (workspace package)
│       ├── src/
│       ├── package.json
│       └── vite.config.ts
├── pnpm-workspace.yaml
├── package.json              # Root package.json with workspace scripts
└── tsconfig.json             # Root tsconfig (references only, no compilerOptions)
```

### Pattern 1: pnpm Workspace Configuration

**What:** Define workspace package locations in pnpm-workspace.yaml
**When to use:** Always - required for pnpm workspaces

**Example:**
```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

### Pattern 2: Workspace Protocol for Internal Dependencies

**What:** Use `workspace:*` protocol for internal package references
**When to use:** When one package depends on another in the monorepo

**Example:**
```json
// packages/button/package.json
{
  "name": "@lit-ui/button",
  "dependencies": {
    "@lit-ui/core": "workspace:*"
  },
  "peerDependencies": {
    "lit": "^3.0.0"
  }
}
```

The `workspace:*` protocol automatically converts to actual version numbers during `pnpm publish`.

### Pattern 3: Changesets Fixed Mode for Lockstep Versions

**What:** All packages always have the same version number
**When to use:** When packages are tightly coupled and should release together

**Example:**
```json
// .changeset/config.json
{
  "$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
  "changelog": "@changesets/changelog-github",
  "commit": false,
  "fixed": [["@lit-ui/*"]],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["@lit-ui/typescript-config", "@lit-ui/vite-config"]
}
```

With `fixed`, when any package gets a changeset, ALL packages in the fixed group bump to the same version.

### Pattern 4: Shared TypeScript Configuration

**What:** Base tsconfig in a config package, individual packages extend it
**When to use:** Always - ensures consistency across packages

**Example:**
```json
// packages/typescript-config/base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "strict": true,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"]
  }
}

// packages/button/tsconfig.json
{
  "extends": "@lit-ui/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"]
}
```

### Pattern 5: Shared Vite Library Configuration

**What:** Base Vite config factory function, packages call with their entry point
**When to use:** For consistent build configuration across component packages

**Example:**
```javascript
// packages/vite-config/library.js
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export function createLibraryConfig(options) {
  return defineConfig({
    plugins: [
      dts({
        rollupTypes: true,
        entryRoot: options.entryRoot || 'src'
      })
    ],
    build: {
      lib: {
        entry: options.entry || 'src/index.ts',
        formats: ['es'],
        fileName: 'index'
      },
      rollupOptions: {
        external: ['lit', /^lit\//, /^@lit\//]
      }
    }
  });
}

// packages/button/vite.config.ts
import { createLibraryConfig } from '@lit-ui/vite-config';

export default createLibraryConfig({
  entry: 'src/index.ts'
});
```

### Pattern 6: Root Package Scripts

**What:** Workspace-wide commands in root package.json
**When to use:** For development workflow and CI

**Example:**
```json
// package.json (root)
{
  "name": "lit-ui-monorepo",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel run dev",
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "lint": "pnpm -r run lint",
    "changeset": "changeset",
    "version": "changeset version",
    "ci:publish": "pnpm build && changeset publish --access public"
  },
  "devDependencies": {
    "@changesets/cli": "^2.28.0",
    "@changesets/changelog-github": "^0.5.0"
  }
}
```

### Anti-Patterns to Avoid

- **Bundling Lit into packages:** "Bundling a reusable component before publishing to npm can introduce multiple versions of Lit into a user's application" - Lit official docs. Always externalize Lit.
- **Using TypeScript project references without build orchestration:** Adds configuration complexity without tooling to manage it. Use simple `extends` instead.
- **Hoisting devDependencies incorrectly:** Keep build tools (vite, typescript) as devDependencies in each package, not just root, for proper isolation.
- **Omitting file extensions in imports:** Lit recommends including `.js` extensions for optimal import map compatibility.
- **Publishing minified code:** Prevents application-level optimizations. Publish unminified ES modules.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Version bumping across packages | Custom scripts | @changesets/cli | Handles dependency graph, changelogs, git tags |
| Workspace dependency linking | Manual symlinks | pnpm workspaces | workspace: protocol with auto-conversion on publish |
| TypeScript declarations | tsc manually | vite-plugin-dts | Integrates with Vite build, handles rollup |
| Lock file updates after version | Manual pnpm install | Changesets workflow | Run `pnpm install` after `changeset version` |
| Parallel watch mode | Custom process management | `pnpm -r --parallel` | Native support with proper process handling |

**Key insight:** The pnpm + changesets combination is battle-tested by major projects (Lit itself, Vue, Vite, Nuxt). The tooling handles edge cases around publishing, version ranges, and workspace protocols that would take significant effort to replicate.

## Common Pitfalls

### Pitfall 1: Lock File Desync After Version Bump

**What goes wrong:** After running `changeset version`, the pnpm-lock.yaml is stale because internal package versions changed.
**Why it happens:** Changesets updates package.json versions but doesn't run `pnpm install`.
**How to avoid:** Always run `pnpm install` after `changeset version` before committing.
**Warning signs:** CI fails on `pnpm install --frozen-lockfile` after merging version PR.

### Pitfall 2: Phantom Dependencies in Strict Mode

**What goes wrong:** Code imports a package that isn't in package.json, works locally but fails in isolation.
**Why it happens:** pnpm's strict node_modules doesn't hoist like npm/yarn. Package was a transitive dependency.
**How to avoid:** Ensure all imports are declared as dependencies. Use `pnpm why <package>` to trace.
**Warning signs:** "Cannot find module" errors only in certain packages or CI.

### Pitfall 3: Workspace Link vs Registry Resolution

**What goes wrong:** Package resolves from npm registry instead of local workspace.
**Why it happens:** Didn't use `workspace:*` protocol, or version range doesn't match local package.
**How to avoid:** Always use `workspace:*` for internal dependencies. Check `pnpm why` output.
**Warning signs:** Unexpected version in node_modules, changes not reflected.

### Pitfall 4: Build Order in Watch Mode

**What goes wrong:** Dependent package's dev server starts before dependency builds.
**Why it happens:** `--parallel` flag ignores dependency graph.
**How to avoid:** Run initial `pnpm build` before `pnpm dev`, or use `pnpm -r --stream` for topological order (but blocks on watch).
**Warning signs:** "Cannot find module" errors on fresh clone, works after manual build.

### Pitfall 5: vite-plugin-dts rootDir Errors in Monorepo

**What goes wrong:** TypeScript error: `'rootDir' is expected to contain all source files.`
**Why it happens:** pnpm symlinks resolve to node_modules paths outside the package.
**How to avoid:** Configure `entryRoot` option in vite-plugin-dts, add `baseUrl` to tsconfig.
**Warning signs:** Build fails when importing from other workspace packages.

### Pitfall 6: Fixed Mode Versioning Surprise

**What goes wrong:** All packages get bumped even when only one changed.
**Why it happens:** This is the intended behavior of `fixed` mode.
**How to avoid:** Understand this is the tradeoff for lockstep versions. Use `linked` if packages should have independent versions.
**Warning signs:** None - this is expected behavior, just document it for contributors.

## Code Examples

Verified patterns from official sources:

### Package.json for a Lit Component Package

```json
// Source: Lit publishing docs + pnpm workspace patterns
{
  "name": "@lit-ui/button",
  "version": "1.0.0",
  "type": "module",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist"],
  "scripts": {
    "dev": "vite build --watch",
    "build": "vite build",
    "test": "vitest run"
  },
  "dependencies": {
    "@lit-ui/core": "workspace:*"
  },
  "peerDependencies": {
    "lit": "^3.0.0"
  },
  "devDependencies": {
    "@lit-ui/typescript-config": "workspace:*",
    "@lit-ui/vite-config": "workspace:*",
    "lit": "^3.3.2",
    "typescript": "^5.9.3",
    "vite": "^7.3.1",
    "vite-plugin-dts": "^4.5.4"
  }
}
```

### GitHub Actions Workflow for Changesets

```yaml
# Source: pnpm docs + changesets action
# .github/workflows/release.yml
name: Release
on:
  push:
    branches:
      - main
concurrency: ${{ github.workflow }}-${{ github.ref }}
permissions:
  contents: write
  pull-requests: write

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
          registry-url: 'https://registry.npmjs.org'
      - run: pnpm install --frozen-lockfile
      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm run ci:publish
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

### pnpm Filter Commands

```bash
# Source: pnpm documentation
# Build specific package
pnpm --filter @lit-ui/button build

# Build package and its dependencies
pnpm --filter @lit-ui/button... build

# Run dev in all packages in parallel (for watch mode)
pnpm -r --parallel run dev

# Run tests in all packages
pnpm -r run test

# Add dependency to specific package
pnpm --filter @lit-ui/button add lodash

# Add workspace dependency
pnpm --filter @lit-ui/button add @lit-ui/core --workspace
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Lerna for monorepos | pnpm workspaces + changesets | 2022-2023 | Lerna less maintained; pnpm native workspaces are standard |
| npm/yarn workspaces | pnpm workspaces | 2021-2022 | pnpm's strict mode prevents phantom dependencies |
| Manual versioning | Changesets automation | 2020+ | Eliminates human error in version management |
| TypeScript project references | Simple extends | 2024+ | Turborepo/Nx docs recommend against references without orchestration |

**Deprecated/outdated:**
- **Lerna bootstrap**: No longer needed with native workspace support in npm/yarn/pnpm
- **publishConfig.directory**: pnpm handles this with workspace: protocol transformation

## Open Questions

Things that couldn't be fully resolved:

1. **Tailwind CSS in monorepo packages**
   - What we know: Each package currently uses @tailwindcss/vite plugin
   - What's unclear: Whether Tailwind config should be shared or per-package for component libraries
   - Recommendation: Keep per-package initially; refactor to shared config if duplication becomes problematic

2. **CLI package location**
   - What we know: Currently at packages/cli, will need CLI-specific build (not library mode)
   - What's unclear: Whether it should stay in packages/ or move elsewhere
   - Recommendation: Keep in packages/ as @lit-ui/cli, use different Vite config for executable output

3. **Docs site base path for GitHub Pages**
   - What we know: Docs is currently a separate app with its own build
   - What's unclear: How base path configuration works in workspace context
   - Recommendation: Keep docs in apps/ directory, configure base path in its own vite.config.ts

## Sources

### Primary (HIGH confidence)
- [pnpm Workspaces](https://pnpm.io/workspaces) - Workspace configuration, protocol, filtering
- [pnpm Recursive Commands](https://pnpm.io/cli/recursive) - Parallel execution, flags
- [Changesets GitHub](https://github.com/changesets/changesets) - Core concepts, config options
- [Changesets Config Options](https://github.com/changesets/changesets/blob/main/docs/config-file-options.md) - Full config schema
- [Changesets Action](https://github.com/changesets/action) - GitHub Actions integration
- [Lit Publishing Docs](https://lit.dev/docs/tools/publishing/) - Component publishing best practices
- [Vite Build Docs](https://vite.dev/guide/build) - Library mode configuration
- [Turborepo TypeScript Guide](https://turborepo.dev/docs/guides/tools/typescript) - Shared tsconfig patterns

### Secondary (MEDIUM confidence)
- [Using Changesets with pnpm](https://pnpm.io/9.x/using-changesets) - pnpm-specific workflow
- [Complete Monorepo Guide 2025](https://jsdev.space/complete-monorepo-guide/) - Community patterns
- [vite-plugin-dts npm](https://www.npmjs.com/package/vite-plugin-dts) - Monorepo entryRoot option

### Tertiary (LOW confidence)
- Various Medium/DEV.to articles on monorepo setup - Community experiences

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official docs from pnpm, changesets, Lit all verified
- Architecture: HIGH - Patterns are well-documented and used by major projects (Lit, Vue, Vite)
- Pitfalls: MEDIUM - Combination of official docs and community experiences

**Research date:** 2026-01-24
**Valid until:** 2026-02-24 (30 days - stable ecosystem)
