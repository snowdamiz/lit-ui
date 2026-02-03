---
phase: 59-tabs-polish-package
verified: 2026-02-02T18:30:00Z
status: passed
score: 5/5 must-haves verified
---

# Phase 59: Tabs Polish & Package Verification Report

**Phase Goal:** Tabs have animated indicator, lazy rendering, overflow handling, SSR compatibility, and ship as a publishable @lit-ui/tabs package
**Verified:** 2026-02-02T18:30:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Active tab indicator slides smoothly between tabs when selection changes, and repositions on window resize | ✓ VERIFIED | Indicator uses CSS transitions on transform/width (tabs.ts:581-585), updateIndicator() uses getBoundingClientRect (tabs.ts:192-205), ResizeObserver calls updateIndicator() on resize (tabs.ts:162-166) |
| 2 | Tab panels with the lazy attribute render content only on first activation and preserve it after | ✓ VERIFIED | lazy property exists (tab-panel.ts:68), _hasBeenExpanded flag tracks activation (tab-panel.ts:73,86), render() returns `nothing` when lazy+not expanded+not active (tab-panel.ts:104-105) |
| 3 | When tabs overflow the container, scroll navigation buttons appear and allow horizontal scrolling | ✓ VERIFIED | _showScrollLeft/_showScrollRight state properties (tabs.ts:77,83), updateScrollButtons() detects overflow (tabs.ts:224-226), scrollTabs() method calls scrollBy() (tabs.ts:232-241), scroll buttons render conditionally (tabs.ts:613-673) |
| 4 | Tab panels without focusable content receive tabindex="0" so keyboard users can reach panel content | ✓ VERIFIED | panelHasFocusableContent() checks for focusable elements (tabs.ts:406-412), syncPanelStates() sets tabindex="0" only when no focusable content (tabs.ts:430-434), lazy panels handled with requestAnimationFrame deferred check (tabs.ts:442-449) |
| 5 | Tabs render correctly via Declarative Shadow DOM on the server and hydrate on the client | ✓ VERIFIED | All browser APIs guarded by isServer: updateIndicator() (tabs.ts:179), updateScrollButtons() (tabs.ts:215), ResizeObserver creation (tabs.ts:151), requestAnimationFrame (tabs.ts:442), tab-panel data-state setAttribute (tab-panel.ts:82) |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `packages/tabs/src/tabs.ts` | Animated indicator, data-state on buttons, ResizeObserver, conditional panel tabindex, scroll buttons | ✓ VERIFIED | Contains: tab-indicator class (line 574,654), styleMap with _indicatorStyle (line 655-658), updateIndicator() with getBoundingClientRect (line 178-209), ResizeObserver setup (line 162-167), data-state attribute (line 642), panelHasFocusableContent() (line 406-412), scroll buttons (line 613-673), _showScrollLeft/_showScrollRight state (line 77,83) |
| `packages/tabs/src/tab-panel.ts` | Lazy rendering with _hasBeenExpanded pattern | ✓ VERIFIED | Contains: lazy property (line 68), _hasBeenExpanded private field (line 73), sets flag on activation (line 86), conditional render returns nothing (line 104-105) |
| `packages/tabs/src/jsx.d.ts` | lazy attribute type for LuiTabPanelAttributes | ✓ VERIFIED | Contains: lazy?: boolean in LuiTabPanelAttributes interface (line 25) |
| `packages/core/src/styles/tailwind.css` | Indicator and scroll button CSS custom property tokens | ✓ VERIFIED | Contains: --ui-tabs-indicator-color, --ui-tabs-indicator-height, --ui-tabs-indicator-radius, --ui-tabs-indicator-transition, --ui-tabs-scroll-button-size tokens (verified via grep) |
| `packages/tabs/package.json` | Publishable package config with exports, types, peer deps | ✓ VERIFIED | Contains: name "@lit-ui/tabs" (line 2), exports with types (line 24-29), peerDependencies lit ^3.0.0 and @lit-ui/core ^1.0.0 (line 38-41), sideEffects true (line 33), files ["dist"] (line 30-32) |
| `packages/tabs/src/index.ts` | Exports and custom element registration with collision detection | ✓ VERIFIED | Contains: exports for Tabs and TabPanel (line 6-7), customElements.get() checks before define (line 17,26), dev-only warning on collision (line 19-24,28-33) |
| `packages/tabs/dist/index.js` | Built JavaScript output | ✓ VERIFIED | File exists: 17KB (verified via ls) |
| `packages/tabs/dist/index.d.ts` | Built TypeScript declarations | ✓ VERIFIED | File exists: 6.2KB (verified via ls) |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| tabs.ts value changes | updateIndicator() | updated() lifecycle | ✓ WIRED | updated() calls updateIndicator() on value change (line 253) |
| ResizeObserver | updateIndicator() | callback | ✓ WIRED | ResizeObserver callback calls updateIndicator() (line 163) |
| ResizeObserver | updateScrollButtons() | callback | ✓ WIRED | ResizeObserver callback calls updateScrollButtons() (line 164) |
| tablist scroll event | updateScrollButtons() | @scroll listener | ✓ WIRED | tablist has @scroll=${this.updateScrollButtons} (line 632) |
| syncPanelStates() | panelHasFocusableContent() | conditional tabindex logic | ✓ WIRED | syncPanelStates calls panelHasFocusableContent to determine tabindex (line 430,444) |
| Indicator div | CSS vars | styleMap + CSS rules | ✓ WIRED | Indicator uses --ui-tabs-indicator-* vars (line 578-580) and styleMap with _indicatorStyle (line 655-658) |
| Scroll buttons | scrollTabs() | click handlers | ✓ WIRED | Scroll button @click handlers call scrollTabs('left'/'right') (line 618,667) |
| lazy panel activation | _hasBeenExpanded | updated() lifecycle | ✓ WIRED | updated() sets _hasBeenExpanded=true when active (line 85-87) |
| render() | lazy check | conditional return | ✓ WIRED | render() checks lazy && !_hasBeenExpanded && !active before returning nothing (line 104-105) |

### Requirements Coverage

| Requirement | Status | Blocking Issue |
|-------------|--------|----------------|
| TABS-16: Animated active indicator (sliding underline) | ✓ SATISFIED | None - indicator div with CSS transition exists |
| TABS-17: Indicator repositions on window resize | ✓ SATISFIED | None - ResizeObserver implemented |
| TABS-18: Lazy rendering of tab panels | ✓ SATISFIED | None - lazy property with _hasBeenExpanded pattern |
| TABS-19: Overflow scroll with navigation buttons | ✓ SATISFIED | None - scroll buttons with overflow detection |
| TABS-20: data-state attribute on tabs/panels | ✓ SATISFIED | None - data-state="active"/"inactive" on buttons |
| TABS-21: SSR compatible via Declarative Shadow DOM | ✓ SATISFIED | None - all browser APIs have isServer guards |
| TABS-22: Panel tabindex="0" when no focusable content | ✓ SATISFIED | None - conditional tabindex with panelHasFocusableContent |
| INTG-02: @lit-ui/tabs publishable package | ✓ SATISFIED | None - package.json correct, build succeeds |

### Anti-Patterns Found

No blocker anti-patterns detected.

**Minor findings:**
- Line 51 (tabs.ts): Uses Math.random() for ID generation (acceptable for non-cryptographic use)
- Line 29 (tab-panel.ts): Same Math.random() pattern (acceptable)

These are standard practices for component ID generation and do not impact functionality.

### Build Verification

```bash
$ pnpm --filter @lit-ui/tabs build
> @lit-ui/tabs@1.0.0 build
> vite build

vite v7.3.1 building client environment for production...
transforming...
✓ 3 modules transformed.
rendering chunks...
dist/index.js  17.03 kB │ gzip: 4.51 kB
[vite:dts] Declaration files built in 729ms.
✓ built in 770ms
```

**Status:** ✓ Build succeeds with zero errors
**Output:** dist/index.js (17KB), dist/index.d.ts (6.2KB)

---

## Summary

**All success criteria verified:**

1. ✓ Active tab indicator slides smoothly between tabs when selection changes, and repositions on window resize
   - Indicator div uses CSS transitions on transform/width (200ms ease)
   - ResizeObserver observes tablist and calls updateIndicator()
   - getBoundingClientRect() calculates button position relative to tablist
   - Supports both horizontal (translateX/width) and vertical (translateY/height) orientations
   - Indicator starts with opacity:0 (_indicatorReady flag) to prevent flash

2. ✓ Tab panels with the lazy attribute render content only on first activation and preserve it after
   - lazy boolean property on TabPanel
   - _hasBeenExpanded private field tracks if panel was ever active
   - render() returns `nothing` when lazy && !_hasBeenExpanded && !active
   - Once activated, content is preserved even when panel becomes inactive

3. ✓ When tabs overflow the container, scroll navigation buttons appear and allow horizontal scrolling
   - _showScrollLeft/_showScrollRight @state() properties control visibility
   - updateScrollButtons() checks scrollLeft and scrollWidth vs clientWidth
   - Buttons render conditionally with SVG icons
   - aria-hidden="true" and tabindex="-1" keep buttons out of tab order
   - scrollTabs() method scrolls by 75% of visible width with smooth behavior
   - Only applies to horizontal orientation (vertical uses display:contents)

4. ✓ Tab panels without focusable content receive tabindex="0" so keyboard users can reach panel content
   - panelHasFocusableContent() checks for a[href], button, input, select, textarea, [tabindex]
   - syncPanelStates() sets tabindex="0" only when panel is active AND has no focusable children
   - Lazy panels use requestAnimationFrame deferred check to handle slot timing
   - Follows W3C APG guidance on tab panel keyboard accessibility

5. ✓ Tabs render correctly via Declarative Shadow DOM on the server and hydrate on the client
   - All browser APIs protected by isServer guards:
     - updateIndicator() (getBoundingClientRect)
     - updateScrollButtons() (scrollLeft/scrollWidth/clientWidth)
     - ResizeObserver creation in firstUpdated()
     - requestAnimationFrame in syncPanelStates
     - setAttribute('data-state') in tab-panel updated()
   - Indicator renders in DSD output with opacity:0 (positioned on client)
   - Scroll buttons correctly omitted in server render (_showScroll* default to false)
   - Package builds successfully with correct exports and peer dependencies

**Phase Goal Achieved:** All must-haves verified. Phase 59 complete.

---

_Verified: 2026-02-02T18:30:00Z_
_Verifier: Claude (gsd-verifier)_
