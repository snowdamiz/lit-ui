# Stack Research: NPM + SSR

**Project:** LitUI v2.0
**Researched:** 2026-01-24
**Dimension:** NPM packaging and SSR compatibility

## Executive Summary

NPM package distribution requires monorepo restructuring with pnpm workspaces and changesets for versioning. SSR compatibility requires the Lit Labs SSR packages (@lit-labs/ssr, @lit-labs/ssr-client) plus component modifications to guard browser-only APIs with `isServer`. The existing Vite + vite-plugin-dts setup is already suitable for library builds with minor configuration changes.

**Key finding:** The @lit-labs/ssr package is still in Labs (experimental) status as of v4.0.0, but is the only official path for Lit SSR. All modern browsers now support Declarative Shadow DOM natively.

---

## Recommended Additions

### @lit-labs/ssr

- **Purpose:** Server-side rendering of Lit templates and components. Generates HTML with Declarative Shadow DOM for pre-rendered content.
- **Version:** 4.0.0 (verified via npm 2026-01-24)
- **Integration:** Used at build/serve time for SSR rendering, not bundled into client components. Provides `render()` function that outputs RenderResult iterable.
- **Alternative considered:** None - this is the only official Lit SSR solution. Stencil has its own SSR but requires their component model.
- **Confidence:** HIGH - official Lit package, verified version

### @lit-labs/ssr-client

- **Purpose:** Client-side hydration support for server-rendered Lit components. Provides `hydrate()` method to reconnect Lit templates with DOM.
- **Version:** 1.1.8 (verified via npm 2026-01-24)
- **Integration:** Must be loaded BEFORE lit and any component modules. Import `@lit-labs/ssr-client/lit-element-hydrate-support.js` first in client entry point.
- **Alternative considered:** Manual hydration - not recommended, complex and error-prone.
- **Confidence:** HIGH - official Lit package, verified version

### @webcomponents/template-shadowroot

- **Purpose:** Polyfill for Declarative Shadow DOM in browsers without native support.
- **Version:** 0.2.1 (verified via npm 2026-01-24)
- **Integration:** Optional - only needed for legacy browser support. Firefox added native DSD support. Chrome and Safari already support it.
- **Alternative considered:** None - this is the official Web Components polyfill.
- **Confidence:** HIGH - browser support is now universal in modern browsers, polyfill only for edge cases

### pnpm (workspace manager)

- **Purpose:** Efficient monorepo package management. Content-addressable store reduces disk usage 60-80% vs npm/yarn. Enables workspace protocol for local package references.
- **Version:** 10.28.1 (verified via npm 2026-01-24)
- **Integration:** Replace npm with pnpm. Add `pnpm-workspace.yaml` at root. Use `workspace:*` protocol for internal dependencies.
- **Alternative considered:**
  - npm workspaces - slower, no content-addressable store
  - yarn workspaces - viable but pnpm has better monorepo performance
  - Nx/Turborepo - overkill for 4-5 packages, adds complexity
- **Confidence:** HIGH - industry standard for monorepos

### @changesets/cli

- **Purpose:** Monorepo versioning and changelog generation. Handles independent versioning of multiple packages, generates changelogs from contributor descriptions.
- **Version:** 2.29.8 (verified via npm 2026-01-24)
- **Integration:** Add `.changeset/` directory. Run `changeset add` before commits with version-bumping changes. `changeset version` bumps versions. `changeset publish` publishes to npm.
- **Alternative considered:**
  - Manual versioning - error-prone, doesn't scale
  - Lerna - deprecated, less maintained
  - Rush - overkill for small monorepo
- **Confidence:** HIGH - standard tool for monorepo publishing

---

## Build Configuration Changes

### Vite Library Mode (existing, minimal changes)

Current configuration is mostly suitable. Changes needed:

**package.json exports field expansion:**
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./button": {
      "types": "./dist/button.d.ts",
      "import": "./dist/button.js"
    },
    "./dialog": {
      "types": "./dist/dialog.d.ts",
      "import": "./dist/dialog.js"
    }
  },
  "sideEffects": false
}
```

**Rationale:** Subpath exports enable tree-shaking and individual component imports (`import '@lit-ui/core/button'`).

### SSR Build Considerations

**isServer guards in TailwindElement:**
The existing `TailwindElement` base class uses browser APIs that need guards:

```typescript
// Current (breaks in SSR):
if (typeof document !== 'undefined') {
  document.adoptedStyleSheets = [...];
}

// Better (using Lit's isServer):
import { isServer } from 'lit';
if (!isServer) {
  document.adoptedStyleSheets = [...];
}
```

**Lifecycle method awareness:**
Server-side execution includes: `constructor()`, `hasChanged()`, `willUpdate()`, `render()`
Client-only execution includes: `connectedCallback()`, `updated()`, `firstUpdated()`

The existing components use `connectedCallback()` for style adoption which is correct - it won't run on server.

**ElementInternals consideration:**
The Button component uses `attachInternals()` in constructor. This needs an `isServer` guard:

```typescript
constructor() {
  super();
  if (!isServer) {
    this.internals = this.attachInternals();
  }
}
```

### Monorepo Structure

Recommended structure for packages:

```
lit-components/
  packages/
    core/           # @lit-ui/core - base classes, utilities
    button/         # @lit-ui/button - button component
    dialog/         # @lit-ui/dialog - dialog component
    cli/            # lit-ui CLI (existing)
  pnpm-workspace.yaml
  package.json      # root workspace config
```

**pnpm-workspace.yaml:**
```yaml
packages:
  - 'packages/*'
```

**Root package.json scripts:**
```json
{
  "scripts": {
    "build": "pnpm -r build",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm build && changeset publish"
  }
}
```

---

## NOT Recommended

### Nx or Turborepo

- **Why not:** Overkill for 4-5 packages. Adds configuration complexity and learning curve. pnpm workspaces alone provide sufficient task running. Revisit if package count grows significantly (10+).

### Lerna

- **Why not:** Less actively maintained. Changesets is the modern replacement for versioning concerns. pnpm workspaces handles the monorepo linking.

### Custom SSR solution

- **Why not:** @lit-labs/ssr is the official solution with Declarative Shadow DOM output. Building custom would require reimplementing the DOM shim and render logic.

### Bundling lit into packages

- **Why not:** Lit documentation explicitly warns against this. Conditional exports in lit won't work properly if bundled. Mark `lit` as external in all builds.

### CommonJS output

- **Why not:** Modern ecosystem is ESM-first. The existing setup outputs ESM only, which is correct. CJS adds bundle size and complexity for no benefit in this use case.

### @lit-labs/ssr in client bundle

- **Why not:** SSR package is for server/build-time only. Only @lit-labs/ssr-client goes to the browser. Bundling SSR would add ~50KB+ unnecessarily.

---

## Integration Points with Existing Stack

| Existing | Integration Required |
|----------|---------------------|
| Lit 3.3.2 | Import `isServer` for SSR guards. No version change needed. |
| Vite 7.3.1 | Keep as build tool. Add workspace-aware config. |
| vite-plugin-dts 4.5.4 | Keep for TypeScript declarations. Works with multiple entry points. |
| Tailwind v4 | No changes needed. Constructable stylesheets work with SSR. |
| TypeScript 5.9.3 | No changes needed. |
| citty CLI | Extend to support `--npm` flag for install mode selection. |

---

## Package Naming Strategy

| Package | npm Name | Purpose |
|---------|----------|---------|
| core | @lit-ui/core | TailwindElement base, design tokens, utilities |
| button | @lit-ui/button | Button component (depends on core) |
| dialog | @lit-ui/dialog | Dialog component (depends on core) |
| cli | lit-ui | CLI tool (existing) |

**Rationale:** Scoped packages (@lit-ui/*) group related packages. CLI stays unscoped for `npx lit-ui` convenience.

---

## Version Compatibility Matrix

| Package | Min Version | Verified Version | Notes |
|---------|-------------|------------------|-------|
| lit | ^3.0.0 | 3.3.2 | Peer dependency |
| @lit-labs/ssr | ^4.0.0 | 4.0.0 | Labs/experimental |
| @lit-labs/ssr-client | ^1.1.0 | 1.1.8 | Labs/experimental |
| pnpm | ^9.0.0 | 10.28.1 | For workspaces |
| Node.js | ^18.0.0 | - | For SSR runtime |

---

## Sources

- [Lit SSR Overview](https://lit.dev/docs/ssr/overview/) - Official SSR documentation
- [Lit SSR Authoring](https://lit.dev/docs/ssr/authoring/) - Component authoring for SSR
- [Lit SSR Client Usage](https://lit.dev/docs/ssr/client-usage/) - Hydration and client setup
- [pnpm Workspaces](https://pnpm.io/workspaces) - Monorepo configuration
- [Changesets](https://github.com/changesets/changesets) - Monorepo versioning
- [Vite Build Guide](https://vite.dev/guide/build) - Library mode configuration
- [Node.js Package Exports](https://nodejs.org/api/packages.html) - Conditional exports
- [package.json exports Guide](https://hirok.io/posts/package-json-exports) - Subpath exports patterns

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| SSR packages | HIGH | Verified versions via npm, official Lit documentation |
| Monorepo tooling | HIGH | pnpm + changesets is industry standard |
| Vite library mode | HIGH | Already working in project, minimal changes |
| isServer guards | HIGH | Documented in official Lit SSR authoring guide |
| Package structure | MEDIUM | Based on common patterns, may need adjustment |

---

## Open Questions for Implementation

1. **Shared Tailwind styles:** Should core package export pre-built CSS or let each component package include styles? (Recommendation: core exports base, components import from core)

2. **SSR testing strategy:** Need to verify SSR output produces valid Declarative Shadow DOM. Consider adding SSR render tests.

3. **CLI npm mode:** How should CLI detect and handle both copy-source and npm install modes? (Recommendation: `--mode npm` flag)
