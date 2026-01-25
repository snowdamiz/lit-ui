---
phase: 17-framework-integration
plan: 02
subsystem: ssr
tags: [nextjs, ssr, react, app-router, lit-labs]

dependency-graph:
  requires:
    - "16-02 (SSR package with hydration support)"
  provides:
    - "Working Next.js 15+ SSR example with Lit components"
    - "use client boundary pattern for Lit in React SSR"
    - "Hydration import order documentation"
  affects:
    - "Documentation phases (Framework Integration guides)"
    - "Future React framework examples"

tech-stack:
  added:
    - "@lit-labs/nextjs ^0.3.0"
    - "next ^15.0.0"
    - "react ^19.0.0"
    - "react-dom ^19.0.0"
  patterns:
    - "use client boundary for Lit components in Next.js App Router"
    - "Hydration import order: @lit-ui/ssr/hydration before components"
    - "JSX type declarations for custom elements"

key-files:
  created:
    - examples/nextjs/package.json
    - examples/nextjs/tsconfig.json
    - examples/nextjs/next.config.mjs
    - examples/nextjs/app/layout.tsx
    - examples/nextjs/app/page.tsx
    - examples/nextjs/app/components/LitDemo.tsx
    - examples/nextjs/README.md

decisions:
  - id: "17-02-01"
    title: "JSX type declarations for custom elements"
    choice: "Extend JSX.IntrinsicElements in client component"
    rationale: "TypeScript needs to know lui-button and lui-dialog are valid JSX elements with specific props"

metrics:
  duration: "5 min"
  completed: "2026-01-25"
---

# Phase 17 Plan 02: Next.js App Router SSR Example Summary

**Working Next.js 15+ SSR example demonstrating Lit UI components with proper 'use client' boundaries and hydration import order.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-01-25T06:14:44Z
- **Completed:** 2026-01-25T06:19:28Z
- **Tasks:** 3
- **Files modified:** 7

## Accomplishments

- Created Next.js 15+ App Router example with @lit-labs/nextjs plugin
- Demonstrated 'use client' boundary pattern for Lit components in React SSR
- Documented critical hydration import order requirement
- Verified pnpm install and pnpm dev work without errors
- Added JSX type declarations for lui-button and lui-dialog custom elements

## Task Commits

1. **Task 1: Create Next.js project with Lit SSR config** - `1cc0e91` (feat)
2. **Task 2: Create App Router pages with Lit components** - `dd52805` (feat)
3. **Task 3: Create README and verify example runs** - `5370e32` (docs)

**Plan metadata:** (to be committed)

## Files Created/Modified

- `examples/nextjs/package.json` - Next.js 15 + React 19 + @lit-labs/nextjs dependencies
- `examples/nextjs/tsconfig.json` - Standard App Router TypeScript config
- `examples/nextjs/next.config.mjs` - withLitSSR plugin wrapper with explanatory comments
- `examples/nextjs/app/layout.tsx` - RootLayout with basic styling
- `examples/nextjs/app/page.tsx` - Server Component importing LitDemo client component
- `examples/nextjs/app/components/LitDemo.tsx` - Client component with Lit components, counter, and dialog
- `examples/nextjs/README.md` - Quick start and explanation of 'use client' + hydration order

## Decisions Made

### 17-02-01: JSX Type Declarations for Custom Elements
- **Choice:** Extend JSX.IntrinsicElements in the client component file
- **Rationale:** TypeScript requires type declarations for custom element tags. Adding them in the component file keeps the example self-contained and shows developers the pattern.

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

All plan verification criteria met:

- [x] examples/nextjs directory created with all config files
- [x] next.config.mjs uses withLitSSR wrapper
- [x] LitDemo.tsx has 'use client' as first line
- [x] LitDemo.tsx imports @lit-ui/ssr/hydration before components
- [x] page.tsx is Server Component that imports client component
- [x] README explains 'use client' requirement and import order
- [x] pnpm install and pnpm dev succeed

## Next Phase Readiness

### For Plan 17-03: Astro SSR Example
- Next.js pattern established as reference
- Same hydration import order applies to Astro

### Blockers
None.
