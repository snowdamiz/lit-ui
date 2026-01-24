# Phase 4: CLI - Context

**Gathered:** 2026-01-24
**Status:** Ready for planning

<domain>
## Phase Boundary

CLI distribution tool that lets users install lit-ui components via `npx lit-ui add <component>`. Includes init command, component registry, build tool detection, and Tailwind v4 setup. Framework verification is a separate phase.

</domain>

<decisions>
## Implementation Decisions

### Command experience
- Informative verbosity by default — show key steps ("Installing dependencies...", "Copying button.ts...")
- Interactive by default with `--yes` flag to skip prompts
- Animated spinners for long operations
- Checkmark + summary on success with next steps ("✓ Added button to src/components/ui")

### Init flow
- JSON config file (lit-ui.json)
- Auto-detect as much as possible, wizard for what couldn't be detected
- Show dependencies to install, ask for confirmation before proceeding
- Auto-detect package manager from lockfile (npm/yarn/pnpm/bun)

### Component installation
- Detect component folder if possible, ask if not detected or uncertain
- Prompt on file conflicts: overwrite, skip, or diff
- Auto-include component dependencies ("add dialog" also adds button if dialog uses it)

### Error messaging
- `--debug` flag for full stack traces and internal state
- Suggest fixes with runnable commands ("Missing lit. Run: npm install lit")

### Claude's Discretion
- Error message formatting style (friendly vs technical)
- Network error handling (retry strategy)
- Base class handling approach (prioritize DX)

</decisions>

<specifics>
## Specific Ideas

- Consistent pattern: auto-detect first, ask only when uncertain
- CLI should feel responsive with spinners and informative output
- Recovery path should be clear — tell user exactly what command to run

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-cli*
*Context gathered: 2026-01-24*
