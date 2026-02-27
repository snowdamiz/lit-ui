---
phase: quick
plan: 2
subsystem: skill
tags: [agents-skill, progressive-disclosure, documentation, cli, tooling]
dependency-graph:
  requires: []
  provides: [skill/SKILL.md, skill/skills/*, scripts/install-skill.mjs]
  affects: []
tech-stack:
  added: []
  patterns: [progressive-disclosure-skill, mesh-skill-pattern, interactive-tui-installer]
key-files:
  created:
    - skill/SKILL.md
    - skill/skills/components/SKILL.md
    - skill/skills/cli/SKILL.md
    - skill/skills/authoring/SKILL.md
    - skill/skills/theming/SKILL.md
    - skill/skills/framework-usage/SKILL.md
    - skill/skills/ssr/SKILL.md
    - scripts/install-skill.mjs
  modified: []
decisions:
  - "Version resolved from packages/cli/package.json (0.1.0) with SKILL_VERSION constant as final fallback — root package.json is private/monorepo"
  - "Skill directory lives at skill/ (repo root) separate from packages/ to keep it framework-agnostic and installable without npm"
  - "install-skill.mjs modeled directly on cadence installer pattern for consistency — same TOOL_TARGETS, same TUI interaction, same version marker approach"
metrics:
  duration: "5m 25s"
  completed: "2026-02-27"
  tasks-completed: 2
  files-created: 8
---

# Quick Task 2: Create Agents Skill with Progressive Disclosure

Progressive disclosure agents skill for lit-ui — lightweight root router with 6 actionable sub-skills and a global install script that copies the skill into all major AI tool directories.

## Files Created

| File | Purpose |
|------|---------|
| `skill/SKILL.md` | Root router: Auto-Load Trigger, component overview, Available Sub-Skills table, Routing Rules |
| `skill/skills/components/SKILL.md` | All 19 lui-* tags, common properties, event convention (ui-* prefix), slot patterns, CSS parts |
| `skill/skills/cli/SKILL.md` | init, add, list, theme, migrate commands with all flags; config file format; distribution modes |
| `skill/skills/authoring/SKILL.md` | TailwindElement base class, @property/@state decorators, ElementInternals, SSR guards, event dispatch, JSX types |
| `skill/skills/theming/SKILL.md` | --ui-* token namespaces, --color-* global tokens, dark mode (.dark class), ::part() selectors, class passthrough |
| `skill/skills/framework-usage/SKILL.md` | React (ref + useEffect for objects), Vue (.prop modifier), Svelte (onMount), Angular (CUSTOM_ELEMENTS_SCHEMA) |
| `skill/skills/ssr/SKILL.md` | @lit-ui/ssr renderToString, hydration import order (must be first), isServer guards, dual-mode styling |
| `scripts/install-skill.mjs` | Global installer: --all/--tools/--yes/--home flags, interactive TUI, text prompt fallback, 8 tool targets |

## Sub-Skill Topics

1. **components** — Component tag reference table, common properties (size/disabled/name/value), ui-* event naming, slot patterns, CSS parts, form participation, per-component API notes for Button/Input/Select/Dialog/DataTable/Toast
2. **cli** — Full command reference for `init`, `add`, `list`, `theme`, `migrate`; config file keys; distribution modes; AI skill injection
3. **authoring** — TailwindElement extension, Lit decorators, ElementInternals for form participation, isServer guards for browser APIs, Shadow DOM parts, `dispatchCustomEvent`, JSX type declarations, file structure
4. **theming** — Per-component --ui-* token namespaces, global --color-* semantic tokens, dark mode activation, component-level token overrides, ::part() targeting, Tailwind class passthrough
5. **framework-usage** — React (addEventListener in useEffect, ref for objects), Vue (.prop modifier for arrays/objects), Svelte (bind:this + onMount), Angular (CUSTOM_ELEMENTS_SCHEMA + property binding), universal rule for object/array props
6. **ssr** — @lit-ui/ssr renderToString usage, hydration must-be-first rule, isServer guard examples, SSR-compatible styling, Next.js and Vite SSR integration, Declarative Shadow DOM notes

## How to Run the Installer

```bash
# Interactive mode (TUI with arrow keys when TTY available)
node scripts/install-skill.mjs

# Non-interactive: install to all tools without prompts
node scripts/install-skill.mjs --all --yes

# Install to specific tools
node scripts/install-skill.mjs --tools agents,claude --yes

# Install to a custom home directory (useful for CI/testing)
node scripts/install-skill.mjs --all --yes --home /path/to/home

# See all options
node scripts/install-skill.mjs --help
```

Installs to 8 AI tool directories under `$HOME`:
- `~/.codex/skills/lit-ui/`
- `~/.agents/skills/lit-ui/`
- `~/.claude/skills/lit-ui/`
- `~/.gemini/skills/lit-ui/`
- `~/.copilot/skills/lit-ui/`
- `~/.config/github-copilot/skills/lit-ui/`
- `~/.codeium/windsurf/skills/lit-ui/`
- `~/.config/opencode/skills/lit-ui/`

## Relationship to Project-Local Skills

The project-local skills in `packages/cli/src/utils/skill-content.ts` provide deep per-component API detail (injected by `npx lit-ui add <component>`). The global skill in `skill/` complements them with:

- Overview routing context (the root SKILL.md)
- Authoring patterns (TailwindElement, ElementInternals) — not in local skills
- Framework integration patterns — not in local skills
- SSR patterns — not in local skills
- Theming deep-dive with token override examples — not in local skills

They do not duplicate each other.

## CLI Integration Note

Future: The `injectOverviewSkills()` function in `packages/cli/src/utils/inject-skills.ts` currently handles project-local skill injection during `npx lit-ui init`. For global install, it could be extended to call this script via `spawnSync('node', [path.resolve(SCRIPT_DIR, '../../scripts/install-skill.mjs'), '--all', '--yes'])`, or extract `copySkillContents()` into a shared utility both can import.

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- skill/SKILL.md exists: FOUND
- skill/skills/components/SKILL.md exists: FOUND
- skill/skills/cli/SKILL.md exists: FOUND
- skill/skills/authoring/SKILL.md exists: FOUND
- skill/skills/theming/SKILL.md exists: FOUND
- skill/skills/framework-usage/SKILL.md exists: FOUND
- skill/skills/ssr/SKILL.md exists: FOUND
- scripts/install-skill.mjs exists: FOUND
- Commit 466d1e4 (Task 1): FOUND
- Commit cbe858c (Task 2): FOUND
- --help exits 0 and prints valid tool keys: VERIFIED
- --all --yes --home /tmp/litui-test2 copies SKILL.md to .agents/skills/lit-ui/: VERIFIED
