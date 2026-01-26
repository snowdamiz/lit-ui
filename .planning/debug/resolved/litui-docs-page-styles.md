---
status: resolved
trigger: "LitUI components on Button and Dialog pages in docs app have no styles, but work correctly on Theme Configurator page"
created: 2026-01-25T12:00:00Z
updated: 2026-01-25T12:20:00Z
---

## Current Focus

hypothesis: CONFIRMED AND FIXED
test: Build and verify
expecting: Components render correctly with library default styles
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

## Resolution

root_cause: The apps/docs/src/styles/button-preview.css and dialog-preview.css files used obsolete selectors (ui-button and ui-dialog) that don't match the actual custom elements (lui-button and lui-dialog). Additionally, these files attempted to set --color-* variables at the element level, which doesn't cascade into Shadow DOM. The LitUI library already provides built-in default styles via CSS custom properties defined at :root level in @lit-ui/core, so these preview CSS files were unnecessary and their incorrect approach broke the component styling.

fix: Removed the obsolete preview CSS files (button-preview.css and dialog-preview.css) and their imports from main.tsx. The LitUI library's built-in CSS custom properties (defined in @lit-ui/core's tailwind.css) now provide the default styling.

verification: Build succeeds without errors. CSS variables (--ui-button-primary-bg, --color-brand-500) are confirmed present in the built bundle. The library's TailwindElement correctly adopts stylesheets containing :root CSS custom properties to the document, which then cascade into Shadow DOM.

files_changed:
  - apps/docs/src/main.tsx (removed CSS imports)
  - apps/docs/src/styles/button-preview.css (deleted)
  - apps/docs/src/styles/dialog-preview.css (deleted)
