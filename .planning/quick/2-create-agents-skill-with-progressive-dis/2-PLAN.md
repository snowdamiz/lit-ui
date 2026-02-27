---
phase: quick
plan: 2
type: execute
wave: 1
depends_on: []
files_modified:
  - skill/SKILL.md
  - skill/skills/components/SKILL.md
  - skill/skills/cli/SKILL.md
  - skill/skills/authoring/SKILL.md
  - skill/skills/theming/SKILL.md
  - skill/skills/framework-usage/SKILL.md
  - skill/skills/ssr/SKILL.md
  - scripts/install-skill.mjs
autonomous: true
requirements: []
must_haves:
  truths:
    - "skill/SKILL.md exists as a progressive disclosure router that describes all sub-skills"
    - "Each sub-skill in skill/skills/ is a self-contained SKILL.md with actionable rules"
    - "scripts/install-skill.mjs copies ./skill/ to ~/.agents/skills/lit-ui (and other AI tool dirs)"
    - "Running node scripts/install-skill.mjs --all installs without prompts"
  artifacts:
    - path: "skill/SKILL.md"
      provides: "Main router/index — auto-load trigger + sub-skill routing table"
    - path: "skill/skills/components/SKILL.md"
      provides: "Component API reference: all lui-* tags, properties, events, slots"
    - path: "skill/skills/cli/SKILL.md"
      provides: "CLI usage: init, add, list, migrate, theme commands"
    - path: "skill/skills/authoring/SKILL.md"
      provides: "Creating new components: TailwindElement, ElementInternals, SSR guards"
    - path: "skill/skills/theming/SKILL.md"
      provides: "CSS custom properties, dark mode, design tokens"
    - path: "skill/skills/framework-usage/SKILL.md"
      provides: "React, Vue, Svelte, Angular, vanilla HTML integration patterns"
    - path: "skill/skills/ssr/SKILL.md"
      provides: "SSR: renderToString, hydration, isServer guard patterns"
    - path: "scripts/install-skill.mjs"
      provides: "Global install script — copies skill/ to AI tool skill dirs in HOME"
  key_links:
    - from: "skill/SKILL.md"
      to: "skill/skills/*/SKILL.md"
      via: "routing table listing sub-skill paths"
    - from: "scripts/install-skill.mjs"
      to: "skill/"
      via: "resolveSourceDir() points to ../skill relative to scripts/"
---

<objective>
Create a standalone agents skill for the lit-ui project following the mesh progressive disclosure pattern.

Purpose: Developers using Claude Code or other AI tools globally (not just in the lit-ui project) can have rich context about the lit-ui library injected into their AI assistant. The progressive disclosure pattern keeps the root SKILL.md lightweight while routing to deep sub-skills on demand.

Output: `skill/` directory with router + 6 sub-skills, plus `scripts/install-skill.mjs` that installs the skill into the user's global AI tool skill directories.
</objective>

<execution_context>
@/Users/sn0w/.claude/get-shit-done/workflows/execute-plan.md
@/Users/sn0w/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md

<!-- Reference examples studied during planning -->
<!-- Mesh skill pattern: /Users/sn0w/Documents/dev/snow/tools/skill/mesh/SKILL.md -->
<!-- Cadence installer: /Users/sn0w/Documents/dev/cadence/scripts/install-cadence-skill.mjs -->
<!-- Existing skill injection: packages/cli/src/utils/skill-content.ts -->
<!-- Existing platform detection: packages/cli/src/utils/detect-ai-platform.ts -->

<interfaces>
<!-- Key patterns from the mesh skill (the template to follow) -->

Mesh SKILL.md structure:
```yaml
---
name: mesh
description: Short trigger description — auto-load condition
---

# Mesh

## Auto-Load Trigger
1. Auto-load this skill for ANY question about X
2. For specific topics, immediately route to the relevant sub-skill
3. For cross-concept questions, load both sub-skills and synthesize

## What is [Project]
[3-5 numbered facts]

## [Domain] at a Glance
[Numbered fact list, ~10 items]

## Available Sub-Skills
1. `skills/topic-a` — description
2. `skills/topic-b` — description

## Routing Rules
1. After overview, check if question maps to a specific sub-skill
2. Load matching sub-skill(s) for deep answers
3. When in doubt, load `skills/components` first
```

Sub-skill SKILL.md structure:
```yaml
---
name: lit-ui-{topic}
description: Specific trigger description for this sub-skill
---

# [Topic]

## [Section]
Rules:
1. Rule one
2. Rule two

Code example:
```typescript
// concrete example
```
```

Cadence installer key patterns:
- TOOL_TARGETS maps key → label → relPath under HOME
- Supports --all, --tools <comma-list>, --yes, --home flags
- resolveSourceDir() → path.resolve(SCRIPT_DIR, "..", "skill")
- copySkillContents() recursively copies sourceDir → targetDir
- Interactive TUI with arrow keys when TTY available
- Writes version marker file (.cadence-version) after install

Existing lit-ui component list (from packages/cli/src/utils/skill-content.ts):
Button, Checkbox, Radio, Switch, Input, Textarea, Select, Calendar,
Date Picker, Date Range Picker, Time Picker, Dialog, Accordion, Tabs,
Tooltip, Popover, Toast, Data Table

Existing skill content already covers per-component API in detail.
The global skill should NOT duplicate that level of detail — it should
provide overview-level routing context and deeper patterns not in the
project-local skills (authoring, SSR, framework integration).

Tag prefix: lui-* (not ui-* — that was renamed from an earlier version)
CSS token prefix: --ui-* (note: different from tag prefix)
Base class: TailwindElement from @lit-ui/core
Form participation: ElementInternals on all form components
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create skill directory with router SKILL.md and all sub-skills</name>
  <files>
    skill/SKILL.md
    skill/skills/components/SKILL.md
    skill/skills/cli/SKILL.md
    skill/skills/authoring/SKILL.md
    skill/skills/theming/SKILL.md
    skill/skills/framework-usage/SKILL.md
    skill/skills/ssr/SKILL.md
  </files>
  <action>
Create `skill/SKILL.md` as the main router following the mesh SKILL.md pattern exactly:

```markdown
---
name: lit-ui
description: >-
  lit-ui is a framework-agnostic web component library built on Lit.js with Tailwind CSS v4.
  Use for any question about lui-* components, the lit-ui CLI, component authoring, theming,
  SSR, or framework integration (React, Vue, Svelte, Angular). Auto-loads for all lit-ui questions.
---

# lit-ui

## Auto-Load Trigger
1. Auto-load this skill for ANY question about the lit-ui component library.
2. For specific topics, immediately route to the relevant sub-skill.
3. For cross-topic questions (e.g., "how do I use lui-button in React with dark mode"), load both relevant sub-skills.
4. Only document what exists in the codebase — never invent properties or attributes.

## What is lit-ui
1. lit-ui is a framework-agnostic component library: components are standard web components usable in React, Vue, Svelte, Angular, or plain HTML without wrappers or adapters.
2. Components are built with Lit.js v3 and styled with Tailwind CSS v4 via constructable stylesheets injected into Shadow DOM.
3. All component tag names use the `lui-` prefix (e.g., `<lui-button>`, `<lui-dialog>`).
4. CSS custom properties for theming use the `--ui-` prefix (e.g., `--ui-button-radius`).
5. Two distribution modes: **copy-source** (component source copied to your project, full ownership) and **npm** (install `@lit-ui/<component>` packages).

## Component Overview
1. Form controls: `<lui-button>`, `<lui-input>`, `<lui-textarea>`, `<lui-select>`, `<lui-checkbox>`, `<lui-radio>`, `<lui-switch>`.
2. Date/time: `<lui-calendar>`, `<lui-date-picker>`, `<lui-date-range-picker>`, `<lui-time-picker>`.
3. Overlays: `<lui-dialog>`, `<lui-tooltip>`, `<lui-popover>`, `<lui-toaster>`.
4. Layout: `<lui-accordion>`, `<lui-tabs>`.
5. Data: `<lui-data-table>`.
6. All form components participate in HTML forms via `ElementInternals`.

## Available Sub-Skills
1. `skills/components` — All lui-* tags, properties, attributes, events, slots, and CSS tokens
2. `skills/cli` — CLI commands: init, add, list, migrate, theme — flags and workflows
3. `skills/authoring` — Creating new components: TailwindElement, ElementInternals, SSR guards, decorators
4. `skills/theming` — CSS custom properties, design tokens, dark mode, ::part() selectors
5. `skills/framework-usage` — React, Vue, Svelte, Angular, and vanilla HTML integration patterns
6. `skills/ssr` — Server-side rendering: renderToString, hydration, isServer guards

## Routing Rules
1. After delivering the overview, check if the question maps to a specific sub-skill.
2. Load the matching sub-skill(s) for deep answers — do not improvise from the overview alone.
3. When in doubt, load `skills/components` first — it covers the most common questions.
4. For CLI questions (npx lit-ui ...), load `skills/cli`.
5. For "how do I build a component" questions, load `skills/authoring`.
```

Then create each sub-skill. Key content for each:

**skill/skills/components/SKILL.md** — property tables for all 19 components, events, slots. Use numbered rules format. Include the full component table from the overview skill (packages/cli/src/utils/skill-content.ts lines 1-80) plus note that each component has detailed API in per-component skills injected via `npx lit-ui add <component>`. Keep concise — route to component-specific skills for full API. Cover: common properties all components share (size, disabled, name, value), event naming convention (ui-* prefix: ui-change, ui-input, ui-open, ui-close), slot patterns.

**skill/skills/cli/SKILL.md** — cover:
- `npx lit-ui init` — initializes config, copies TailwindElement base, prompts for AI skill injection
- `npx lit-ui add <component> [--yes] [--overwrite] [--npm] [--cwd]`
- `npx lit-ui list` — list available components
- `npx lit-ui theme` — theme management
- `npx lit-ui migrate` — migration helpers
- Config file: `lit-ui.config.json`, keys: mode (copy-source | npm), componentsDir, tailwindCssPath

**skill/skills/authoring/SKILL.md** — cover:
- Extend `TailwindElement` from `@lit-ui/core` (not LitElement directly)
- Use `@customElement('lui-my-component')` decorator
- Use `@property()` for reflected attributes, `@state()` for internal state
- ElementInternals for form participation: `static formAssociated = true`, `this.internals = this.attachInternals()`
- SSR guard: `import { isServer } from 'lit'; if (!isServer) { /* client only */ }`
- Shadow DOM parts: add `part="base"` to root element for external `::part()` styling
- Event dispatch: `dispatchCustomEvent(this, 'change', detail)` from `@lit-ui/core`
- JSX types: create `jsx.d.ts` alongside component for React/JSX type support
- CSS in Shadow DOM: use Tailwind classes in `render()` — TailwindElement handles injection

**skill/skills/theming/SKILL.md** — cover:
- Token namespaces: `--ui-<component>-<property>` (e.g., `--ui-button-radius`, `--ui-input-border`)
- Global semantic tokens: `--color-primary`, `--color-secondary`, `--color-destructive`, `--color-muted`, `--color-background`, `--color-foreground`, `--color-border`, `--color-ring`
- Dark mode: add `.dark` class to `<html>` or `<body>`; components use `:host-context(.dark)`
- `::part()` for targeted Shadow DOM styling: `lui-button::part(base) { font-weight: 600; }`
- Tailwind class passthrough: `<lui-button class="shadow-lg">` — classes apply to `:host`

**skill/skills/framework-usage/SKILL.md** — cover React, Vue, Svelte, Angular, vanilla HTML. For React: import side-effect, use className if needed but class works, event listeners need onXxx or addEventListener, no JSX prop inference for custom attrs (use as string). For Vue: works natively, use @ui-change.native or @ui-change, .prop modifier for object/array properties. For Svelte: import, use on:ui-change. For Angular: add CUSTOM_ELEMENTS_SCHEMA. Setting object/array properties in all frameworks: use `.prop` binding syntax or set via JS reference, not attributes.

**skill/skills/ssr/SKILL.md** — cover:
- Package: `@lit-ui/ssr` for server rendering
- `import { renderToString, html } from '@lit-ui/ssr'`
- Hydration: `import '@lit-ui/ssr/hydration'` MUST be the first import on client
- `isServer` guard from `@lit-ui/core` for ElementInternals, ResizeObserver, etc.
- Components serialize Shadow DOM declaratively; styles are inlined for SSR then upgraded to constructable on client
  </action>
  <verify>
    ls /Users/sn0w/Documents/dev/lit-components/skill/SKILL.md && ls /Users/sn0w/Documents/dev/lit-components/skill/skills/components/SKILL.md && ls /Users/sn0w/Documents/dev/lit-components/skill/skills/cli/SKILL.md && ls /Users/sn0w/Documents/dev/lit-components/skill/skills/authoring/SKILL.md && ls /Users/sn0w/Documents/dev/lit-components/skill/skills/theming/SKILL.md && ls /Users/sn0w/Documents/dev/lit-components/skill/skills/framework-usage/SKILL.md && ls /Users/sn0w/Documents/dev/lit-components/skill/skills/ssr/SKILL.md && echo "All skill files exist"
  </verify>
  <done>7 SKILL.md files exist; root SKILL.md has Auto-Load Trigger section and Available Sub-Skills table listing all 6 sub-skills with paths; each sub-skill has YAML frontmatter with name and description</done>
</task>

<task type="auto">
  <name>Task 2: Create global install script</name>
  <files>
    scripts/install-skill.mjs
  </files>
  <action>
Create `scripts/install-skill.mjs` modeled on the cadence installer but simplified for lit-ui. No Python dependency check needed.

Key behaviors:
- `SKILL_NAME = "lit-ui"`
- `TOOL_TARGETS` array with same tools as cadence: codex, agents, claude, gemini, copilot, github-copilot, windsurf, opencode — using same relPath conventions
- `resolveSourceDir()` → `path.resolve(SCRIPT_DIR, "..", "skill")` (installer is in `scripts/`, skill is in `skill/`)
- CLI flags: `--all`, `--tools <comma-list>`, `--yes`, `--home <path>`, `--help`
- Interactive TUI multi-select when TTY available (arrow keys, space to toggle, a=all, enter=confirm, q=cancel) — copy the TUI logic from cadence
- Text prompt fallback when no TTY (pipe-friendly)
- `copySkillContents(sourceDir, targetDir)` — recursive copy using `fs.cp` with `recursive: true, force: true`
- Version marker: read version from `../package.json` (the root package.json — but since it's a monorepo private package, fall back to reading from `../packages/cli/package.json` if root has no public version, or use a hardcoded SKILL_VERSION constant as final fallback)
- Version marker file: `.lit-ui-version` in the target dir
- Install detection: check for `SKILL.md` in target dir

The script should be `#!/usr/bin/env node` ESM (`.mjs`), no external dependencies — only Node.js builtins (`fs/promises`, `os`, `path`, `readline/promises`, `child_process`, `url`).

Add a `bin` entry hint in a comment at the top so it's clear how to run:
```
# Run: node scripts/install-skill.mjs
# Or: node scripts/install-skill.mjs --all --yes
```

After install, print: `lit-ui skill installation complete.`

Also note in the script header comment (JSDoc block) that this script can be called from the lit-ui CLI init flow in the future by spawning it or importing the core install logic.
  </action>
  <verify>
    node /Users/sn0w/Documents/dev/lit-components/scripts/install-skill.mjs --help
  </verify>
  <done>`--help` prints usage with valid --tools keys; `node scripts/install-skill.mjs --all --yes --home /tmp/test-install` successfully copies skill/ contents to /tmp/test-install/.agents/skills/lit-ui/ (and other tool dirs) without error</done>
</task>

</tasks>

<verification>
After both tasks complete:

1. `ls skill/skills/` shows: components cli authoring theming framework-usage ssr
2. `grep "Auto-Load Trigger" skill/SKILL.md` returns a match
3. `grep "skills/components" skill/SKILL.md` returns a match (routing table present)
4. Each sub-skill has `---` frontmatter with `name:` and `description:` fields
5. `node scripts/install-skill.mjs --help` exits 0 and prints flag descriptions
6. `node scripts/install-skill.mjs --all --yes --home /tmp/litui-test && ls /tmp/litui-test/.agents/skills/lit-ui/SKILL.md` succeeds
</verification>

<success_criteria>
- `skill/` directory exists with `SKILL.md` router and 6 sub-skill directories
- Main router SKILL.md has frontmatter, Auto-Load Trigger section, Available Sub-Skills list, Routing Rules section
- Each sub-skill is self-contained and actionable (rules + code examples where applicable)
- `scripts/install-skill.mjs` runs without dependencies, supports `--all --yes` for non-interactive install
- Global install copies entire `skill/` tree to `~/.agents/skills/lit-ui` (and equivalent paths for each supported AI tool)
- Skill content does not contradict existing project-local skills in `packages/cli/src/utils/skill-content.ts` — it complements them with authoring and framework patterns not covered there
</success_criteria>

<output>
After completion, create `.planning/quick/2-create-agents-skill-with-progressive-dis/2-SUMMARY.md` with:
- Files created
- Sub-skill topics covered
- How to run the installer
- Note on integration point with CLI init (future: `injectOverviewSkills` could call this script for global install)
</output>
