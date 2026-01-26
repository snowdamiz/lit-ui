---
phase: 27-core-input-component
plan: 01
subsystem: form-inputs
tags: [input, form-controls, lit, tailwind, elementinternals]

dependency-graph:
  requires: [26-css-tokens-foundation]
  provides: [lui-input-element, input-types, input-sizes, form-participation]
  affects: [27-02, 27-03, 28-textarea, 29-select]

tech-stack:
  added: []
  patterns:
    - form-associated-custom-element
    - elementinternals-form-value
    - css-custom-property-styling
    - isserver-ssr-guard

files:
  created:
    - packages/input/package.json
    - packages/input/tsconfig.json
    - packages/input/vite.config.ts
    - packages/input/src/vite-env.d.ts
    - packages/input/src/input.ts
    - packages/input/src/index.ts
    - packages/input/src/jsx.d.ts
  modified: []

decisions: []

metrics:
  duration: 1m42s
  completed: 2026-01-26
---

# Phase 27 Plan 01: Core Input Package Structure Summary

**One-liner:** lui-input element with 5 input types, 3 sizes, and ElementInternals form participation using Phase 26 CSS tokens

## Tasks Completed

| Task | Name | Commit | Key Files |
|------|------|--------|-----------|
| 1 | Create @lit-ui/input package structure | 4072cf3 | package.json, tsconfig.json, vite.config.ts |
| 2 | Implement Input component | 708ce35 | src/input.ts (242 lines) |
| 3 | Create exports and JSX declarations | 9047d08 | src/index.ts, src/jsx.d.ts |

## What Was Built

### Input Component (`packages/input/src/input.ts`)

**Types exported:**
- `InputType`: 'text' | 'email' | 'password' | 'number' | 'search'
- `InputSize`: 'sm' | 'md' | 'lg'

**Properties:**
- `type: InputType` - HTML input type (default: 'text')
- `size: InputSize` - Visual size variant (default: 'md')
- `name: string` - Form field name
- `value: string` - Current input value
- `placeholder: string` - Placeholder text
- `disabled: boolean` - Disabled state
- `readonly: boolean` - Readonly state

**Form Participation:**
- `static formAssociated = true` enables native form association
- `attachInternals()` with `isServer` guard for SSR safety
- `setFormValue()` syncs value to parent form on every input

**CSS Token Usage:**
Uses all Phase 26 input tokens:
- Layout: `--ui-input-radius`, `--ui-input-border-width`, `--ui-input-transition`
- Size-specific: `--ui-input-padding-{x,y}-{sm,md,lg}`, `--ui-input-font-size-{sm,md,lg}`
- State colors: `--ui-input-{bg,text,border,placeholder}`, focus/disabled variants

### Package Structure

Follows exact button package pattern:
- `package.json` with correct exports, sideEffects, peerDependencies
- `tsconfig.json` extending @lit-ui/typescript-config/library.json
- `vite.config.ts` using createLibraryConfig
- Safe custom element registration with collision detection

### JSX Type Declarations

Framework support via `jsx.d.ts`:
- React: `JSX.IntrinsicElements['lui-input']`
- Vue: `GlobalComponents['lui-input']`
- Svelte: `svelteHTML.IntrinsicElements['lui-input']`

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

```
# Build output
dist/index.js  4.00 kB | gzip: 1.31 kB
dist/index.d.ts  2.68 kB

# Type check
pnpm tsc --noEmit - passed
```

## Success Criteria Checklist

- [x] packages/input/ exists with all config files matching button package structure
- [x] Input class exports InputType, InputSize types
- [x] Input renders native input element with correct type attribute
- [x] Input has three size variants (sm, md, lg) using CSS tokens
- [x] Input has static formAssociated = true and attachInternals() (with isServer guard)
- [x] Input syncs value to form via setFormValue()
- [x] lui-input custom element registered
- [x] Package builds successfully with TypeScript declarations

## Next Plan Readiness

**Plan 02 (Label, Helper, Validation)** can proceed:
- Input class exists with core properties
- Form value synchronization working
- CSS tokens proven working for size/state styling
- Component structure ready for label, helperText, error message additions

**Plan 03 (States, Accessibility)** dependencies ready:
- Disabled and readonly states implemented with proper CSS
- Part attribute on input for external styling
- Focus state styling in place

## Usage Example

```html
<lui-input type="text" size="md" placeholder="Enter your name"></lui-input>
<lui-input type="email" name="email" value="user@example.com"></lui-input>
<lui-input type="password" size="lg" placeholder="Password"></lui-input>

<!-- Form participation -->
<form>
  <lui-input type="text" name="username" value="john"></lui-input>
  <button type="submit">Submit</button>
</form>
```

```typescript
import { Input, InputType, InputSize } from '@lit-ui/input';

// Types available for type-safe usage
const type: InputType = 'email';
const size: InputSize = 'lg';
```
