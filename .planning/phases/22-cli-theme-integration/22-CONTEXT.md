# Phase 22: CLI Theme Integration - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

CLI accepts encoded theme configuration and generates CSS file with user's design tokens. Theme is applied during `lit-ui init` and can be added/updated later via dedicated `lit-ui theme` command. Components work with or without custom theme CSS.

</domain>

<decisions>
## Implementation Decisions

### Theme parameter design
- Theme passed to `lit-ui init --theme <encoded>` during project setup
- Encoded string only (no file path support) — configurator generates it
- `--theme` is optional — if omitted, no theme CSS is generated
- Re-running init with `--theme` on existing project prompts: "Theme exists. Replace?"
- Separate `lit-ui theme <encoded>` command for adding/updating theme post-init

### CSS output behavior
- Theme CSS written to project root as `lit-ui-theme.css`
- CLI auto-adds `@import 'lit-ui-theme.css'` to detected main CSS/entry file
- If auto-import can't find suitable file, warn (yellow) and continue successfully
- User can manually import if auto-detection fails

### Error messaging
- Invalid theme errors are minimal: "Invalid theme. Generate a new one from the configurator."
- Include configurator URL in error messages
- Show yellow warnings for unusual but valid values
- Success messages are minimal: "Theme applied."

### Default theme handling
- `lit-ui init` without `--theme` skips CSS generation entirely
- Components have built-in fallback colors — work without theme CSS file
- Show hint when init runs without --theme: "Tip: Use --theme to customize colors. Get one at [URL]"

### Claude's Discretion
- Auto-import detection logic (which files to check)
- Warning thresholds for unusual values
- Exact wording of prompts and messages

</decisions>

<specifics>
## Specific Ideas

- Two commands: `lit-ui init --theme` for initial setup, `lit-ui theme` for post-init changes
- Components should be usable immediately even without theming — progressive enhancement

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 22-cli-theme-integration*
*Context gathered: 2026-01-25*
