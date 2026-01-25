# Phase 18: CLI Enhancement - Context

**Gathered:** 2026-01-25
**Status:** Ready for planning

<domain>
## Phase Boundary

CLI supports both copy-source and npm installation modes. User chooses mode during init, can override with flags, and can migrate existing copy-source projects to npm. Config file persists the mode choice.

</domain>

<decisions>
## Implementation Decisions

### Mode selection UX
- Init sets default mode, per-command flags (--npm, --copy) can override
- Default mode is copy-source (matches existing behavior, user opts into npm)
- Init prompt shows descriptive options explaining trade-offs of each mode
- Config created automatically on first command if missing (no "run init first" error)

### Add command behavior
- In npm mode: install package + print import snippet and basic usage example
- Auto-detect package manager (pnpm-lock, yarn.lock, package-lock) and use matching one
- If component already exists: prompt to overwrite (not skip, not error)

### Migration path
- Delete copied source files after installing npm packages (no backup folder)
- If user modified copied source: show diff, ask to confirm before replacing
- No dry-run mode needed — migration safe enough to just run

### Mode persistence
- Store in lit-ui.config.json at project root
- Config contains: mode + component path (for copy-source)
- Config should be committed to git (team shares mode)
- If no config exists: create automatically with defaults on first command

### Claude's Discretion
- Whether to add a dedicated 'lit-ui mode' command or just edit config
- Output format for batch add operations (progress per component vs summary)
- How to handle import path updates during migration (auto-update vs show list)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 18-cli-enhancement*
*Context gathered: 2026-01-25*
