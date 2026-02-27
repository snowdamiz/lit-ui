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
