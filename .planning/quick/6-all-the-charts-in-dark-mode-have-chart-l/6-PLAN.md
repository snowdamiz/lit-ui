---
quick: 6
type: execute
wave: 1
depends_on: []
files_modified:
  - apps/docs/src/index.css
autonomous: true
requirements: []

must_haves:
  truths:
    - "Chart lines and series colors are visually comfortable in dark mode (not eye-searingly bright)"
    - "All 8 chart color tokens have dark mode overrides"
    - "Non-color tokens (grid, axis, tooltip, legend) also have appropriate dark mode values"
    - "Toggling dark mode on/off updates chart colors without page reload"
  artifacts:
    - path: "apps/docs/src/index.css"
      provides: "Dark mode CSS token overrides for all --ui-chart-* tokens"
      contains: ".dark { --ui-chart-color-1"
  key_links:
    - from: "apps/docs/src/index.css .dark block"
      to: "packages/charts/src/base/theme-bridge.ts readToken()"
      via: "CSS custom property inheritance into Shadow DOM host via getComputedStyle"
      pattern: "getComputedStyle\\(this\\.host\\)"
---

<objective>
Mute chart line colors in dark mode so they stop being eye-searingly bright.

Purpose: The ThemeBridge fallback colors (#3b82f6, #8b5cf6, etc.) are vivid light-mode colors with no dark mode overrides. When .dark is active there are no --ui-chart-* CSS token overrides, so the chart renders maximum-saturation colors against a near-black background — blinding contrast. Adding dark mode token overrides with lower-lightness, reduced-saturation variants fixes this without touching any chart logic.

Output: `.dark` block in index.css with muted variants for all 8 color tokens plus supporting tokens (grid, axis, tooltip, legend).
</objective>

<execution_context>
@/Users/sn0w/.claude/get-shit-done/workflows/execute-plan.md
@/Users/sn0w/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@apps/docs/src/index.css
@packages/charts/src/base/theme-bridge.ts

How dark mode works in this project:
- .dark class toggled on <html> element
- ThemeBridge.readToken() calls getComputedStyle(this.host) — CSS custom properties are inherited, so .dark tokens on <html> cascade into Shadow DOM hosts
- _colorSchemeObserver in base-chart-element.ts watches document.documentElement class changes and calls _applyThemeUpdate(), which calls buildColorUpdate() to re-resolve tokens and push them to ECharts
- So adding .dark { --ui-chart-color-N: ... } in index.css is all that's needed — no TypeScript changes required

Light mode fallbacks (from theme-bridge.ts _tokenDefaults):
  --ui-chart-color-1: #3b82f6  (blue-500)
  --ui-chart-color-2: #8b5cf6  (violet-500)
  --ui-chart-color-3: #10b981  (emerald-500)
  --ui-chart-color-4: #f59e0b  (amber-500)
  --ui-chart-color-5: #ef4444  (red-500)
  --ui-chart-color-6: #06b6d4  (cyan-500)
  --ui-chart-color-7: #f97316  (orange-500)
  --ui-chart-color-8: #84cc16  (lime-500)
  --ui-chart-grid-line:       #e5e7eb
  --ui-chart-axis-label:      #6b7280
  --ui-chart-axis-line:       #d1d5db
  --ui-chart-tooltip-bg:      #ffffff
  --ui-chart-tooltip-border:  #e5e7eb
  --ui-chart-tooltip-text:    #111827
  --ui-chart-legend-text:     #374151

Dark background is oklch(0.10 0 0) ≈ #1a1a1a.
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add dark mode CSS token overrides for all chart tokens</name>
  <files>apps/docs/src/index.css</files>
  <action>
    Append a new `.dark` block to index.css containing dark mode overrides for every `--ui-chart-*` token. Place it immediately after the existing `.dark { --color-background: ... }` block (around line 54).

    For the 8 chart colors, use the -400 shade (one step lighter than -500) of each Tailwind color but in hex — this preserves the hue while reducing the blinding intensity on dark backgrounds:

    ```css
    /* Chart token dark mode overrides — muted variants for dark backgrounds */
    .dark {
      --ui-chart-color-1: #60a5fa;  /* blue-400 — softer than blue-500 on dark bg */
      --ui-chart-color-2: #a78bfa;  /* violet-400 */
      --ui-chart-color-3: #34d399;  /* emerald-400 */
      --ui-chart-color-4: #fbbf24;  /* amber-400 */
      --ui-chart-color-5: #f87171;  /* red-400 */
      --ui-chart-color-6: #22d3ee;  /* cyan-400 */
      --ui-chart-color-7: #fb923c;  /* orange-400 */
      --ui-chart-color-8: #a3e635;  /* lime-400 */
      --ui-chart-grid-line: #374151;    /* gray-700 — subtle grid on dark bg */
      --ui-chart-axis-label: #9ca3af;   /* gray-400 — readable but not harsh */
      --ui-chart-axis-line: #4b5563;    /* gray-600 */
      --ui-chart-tooltip-bg: #1f2937;   /* gray-800 */
      --ui-chart-tooltip-border: #374151; /* gray-700 */
      --ui-chart-tooltip-text: #f9fafb;   /* gray-50 */
      --ui-chart-legend-text: #d1d5db;    /* gray-300 */
    }
    ```

    The -400 shades are intentionally lighter (higher lightness) in Tailwind — on a dark background they appear vivid but not blindingly saturated. The -500 originals are max-saturation and designed for light backgrounds where they show as medium-weight.

    Do NOT modify any existing CSS. Only add the new block.
  </action>
  <verify>
    1. Open the docs app: `npm run dev --workspace=apps/docs`
    2. Navigate to any chart page (e.g., /charts/line)
    3. Toggle dark mode
    4. Confirm chart lines are visible but not eye-searingly bright
    5. Toggle back to light mode — chart should return to original vivid colors
    6. Also verify: `grep -n "ui-chart-color-1" apps/docs/src/index.css` shows the dark override
  </verify>
  <done>
    .dark block with all 16 --ui-chart-* tokens added to index.css. In dark mode, chart series use muted -400 variants; grid/axis/tooltip/legend use appropriate gray shades. Toggling .dark class dynamically updates chart colors without reload.
  </done>
</task>

</tasks>

<verification>
- `grep -c "ui-chart-color" /Users/sn0w/Documents/dev/lit-components/apps/docs/src/index.css` returns at least 8 (the 8 color overrides in the .dark block)
- `grep -A 20 "Chart token dark mode" /Users/sn0w/Documents/dev/lit-components/apps/docs/src/index.css` shows all color tokens
- Light mode fallbacks in theme-bridge.ts are unchanged
- No TypeScript files modified
</verification>

<success_criteria>
index.css contains a .dark block with 16 --ui-chart-* token overrides. Chart colors in dark mode are softer (-400 Tailwind shades) rather than the blinding -500 defaults. Axis, grid, tooltip, and legend tokens are appropriate for dark backgrounds.
</success_criteria>

<output>
After completion, create `.planning/quick/6-all-the-charts-in-dark-mode-have-chart-l/6-SUMMARY.md` with what was changed and the token values used.
</output>
