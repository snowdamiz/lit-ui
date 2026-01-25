# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-25)

**Core value:** Developers can use polished, accessible UI components in any framework without lock-in
**Current focus:** v3.0 Theme Customization - Phase 23 next

## Current Position

Phase: 23 of 24 (Visual Configurator Core)
Plan: 2 of 4 in current phase
Status: In progress
Last activity: 2026-01-25 — Completed 23-02-PLAN.md

Progress: v1.0 SHIPPED | v1.1 [########..] 8/12 phases | v2.0 SHIPPED | v3.0 [######....] 11/13 plans

## Performance Metrics

**v1.0 Velocity:**
- Total plans completed: 22
- Average duration: 2.9 min
- Total execution time: ~65 min

**v1.1 Velocity (partial):**
- Plans completed: 9
- Total execution time: 22 min

**v2.0 Velocity:**
- Plans completed: 27
- Total execution time: ~86 min

**v3.0 Velocity:**
- Plans completed: 11
- Total execution time: 22 min

## Accumulated Context

### Decisions

Key decisions are logged in PROJECT.md Key Decisions table.

**v3.0 decisions (pending validation):**
- Build-time theming over runtime — simpler, SSR-compatible
- URL-encoded token config — no server storage needed
- Theme generates into Tailwind CSS layer (not separate tokens file)
- OKLCH color space for perceptual uniformity
- lz-string compression for URL encoding
- Components already use CSS custom properties (no component changes needed)

**21-01 decisions:**
- Version literal 1 for future schema migrations
- OKLCH regex validates format, not value ranges (colorjs.io handles)
- Neutral gray palette uses chroma ~0.02-0.03

**21-02 decisions:**
- Lightness scale 50-950 follows Tailwind convention (0.97 to 0.20)
- Chroma modulation via scale factors prevents oversaturation
- NaN hue handling defaults to 0 for achromatic colors
- Dark mode uses 0.9x chroma reduction

**21-03 decisions:**
- Explicit base64url format validation before decode (regex check)
- 4-stage validation: format -> decode -> JSON -> schema
- Descriptive error messages for each failure mode

**21-04 decisions:**
- --lui-* prefix for CSS custom properties
- Both .dark class AND @media prefers-color-scheme for dark mode
- :root:not(.light) selector for opt-out capability

**21-05 decisions:**
- Public API exports only high-level functions, not internal utilities
- Module-level JSDoc with complete usage examples
- Integration tests simulate actual CLI workflow

**22-01 decisions:**
- Check 10 CSS file locations covering Next.js, Vite, and common structures
- Verify Tailwind content before accepting CSS file as entry
- Calculate relative paths from CSS file to theme file for portability
- Insert imports after @charset/@import but before content
- TTY awareness: prompt in interactive, skip in CI/scripts

**22-04 decisions:**
- Test fixtures use unique directory name to avoid conflicts
- Tests cover both Next.js and Vite CSS entry patterns
- Complete workflow tests simulate actual CLI usage

**23-01 decisions:**
- Implement deriveDarkMode/deriveLightMode locally (matches CLI algorithm, not exported)
- Add @lit-ui/cli/theme export to enable docs app imports
- Use colorjs.io for browser-side color conversion (consistency with CLI)

**23-02 decisions:**
- Hex input uses controlled state with validation on blur (allow typing incomplete values)
- TailwindSwatches includes all 22 Tailwind palettes (242 total swatches)
- ModeToggle controls editing mode, independent of page theme display

### Pending Todos

None.

### Blockers/Concerns

None currently.

## Session Continuity

Last session: 2026-01-25T22:45:49Z
Stopped at: Completed 23-02-PLAN.md
Resume file: None

## Next Steps

### Milestone v3.0 in progress

1. Execute 23-03-PLAN.md (Preview, layout, modal, routing)
2. Execute 23-04-PLAN.md (Human verification checkpoint)
3. Continue to Phase 24 (Presets and Features)
