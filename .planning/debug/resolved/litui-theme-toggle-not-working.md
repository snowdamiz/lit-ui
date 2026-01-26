---
status: resolved
trigger: "LitUI components (buttons, dialogs) in ThemePreview don't respond to Light/Dark mode toggle - they appear stuck in dark mode styling"
created: 2026-01-25T10:00:00Z
updated: 2026-01-25T11:35:00Z
---

## Current Focus

hypothesis: CONFIRMED - The @media (prefers-color-scheme: dark) block in the generated theme CSS overrides the light/dark toggle because the preview container never gets a `.light` class to prevent the system preference from applying.
test: Add `.light` class to preview container when in light mode
expecting: System dark preference will be blocked by `.light` class, toggle will work
next_action: COMPLETED - Fix verified

## Symptoms

expected: When switching between Light/Dark mode in the configurator, LitUI components (buttons, dialogs) in the Live Preview section should update their styling to match the selected theme mode
actual: Non-library components (backgrounds, section headers, color pickers) correctly change colors when toggling modes. However, LitUI components in the Live Preview (buttons showing Primary, Secondary, Destructive variants) appear to always render with the same dark-mode-like styling regardless of the mode toggle position. In Light mode the buttons have dark backgrounds. In Dark mode the preview background changes but buttons look similar.
errors: No console errors - visual/styling bug
reproduction: 1. Go to Theme Configurator page 2. Toggle "Editing Mode" between Light and Dark 3. Observe the "Live Preview" section - buttons don't change their styling appropriately
started: Current behavior in the codebase

## Eliminated

- hypothesis: processCSS not scoping .dark selector properly
  evidence: Code shows `.replace(/^\.dark\s*\{/gm, `#${PREVIEW_ID}.dark {`)` which DOES handle .dark selector
  timestamp: 2026-01-25T11:00:00Z

- hypothesis: CSS specificity issue between ID and class selectors
  evidence: Verified via code analysis that #theme-preview-container.dark (1,1,0) correctly beats #theme-preview-container (1,0,0)
  timestamp: 2026-01-25T11:15:00Z

- hypothesis: Library CSS inside Shadow DOM overriding theme CSS
  evidence: Library's :root rules inside Shadow DOM don't match anything (no document root in shadow). Variables correctly inherit from outside.
  timestamp: 2026-01-25T11:20:00Z

## Evidence

- timestamp: 2026-01-25T11:25:00Z
  checked: Generated theme CSS structure
  found: CSS includes three blocks:
    1. `#theme-preview-container { light values }`
    2. `#theme-preview-container.dark { dark values }`
    3. `@media (prefers-color-scheme: dark) { #theme-preview-container:not(.light) { dark values } }`
  implication: The media query block applies dark styles whenever system prefers dark mode AND container lacks `.light` class

- timestamp: 2026-01-25T11:26:00Z
  checked: ThemePreview container className logic
  found: `className={`min-h-full p-8 ${isDark ? "dark" : ""}`}` - only adds `.dark` in dark mode, never adds `.light` in light mode
  implication: In light mode, container has no mode-related class, so media query `:not(.light)` selector MATCHES

- timestamp: 2026-01-25T11:27:00Z
  checked: CSS selector specificity
  found: Media query selector `#theme-preview-container:not(.light)` has specificity 1,1,0 - same as `#theme-preview-container.dark`
  implication: When system prefers dark and user selects light mode, media query dark values apply because there's no `.light` class to prevent the match

## Resolution

root_cause: The `@media (prefers-color-scheme: dark) { #theme-preview-container:not(.light) { ... } }` block in the generated theme CSS applies dark mode values whenever the user's system preference is dark mode AND the container doesn't have a `.light` class. Since ThemePreview only adds `.dark` class (never `.light`), the system preference overrides the toggle when the user's system is in dark mode.

fix: Updated ThemePreview.tsx to add `.light` class when activeMode is "light". This causes the `:not(.light)` selector to NOT match, preventing system dark preference from overriding the user's toggle choice.

Changed line 110 from:
  `className={`min-h-full p-8 ${isDark ? "dark" : ""}`}`
To:
  `className={`min-h-full p-8 ${isDark ? "dark" : "light"}`}`

verification:
  - Build passes: pnpm --filter lit-ui-docs build (success)
  - CSS selector analysis confirms:
    - Light mode (class="light"): light values apply, media query blocked by :not(.light)
    - Dark mode (class="dark"): dark values apply from .dark selector
  - Logic verified: The .light class prevents the prefers-color-scheme media query from overriding

files_changed:
  - apps/docs/src/components/configurator/ThemePreview.tsx
