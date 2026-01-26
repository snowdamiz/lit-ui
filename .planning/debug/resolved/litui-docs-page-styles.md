---
status: resolved
trigger: "LitUI components on Button and Dialog pages in docs app have no styles, but work correctly on Theme Configurator page"
created: 2026-01-25T12:00:00Z
updated: 2026-01-25T15:05:00Z
---

## Current Focus

hypothesis: CONFIRMED AND FIXED
test: Bundle analysis confirms all required code is now present
expecting: Buttons render with proper styling (blue primary background, gray secondary, red destructive)
next_action: Complete - archive session

## Symptoms

expected: LitUI components (buttons, dialogs) on the Button and Dialog documentation pages should show their default styles provided by the LitUI components
actual: Styles don't work at all on Button/Dialog pages - components appear unstyled. However, the same components render correctly with styles on the Theme Configurator page.
errors: No console errors mentioned - visual/styling bug
reproduction: 1. Go to Button or Dialog page in docs app 2. Observe components have no styles 3. Go to Theme Configurator page 4. Observe components render with correct styles
started: After recent changes

## Eliminated

## Evidence

- timestamp: 2026-01-25T12:01:00Z
  checked: packages/button/src/index.ts and packages/dialog/src/index.ts - custom element registration
  found: Components are registered as 'lui-button' and 'lui-dialog' (customElements.define)
  implication: The HTML elements in docs pages use <lui-button> and <lui-dialog>

- timestamp: 2026-01-25T12:02:00Z
  checked: apps/docs/src/styles/button-preview.css and dialog-preview.css
  found: CSS selectors target "ui-button" and "ui-dialog" instead of "lui-button" and "lui-dialog"
  implication: CSS rules won't match the actual elements since selectors are wrong

- timestamp: 2026-01-25T12:03:00Z
  checked: apps/docs/src/main.tsx
  found: Imports both ./styles/button-preview.css and ./styles/dialog-preview.css
  implication: These files ARE loaded, but their selectors don't match actual elements

- timestamp: 2026-01-25T12:04:00Z
  checked: ConfiguratorPage and ThemePreview component
  found: ThemePreview uses ConfiguratorContext.getGeneratedCSS() which dynamically injects CSS with correct :root and #preview-container selectors. Variables like --color-primary, --ui-button-* are set at document level.
  implication: Configurator works because it generates fresh CSS and injects it, not relying on the broken preview CSS files

- timestamp: 2026-01-25T12:05:00Z
  checked: packages/core/src/styles/tailwind.css
  found: Contains :root block with all --ui-button-* and --ui-dialog-* CSS custom properties. These cascade into Shadow DOM.
  implication: The core package provides default styles via CSS custom properties, but the preview CSS files were using obsolete selectors instead of letting the library defaults apply

- timestamp: 2026-01-25T12:06:00Z
  checked: packages/core/src/tailwind-element.ts
  found: TailwindElement extracts :root rules containing --ui-* variables and adds them to document.adoptedStyleSheets. This makes the CSS variables available globally.
  implication: Library provides built-in default styles - the preview CSS files are unnecessary and redundant

- timestamp: 2026-01-25T12:07:00Z
  checked: packages/core/dist/index.js
  found: Built bundle includes both the CSS variables and the document.adoptedStyleSheets code
  implication: The mechanism for providing default styles is in place, just need to remove the broken preview CSS files that may be interfering

- timestamp: 2026-01-25T12:12:00Z
  checked: Build after fix applied
  found: pnpm --filter lit-ui-docs build succeeds without errors
  implication: Fix does not break the build

- timestamp: 2026-01-25T12:13:00Z
  checked: Built JS bundle contains --ui-button-primary-bg and --color-brand-500
  found: grep confirms CSS variables are present in dist/assets/index-*.js
  implication: Library's default styles are correctly bundled into the docs app

- timestamp: 2026-01-25T14:25:00Z
  checked: ThemePreview.tsx - why configurator works
  found: ThemePreview injects dynamic CSS via getGeneratedCSS() which includes ALL color tokens (--color-primary, --color-secondary, etc.) AND component tokens (--ui-button-*). This CSS is injected into a <style> element in document head.
  implication: Configurator works because it injects BOTH the semantic color tokens AND the component tokens

- timestamp: 2026-01-25T14:26:00Z
  checked: apps/docs/src/index.css - what docs app defines
  found: Defines --color-primary-50 through --color-primary-950 scale, but NOT --color-primary itself. Also missing --color-secondary, --color-destructive, --color-accent, --color-card, --color-ring, etc.
  implication: The semantic tokens that --ui-button-* variables reference are NOT defined anywhere in docs app

- timestamp: 2026-01-25T14:27:00Z
  checked: packages/core/src/styles/tailwind.css - library's token definitions
  found: Library defines semantic tokens in @theme block: --color-primary: var(--color-brand-500), etc. Also defines --ui-button-primary-bg: var(--color-primary) in :root block.
  implication: Library expects @theme tokens to be available, but only :root rules get extracted to document.adoptedStyleSheets

- timestamp: 2026-01-25T14:28:00Z
  checked: TailwindElement regex pattern for extraction
  found: rootRulePattern = /:root\s*\{[^}]*--ui-[^}]+\}/g - only extracts :root blocks containing --ui-* variables. Does NOT extract @theme block which contains --color-primary, --color-secondary, etc.
  implication: The library correctly injects --ui-button-* variables but NOT the --color-* variables they depend on. This is the root cause.

- timestamp: 2026-01-25T14:29:00Z
  checked: Dependency chain
  found: --ui-button-primary-bg: var(--color-primary) -> --color-primary: var(--color-brand-500) -> --color-brand-500 (defined in @theme). None of these @theme values reach the docs app.
  implication: The --ui-button-* variables resolve to empty/invalid values because their dependencies are missing

- timestamp: 2026-01-25T14:45:00Z
  checked: Built docs bundle for customElements.define
  found: customElements.define was NOT FOUND in bundle. Side-effect import `import '@lit-ui/button'` was tree-shaken out entirely.
  implication: Components were never registered! This is why they appear unstyled - they're not web components at all, just empty HTML tags.

- timestamp: 2026-01-25T14:46:00Z
  checked: packages/button/package.json
  found: `"sideEffects": false` - this tells bundlers the package has no side effects and can be safely tree-shaken if exports aren't used
  implication: The side-effect import was removed because bundler thought it was dead code

- timestamp: 2026-01-25T14:55:00Z
  checked: Built bundle after fix (sideEffects: true + self-contained colors)
  found: customElements.define("lui-button") FOUND, adoptedStyleSheets FOUND, --ui-color-primary:oklch FOUND. Bundle size 655KB (was 555KB).
  implication: Fix successfully includes all component code and self-contained CSS variables

## Eliminated

- hypothesis: Obsolete CSS selectors (ui-button vs lui-button)
  evidence: Previous fix removed those files, issue persisted
  timestamp: 2026-01-25T14:20:00Z

## Resolution

root_cause: TWO ISSUES FOUND:

1. **sideEffects: false in package.json** - The @lit-ui/core, @lit-ui/button, and @lit-ui/dialog packages had `"sideEffects": false` in their package.json, which told bundlers to tree-shake the side-effect-only imports. This caused `import '@lit-ui/button';` to be completely removed from the bundle, meaning customElements.define() was never called and the components were never registered.

2. **Missing self-contained color fallbacks** - The library's :root CSS block defined component tokens like `--ui-button-primary-bg: var(--color-primary)` but the semantic tokens (--color-primary) were defined in @theme block which gets tree-shaken by Tailwind if not directly used. The library needs self-contained fallback values.

fix:
1. Changed `"sideEffects": false` to `"sideEffects": true` in packages/core/package.json, packages/button/package.json, and packages/dialog/package.json
2. Added `--ui-color-*` semantic token defaults with actual oklch values to the library's :root block
3. Updated component token definitions to use fallback pattern: `var(--color-primary, var(--ui-color-primary))`

verification: Build succeeds. JS bundle now includes customElements.define("lui-button"), adoptedStyleSheets code, and --ui-color-primary:oklch values. Bundle size increased from 555KB to 655KB confirming component code is included.

files_changed:
  - packages/core/package.json (sideEffects: true)
  - packages/button/package.json (sideEffects: true)
  - packages/dialog/package.json (sideEffects: true)
  - packages/core/src/styles/tailwind.css (added --ui-color-* defaults with fallback pattern)
  - packages/button/src/button.ts (focus ring uses fallback pattern)
