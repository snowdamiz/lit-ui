---
status: investigating
trigger: "Dialog component renders in dark mode when light mode is selected - dialog appears with dark background when page is in light mode"
created: 2026-01-25T12:00:00Z
updated: 2026-01-25T12:00:00Z
---

## Current Focus

hypothesis: ROOT CAUSE CONFIRMED - Dialog uses native <dialog> element with showModal(), which renders in the browser's top layer. The top layer is outside the normal DOM cascade, so CSS variables scoped to #theme-preview-container don't apply. Dialog inherits from :root, which has light mode variables, not from the container with .dark class.
test: Verified by reading dialog.ts - uses showModal() at line 257
expecting: Need to inject CSS variables at :root level for the dialog, not just scoped to container
next_action: Fix processCSS to also inject variables at :root for dialogs to inherit

## Symptoms

expected: When mode is set to Light, the dialog should render with light mode styling (light background, dark text)
actual: Dialog renders with dark mode styling (black background, gray text) even when light mode is selected
errors: No console errors - visual/styling bug
reproduction: 1. Go to Theme Configurator page 2. Set mode to Light 3. Click "Open Dialog" 4. Observe dialog has dark mode styling
started: After previous fix that scoped CSS to #theme-preview-container

## Eliminated

## Evidence

- timestamp: 2026-01-25T12:01:00Z
  checked: ThemePreview.tsx structure
  found: The lui-dialog element is placed INSIDE the #theme-preview-container div. However, native dialog elements render in the browser's "top layer" when shown with showModal(), which is outside the normal DOM tree.
  implication: Even though the lui-dialog element is inside the container, when it opens via native dialog.showModal(), it renders in the top layer and CSS variables from #theme-preview-container don't cascade to it.

## Resolution

root_cause:
fix:
verification:
files_changed: []
