---
status: resolved
trigger: "LitUI components (buttons, dialogs) in ThemePreview don't respond to Light/Dark mode toggle - they appear stuck in dark mode styling"
created: 2026-01-25T10:00:00Z
updated: 2026-01-25T10:00:00Z
---

## Current Focus

hypothesis: The processCSS function only scopes `:root` and `:root.dark`, but generated CSS uses standalone `.dark { ... }` which doesn't get scoped. This means `.dark { ... }` CSS is global and may conflict with other .dark elements on the page OR is being overridden by the :root variables in rootVars.
test: Analyze the exact CSS output and specificity conflicts
expecting: Find a specificity or scoping issue with dark mode variables
next_action: Check if rootVars contains the same variables as .dark block (overriding issue) OR if .dark block isn't scoped properly

## Symptoms

expected: When switching between Light/Dark mode in the configurator, LitUI components (buttons, dialogs) in the Live Preview section should update their styling to match the selected theme mode
actual: Non-library components (backgrounds, section headers, color pickers) correctly change colors when toggling modes. However, LitUI components in the Live Preview (buttons showing Primary, Secondary, Destructive variants) appear to always render with the same dark-mode-like styling regardless of the mode toggle position. In Light mode the buttons have dark backgrounds. In Dark mode the preview background changes but buttons look similar.
errors: No console errors - visual/styling bug
reproduction: 1. Go to Theme Configurator page 2. Toggle "Editing Mode" between Light and Dark 3. Observe the "Live Preview" section - buttons don't change their styling appropriately
started: Current behavior in the codebase

## Eliminated

## Evidence

- timestamp: 2026-01-25T10:05:00Z
  checked: css-generator.ts - how theme CSS is generated
  found: Generated CSS has `:root { ... }` for light mode and `.dark { ... }` for dark mode. The `.dark` selector expects to be on an ancestor element to activate dark mode variables.
  implication: Dark mode activation depends on the `.dark` class being present on an element that contains the LitUI components.

- timestamp: 2026-01-25T10:06:00Z
  checked: button.ts - how LitUI button consumes CSS variables
  found: Button component uses shadow DOM. Styles like `background-color: var(--ui-button-primary-bg)` are applied inside the shadow root. CSS variables inherit through shadow DOM boundaries from the DOM ancestor chain.
  implication: Shadow DOM elements read CSS variables from their host element's computed style, which inherits from ancestors.

- timestamp: 2026-01-25T10:07:00Z
  checked: ThemePreview.tsx processCSS function (lines 26-38)
  found: The processCSS function does TWO things: (1) extracts --lui-* variables to :root level, (2) scopes style rules by replacing `:root.dark` with `#theme-preview-container.dark`. However, the generated CSS uses `.dark` NOT `:root.dark` for dark mode rules!
  implication: The regex `.replace(/:root\.dark/g, ...)` won't match `.dark { ... }` - it only matches `:root.dark`. The dark mode CSS block in the generated CSS is a standalone `.dark { ... }` selector, NOT `:root.dark { ... }`.

- timestamp: 2026-01-25T10:08:00Z
  checked: ThemePreview.tsx line 96
  found: Preview container has `className={... ${isDark ? "dark" : ""}}` which adds `.dark` class when dark mode is active.
  implication: The `.dark` class IS being applied to the preview container, but the CSS selector `.dark { ... }` from the generated CSS is NOT being scoped to `#theme-preview-container.dark`.

- timestamp: 2026-01-25T10:09:00Z
  checked: processCSS varRegex /--lui-[^:]+:/
  found: The regex extracts `--lui-*` variables, but the generated CSS uses `--ui-button-*`, `--ui-dialog-*`, `--color-*` variables - NONE of them start with `--lui-`! So `rootVars` is always EMPTY.
  implication: The rootVars extraction is broken - it extracts nothing because variable prefix mismatch.

- timestamp: 2026-01-25T10:10:00Z
  checked: ThemePreview useEffect dependencies (line 58)
  found: useEffect depends on `[getGeneratedCSS]` but NOT on `activeMode`. When activeMode changes, getGeneratedCSS returns the SAME CSS (it's based on getThemeConfig which only returns light colors).
  implication: Even when mode changes, the CSS doesn't change because CSS generation doesn't account for which mode is being previewed - it always generates both modes in one CSS file.

- timestamp: 2026-01-25T10:12:00Z
  checked: CSS specificity analysis
  found: processCSS converts `:root` to `#theme-preview-container` (ID selector, specificity 1,0,0). The `.dark` block is NOT transformed, so it stays as `.dark` (class selector, specificity 0,1,0). ID selectors ALWAYS beat class selectors!
  implication: ROOT CAUSE CONFIRMED: The light mode variables on `#theme-preview-container` (ID) always win over `.dark` (class) regardless of whether .dark class is present. CSS specificity prevents dark mode from ever taking effect.

## Resolution

root_cause: CSS specificity mismatch in ThemePreview.tsx processCSS function. The function transforms `:root` to `#theme-preview-container` (ID selector, specificity 1,0,0) but fails to transform `.dark` to `#theme-preview-container.dark`. The `.dark` class selector (specificity 0,1,0) can never override the ID selector, so dark mode CSS variables never take effect.
fix: Updated processCSS to transform:
  - `.dark` -> `#theme-preview-container.dark` (specificity 1,1,0 - overrides light mode)
  - `:root:not(.light)` -> `#theme-preview-container:not(.light)` (for media query support)
  - Removed broken --lui-* variable extraction (variables use --ui-* and --color-* prefixes)
verification:
  - Build passes: pnpm --filter lit-ui-docs build (success)
  - Type check passes: pnpm tsc --noEmit (success)
  - CSS transformation test: Verified .dark becomes #theme-preview-container.dark
  - Specificity confirmed: #container.dark (1,1,0) > #container (1,0,0)
files_changed:
  - apps/docs/src/components/configurator/ThemePreview.tsx
