---
phase: 59
plan: 02
subsystem: tabs
tags: [overflow-scroll, scroll-buttons, ssr, package-audit, css-custom-properties]
depends_on:
  requires: [59-01]
  provides: [overflow-scroll-buttons, ssr-verified, package-publishable]
  affects: [60]
tech-stack:
  added: []
  patterns: [scroll-button-overflow-detection, isServer-guard-pattern]
key-files:
  created: []
  modified:
    - packages/tabs/src/tabs.ts
    - packages/core/src/styles/tailwind.css
decisions:
  - Scroll buttons use aria-hidden and tabindex=-1 to stay out of tab order
  - Vertical orientation uses display:contents to bypass tablist-wrapper layout
  - Tablist changed from inline-flex to flex for overflow detection
  - Hidden scrollbar via scrollbar-width:none + webkit-scrollbar:none
  - requestAnimationFrame in syncPanelStates guarded with isServer check
metrics:
  duration: 2m 30s
  completed: 2026-02-03
---

# Phase 59 Plan 02: Overflow Scroll Buttons, SSR Verification, and Package Audit Summary

Overflow scroll navigation buttons with ResizeObserver/scroll-event visibility sync, isServer guards on all browser APIs verified, and @lit-ui/tabs package validated as publish-ready with correct exports/types/peer deps.

## Tasks Completed

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Overflow scroll with navigation buttons | ff788c4 | _showScrollLeft/_showScrollRight state, updateScrollButtons(), scrollTabs(), tablist-wrapper, scroll-button CSS, --ui-tabs-scroll-button-size token |
| 2 | SSR compatibility verification and package publishability audit | 1074bbc | isServer guard on requestAnimationFrame in syncPanelStates, verified all browser API guards, package.json audit |

## Decisions Made

1. **Scroll buttons outside tab order** - aria-hidden="true" and tabindex="-1" prevent scroll buttons from interfering with keyboard navigation of tabs (roving tabindex pattern).
2. **Vertical orientation bypass** - display:contents on tablist-wrapper in vertical mode prevents the wrapper from affecting the existing flex layout.
3. **Tablist display:flex instead of inline-flex** - Required for overflow detection (tablist must fill wrapper width for scrollWidth comparison to work).
4. **Hidden scrollbar** - scrollbar-width:none + ::-webkit-scrollbar{display:none} + -ms-overflow-style:none for cross-browser hidden scrollbar.
5. **requestAnimationFrame isServer guard** - syncPanelStates lazy panel re-check now guarded to prevent SSR errors.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added isServer guard to requestAnimationFrame in syncPanelStates**
- **Found during:** Task 2 (SSR audit)
- **Issue:** requestAnimationFrame call in syncPanelStates was not guarded by isServer, could fail during server-side rendering
- **Fix:** Added `&& !isServer` condition to the lazy panel rAF check
- **Files modified:** packages/tabs/src/tabs.ts
- **Verification:** Build succeeds, all browser APIs now guarded
- **Committed in:** 1074bbc (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** Essential for SSR correctness. No scope creep.

## Verification Results

- `pnpm --filter @lit-ui/tabs build` succeeds with zero errors
- dist/index.js (17KB) and dist/index.d.ts (6KB) exist
- All browser APIs guarded: getBoundingClientRect, ResizeObserver, scrollLeft/scrollWidth/clientWidth, scrollBy, requestAnimationFrame
- Scroll buttons render conditionally via _showScrollLeft/_showScrollRight @state()
- Package.json: name @lit-ui/tabs, exports correct, types dist/index.d.ts, peerDependencies lit ^3.0.0 and @lit-ui/core ^1.0.0, sideEffects true, files ["dist"]
- index.ts: collision detection via customElements.get() checks

## Next Phase Readiness

Phase 59 (Tabs Polish & Package) is complete. All tabs features implemented:
- Core tablist with keyboard nav, ARIA, controlled/uncontrolled modes (58)
- Animated indicator, lazy panels, conditional tabindex (59-01)
- Overflow scroll buttons, SSR verified, package publishable (59-02)

Phase 60 can proceed with final integration tasks.
