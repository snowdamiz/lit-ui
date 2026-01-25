---
phase: 14-core-package
verified: 2026-01-24T20:30:00Z
status: passed
score: 5/5 must-haves verified
---

# Phase 14: Core Package Verification Report

**Phase Goal:** @lit-ui/core exports SSR-aware TailwindElement with dual-mode styling
**Verified:** 2026-01-24T20:30:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Consumer imports `import { TailwindElement } from '@lit-ui/core'` successfully | ✓ VERIFIED | TailwindElement exported in dist/index.d.ts, package.json exports field maps "." to dist/index.js |
| 2 | TailwindElement renders with inline styles during SSR (no constructable stylesheets) | ✓ VERIFIED | Static styles getter returns unsafeCSS(tailwindStyles) when isServer === true (line 144-146), constructable stylesheet creation guarded with `if (!isServer && typeof CSSStyleSheet !== 'undefined')` (line 52) |
| 3 | After hydration, component uses shared constructable stylesheets (memory optimization) | ✓ VERIFIED | Module-level sharedTailwindSheet/sharedHostDefaultsSheet created once (lines 49-58), _adoptTailwindStyles() applies them to shadowRoot.adoptedStyleSheets in connectedCallback (lines 176-187) |
| 4 | Design tokens available via CSS custom properties from @lit-ui/core/tokens | ✓ VERIFIED | tokens/index.ts exports 92-line tokens object with color/spacing/radius/shadow/fontFamily/zIndex, package.json exports "./tokens" to dist/tokens/index.js |
| 5 | Tree shaking removes unused exports when bundling consumer app | ✓ VERIFIED | package.json has `sideEffects: false`, all module-level code properly guarded (!isServer, typeof checks), lit externalized as import (not bundled) |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/core/src/tailwind-element.ts` | SSR-aware base class with dual-mode styling | ✓ VERIFIED | 189 lines, imports isServer from lit, static styles getter with isServer check, constructable stylesheet guards, no stub patterns |
| `packages/core/src/styles/tailwind.css` | Tailwind v4 config with design tokens | ✓ VERIFIED | 7.3KB file, contains `@import "tailwindcss"`, @theme block with tokens, :host-context(.dark) overrides |
| `packages/core/src/styles/host-defaults.css` | Shadow DOM @property workaround | ✓ VERIFIED | 4.5KB file, contains `:host` declarations with fallback values for @property-dependent variables |
| `packages/core/src/styles/safelist.css` | Explicit utility classes for passthrough | ✓ VERIFIED | 74KB file with safelisted utilities |
| `packages/core/src/tokens/index.ts` | Design tokens as CSS custom property references | ✓ VERIFIED | 92 lines, exports tokens object with 6 categories (color/spacing/radius/shadow/fontFamily/zIndex), type helpers exported |
| `packages/core/src/utils/events.ts` | Type-safe custom event dispatch helper | ✓ VERIFIED | 45 lines, exports dispatchCustomEvent with composed: true default, proper TypeScript generics |
| `packages/core/src/utils/environment.ts` | SSR-safe environment detection | ✓ VERIFIED | Re-exports isServer from lit, exports hasConstructableStylesheets feature check |
| `packages/core/src/fouc.css` | FOUC prevention CSS | ✓ VERIFIED | Contains :not(:defined) selectors for ui-button and ui-dialog, optional skeleton pattern commented |
| `packages/core/package.json` | Exports field with /tokens subpath | ✓ VERIFIED | Exports field has ".", "./tokens", "./utils", "./fouc.css" subpaths, sideEffects: false, lit ^3.0.0 peer dependency |
| `packages/core/dist/index.js` | Built library output | ✓ VERIFIED | 65KB file (65 lines), imports from lit externalized, exports TailwindElement/isServer/dispatchCustomEvent/hasConstructableStylesheets/VERSION |
| `packages/core/dist/tokens/index.js` | Tokens build output | ✓ VERIFIED | 1.9KB file with tokens object |
| `packages/core/dist/utils/index.js` | Utils build output | ✓ VERIFIED | 465 bytes with utility exports |

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `tailwind-element.ts` | `styles/tailwind.css` | import with ?inline | ✓ WIRED | Line 34: `import tailwindStyles from './styles/tailwind.css?inline'` |
| `tailwind-element.ts` | `styles/host-defaults.css` | import with ?inline | ✓ WIRED | Line 36: `import hostDefaults from './styles/host-defaults.css?inline'` |
| `index.ts` | `tailwind-element.ts` | export | ✓ WIRED | Line 3: `export { TailwindElement } from './tailwind-element.js'` |
| `package.json exports` | `dist/tokens/index.js` | exports field | ✓ WIRED | "./tokens" maps to types: dist/tokens/index.d.ts, import: dist/tokens/index.js |
| `package.json exports` | `dist/utils/index.js` | exports field | ✓ WIRED | "./utils" maps to types: dist/utils/index.d.ts, import: dist/utils/index.js |
| `tailwind-element.ts` (SSR) | static styles getter | isServer check | ✓ WIRED | Lines 144-149: returns unsafeCSS when isServer, empty array when client |
| `tailwind-element.ts` (client) | adoptedStyleSheets | connectedCallback | ✓ WIRED | Lines 156-164: calls _adoptTailwindStyles() which sets shadowRoot.adoptedStyleSheets (lines 176-187) |
| Component instances | shared stylesheets | module-level variables | ✓ WIRED | Lines 49-58: sharedTailwindSheet and sharedHostDefaultsSheet created once, shared across all instances |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| CORE-01: @lit-ui/core package exports TailwindElement base class | ✓ SATISFIED | TailwindElement exported in dist/index.d.ts, package.json exports configured |
| CORE-02: TailwindElement supports SSR with static styles (no constructable stylesheets) | ✓ SATISFIED | Static styles getter returns inline CSS when isServer === true, constructable stylesheet creation guarded |
| CORE-03: TailwindElement optimizes to constructable stylesheets on client after hydration | ✓ SATISFIED | Shared constructable stylesheets created at module level (lines 49-58), adopted in connectedCallback (lines 176-187) |
| CORE-04: Design tokens exported as CSS custom properties | ✓ SATISFIED | tokens/index.ts exports tokens object with var(--*) references, package.json "./tokens" subpath configured |
| CORE-05: Package has proper exports field with conditional exports | ✓ SATISFIED | Exports field has types-first conditional exports for ".", "./tokens", "./utils", "./fouc.css" |
| CORE-06: Package marked sideEffects: false for tree shaking | ✓ SATISFIED | package.json has `"sideEffects": false`, all module-level code properly guarded |
| CORE-07: Lit declared as peer dependency ^3.0.0 | ✓ SATISFIED | peerDependencies has `"lit": "^3.0.0"` |

### Anti-Patterns Found

**None** — No anti-patterns detected.

Scan checked for:
- TODO/FIXME comments: 0 found
- Placeholder content: 0 found
- Empty implementations (return null/{}): 0 found
- Console.log-only handlers: 0 found
- Unguarded SSR code: 0 found (all module-level DOM code properly guarded)

All code is substantive with proper SSR guards.

### Human Verification Required

None — All success criteria can be verified programmatically through build outputs and code inspection.

---

## Detailed Verification

### Level 1: Existence
All required artifacts exist:
- ✓ `packages/core/src/tailwind-element.ts` (189 lines)
- ✓ `packages/core/src/index.ts` (12 lines)
- ✓ `packages/core/src/styles/tailwind.css` (7.3KB)
- ✓ `packages/core/src/styles/host-defaults.css` (4.5KB)
- ✓ `packages/core/src/styles/safelist.css` (74KB)
- ✓ `packages/core/src/tokens/index.ts` (92 lines)
- ✓ `packages/core/src/utils/events.ts` (45 lines)
- ✓ `packages/core/src/utils/environment.ts` (exists)
- ✓ `packages/core/src/utils/index.ts` (barrel export)
- ✓ `packages/core/src/fouc.css` (35 lines)
- ✓ `packages/core/package.json` (42 lines)
- ✓ `packages/core/dist/index.js` (65KB)
- ✓ `packages/core/dist/index.d.ts` (249 bytes)
- ✓ `packages/core/dist/tokens/index.js` (1.9KB)
- ✓ `packages/core/dist/tokens/index.d.ts` (3.3KB)
- ✓ `packages/core/dist/utils/index.js` (465 bytes)
- ✓ `packages/core/dist/utils/index.d.ts` (98 bytes)

### Level 2: Substantive
All artifacts exceed minimum line counts and contain real implementations:

**TailwindElement (189 lines, min: 80)**
- ✓ Proper imports: isServer, LitElement, css, unsafeCSS
- ✓ CSS imports with ?inline suffix
- ✓ Shared stylesheet variables with guards
- ✓ Static styles getter with isServer conditional
- ✓ connectedCallback with _adoptTailwindStyles call
- ✓ _adoptTailwindStyles method setting shadowRoot.adoptedStyleSheets
- ✓ JSDoc documentation explaining SSR behavior
- ✗ No stub patterns (TODO, placeholder, return null)
- ✓ Exports TailwindElement class

**tokens/index.ts (92 lines, min: 50)**
- ✓ Full tokens object with 6 categories
- ✓ 16 color tokens, 12 spacing tokens, 8 radius tokens, 6 shadow tokens, 2 font families, 6 z-index levels
- ✓ Type helpers exported (ColorToken, SpacingToken, etc.)
- ✗ No stub patterns

**utils/events.ts (45 lines, min: 10)**
- ✓ Exports dispatchCustomEvent function
- ✓ TypeScript generics for type safety
- ✓ composed: true default for Shadow DOM
- ✓ Proper JSDoc with examples
- ✗ No stub patterns

**CSS files**
- ✓ tailwind.css contains `@import "tailwindcss"` and @theme block
- ✓ host-defaults.css contains `:host` declarations
- ✓ fouc.css contains `:not(:defined)` selectors

### Level 3: Wired
All critical wiring verified:

**Import wiring:**
- ✓ TailwindElement imported in index.ts (1 occurrence)
- ✓ isServer imported in tailwind-element.ts (1 import)
- ✓ CSS files imported with ?inline suffix (2 imports)
- ✓ lit externalized in build (3 import statements in dist/index.js)

**Export wiring:**
- ✓ TailwindElement exported in dist/index.d.ts
- ✓ isServer re-exported in dist/index.d.ts
- ✓ dispatchCustomEvent exported in dist/index.d.ts
- ✓ hasConstructableStylesheets exported in dist/index.d.ts
- ✓ tokens exported in dist/tokens/index.js
- ✓ utils exported in dist/utils/index.js

**Runtime wiring:**
- ✓ Static styles getter returns inline CSS when isServer (lines 144-149)
- ✓ Constructable stylesheets guarded with !isServer (line 52)
- ✓ connectedCallback calls _adoptTailwindStyles when !isServer (lines 156-164)
- ✓ _adoptTailwindStyles sets shadowRoot.adoptedStyleSheets (lines 176-187)
- ✓ Shared stylesheets created once at module level (lines 49-58)

**Package wiring:**
- ✓ package.json exports field maps all subpaths correctly
- ✓ sideEffects: false enables tree shaking
- ✓ lit declared as peer dependency ^3.0.0
- ✓ files array includes dist/ and src/fouc.css

---

## Summary

**All 5 success criteria achieved:**

1. ✓ Consumer imports `import { TailwindElement } from '@lit-ui/core'` successfully
2. ✓ TailwindElement renders with inline styles during SSR (no constructable stylesheets)
3. ✓ After hydration, component uses shared constructable stylesheets (memory optimization)
4. ✓ Design tokens available via CSS custom properties from @lit-ui/core/tokens
5. ✓ Tree shaking removes unused exports when bundling consumer app

**All 7 requirements satisfied:**
- CORE-01 through CORE-07 verified in codebase

**No gaps found.** Phase goal fully achieved.

---

_Verified: 2026-01-24T20:30:00Z_
_Verifier: Claude (gsd-verifier)_
